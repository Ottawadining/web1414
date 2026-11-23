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
  ('alexandra-gill',      'Alexandra Gill',      'The Restaurant Executioner',                              2,  'published'),
  ('chris-nuttall-smith', 'Chris Nuttall-Smith', 'The Sensationalist',                         3,  'published'),
  ('marie-claude-lortie', 'Marie-Claude Lortie', 'The Unappeasable',                           4,  'published'),
  ('mark-dewolf',         'Mark DeWolf',         'The Sommelier at the Pass',                  5,  'published'),
  ('renee-suen',          'Renée Suen',          'The Panel of One',                           6,  'published'),
  ('michelle-sproule',    'Michelle Sproule',    'The Relentless Optimist',                    7,  'published'),
  ('karon-liu',           'Karon Liu',           'The Food Desk Philosopher',                  8,  'published'),
  ('elizabeth-chorney-booth', 'Elizabeth Chorney-Booth', 'The Eternal Cheerleader',               9,  'published'),
  ('peter-hum',           'Peter Hum',           'The Accidental Food Critic',                10, 'published')
on conflict (slug) do update set
  name = excluded.name, nickname = excluded.nickname, editorial_rank = excluded.editorial_rank;

-- Lesley Chesterman: roast, verified details and receipts
update public.critics set
  city = 'Montréal',
  publication = 'Montreal Gazette (former)',
  background = 'Restaurant critic for the Montreal Gazette for two decades. She now writes the Lick my Plate newsletter and has published several cookbooks.',
  bio_verified = true,
  excerpt = 'Chesterman may have retired from handing down verdicts, but the authority of the critic is long overdue for an appeal.',
  roast = 'For twenty years, Lesley Chesterman presided over Montréal''s dining scene like a Supreme Court justice with a reservation book. Her four-star rating was so precious that restaurants could go years without seeing one, as though perfection were a privilege only she was qualified to recognize.

At Candide, she dismissed an ambitious young chef''s cooking as joyless, while other prominent critics were busy praising the very same restaurant. And when her final review of Toqué! proved disappointing, she declined to award a star rating at all, citing her long affection for the establishment. Apparently, twenty-five years of goodwill could earn a restaurant the benefit of the doubt that others weren''t always afforded.

Chesterman may have retired from handing down verdicts, but the authority of the critic is long overdue for an appeal.'
where slug = 'lesley-chesterman';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'lesley-chesterman');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'lesley-chesterman'), 'The four-star drought', 'In twenty years at the Gazette, Chesterman awarded a perfect four-star rating only a handful of times. Joe Beef and L''Express were among the few to get one.', 'https://montreal.ctvnews.ca/weekend-bite-lesley-chesterman-moves-on-after-two-decades-of-food-writing-1.4251575', 'CTV News Montreal', null, null, 1, 'published', now()),
  ((select id from public.critics where slug = 'lesley-chesterman'), 'The Candide head-scratcher', 'Reviewing Candide in Little Burgundy, Chesterman acknowledged that critical acclaim had been "rolling in since its opening", then wrote that she walked away "scratching my head": the meal wasn''t depressing, but it "wasn''t the height of cheeriness either." The review ran under the headline "Artistic vision needs a little colour."', 'https://www.pressreader.com/canada/montreal-gazette/20160206/283085593223639', 'Montreal Gazette', '2016-02-06', null, 2, 'published', now()),
  ((select id from public.critics where slug = 'lesley-chesterman'), 'The Toqué! exception', 'Chesterman''s final Gazette review described a disappointing meal at Toqué!, then withheld the star rating: "my love for Toqué! will not be quashed by one mediocre meal. And for that reason, allow me to hold off on the star rating for this last review."', 'https://eatnorth.com/node/4461', 'Eat North (reporting on the Gazette review)', null, 'Chesterman said her affection came from 25 years of patronizing the restaurant.', 3, 'published', now());

-- Alexandra Gill: nickname, roast, verified details and receipts
update public.critics set
  nickname = 'The Restaurant Executioner',
  city = 'Vancouver',
  publication = 'The Globe and Mail (former)',
  background = 'The Globe and Mail''s Vancouver restaurant critic from 2005, after joining the paper as an entertainment columnist. She now runs Dine Like a Critic.',
  bio_verified = true,
  excerpt = 'Somewhere along the way, the review became the main course.',
  roast = 'Before Alexandra Gill became one of Vancouver''s most feared restaurant critics, she was an entertainment and gossip columnist. As it turns out, the transition from celebrity gossip to culinary demolition was remarkably seamless.

