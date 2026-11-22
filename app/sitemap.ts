import type { MetadataRoute } from "next";
import { createPublicClient, isConfigured } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["/", "/critics", "/nominate", "/about", "/editorial-policy", "/community-guidelines", "/contact", "/privacy", "/terms"].map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: p === "/" ? ("daily" as const) : ("monthly" as const),
    priority: p === "/" ? 1 : 0.5,
  }));
  if (!isConfigured()) return pages;
  const { data } = await createPublicClient().from("critics").select("slug, updated_at").eq("status", "published");
  return [
    ...pages,
    ...(data ?? []).map((c) => ({ url: absoluteUrl(`/critics/${c.slug}`), lastModified: c.updated_at, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
