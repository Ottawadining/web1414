/**
 * Build-time data. Runs during `next build` (GitHub Actions) with the public
 * anon key, so the exported HTML contains real names and copy for SEO.
 * The browser then refreshes everything live (see lib/live.ts).
 */
import { createPublicClient, isConfigured } from "./supabase/public";
import { DEFAULT_SETTINGS, toScoreMap } from "./ranking";
import type { Critic, Receipt, Settings } from "./types";

const PREVIEW: Array<[string, string, string]> = [
  ["lesley-chesterman", "Lesley Chesterman", "The Self-Appointed Supreme Court of Dinner"],
  ["alexandra-gill", "Alexandra Gill", "The Last Word"],
  ["chris-nuttall-smith", "Chris Nuttall-Smith", "The Sensationalist"],
  ["marie-claude-lortie", "Marie-Claude Lortie", "The Unappeasable"],
  ["mark-dewolf", "Mark DeWolf", "The Sommelier at the Pass"],
  ["renee-suen", "Renée Suen", "The Professional Enthusiast"],
  ["michelle-sproule", "Michelle Sproule", "The Relentless Optimist"],
  ["karon-liu", "Karon Liu", "The Food Desk Philosopher"],
  ["elizabeth-chorney-booth", "Elizabeth Chorney-Booth", "The Unofficial Publicist"],
  ["peter-hum", "Peter Hum", "The Jazz Critic Who Stayed for Dinner"],
];
/** Critics with a portrait in public/portraits/<slug>.jpg (mirrors seed.sql). */
const PORTRAITS = ["lesley-chesterman", "alexandra-gill", "chris-nuttall-smith", "marie-claude-lortie", "renee-suen", "mark-dewolf", "peter-hum", "elizabeth-chorney-booth", "karon-liu", "michelle-sproule"];

/** Mirrors the copy in supabase/seed.sql. */
const PREVIEW_COPY: Record<string, Partial<Critic>> = {
  "michelle-sproule": {
    city: "Vancouver",
    publication: "Scout Magazine · The Infatuation",
    background: "Co-founder (in 2008) and managing editor of Vancouver's Scout Magazine, and a contributor to The Infatuation's Vancouver restaurant coverage. A writer and photographer.",
    bio_verified: true,
    excerpt: "Somewhere in Vancouver, a chef is still waiting to discover what it takes to disappoint Michelle Sproule.",
    roast: "Michelle Sproule has mastered a particularly agreeable form of restaurant criticism: finding restaurants she likes and explaining, in considerable detail, why everyone else should like them too. At AnnaLena, the food is extraordinary. At Masayoshi, the chef is a master of his craft. At Hy's, even the creamed spinach earns applause. One begins to wonder whether Vancouver has somehow achieved culinary perfection or whether the less impressive dinners simply never make it into print.\n\nIt's a wonderfully efficient system of criticism in which the restaurants are excellent, the recommendations are enthusiastic, and the uncomfortable business of actually criticizing something is largely avoided.\n\nSomewhere in Vancouver, a chef is still waiting to discover what it takes to disappoint Michelle Sproule.",
  },
  "mark-dewolf": {
    city: "Halifax",
    publication: "The Coast",
    background: "Food and drink critic for Halifax's The Coast. A certified sommelier and wine-tour entrepreneur, he has worked in Canada's food and wine scene for more than 25 years.",
    bio_verified: true,
    excerpt: "Perhaps the next time a chef visits a vineyard, they should publish a review of the winemaking.",
    roast: "Mark DeWolf has spent more than 25 years in the food and wine business, and apparently knowing your way around a wine cellar eventually qualifies you to pass judgment on everything coming out of the kitchen. In one review, he arrives fresh from touring the wineries and restaurants of southern Italy, only to find Halifax's wild boar failing to measure up to his Mediterranean memories. In another, he devotes considerable attention to a restaurant's wine list before informing the kitchen that its pasta was a touch too salty.\n\nThere's something wonderfully predictable about a wine expert reviewing dinner: the grapes get a dissertation, the chef gets a verdict, and everyone is expected to appreciate the sophistication of the exercise.\n\nPerhaps the next time a chef visits a vineyard, they should publish a review of the winemaking.",
  },
  "elizabeth-chorney-booth": {
    city: "Calgary",
    publication: "Calgary Herald",
    background: "Weekly restaurant columnist for the Calgary Herald since 2018, succeeding John Gilchrist. A former music journalist, she is also a food columnist for CBC Radio in Calgary.",
    bio_verified: true,
    excerpt: "Sometimes the most useful thing a critic can bring to dinner isn't enthusiasm. It's a little disappointment.",
    roast: "Elizabeth Chorney-Booth spent her early career writing about music before discovering that restaurants offered an equally enthusiastic audience. Since taking over the Calgary Herald's restaurant column in 2018, she's made a specialty of celebrating the city's dining scene, often sounding more like its unofficial publicist than its toughest critic. New openings, inspiring chefs, neighbourhood favourites — there's always another heartwarming story to tell.\n\nHer columns raise an awkward question: when restaurant coverage becomes an endless procession of glowing introductions, who's left to tell readers when the food simply isn't very good?\n\nSometimes the most useful thing a critic can bring to dinner isn't enthusiasm. It's a little disappointment.",
  },
};

export const previewCritics: Critic[] = PREVIEW.map(([slug, name, nickname], i) => ({
  id: `preview-${slug}`, slug, name, nickname, city: null, publication: null, background: null, bio_verified: false,
  roast: null, excerpt: null, portrait_url: null, portrait_credit: null,
  editorial_rank: i + 1, status: "published", created_at: "2026-11-21T00:00:00Z", updated_at: "2026-11-21T00:00:00Z",
  ...(PORTRAITS.includes(slug) ? { portrait_url: `/portraits/${slug}.jpg` } : {}),
  ...(PREVIEW_COPY[slug] ?? {}),
}));

export const isPreview = () => !isConfigured();

export async function getSettings(): Promise<Settings> {
  if (isPreview()) return DEFAULT_SETTINGS;
  const { data } = await createPublicClient().from("settings").select("min_votes, community_size, force_editorial").eq("id", 1).maybeSingle();
  return data ?? DEFAULT_SETTINGS;
}

export async function getPublishedCritics(): Promise<Critic[]> {
  if (isPreview()) return previewCritics;
  const { data, error } = await createPublicClient().from("critics").select("*").eq("status", "published").order("name");
  if (error) throw error;
  return (data ?? []) as Critic[];
}

export async function getScores() {
  if (isPreview()) return toScoreMap([]);
  const { data } = await createPublicClient().rpc("critic_scores");
  return toScoreMap(data);
}

export async function getCritic(slug: string): Promise<Critic | null> {
  if (isPreview()) return previewCritics.find((c) => c.slug === slug) ?? null;
  const { data } = await createPublicClient().from("critics").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as Critic) ?? null;
}

export async function getReceipts(criticId: string): Promise<Receipt[]> {
  if (isPreview()) return [];
  const { data } = await createPublicClient().from("receipts").select("*").eq("critic_id", criticId).eq("status", "published").order("sort_order");
  return (data ?? []) as Receipt[];
}

export type Reply = { id: string; author_name: string; author_title: string | null; body: string; published_at: string | null };

export async function getResponses(criticId: string): Promise<Reply[]> {
  if (isPreview()) return [];
  const { data } = await createPublicClient()
    .from("critic_responses").select("id, author_name, author_title, body, published_at")
    .eq("critic_id", criticId).eq("status", "published").order("published_at", { ascending: false });
  return (data ?? []) as Reply[];
}