At Blackbird, she declared the restaurant horrible and delivered a review so savage it was still being quoted years later. At Nightingale, she dismissed David Hawksworth''s highly anticipated restaurant as a bland L.A. knockoff. And when Hydra Estiatorio failed to impress, the restaurant responded by purchasing an advertisement in her own newspaper to challenge the relevance of professional critics.

There''s no denying Gill could write a devastating review. The more interesting question is whether a restaurant critic''s job is to help diners decide where to eat, or to make the destruction of a restaurant the most entertaining story in town. Somewhere along the way, the review became the main course.'
where slug = 'alexandra-gill';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'alexandra-gill');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'alexandra-gill'), '"Mostly gossip"', 'Gill joined The Globe and Mail as an entertainment columnist in 1998. In her own words, the job "was actually mostly gossip, quite gruelling and prepared me well for being a restaurant critic."', 'https://jellymarketing.ca/blog/ask-the-expert-alexandra-gill/', 'Jelly Marketing interview', null, null, 1, 'published', now()),
  ((select id from public.critics where slug = 'alexandra-gill'), 'Blackbird: "horrible"', 'Her review opened: "There is no sense in pussyfooting around it: the Blackbird bistro is horrible. My first meal there was easily one of the worst dining experiences I''ve had in nearly 10 years of reviewing restaurants." The Globe ran it under the headline "a fine-dining disaster."', 'https://www.theglobeandmail.com/life/food-and-wine/restaurant-reviews/donnelly-groups-blackbird-bistro-a-fine-dining-disaster/article20172351/', 'The Globe and Mail', '2014-08-22', null, 2, 'published', now()),
  ((select id from public.critics where slug = 'alexandra-gill'), 'Nightingale: "a hard miss"', 'Gill''s review of David Hawksworth''s much-anticipated second restaurant ran as "Vancouver''s Nightingale is a hard miss for a Canadian culinary leader," calling it a "bland L.A. knockoff" and "a head scratcher."', 'https://www.theglobeandmail.com/life/food-and-wine/restaurant-reviews/vancouvers-nightingale-is-a-hard-miss-for-a-canadian-culinary-leader/article31813563/', 'The Globe and Mail', '2016-09-09', null, 3, 'published', now()),
  ((select id from public.critics where slug = 'alexandra-gill'), 'Hydra Estiatorio buys an ad', 'After Gill''s December 2019 review called Hydra "a cheap and nasty package," the restaurant took out an advertisement in the following Saturday''s Globe calling restaurant critics "dated, valueless, and irrelevant."', 'https://rrj.ca/?p=17173', 'Ryerson Review of Journalism', null, 'The Globe''s public editor later said the ad was published through human error, and the paper gave the ad money to charity.', 4, 'published', now());

-- Chris Nuttall-Smith: roast, verified details and receipts
update public.critics set
  city = 'Toronto',
  publication = 'The Globe and Mail (former)',
  background = 'The Globe and Mail''s restaurant critic for four years until 2016, after serving as food editor and restaurant critic at Toronto Life. Now a Top Chef Canada judge.',
  bio_verified = true,
  excerpt = 'There''s a fine line between fearless criticism and theatrical destruction, and few Canadian food writers have explored it with quite so much enthusiasm.',
  roast = 'Chris Nuttall-Smith never seemed content to simply dislike a restaurant. Why settle for a disappointing dinner when you can turn it into a literary bloodbath? Armed with fake names, disguises and a microphone to record conversations, he approached restaurant criticism with the operational sophistication of an undercover intelligence agency.

His infamous demolition of Toronto''s America restaurant went viral, and the entire front-of-house staff was subsequently fired. Restaurateur Jen Agg publicly blamed his review for the demise of her Raw Bar, while another chef described the crushing effect of one of his takedowns on staff morale.

