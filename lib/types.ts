export type Critic = {
  id: string;
  slug: string;
  name: string;
  nickname: string | null;
  city: string | null;
  publication: string | null;
  background: string | null;
  bio_verified: boolean;
  roast: string | null;
  excerpt: string | null;
  portrait_url: string | null;
  portrait_credit: string | null;
  editorial_rank: number | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export type Receipt = {
  id: string;
  critic_id: string;
  headline: string;
  explanation: string;
  source_url: string | null;
  source_title: string | null;
  published_on: string | null;
  context: string | null;
  status: "draft" | "published";
  verified_at: string | null;
  sort_order: number;
};

export type PublicComment = {
  id: string;
  parent_id: string | null;
  depth: number;
  body: string;
  created_at: string;
  display_name: string;
};

export type Settings = { min_votes: number; community_size: number; force_editorial: boolean };
