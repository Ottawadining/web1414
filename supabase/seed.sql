-- =====================================================================
-- Seed: the inaugural editorial order.
-- Only names, nicknames and order are supplied. Everything else
-- (city, background, roast, excerpt, portrait, receipts) is left empty
-- on purpose and must be added and verified in /admin before it appears.
-- =====================================================================
-- Replaced critics (Joanne Kates at No. 5, Mia Stainsby at No. 7, Suresh Doss at No. 9); archived if an older seed was already run.
update public.critics set editorial_rank = null, status = 'archived' where slug in ('suresh-doss', 'joanne-kates', 'mia-stainsby');

insert into public.critics (slug, name, nickname, editorial_rank, status) values
  ('lesley-chesterman',   'Lesley Chesterman',   'The Self-Appointed Supreme Court of Dinner', 1,  'published'),
  ('alexandra-gill',      'Alexandra Gill',      'The Last Word',                              2,  'published'),
  ('chris-nuttall-smith', 'Chris Nuttall-Smith', 'The Sensationalist',                         3,  'published'),
  ('marie-claude-lortie', 'Marie-Claude Lortie', 'The Unappeasable',                           4,  'published'),
  ('mark-dewolf',         'Mark DeWolf',         'The Sommelier at the Pass',                  5,  'published'),
  ('renee-suen',          'Renée Suen',          'The Professional Enthusiast',                6,  'published'),
  ('michelle-sproule',    'Michelle Sproule',    'The Relentless Optimist',                    7,  'published'),
  ('karon-liu',           'Karon Liu',           'The Food Desk Philosopher',                  8,  'published'),
  ('elizabeth-chorney-booth', 'Elizabeth Chorney-Booth', 'The Unofficial Publicist',              9,  'published'),
  ('peter-hum',           'Peter Hum',           'The Jazz Critic Who Stayed for Dinner',      10, 'published')
on conflict (slug) do update set
  name = excluded.name, nickname = excluded.nickname, editorial_rank = excluded.editorial_rank;

-- Supplied and verified copy
update public.critics set
  city = 'Calgary',
  publication = 'Calgary Herald',
  background = 'Weekly restaurant columnist for the Calgary Herald since 2018, succeeding John Gilchrist. A former music journalist, she is also a food columnist for CBC Radio in Calgary.',
  bio_verified = true,
  excerpt = 'Sometimes the most useful thing a critic can bring to dinner isn''t enthusiasm. It''s a little disappointment.',
  roast = 'Elizabeth Chorney-Booth spent her early career writing about music before discovering that restaurants offered an equally enthusiastic audience. Since taking over the Calgary Herald''s restaurant column in 2018, she''s made a specialty of celebrating the city''s dining scene, often sounding more like its unofficial publicist than its toughest critic. New openings, inspiring chefs, neighbourhood favourites — there''s always another heartwarming story to tell.

Her columns raise an awkward question: when restaurant coverage becomes an endless procession of glowing introductions, who''s left to tell readers when the food simply isn''t very good?

Sometimes the most useful thing a critic can bring to dinner isn''t enthusiasm. It''s a little disappointment.'
where slug = 'elizabeth-chorney-booth';

update public.critics set
  city = 'Halifax',
  publication = 'The Coast',
  background = 'Food and drink critic for Halifax''s The Coast. A certified sommelier and wine-tour entrepreneur, he has worked in Canada''s food and wine scene for more than 25 years.',
  bio_verified = true,
  excerpt = 'Perhaps the next time a chef visits a vineyard, they should publish a review of the winemaking.',
  roast = 'Mark DeWolf has spent more than 25 years in the food and wine business, and apparently knowing your way around a wine cellar eventually qualifies you to pass judgment on everything coming out of the kitchen. In one review, he arrives fresh from touring the wineries and restaurants of southern Italy, only to find Halifax''s wild boar failing to measure up to his Mediterranean memories. In another, he devotes considerable attention to a restaurant''s wine list before informing the kitchen that its pasta was a touch too salty.

There''s something wonderfully predictable about a wine expert reviewing dinner: the grapes get a dissertation, the chef gets a verdict, and everyone is expected to appreciate the sophistication of the exercise.

Perhaps the next time a chef visits a vineyard, they should publish a review of the winemaking.'
where slug = 'mark-dewolf';

update public.critics set
  city = 'Vancouver',
  publication = 'Scout Magazine · The Infatuation',
  background = 'Co-founder (in 2008) and managing editor of Vancouver''s Scout Magazine, and a contributor to The Infatuation''s Vancouver restaurant coverage. A writer and photographer.',
  bio_verified = true,
  excerpt = 'Somewhere in Vancouver, a chef is still waiting to discover what it takes to disappoint Michelle Sproule.',
  roast = 'Michelle Sproule has mastered a particularly agreeable form of restaurant criticism: finding restaurants she likes and explaining, in considerable detail, why everyone else should like them too. At AnnaLena, the food is extraordinary. At Masayoshi, the chef is a master of his craft. At Hy''s, even the creamed spinach earns applause. One begins to wonder whether Vancouver has somehow achieved culinary perfection or whether the less impressive dinners simply never make it into print.

It''s a wonderfully efficient system of criticism in which the restaurants are excellent, the recommendations are enthusiastic, and the uncomfortable business of actually criticizing something is largely avoided.

Somewhere in Vancouver, a chef is still waiting to discover what it takes to disappoint Michelle Sproule.'
where slug = 'michelle-sproule';

-- Portraits (files live in public/portraits/)
update public.critics set portrait_url = '/portraits/' || slug || '.jpg'
where slug in ('lesley-chesterman', 'alexandra-gill', 'chris-nuttall-smith', 'marie-claude-lortie', 'renee-suen', 'mark-dewolf', 'peter-hum', 'elizabeth-chorney-booth', 'karon-liu', 'michelle-sproule');

-- Settings: launch defaults (editable in /admin/settings)
update public.settings set min_votes = 50, community_size = 10, force_editorial = false where id = 1;