Nuttall-Smith once explained that he didn''t merely want to have an opinion; he wanted to be right. An admirable ambition, perhaps, for someone whose profession consists largely of subjective judgments about dinner. There''s a fine line between fearless criticism and theatrical destruction, and few Canadian food writers have explored it with quite so much enthusiasm.'
where slug = 'chris-nuttall-smith';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'chris-nuttall-smith');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'chris-nuttall-smith'), 'Undercover operations', 'A 2015 Guardian profile described his methods: he never booked under his own name, gave dinner guests an alias to use in the dining room, changed his look, and recorded service with a live microphone. He told the paper: "I don''t want to have an opinion. I want to be right."', 'https://www.theguardian.com/lifeandstyle/2015/dec/07/toronto-restaurant-critic-chris-nuttall-smith', 'The Guardian', '2015-12-07', null, 1, 'published', now()),
  ((select id from public.critics where slug = 'chris-nuttall-smith'), 'America, at the Trump Hotel', 'His review of America, the fine-dining restaurant at Toronto''s Trump hotel, was shared more than 15,000 times on Facebook within a day. The Guardian reported that the restaurant then fired its entire front-of-house staff.', 'https://www.theguardian.com/lifeandstyle/2015/dec/07/toronto-restaurant-critic-chris-nuttall-smith', 'The Guardian', '2015-12-07', 'Nuttall-Smith told the Guardian he felt bad about the firings, and bad for the chef.', 2, 'published', now()),
  ((select id from public.critics where slug = 'chris-nuttall-smith'), 'Hoof Raw Bar: "awful"', 'His 2012 review of Jen Agg''s Hoof Raw Bar said: "A lot of the food is awful." Agg later told Toronto Life: "I do think Chris Nuttall-Smith''s terrible review closed us down."', 'https://www.theglobeandmail.com/life/food-and-wine/restaurant-reviews/hoof-raw-bar-a-menu-in-need-of-a-lighter-touch/article4275464/', 'The Globe and Mail', null, 'This is Agg''s account. In the same interview she said "we probably missed the mark somewhere." The two later debated it on Canadaland''s Taste Buds podcast (2018).', 3, 'published', now()),
  ((select id from public.critics where slug = 'chris-nuttall-smith'), 'Hey!: a neighbourhood spot eviscerated', 'In 2012 chef Rod Bowers'' Roncesvalles restaurant, Hey!, received what Streets of Toronto called "a thorough evisceration" from Nuttall-Smith. The magazine reported that the review hurt the team''s morale, and Bowers questioned why a critic needed to be so harsh with a family-friendly neighbourhood restaurant.', 'https://streetsoftoronto.com/food/the-end-of-the-toronto-restaurant-critic/', 'Streets of Toronto', '2020-03-09', null, 4, 'published', now());

-- Marie-Claude Lortie: roast, verified details and receipts
update public.critics set
  city = 'Montréal',
  publication = 'La Presse (former)',
  background = 'La Presse''s restaurant critic from 2002 to 2021, part of a 33-year career at the paper as a reporter and columnist. She then became editor-in-chief of Le Droit in Ottawa-Gatineau.',
  bio_verified = true,
  excerpt = 'After two decades of dispensing disappointment, she left wondering whether she should have dispensed more.',
  roast = 'Marie-Claude Lortie spent nineteen years passing judgment on Montréal restaurants for La Presse, and somehow concluded that her greatest failing was not being harsh enough. That must have come as news to chef Martin Juneau, who publicly took her to task over her review of Les Coudes sur la Table, a review one magazine later described as far from virulent. Or to the team at Candide, who watched Lortie dismiss their ambitious local cuisine as a challenge the kitchen couldn''t meet, then announce she wouldn''t be going back.

When Candide''s sommelier publicly questioned the review, Lortie fired back with a rebuttal, apparently astonished that the people being judged might have opinions of their own. For someone whose career involved telling chefs what they were doing wrong, she seemed remarkably unenthusiastic about receiving a little criticism herself.

