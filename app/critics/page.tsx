import type { Metadata } from "next";
import { Directory } from "@/components/Directory";
import { getPublishedCritics, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Critics",
  description: "Every Canadian food critic on Rotten Critics, in and out of the Top 10. Search by name, nickname, city or publication.",
  alternates: { canonical: "/critics/" },
};

export default async function CriticsPage() {
  const [critics, settings] = await Promise.all([getPublishedCritics(), getSettings()]);
  return (
    <div className="wrap pt-14 md:pt-20">
      <p className="kicker">The directory</p>
      <h1 className="mt-3 text-5xl md:text-7xl" style={{ fontVariationSettings: '"opsz" 96' }}>All Critics</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-soft leading-relaxed">
        Everyone we&rsquo;ve approved, in the Ten or waiting for a table. Every critic here has a public body of restaurant
        criticism. Each one can be voted on, and any of them can climb into the community ranking.
      </p>
      <Directory initialCritics={critics} initialSettings={settings} />
    </div>
  );
}
