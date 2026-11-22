"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Browser client. Session lives in localStorage; RLS decides what it can do. */
export function sb(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "missing",
      { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
    );
  }
  return client;
}