And after two decades of dispensing disappointment, she left wondering whether she should have dispensed more. Somewhere in Montréal, a chef is still recovering from the restraint.'
where slug = 'marie-claude-lortie';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'marie-claude-lortie');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'marie-claude-lortie'), 'Candide: "Malheureusement, non"', 'Her April 2016 review called Candide''s hyper-local cooking a very difficult challenge the kitchen wasn''t meeting, flagged burnt wild rice and a bland Jerusalem artichoke dish, and ended: "On y retourne ? Malheureusement, non." (Are we going back? Unfortunately, no.)', 'https://www.lapresse.ca/vivre/gourmand/restaurants/201604/13/01-4970788-candide-le-difficile-defi-du-locavore.php', 'La Presse', '2016-04-15', 'The same review praised the chef''s locavore philosophy, the front-of-house team and sommelier Emily Campeau''s energy.', 1, 'published', now()),
  ((select id from public.critics where slug = 'marie-claude-lortie'), 'Candide bites back', 'Montreal''s critics split two and two on Candide. Sommelier Emily Campeau publicly defended the restaurant, which prompted a rebuttal letter from Lortie. Eat North concluded that many in the industry sided with Campeau.', 'https://eatnorth.com/mallory-frayn/year-review-stand-out-montreal-food-news-2016', 'Eat North', null, null, 2, 'published', now()),
  ((select id from public.critics where slug = 'marie-claude-lortie'), 'Les Coudes sur la Table', 'In November 2014 Lortie reviewed Les Coudes sur la Table under the headline "déception sur airs connus" (disappointment to a familiar tune). Chef Martin Juneau publicly attacked her over it, defending the restaurant''s owner as a brave entrepreneur whose livelihood a critic could threaten at no risk to herself. L''actualité, writing about the episode, called the review far from virulent.', 'https://www.lapresse.ca/vivre/restaurants/201411/19/01-4820413-les-coudes-sur-la-table-deception-sur-airs-connus.php', 'La Presse', '2014-11-19', 'L''actualité''s account: https://lactualite.com/culture/2015/02/20/ne-tirez-pas-sur-les-critiques/', 3, 'published', now()),
  ((select id from public.critics where slug = 'marie-claude-lortie'), 'Not severe enough', 'Announcing her departure from La Presse after 19 years of restaurant reviews, she wrote that she would certainly write some reviews differently today, and that she believed she had more often erred by not being severe enough: "Je crois que j''ai plus souvent erré en n''étant pas assez sévère."', 'https://www.lapresse.ca/gourmand/chroniques/2021-05-22/au-revoir.php', 'La Presse', '2021-05-22', 'She said her main regret was not investigating restaurants more, including sourcing, workers'' wages and harassment.', 4, 'published', now());

-- Renée Suen: roast, verified details and receipts
update public.critics set
  city = 'Toronto',
  publication = 'The Infatuation · Toronto Life',
  background = 'Toronto-based restaurant and travel journalist and photographer, and a former academic scientist, who has covered Canada''s food scene for nearly two decades. Academy Chair for The World''s 50 Best Restaurants and North America''s 50 Best.',
  bio_verified = true,
  excerpt = 'Perhaps the next great culinary competition should involve judging the judges. At least she''d know the format.',
  roast = 'Renée Suen has managed to turn eating in restaurants into something resembling a permanent seat on the Security Council of Gastronomy. She''s an Academy Chair for The World''s 50 Best Restaurants, an Academy Chair for North America''s 50 Best, head Toronto judge for the Canadian Culinary Championship, and a panellist on enough restaurant rankings to make a Michelin inspector look underemployed. When she isn''t helping decide which restaurants deserve international recognition, she''s writing about them for publications such as Toronto Life and The Infatuation.

At some point, the distinction between reviewing restaurants and participating in the machinery that celebrates them begins to look rather academic. Suen''s impressive collection of judging credentials raises a perfectly reasonable question: how many awards panels does one person need to sit on before the entire restaurant industry starts to feel like a private dinner party?

Perhaps the next great culinary competition should involve judging the judges. At least she''d know the format.'
where slug = 'renee-suen';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'renee-suen');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'renee-suen'), 'The World''s 50 Best: Academy Chair', '50 Best''s own Academy page lists her as Academy Chair for Mid USA & Mid Canada in The World''s 50 Best Restaurants, one of the regional chairs who run its voting panels. When she was appointed she said she was the list''s first Canadian chair.', 'https://www.theworlds50best.com/restaurants/best-in-north-america/voting/the-academy.html', 'The World''s 50 Best Restaurants', null, null, 1, 'published', now()),
  ((select id from public.critics where slug = 'renee-suen'), 'North America''s 50 Best: Canada Central', 'On the Academy page for North America''s 50 Best Restaurants, launched in 2025, she is listed as the chair for Canada Central.', 'https://www.theworlds50best.com/northamerica/en/voting/the-academy.html', 'North America''s 50 Best Restaurants', null, null, 2, 'published', now()),
  ((select id from public.critics where slug = 'renee-suen'), 'Head Toronto judge, and then some', 'Her published bios describe her as head Toronto judge for the Canadian Culinary Championship, a panellist for various restaurant ranking surveys, and a former guest judge on Iron Chef Canada.', 'https://www.terroirsymposium.com/renee-suen', 'Terroir Symposium', null, null, 3, 'published', now()),
  ((select id from public.critics where slug = 'renee-suen'), 'The Infatuation: Toronto''s best restaurants', 'She is one of three credited authors of The Infatuation''s guide to the best restaurants in Toronto, last updated in September 2026. She wrote ten of its entries, including Lunch Lady and Kappo Sato.', 'https://www.theinfatuation.com/toronto/guides/best-restaurants-toronto', 'The Infatuation', '2026-09-28', 'Co-authored with Erin Hershberg and Deepi Harish.', 4, 'published', now());

