import { createClient } from "@supabase/supabase-js";

export const isConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Cookie-less anon client for build-time reads (static pages, sitemap, OG images). */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "missing",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
