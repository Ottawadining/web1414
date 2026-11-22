-- =====================================================================
-- Rotten Critics — core schema
-- Run in the Supabase SQL editor (or `supabase db push`). Idempotent-ish:
-- intended to run once on a fresh project, in order, before 0002 and seed.
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------
-- Profiles (one per auth user). Never exposed publicly except display_name
-- through security-definer functions.
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  citext unique check (display_name is null or char_length(display_name) between 2 and 40),
  role          text not null default 'member' check (role in ('member','admin')),
  is_restricted boolean not null default false,  -- votes excluded from totals, cannot comment
  restricted_reason text,
  created_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers used by RLS. security definer so they can read auth.users / profiles.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_verified()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select coalesce((select email_confirmed_at is not null from auth.users where id = auth.uid()), false);
$$;

create or replace function public.can_participate()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_verified() and exists (
    select 1 from public.profiles
    where id = auth.uid() and not is_restricted and display_name is not null
  );
$$;

-- ---------------------------------------------------------------------
-- Critics
-- ---------------------------------------------------------------------
create table public.critics (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name             text not null check (char_length(name) between 2 and 120),
  nickname         text check (char_length(nickname) <= 120),
  city             text,
  publication      text,
  background       text,                 -- professional background; only shown when bio_verified
  bio_verified     boolean not null default false,
  roast            text,                 -- 100–150 words, supplied and reviewed separately
  excerpt          text check (char_length(excerpt) <= 280),
  portrait_url     text,
  portrait_credit  text,
  editorial_rank   int unique check (editorial_rank > 0),
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index critics_status_idx on public.critics(status);

-- Display names may not impersonate a listed critic or the site itself.
create or replace function public.check_display_name()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.display_name is not null then
    if lower(new.display_name::text) in ('admin','administrator','moderator','rotten critics','rottencritics','editor','the editors')
       or exists (select 1 from public.critics c where lower(c.name) = lower(new.display_name::text)) then
      raise exception 'That display name is reserved.' using errcode = 'P0001';
    end if;
    if new.display_name::text !~ '^[[:alnum:] ._''-]+$' then
      raise exception 'Display names may use letters, numbers, spaces, and . _ '' -' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_display_name before insert or update of display_name on public.profiles
  for each row execute function public.check_display_name();

-- ---------------------------------------------------------------------
-- Receipts: documented, sourced published work. Cannot be published
-- without a source URL and a verification stamp.
-- ---------------------------------------------------------------------
create table public.receipts (
  id           uuid primary key default gen_random_uuid(),
  critic_id    uuid not null references public.critics(id) on delete cascade,
  headline     text not null check (char_length(headline) between 3 and 160),
  explanation  text not null,
  source_url   text check (source_url ~ '^https?://'),
  source_title text,
  published_on date,
  context      text,                  -- critic's response, editor's note, etc.
  status       text not null default 'draft' check (status in ('draft','published')),
  verified_by  uuid references auth.users(id),
  verified_at  timestamptz,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint receipts_publish_requires_source check (
    status <> 'published' or (source_url is not null and verified_at is not null)
  )
);
create index receipts_critic_idx on public.receipts(critic_id, status, sort_order);

-- ---------------------------------------------------------------------
-- Settings (single row)
-- ---------------------------------------------------------------------
create table public.settings (
  id               int primary key default 1 check (id = 1),
  min_votes        int not null default 50 check (min_votes between 1 and 100000),
  community_size   int not null default 10 check (community_size between 3 and 50),
  force_editorial  boolean not null default false,  -- pin the editorial order regardless of votes
  updated_at       timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------
-- Rate limiting (generic sliding-bucket counter)
-- ---------------------------------------------------------------------
create table public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  hits         int not null default 0,
  primary key (key, window_start)
);

-- Returns true if allowed, false if the limit was exceeded.
create or replace function public.hit_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n int;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into n;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  return n <= p_max;
end $$;

create or replace function public.assert_rate_limit(p_key text, p_window_seconds int, p_max int, p_message text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.hit_rate_limit(p_key, p_window_seconds, p_max) then
    raise exception '%', p_message using errcode = 'P0001';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Votes: one active vote per user per critic (primary key).
-- ---------------------------------------------------------------------
create table public.votes (
  critic_id  uuid not null references public.critics(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  value      text not null check (value in ('rotten','not_rotten')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (critic_id, user_id)
);
create index votes_user_idx on public.votes(user_id);

-- Append-only log for abuse review. Admin-only.
create table public.vote_events (
  id         bigint generated always as identity primary key,
  critic_id  uuid not null references public.critics(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null check (action in ('cast','change','withdraw')),
  value      text,
  created_at timestamptz not null default now()
);
create index vote_events_user_time_idx on public.vote_events(user_id, created_at desc);
create index vote_events_critic_time_idx on public.vote_events(critic_id, created_at desc);

create or replace function public.votes_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare uid uuid := coalesce(new.user_id, old.user_id);
begin
  if tg_op in ('INSERT','UPDATE') then
    perform public.assert_rate_limit('vote:' || uid, 3600, 60, 'Easy. That is a lot of votes for one hour. Try again later.');
    perform public.assert_rate_limit('vote-critic:' || uid || ':' || new.critic_id, 600, 6, 'You keep changing your mind on this one. Give it ten minutes.');
    new.updated_at := now();
    insert into public.vote_events (critic_id, user_id, action, value)
      values (new.critic_id, uid, case when tg_op = 'INSERT' then 'cast' else 'change' end, new.value);
    return new;
  else
    insert into public.vote_events (critic_id, user_id, action, value) values (old.critic_id, uid, 'withdraw', old.value);
    return old;
  end if;
end $$;
create trigger votes_guard_iu before insert or update on public.votes
  for each row execute function public.votes_guard();
create trigger votes_guard_d before delete on public.votes
  for each row execute function public.votes_guard();

-- ---------------------------------------------------------------------
-- Scores. Wilson score lower bound (95%) on the Rotten proportion.
-- Votes from restricted accounts are excluded. No identities exposed.
-- ---------------------------------------------------------------------
create or replace function public.critic_scores()
returns table (
  critic_id uuid,
  rotten int,
  not_rotten int,
  total int,
  rotten_pct numeric,
  wilson numeric,
  eligible boolean,
  community_rank int
) language sql stable security definer set search_path = public as $$
  with s as (select min_votes from public.settings where id = 1),
  agg as (
    select c.id as critic_id,
           count(*) filter (where v.value = 'rotten')::int as rotten,
           count(*) filter (where v.value = 'not_rotten')::int as not_rotten,
           count(v.user_id)::int as total
    from public.critics c
    left join public.votes v on v.critic_id = c.id
      and not exists (select 1 from public.profiles p where p.id = v.user_id and p.is_restricted)
    where c.status = 'published'
    group by c.id
  ),
  scored as (
    select a.*,
      case when a.total = 0 then null else round(a.rotten::numeric / a.total, 4) end as rotten_pct,
      case when a.total = 0 then 0 else
        round(((a.rotten::numeric / a.total) + (1.96^2) / (2 * a.total)
          - 1.96 * sqrt(((a.rotten::numeric / a.total) * (1 - a.rotten::numeric / a.total) + (1.96^2) / (4 * a.total)) / a.total))
          / (1 + (1.96^2) / a.total), 4)
      end as wilson,
      a.total >= (select min_votes from s) as eligible
    from agg a
  )
  select critic_id, rotten, not_rotten, total, rotten_pct, wilson, eligible,
    case when eligible then (rank() over (partition by eligible order by wilson desc, total desc))::int end as community_rank
  from scored;
$$;

-- ---------------------------------------------------------------------
-- Comments (threaded, pre-moderated at launch)
-- ---------------------------------------------------------------------
create table public.comments (
  id               uuid primary key default gen_random_uuid(),
  critic_id        uuid not null references public.critics(id) on delete cascade,
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  parent_id        uuid references public.comments(id) on delete cascade,
  depth            int not null default 0,
  body             text not null check (char_length(body) between 2 and 2000),
  status           text not null default 'pending' check (status in ('pending','approved','rejected','removed')),
  moderation_note  text,
  moderated_by     uuid references auth.users(id),
  moderated_at     timestamptz,
  created_at       timestamptz not null default now()
);
create index comments_critic_idx on public.comments(critic_id, status, created_at);
create index comments_status_idx on public.comments(status, created_at);

create or replace function public.comments_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare p record;
begin
  -- Everything starts pending, whatever the client sends.
  new.status := 'pending';
  new.moderated_by := null; new.moderated_at := null; new.moderation_note := null;
  new.body := btrim(new.body);
  if new.parent_id is not null then
    select critic_id, depth, status into p from public.comments where id = new.parent_id;
    if not found or p.critic_id <> new.critic_id or p.status <> 'approved' then
      raise exception 'You can only reply to a published comment.' using errcode = 'P0001';
    end if;
    if p.depth >= 3 then
      raise exception 'This thread is deep enough. Start a new one.' using errcode = 'P0001';
    end if;
    new.depth := p.depth + 1;
  else
    new.depth := 0;
  end if;
  -- crude link-spam guard
  if (select count(*) from regexp_matches(new.body, 'https?://', 'g')) > 3 then
    raise exception 'Too many links in one comment.' using errcode = 'P0001';
  end if;
  perform public.assert_rate_limit('comment:' || new.user_id, 600, 5, 'Five comments in ten minutes. Let the kitchen catch up.');
  perform public.assert_rate_limit('comment-day:' || new.user_id, 86400, 40, 'Daily comment limit reached. Come back tomorrow.');
  return new;
end $$;
create trigger comments_guard_i before insert on public.comments
  for each row execute function public.comments_guard();

create or replace function public.comments_moderation_stamp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    new.moderated_by := auth.uid();
    new.moderated_at := now();
  end if;
  -- body and authorship are immutable after submission
  new.body := old.body; new.user_id := old.user_id; new.critic_id := old.critic_id; new.parent_id := old.parent_id;
  return new;
end $$;
create trigger comments_moderation_u before update on public.comments
  for each row execute function public.comments_moderation_stamp();

-- Public, identity-safe comment feed for one critic.
create or replace function public.public_comments(p_critic uuid)
returns table (id uuid, parent_id uuid, depth int, body text, created_at timestamptz, display_name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.parent_id, c.depth, c.body, c.created_at, coalesce(p.display_name::text, 'Anonymous diner')
  from public.comments c
  join public.critics k on k.id = c.critic_id and k.status = 'published'
  left join public.profiles p on p.id = c.user_id
  where c.critic_id = p_critic and c.status = 'approved'
  order by c.created_at asc;
$$;

create or replace function public.public_comment_counts()
returns table (critic_id uuid, n int)
language sql stable security definer set search_path = public as $$
  select critic_id, count(*)::int from public.comments where status = 'approved' group by critic_id;
$$;

create table public.comment_reports (
  id          uuid primary key default gen_random_uuid(),
  comment_id  uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reason      text not null check (reason in ('threat','doxxing','discrimination','invented_allegation','private_life','spam','other')),
  details     text check (char_length(details) <= 1000),
  status      text not null default 'open' check (status in ('open','actioned','dismissed')),
  created_at  timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

create or replace function public.reports_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.status := 'open';
  perform public.assert_rate_limit('report:' || new.reporter_id, 86400, 25, 'Daily report limit reached.');
  return new;
end $$;
create trigger reports_guard_i before insert on public.comment_reports
  for each row execute function public.reports_guard();

-- ---------------------------------------------------------------------
-- Nominations (private queue)
-- ---------------------------------------------------------------------
create table public.nominations (
  id            uuid primary key default gen_random_uuid(),
  submitted_by  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  critic_name   text not null check (char_length(critic_name) between 2 and 120),
  publication   text not null check (char_length(publication) between 2 and 160),
  city          text not null check (char_length(city) between 2 and 120),
  review_url    text not null check (review_url ~ '^https?://'),
  reason        text not null check (char_length(reason) between 20 and 2000),
  extra_links   text[] not null default '{}',
  status        text not null default 'pending' check (status in ('pending','approved','rejected','duplicate')),
  admin_notes   text,
  created_critic_id uuid references public.critics(id) on delete set null,
  reviewed_by   uuid references auth.users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  constraint extra_links_limit check (cardinality(extra_links) <= 5)
);

create or replace function public.nominations_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.admin_notes := null; new.created_critic_id := null;
    perform public.assert_rate_limit('nominate:' || new.submitted_by, 86400, 5, 'Five nominations a day is plenty.');
  elsif new.status is distinct from old.status then
    new.reviewed_by := auth.uid(); new.reviewed_at := now();
  end if;
  return new;
end $$;
create trigger nominations_guard before insert or update on public.nominations
  for each row execute function public.nominations_guard();

-- ---------------------------------------------------------------------
-- Inbound messages (corrections, evidence, right of reply, general).
-- Anyone may submit (no account needed); a trigger rate-limits by IP and email.
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('correction','evidence','reply','general','legal')),
  name         text not null check (char_length(name) between 2 and 120),
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  organization text,
  critic_id    uuid references public.critics(id) on delete set null,
  url          text,
  body         text not null check (char_length(body) between 10 and 6000),
  status       text not null default 'new' check (status in ('new','in_progress','closed')),
  admin_notes  text,
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- Client IP as seen by the Supabase API gateway (hashed before storage).
create or replace function public.request_ip()
returns text language sql stable as $$
  select coalesce(
    nullif(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1), ''),
    current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
    'unknown');
$$;

create or replace function public.contact_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare ip text := public.request_ip();
begin
  new.status := 'new'; new.admin_notes := null;
  new.email := lower(btrim(new.email));
  new.ip_hash := encode(digest('rc:' || ip, 'sha256'), 'hex');
  perform public.assert_rate_limit('contact-ip:' || new.ip_hash, 3600, 5, 'Too many messages from this connection. Try again in an hour.');
  perform public.assert_rate_limit('contact-email:' || new.email, 86400, 10, 'Too many messages from this address today.');
  perform public.assert_rate_limit('contact-all', 3600, 200, 'The desk is swamped. Try again shortly.');
  return new;
end $$;
create trigger contact_guard_i before insert on public.contact_messages
  for each row execute function public.contact_guard();

-- Published right-of-reply statements. Created by an admin from a verified
-- contact message; shown on the critic page, visually distinct from comments.
create table public.critic_responses (
  id            uuid primary key default gen_random_uuid(),
  critic_id     uuid not null references public.critics(id) on delete cascade,
  source_message_id uuid references public.contact_messages(id) on delete set null,
  author_name   text not null,
  author_title  text,
  body          text not null check (char_length(body) between 10 and 6000),
  identity_verified boolean not null default false,
  status        text not null default 'draft' check (status in ('draft','published','withdrawn')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  constraint response_publish_requires_verification check (status <> 'published' or identity_verified)
);

-- ---------------------------------------------------------------------
-- Traffic: privacy-light aggregate page counts. No IPs, no cookies.
-- ---------------------------------------------------------------------
create table public.page_views (
  day   date not null default current_date,
  path  text not null check (char_length(path) <= 200),
  views int not null default 0,
  primary key (day, path)
);

create or replace function public.record_view(p_path text)
returns void language sql security definer set search_path = public as $$
  insert into public.page_views as pv (day, path, views)
  values (current_date, left(p_path, 200), 1)
  on conflict (day, path) do update set views = pv.views + 1;
$$;

-- ---------------------------------------------------------------------
-- Audit trail of editorial and moderation actions
-- ---------------------------------------------------------------------
create table public.moderation_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,          -- INSERT / UPDATE / DELETE
  entity     text not null,          -- table name
  entity_id  text,
  changes    jsonb,
  created_at timestamptz not null default now()
);
create index moderation_log_time_idx on public.moderation_log(created_at desc);

create or replace function public.log_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  diff jsonb := '{}'::jsonb;
  k text;
  o jsonb; n jsonb;
begin
  if tg_op = 'UPDATE' then
    o := to_jsonb(old); n := to_jsonb(new);
    for k in select jsonb_object_keys(n) loop
      if k not in ('updated_at') and (o -> k) is distinct from (n -> k) then
        diff := diff || jsonb_build_object(k, jsonb_build_object('from', o -> k, 'to', n -> k));
      end if;
    end loop;
    if diff = '{}'::jsonb then return new; end if;
    insert into public.moderation_log (actor_id, action, entity, entity_id, changes)
      values (auth.uid(), tg_op, tg_table_name, n ->> 'id', diff);
    return new;
  elsif tg_op = 'INSERT' then
    insert into public.moderation_log (actor_id, action, entity, entity_id, changes)
      values (auth.uid(), tg_op, tg_table_name, to_jsonb(new) ->> 'id', null);
    return new;
  else
    insert into public.moderation_log (actor_id, action, entity, entity_id, changes)
      values (auth.uid(), tg_op, tg_table_name, to_jsonb(old) ->> 'id', to_jsonb(old));
    return old;
  end if;
end $$;

create trigger audit_critics after insert or update or delete on public.critics for each row execute function public.log_change();
create trigger audit_receipts after insert or update or delete on public.receipts for each row execute function public.log_change();
create trigger audit_settings after update on public.settings for each row execute function public.log_change();
create trigger audit_responses after insert or update or delete on public.critic_responses for each row execute function public.log_change();
create trigger audit_comments after update or delete on public.comments for each row execute function public.log_change();
create trigger audit_reports after update on public.comment_reports for each row execute function public.log_change();
create trigger audit_nominations after update or delete on public.nominations for each row execute function public.log_change();
create trigger audit_messages after update or delete on public.contact_messages for each row execute function public.log_change();
create trigger audit_profiles after update of role, is_restricted, restricted_reason on public.profiles for each row execute function public.log_change();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
create trigger critics_touch before update on public.critics for each row execute function public.touch_updated_at();
create trigger receipts_touch before update on public.receipts for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
-- Explicit grants (newer Supabase projects may not auto-expose new tables).
-- RLS below is what actually decides access.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter table public.profiles         enable row level security;
alter table public.critics          enable row level security;
alter table public.receipts         enable row level security;
alter table public.settings         enable row level security;
alter table public.rate_limits      enable row level security;
alter table public.votes            enable row level security;
alter table public.vote_events      enable row level security;
alter table public.comments         enable row level security;
alter table public.comment_reports  enable row level security;
alter table public.nominations      enable row level security;
alter table public.contact_messages enable row level security;
alter table public.critic_responses enable row level security;
alter table public.page_views       enable row level security;
alter table public.moderation_log   enable row level security;

-- profiles: own row, admins see all. Members may only change display_name.
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;
-- admins change role / restriction through the admin client paths below
grant update (role, is_restricted, restricted_reason) on public.profiles to authenticated;
-- …but a trigger stops non-admins touching those columns:
create or replace function public.profiles_protect()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.is_restricted is distinct from old.is_restricted
      or new.restricted_reason is distinct from old.restricted_reason)
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'Not allowed.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.profiles_protect();

-- critics
create policy critics_public on public.critics for select using (status = 'published' or public.is_admin());
create policy critics_admin_ins on public.critics for insert with check (public.is_admin());
create policy critics_admin_upd on public.critics for update using (public.is_admin()) with check (public.is_admin());
create policy critics_admin_del on public.critics for delete using (public.is_admin());

-- receipts
create policy receipts_public on public.receipts for select using (
  public.is_admin() or (status = 'published' and exists (select 1 from public.critics c where c.id = critic_id and c.status = 'published'))
);
create policy receipts_admin_ins on public.receipts for insert with check (public.is_admin());
create policy receipts_admin_upd on public.receipts for update using (public.is_admin()) with check (public.is_admin());
create policy receipts_admin_del on public.receipts for delete using (public.is_admin());

-- settings
create policy settings_read on public.settings for select using (true);
create policy settings_admin on public.settings for update using (public.is_admin()) with check (public.is_admin());

-- rate_limits: no direct access (functions only)

-- votes: private to the voter
create policy votes_own_select on public.votes for select using (user_id = auth.uid());
create policy votes_own_insert on public.votes for insert with check (
  user_id = auth.uid() and public.can_participate()
  and exists (select 1 from public.critics c where c.id = critic_id and c.status = 'published')
);
create policy votes_own_update on public.votes for update using (user_id = auth.uid()) with check (user_id = auth.uid() and public.can_participate());
create policy votes_own_delete on public.votes for delete using (user_id = auth.uid());
revoke update on public.votes from anon, authenticated;
grant update (value) on public.votes to authenticated;

-- Single entry point for casting, changing or withdrawing a vote.
-- security invoker: RLS policies above still apply.
create or replace function public.cast_vote(p_critic uuid, p_value text)
returns text language plpgsql security invoker set search_path = public as $$
declare cur text;
begin
  if auth.uid() is null then raise exception 'Sign in to vote.' using errcode = 'P0001'; end if;
  if p_value is not null and p_value not in ('rotten','not_rotten') then
    raise exception 'Invalid vote.' using errcode = 'P0001';
  end if;
  select value into cur from public.votes where critic_id = p_critic and user_id = auth.uid();
  if p_value is null then
    delete from public.votes where critic_id = p_critic and user_id = auth.uid();
    return null;
  elsif cur is null then
    insert into public.votes (critic_id, user_id, value) values (p_critic, auth.uid(), p_value);
  elsif cur <> p_value then
    update public.votes set value = p_value where critic_id = p_critic and user_id = auth.uid();
  end if;
  return p_value;
end $$;
revoke execute on function public.cast_vote(uuid, text) from public, anon;
grant execute on function public.cast_vote(uuid, text) to authenticated;

-- vote_events: admins only
create policy vote_events_admin on public.vote_events for select using (public.is_admin());

-- comments: author sees own (any status), admins see all; public reads via public_comments()
create policy comments_select on public.comments for select using (user_id = auth.uid() or public.is_admin());
create policy comments_insert on public.comments for insert with check (
  user_id = auth.uid() and public.can_participate()
  and exists (select 1 from public.critics c where c.id = critic_id and c.status = 'published')
);
create policy comments_admin_update on public.comments for update using (public.is_admin()) with check (public.is_admin());
create policy comments_delete on public.comments for delete using (public.is_admin() or (user_id = auth.uid() and status = 'pending'));

-- reports
create policy reports_insert on public.comment_reports for insert with check (reporter_id = auth.uid() and public.is_verified());
create policy reports_admin_select on public.comment_reports for select using (public.is_admin());
create policy reports_admin_update on public.comment_reports for update using (public.is_admin()) with check (public.is_admin());

-- nominations
create policy nominations_insert on public.nominations for insert with check (submitted_by = auth.uid() and public.is_verified());
create policy nominations_select on public.nominations for select using (submitted_by = auth.uid() or public.is_admin());
create policy nominations_admin_update on public.nominations for update using (public.is_admin()) with check (public.is_admin());
create policy nominations_admin_delete on public.nominations for delete using (public.is_admin());

-- contact messages: anyone can submit; only admins can read
create policy messages_insert_any on public.contact_messages for insert with check (true);
grant insert on public.contact_messages to anon;
create policy messages_admin_select on public.contact_messages for select using (public.is_admin());
create policy messages_admin_update on public.contact_messages for update using (public.is_admin()) with check (public.is_admin());

-- critic responses
create policy responses_public on public.critic_responses for select using (status = 'published' or public.is_admin());
create policy responses_admin_ins on public.critic_responses for insert with check (public.is_admin());
create policy responses_admin_upd on public.critic_responses for update using (public.is_admin()) with check (public.is_admin());
create policy responses_admin_del on public.critic_responses for delete using (public.is_admin());

-- page views / audit: admins read only
create policy page_views_admin on public.page_views for select using (public.is_admin());
create policy modlog_admin on public.moderation_log for select using (public.is_admin());

-- Function privileges
revoke execute on function public.hit_rate_limit(text,int,int) from public, anon, authenticated;
revoke execute on function public.assert_rate_limit(text,int,int,text) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text,int,int) to service_role;
grant execute on function public.critic_scores() to anon, authenticated;
grant execute on function public.public_comments(uuid) to anon, authenticated;
grant execute on function public.public_comment_counts() to anon, authenticated;
grant execute on function public.record_view(text) to anon, authenticated;

-- Admin-only view of accounts (emails + signup time) for abuse review.
create or replace function public.admin_users(p_ids uuid[] default null)
returns table (id uuid, email text, created_at timestamptz, display_name text, is_restricted boolean, role text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'Not allowed.' using errcode = '42501'; end if;
  return query
    select u.id, u.email::text, u.created_at, p.display_name::text, p.is_restricted, p.role
    from auth.users u join public.profiles p on p.id = u.id
    where p_ids is null or u.id = any(p_ids)
    order by u.created_at desc
    limit 2000;
end $$;
revoke execute on function public.admin_users(uuid[]) from public, anon;
grant execute on function public.admin_users(uuid[]) to authenticated;
