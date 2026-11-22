"use client";

import { sb } from "@/lib/supabase/client";
import type { Settings as S } from "@/lib/types";
import { AdminTitle, Flash, must, useAsync, useFlash } from "./ui";

export function Settings() {
  const flash = useFlash();
  const { data, reload } = useAsync(async () => must(await sb().from("settings").select("min_votes, community_size, force_editorial").eq("id", 1).single()) as S);
  if (!data) return <AdminTitle>Ranking settings</AdminTitle>;
  return (
    <>
      <AdminTitle sub="The community ranking replaces the editorial order once enough critics reach the threshold.">Ranking settings</AdminTitle>
      <Flash msg={flash.msg} />
      <form className="max-w-lg space-y-5" onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const min = Number(f.get("min_votes")), size = Number(f.get("community_size"));
        flash.run(async () => {
          if (!(min >= 1 && size >= 3 && size <= 50)) throw new Error("Check the numbers.");
          must(await sb().from("settings").update({ min_votes: min, community_size: size, force_editorial: f.get("force_editorial") === "on" }).eq("id", 1));
          await reload();
        });
      }}>
        <div><label className="label">Minimum votes for community eligibility</label><input name="min_votes" type="number" min={1} defaultValue={data.min_votes} className="field" /></div>
        <div><label className="label">Size of the list</label><input name="community_size" type="number" min={3} max={50} defaultValue={data.community_size} className="field" />
          <p className="hint">The community ranking takes over once this many critics are eligible. Keep it at 10 for &ldquo;The Ten&rdquo;.</p></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="force_editorial" defaultChecked={data.force_editorial} /> Pin the editorial order even if the community ranking is ready</label>
        <button className="btn">Save settings</button>
      </form>
    </>
  );
}