-- Karon Liu: roast, verified details and receipts
update public.critics set
  city = 'Toronto',
  publication = 'Toronto Star',
  background = 'Toronto Star food reporter, on staff since January 2016 after freelancing for the paper and covering food for The Grid. He was hired as the Star''s recipe tester and developer. By his own description, he is not a restaurant critic.',
  bio_verified = true,
  excerpt = 'Perhaps the most remarkable thing about Toronto''s restaurant scene isn''t how many great places Liu discovers, but how few disappointing ones ever seem to make the column.',
  roast = 'Karon Liu has spent more than a decade covering Toronto''s restaurants for the Toronto Star, mastering the increasingly popular art of food criticism without much actual criticism. His columns are a seemingly endless parade of hidden gems, inspiring immigrant success stories, neighbourhood discoveries and remarkably affordable lunches. There''s always another wonderful little restaurant that deserves your attention, another $10 bowl of noodles that might just change your life.

Liu has even explained that he sees his job as filling in the blanks for readers by interviewing cooks and telling their stories. Admirable journalism, certainly, but somewhere along the way, the restaurant review appears to have become an endangered species. Chefs get their stories told, readers get another recommendation, and the uncomfortable business of telling someone their cooking isn''t very good is largely left to somebody else.

Perhaps the most remarkable thing about Toronto''s restaurant scene isn''t how many great places Liu discovers, but how few disappointing ones ever seem to make the column.'
where slug = 'karon-liu';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'karon-liu');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'karon-liu'), '"No, I''m not a restaurant critic"', 'That was the title of the 2022 Atkinson Lecture he gave at Toronto Metropolitan University''s journalism school: "No, I''m not a restaurant critic" and other notes on food reporting.', 'https://www.torontomu.ca/journalism/news-events/2022/04/-no--i-m-not-a-restaurant-critic--and-other-notes-on-food-report/', 'Toronto Metropolitan University', '2022-04-07', 'In fairness, he says so himself: he describes his job as food reporting, not restaurant criticism.', 1, 'published', now()),
  ((select id from public.critics where slug = 'karon-liu'), 'Filling in the blanks', 'In the lecture he said: "The job of a food writer is to fill in the blanks and get the information that a regular diner won''t be able to." That means talking to cooks, staff and cuisine experts so readers know the context and the people behind a dish.', 'https://www.torontomu.ca/journalism/news-events/2022/04/alum-and-toronto-star-food-reporter-gives-the-2022-atkinson-lect/', 'Toronto Metropolitan University', '2022-04-25', null, 2, 'published', now()),
  ((select id from public.critics where slug = 'karon-liu'), 'The beat, in his words', 'Asked in 2024 what a food reporter covers, he listed openings and closings, chef profiles and trend stories, profiles of chefs and restaurants doing interesting things, and pockets of the city he considers culinary destinations.', 'https://www.torontomu.ca/research/publications/newsletter/food-for-life-cultivating-sustaining-and-transforming/food-beat-with-journalism-alum-karon-liu/', 'Toronto Metropolitan University', null, null, 3, 'published', now()),
  ((select id from public.critics where slug = 'karon-liu'), 'The best thing I ate this week', 'His weekly Star column promises "a trusted and affordable recommendation on what to eat in the city." A January 2026 instalment: "This hearty $9 congee combo is the best thing I ate in Toronto this week."', 'https://www.pressreader.com/canada/toronto-star/20260110/282248081944740', 'Toronto Star (via PressReader)', '2026-01-10', null, 4, 'published', now());

-- Portraits (files live in public/portraits/)
-- Elizabeth Chorney-Booth: nickname, roast, verified details and receipts, verified details and receipts
update public.critics set
  nickname = 'The Eternal Cheerleader',
  city = 'Calgary',
  publication = 'Calgary Herald',
  background = 'Weekly restaurant columnist for the Calgary Herald since 2018, succeeding John Gilchrist. A former rock ''n'' roll journalist, she is also the food trends columnist for CBC Calgary''s The Homestretch and writes the Who''s Hungry, Calgary? newsletter.',
  bio_verified = true,
  excerpt = 'Somewhere in Calgary, there must be a disappointing restaurant. Perhaps nobody''s told Elizabeth.',
  roast = 'Elizabeth Chorney-Booth began her career writing about rock stars before discovering that chefs were considerably easier to find at dinner. Since inheriting the Calgary Herald''s restaurant column in 2018, she''s made a career of introducing readers to Calgary''s latest culinary triumphs, with an enthusiasm that occasionally makes the distinction between restaurant criticism and public relations difficult to locate. At Saint Vincent, there''s another wonderful neighbourhood restaurant to celebrate. At Bar Chouette, a "Je t''aime." She even published a love letter to Bar Gigi, apparently deciding that ordinary praise was no longer sufficient.

