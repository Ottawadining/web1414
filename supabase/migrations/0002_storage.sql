-- Public bucket for critic portraits. Only admins can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portraits', 'portraits', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "portraits public read" on storage.objects for select using (bucket_id = 'portraits');
create policy "portraits admin insert" on storage.objects for insert with check (bucket_id = 'portraits' and public.is_admin());
create policy "portraits admin update" on storage.objects for update using (bucket_id = 'portraits' and public.is_admin());
create policy "portraits admin delete" on storage.objects for delete using (bucket_id = 'portraits' and public.is_admin());
