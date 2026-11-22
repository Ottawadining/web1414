"use client";

import { z } from "zod";
import { configured, sb } from "./supabase/client";
import { SITE } from "./site";

export type Result = { ok: boolean; message: string } | null;
const fail = (message: string): Result => ({ ok: false, message });
const ok = (message: string): Result => ({ ok: true, message });

export function dbMessage(error: { code?: string; message?: string } | null, fallback = "Something went wrong. Try again.") {
  if (!error) return fallback;
  if (error.code === "P0001" && error.message) return error.message;
  if (error.code === "42501" || /row-level security/i.test(error.message ?? "")) return "You need a verified account with a display name to do that.";
  if (error.code === "23505") return "That already exists.";
  return error.message || fallback;
}

const offline = () => (!configured ? fail("The database isn't connected yet.") : null);

// ------------------------------------------------------------ votes
export async function castVote(criticId: string, value: "rotten" | "not_rotten" | null): Promise<Result> {
  if (!configured) return offline();
  const { error } = await sb().rpc("cast_vote", { p_critic: criticId, p_value: value });
  return error ? fail(dbMessage(error)) : ok(value ? "Vote counted." : "Vote withdrawn.");
}

// ------------------------------------------------------------ comments
export async function postComment(f: FormData): Promise<Result> {
  if (!configured) return offline();
  if (f.get("website")) return ok("Thanks.");
  const body = z.string().trim().min(2, "Say a little more.").max(2000, "Keep it under 2,000 characters.").safeParse(f.get("body"));
  if (!body.success) return fail(body.error.issues[0].message);
  const parent = String(f.get("parent_id") || "") || null;
  const { error } = await sb().from("comments").insert({ critic_id: String(f.get("critic_id")), parent_id: parent, body: body.data });
  return error ? fail(dbMessage(error)) : ok("Received. An editor reads every comment before it goes up.");
}

export async function reportComment(f: FormData): Promise<Result> {
  if (!configured) return offline();
  const reason = String(f.get("reason") || "");
  if (!reason) return fail("Pick a reason.");
  const { error } = await sb().from("comment_reports").insert({ comment_id: String(f.get("comment_id")), reason, details: String(f.get("details") || "") || null });
  if (error?.code === "23505") return ok("You've already reported this one. We're on it.");
  return error ? fail(dbMessage(error, "Sign in to report a comment.")) : ok("Reported. Thank you.");
}

// ------------------------------------------------------------ nominations
const url = z.string().trim().url("Use a full link, starting with https://").max(500);
export async function submitNomination(f: FormData): Promise<Result> {
  if (!configured) return offline();
  if (f.get("website")) return ok("Thanks.");
  const parsed = z.object({
    critic_name: z.string().trim().min(2, "Name is required.").max(120),
    publication: z.string().trim().min(2, "Publication is required.").max(160),
    city: z.string().trim().min(2, "City is required.").max(120),
    review_url: url,
    reason: z.string().trim().min(20, "Give us at least a sentence or two (20+ characters).").max(2000),
  }).safeParse(Object.fromEntries(f));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const extras = String(f.get("extra_links") || "").split(/\s+/).map((s) => s.trim()).filter(Boolean);
  if (extras.length > 5) return fail("Five supporting links at most.");
  for (const e of extras) if (!url.safeParse(e).success) return fail(`That doesn't look like a link: ${e.slice(0, 60)}`);
  const { error } = await sb().from("nominations").insert({ ...parsed.data, extra_links: extras });
  return error
    ? fail(dbMessage(error, "Sign in to nominate a critic."))
    : ok("Nomination received. It goes to a private queue, and nobody is listed until an editor confirms a public record of restaurant criticism.");
}

// ------------------------------------------------------------ contact
export async function submitContact(f: FormData): Promise<Result> {
  if (!configured) return offline();
  if (f.get("website")) return ok("Thanks.");
  const parsed = z.object({
    kind: z.enum(["correction", "evidence", "reply", "general", "legal"]),
    name: z.string().trim().min(2, "Your name is required.").max(120),
    email: z.string().trim().email("Enter a valid email address."),
    organization: z.string().trim().max(160).optional(),
    critic_id: z.string().optional(),
    url: z.string().trim().max(500).optional(),
    body: z.string().trim().min(10, "Tell us a little more.").max(6000),
  }).safeParse(Object.fromEntries(f));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;
  // No .select(): the public can insert but not read messages back.
  const { error } = await sb().from("contact_messages").insert({
    kind: d.kind, name: d.name, email: d.email, organization: d.organization || null,
    critic_id: d.critic_id || null, url: d.url || null, body: d.body,
  });
  if (error) return fail(dbMessage(error));
  return ok(d.kind === "reply" ? "Received. We'll confirm your identity by email before anything is published." : "Received. A human editor will read it.");
}

// ------------------------------------------------------------ auth
/** Google is the only way in. Google has already verified the email address. */
export async function signInWithGoogle(next = "/"): Promise<Result> {
  if (!configured) return offline();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const origin = typeof window !== "undefined" ? window.location.origin : SITE.url;
  const { error } = await sb().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback/?next=${encodeURIComponent(safeNext)}`, queryParams: { prompt: "select_account" } },
  });
  return error ? fail("We couldn't reach Google. Try again.") : null; // browser is redirected to Google
}

export async function signOut() {
  if (configured) await sb().auth.signOut();
}

export async function updateDisplayName(userId: string, f: FormData): Promise<Result> {
  const name = z.string().trim().min(2, "At least two characters.").max(40, "Forty characters at most.").safeParse(f.get("display_name"));
  if (!name.success) return fail(name.error.issues[0].message);
  const { error } = await sb().from("profiles").update({ display_name: name.data }).eq("id", userId);
  if (error) return fail(error.code === "23505" ? "Someone already has that name." : dbMessage(error));
  return ok("Saved. That's the name the dining room will see.");
}