Chorney-Booth also judges Avenue''s Best Restaurants awards, writes restaurant recommendations for OpenTable, and contributes to Tourism Calgary. It''s an impressive collection of platforms for celebrating the city''s dining scene. But when the critic, the cheerleader and the tourism guide all sound remarkably similar, one has to wonder who''s left to deliver the bad news.

Somewhere in Calgary, there must be a disappointing restaurant. Perhaps nobody''s told Elizabeth.'
where slug = 'elizabeth-chorney-booth';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'elizabeth-chorney-booth');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'elizabeth-chorney-booth'), 'Saint Vincent: a new chapter', 'Her November 19, 2026 Herald column introduced Saint Vincent, the new Marda Loop restaurant from the founders of Una Pizza and Wine, largely through the owners'' story. She had previewed it in her newsletter the week before as "the new buzzy spot in Marda Loop."', 'https://ca.news.yahoo.com/chorney-booth-saint-vincent-chapter-123828498.html', 'Calgary Herald (via Yahoo News)', '2026-11-19', null, 1, 'published', now()),
  ((select id from public.critics where slug = 'elizabeth-chorney-booth'), '"It''s okay to swoon over a restaurant"', 'On September 4, 2026 her newsletter published "A love letter to Bar Gigi," subtitled "It''s okay to swoon over a restaurant." A week earlier she had called Gigi one of her favourite restaurants in all of Canada. A week later her lead item was headed "Oh, Bar Chouette. Je t''aime."', 'https://hungrycalgary.substack.com/p/a-love-letter-to-bar-gigi', 'Who''s Hungry, Calgary?', '2026-09-04', null, 2, 'published', now()),
  ((select id from public.critics where slug = 'elizabeth-chorney-booth'), 'Judge, list-maker, tourism guide', 'She sat on the judging panel for Avenue Calgary''s 2026 Best Restaurants, whose guiding principle was to showcase restaurants the judges would personally recommend. She also writes restaurant round-ups for Tourism Calgary and curated lists for OpenTable, such as "11 of Calgary''s Best Date-Night Restaurants."', 'https://www.avenuecalgary.com/best-restaurants-calgary/avenue-2026-best-restaurants-judges/', 'Avenue Calgary', null, 'Tourism Calgary author page: https://www.visitcalgary.com/authors/elizabeth-chorney-booth', 3, 'published', now()),
  ((select id from public.critics where slug = 'elizabeth-chorney-booth'), 'She tells you when it''s comped', 'In fairness, she discloses it. A March 2026 newsletter flagged a meal where the restaurant "invited me in as a hosted guest and pulled out all the stops," and she runs an "Off the Clock Review" series on what she eats when she''s footing her own bill.', 'https://hungrycalgary.substack.com/p/march-4-2026', 'Who''s Hungry, Calgary?', '2026-03-04', 'Her work across these outlets does not, by itself, establish any conflict of interest.', 4, 'published', now());

-- Mark DeWolf: roast, verified details and receipts
update public.critics set
  city = 'Halifax',
  publication = 'The Coast',
  background = 'Food and drink critic for Halifax''s The Coast, and a fixture of Canada''s food and wine scene for more than 25 years. A sommelier and former national president of the Canadian Association of Professional Sommeliers, he runs food-and-wine tours and edits ASI Magazine for the international sommelier association.',
  bio_verified = true,
  excerpt = 'Perhaps the next time a chef visits a vineyard, they should publish a review of the winemaking. After all, they''ve tasted wine before.',
  roast = 'Mark DeWolf spent more than two decades establishing himself as a wine expert before deciding that the contents of the plate deserved his professional judgment too. A sommelier, wine educator, international tour host and former president of Canada''s professional sommelier association, DeWolf certainly knows his way around a glass.

But at Halifax''s Via Condotti, his expertise apparently extended to explaining why Nova Scotian boar couldn''t measure up to the animals roaming the forests of central Italy — despite admitting he didn''t actually know where the restaurant''s meat came from. At Tribute, the pasta was too salty, the steak needed more salt, and the wine list received the sort of detailed examination usually reserved for a doctoral dissertation. Somewhere in Halifax, a chef is still trying to calculate the precise milligram of sodium required to satisfy Mark DeWolf.

Perhaps the next time a chef visits a vineyard, they should publish a review of the winemaking. After all, they''ve tasted wine before.'
where slug = 'mark-dewolf';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'mark-dewolf');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'mark-dewolf'), 'Via Condotti: the boar of uncertain origin', 'He found Via Condotti''s wild boar pappardelle "lacked the earthy, game-driven depth associated with the great versions found throughout Tuscany and Umbria," and suggested it might be farmed Nova Scotian boar. Then: "Note, I do not know the source of the boar. I am only speculating."', 'https://www.thecoast.ca/food-drink-2/lofty-expectations-a-night-at-via-condotti/', 'The Coast', '2026-05-19', null, 1, 'published', now()),
  ((select id from public.critics where slug = 'mark-dewolf'), 'Tribute: too salty, then not salty enough', 'At Tribute he called the balzoni''s texture sublime but said "the dish itself was a little too salty." Of the steak: "a touch more salt here would have been welcome." The wine list, he noted, has "a deep Italian slant."', 'https://www.thecoast.ca/food-drink-2/chef-colin-bebbingtons-tribute-where-anticipation-met-reality/', 'The Coast', '2026-01-19', 'The same review praised the kitchen''s clear technique and ambition.', 2, 'published', now()),
  ((select id from public.critics where slug = 'mark-dewolf'), 'The wine credentials', 'In 2020 he stepped down as national president of the Canadian Association of Professional Sommeliers after a nearly four-year term, following three years as national vice-president. He now edits ASI Magazine for the Association de la Sommellerie Internationale.', 'https://www.asi.info/?p=4400281', 'Association de la Sommellerie Internationale', '2020-11-11', 'He turned his sommelier training into wine businesses, starting with wine tours in Nova Scotia and then Europe.', 3, 'published', now());

-- Michelle Sproule: roast, verified details and receipts
update public.critics set
  city = 'Vancouver',
  publication = 'Scout Magazine · The Infatuation',
  background = 'Co-founder (in 2008), publisher and managing editor of Vancouver''s Scout Magazine, and a contributor to The Infatuation''s Vancouver restaurant coverage.',
  bio_verified = true,
  excerpt = 'Somewhere in Vancouver, a chef must have served Michelle Sproule a bad meal. We''d love to read about it.',
  roast = 'Michelle Sproule has perfected a particularly comfortable form of restaurant criticism: finding places she likes and explaining why everyone else should like them too. As a co-founder of Scout Magazine and a contributor to The Infatuation, she''s built a career around Vancouver''s dining scene, where apparently there''s no shortage of restaurants deserving applause. At AnnaLena, the tasting menu is a triumph. At Masayoshi, the chef''s precision is extraordinary. At Hy''s Steakhouse, even the creamed spinach gets its moment in the spotlight.

One begins to wonder whether Vancouver has achieved culinary perfection or whether the disappointing dinners simply never make it into print. Of course, recommending good restaurants is useful. But calling it criticism when almost everyone gets a glowing report feels a little like running a cooking competition where only the winners are allowed to enter.

Somewhere in Vancouver, a chef must have served Michelle Sproule a bad meal. We''d love to read about it.'
where slug = 'michelle-sproule';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'michelle-sproule');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'michelle-sproule'), 'AnnaLena: "no qualifiers needed"', 'Her September 2025 Infatuation review: "AnnaLena is one of Vancouver''s best restaurants, no qualifiers needed." You could ignore the design details, she wrote, and "still be blown away by the food."', 'https://www.theinfatuation.com/vancouver/reviews/annalena', 'The Infatuation', '2025-09-19', null, 1, 'published', now()),
  ((select id from public.critics where slug = 'michelle-sproule'), 'Masayoshi: near-surgical precision', 'Her February 2026 review of the $245, roughly 18-course omakase describes scallops wrapped with "near-surgical precision" and a chef with "command of his craft."', 'https://www.theinfatuation.com/vancouver/reviews/masayoshi', 'The Infatuation', '2026-02-05', null, 2, 'published', now()),
  ((select id from public.critics where slug = 'michelle-sproule'), 'Hy''s: the creamed spinach''s moment', 'At Hy''s she praised the "expertly mixed Manhattans" and wrote that the sides pull their weight, especially the creamed spinach, "which is lush instead of gloopy."', 'https://www.theinfatuation.com/vancouver/reviews/hy-s-steakhouse-cocktail-bar', 'The Infatuation', '2025-09-19', null, 3, 'published', now()),
  ((select id from public.critics where slug = 'michelle-sproule'), 'Scout''s mission statement', 'Scout, which she co-founded in 2008, has long described its main objective as being to "scout out and promote the things that make Vancouver such a sweet place to be."', 'https://scoutmagazine.ca/the-scout-list-a-curated-agenda-for-discerning-vancouverites-9/', 'Scout Magazine', null, 'A run of positive reviews doesn''t by itself show that she avoids negative criticism. The Infatuation does publish Vancouver pans: its 2025 review of Published on Main, for example, was written by a colleague.', 4, 'published', now());

-- Peter Hum: roast, verified details and receipts
update public.critics set
  nickname = 'The Accidental Food Critic',
  city = 'Ottawa',
  publication = 'Ottawa Citizen',
  background = 'At the Ottawa Citizen since 1990, where he worked a string of news beats before becoming restaurant critic in 2012. Also a jazz pianist with several albums. His grandfather, father and uncles ran Chinese restaurants in Ottawa from 1910 to 1985.',
  bio_verified = true,
  excerpt = 'After fourteen years of restaurant reviews, perhaps the real question isn''t whether Peter Hum knows how to criticize a chef. It''s whether fourteen years of criticizing chefs qualifies him to become one.',
  roast = 'Peter Hum spent two decades at the Ottawa Citizen covering everything from city hall to the courts, and blogging about jazz on the side, before somebody apparently decided that reviewing saxophone solos was sufficient preparation for judging professional kitchens. One day it''s the phrasing of a trumpet solo; the next it''s the seasoning of a beurre blanc. Why not? Both require taste, timing, and the confidence to tell someone with considerably more practical experience what they should have done differently.

Hum has since spent years dissecting Ottawa''s restaurants with the meticulous attention of a man reviewing a particularly complicated jazz arrangement. In 2026, the National Arts Centre even invited him into the kitchen as a resident chef, finally giving him a chance to experience the profession from the other side of the pass.

After fourteen years of restaurant reviews, perhaps the real question isn''t whether Peter Hum knows how to criticize a chef. It''s whether fourteen years of criticizing chefs qualifies him to become one.'
where slug = 'peter-hum';

delete from public.receipts where critic_id = (select id from public.critics where slug = 'peter-hum');
insert into public.receipts (critic_id, headline, explanation, source_url, source_title, published_on, context, sort_order, status, verified_at) values
  ((select id from public.critics where slug = 'peter-hum'), 'From the news desk to the dining room', 'Hum joined the Ottawa Citizen in 1990 and wrote and edited on numerous beats before becoming its restaurant critic in 2012. He is also a jazz pianist who has released several albums.', 'https://capitalcurrent.ca/peter-hum-brings-ottawa-appetite-to-restaurant-critiques/', 'Capital Current', null, 'Restaurants do run in the family: his grandfather, father and uncles ran some of Ottawa''s first Chinese restaurants, dating back to the 1910s.', 1, 'published', now()),
  ((select id from public.critics where slug = 'peter-hum'), 'The critic becomes the chef', 'The National Arts Centre named him a resident chef at 1 Elgin, its restaurant, for an eight-week stint in early 2026. He worked with NAC executive chef Kenton Leier on the menu and on the Resident Chef Series Gala.', 'https://capitalcurrent.ca/peter-hum-brings-ottawa-appetite-to-restaurant-critiques/', 'Capital Current', null, 'Under the NAC programme, the resident chef supplies the recipes and works with the 1 Elgin kitchen team on the final plates.', 2, 'published', now()),
  ((select id from public.critics where slug = 'peter-hum'), 'Hand-picked by the critic', 'The menu for the Ottawa Citizen Best Restaurants 2026 event at the National Arts Centre, on October 19, featured restaurants "hand-picked by the Citizen''s renowned restaurant critic Peter Hum."', 'https://nac-cna.ca/en/event/41904', 'National Arts Centre', '2026-10-19', 'A portion of ticket sales went to the Ottawa Food Bank.', 3, 'published', now());

update public.critics set portrait_url = '/portraits/' || slug || '.jpg'
where slug in ('lesley-chesterman', 'alexandra-gill', 'chris-nuttall-smith', 'marie-claude-lortie', 'renee-suen', 'mark-dewolf', 'peter-hum', 'elizabeth-chorney-booth', 'karon-liu', 'michelle-sproule');

-- Settings: launch defaults (editable in /admin/settings)
update public.settings set min_votes = 50, community_size = 10, force_editorial = false where id = 1;
