"use client";

import { sb } from "@/lib/supabase/client";
import { AdminTitle, Flash, Pill, must, useAsync, useFlash, when } from "./ui";

type U = { id: string; email: string; created_at: string; display_name: string | null; is_restricted: boolean; role: string };

export function Votes() {
  const flash = useFlash();
  const { data, reload } = useAsync(async () => {
    const since = new Date(Date.now() - 864e5).toISOString();
    const events = must(await sb().from("vote_events").select("user_id, critic_id, action, created_at, critics(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(5000)) ?? [];
    const users = new Map<string, U>();
    for (const u of (must(await sb().rpc("admin_users")) ?? []) as U[]) users.set(u.id, u);

    const byUser = new Map<string, { n: number; critics: Set<string>; changes: number }>();
    const byCriticHour = new Map<string, Map<string, number>>();
    for (const e of events) {
      const u = byUser.get(e.user_id) ?? { n: 0, critics: new Set<string>(), changes: 0 };
      u.n++; u.critics.add(e.critic_id); if (e.action !== "cast") u.changes++;
      byUser.set(e.user_id, u);
      const name = (e.critics as unknown as { name: string } | null)?.name ?? e.critic_id;
      const m = byCriticHour.get(name) ?? new Map<string, number>();
      m.set(e.created_at.slice(0, 13), (m.get(e.created_at.slice(0, 13)) ?? 0) + 1);
      byCriticHour.set(name, m);
    }
    const top = [...byUser.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 30);
    const spikes = [...byCriticHour.entries()].map(([name, m]) => {
      const [hour, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
      return { name, hour, n, total: [...m.values()].reduce((a, b) => a + b, 0) };
    }).sort((a, b) => b.n - a.n);
    return { top, spikes, users, restricted: [...users.values()].filter((u) => u.is_restricted) };
  });

  const restrict = (id: string, on: boolean) => flash.run(async () => {
    must(await sb().from("profiles").update({ is_restricted: on, restricted_reason: on ? "Vote/comment abuse" : null }).eq("id", id));
    await reload();
  }, on ? "Account restricted. Its votes no longer count." : "Restriction lifted.");

  const isNew = (id: string) => { const c = data?.users.get(id)?.created_at; return c ? Date.now() - new Date(c).getTime() < 864e5 : false; };

  return (
    <>
      <AdminTitle sub="Last 24 hours. Restricting an account removes its votes from every total and blocks commenting. Reversible.">Votes &amp; users</AdminTitle>
      <Flash msg={flash.msg} />
      <h2 className="text-2xl mb-3">Most active voters</h2>
      {data && data.top.length === 0 ? <p className="text-muted mb-10">No vote activity in the last 24 hours.</p> : (
        <div className="overflow-x-auto mb-12"><table className="tbl">
          <thead><tr><th>Account</th><th>Actions</th><th>Critics</th><th>Changes</th><th>Signals</th><th></th></tr></thead>
          <tbody>
            {(data?.top ?? []).map(([id, u]) => {
              const p = data!.users.get(id);
              return (
                <tr key={id}>
                  <td><strong>{p?.display_name ?? "—"}</strong><div className="text-xs text-muted">{p?.email ?? id.slice(0, 8)}</div></td>
                  <td>{u.n}</td><td>{u.critics.size}</td><td>{u.changes}</td>
                  <td className="space-x-1">{isNew(id) && <Pill tone="red">new account</Pill>}{u.changes > 10 && <Pill tone="red">flip-flopping</Pill>}{p?.is_restricted && <Pill tone="ink">restricted</Pill>}</td>
                  <td><button className="btn btn-sm btn-ghost" onClick={() => restrict(id, !p?.is_restricted)}>{p?.is_restricted ? "Unrestrict" : "Restrict"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      )}
      <h2 className="text-2xl mb-3">Busiest hour per critic</h2>
      {data && data.spikes.length === 0 ? <p className="text-muted mb-10">Nothing yet.</p> : (
        <table className="tbl mb-12"><thead><tr><th>Critic</th><th>Peak hour (UTC)</th><th>Actions in peak</th><th>24h total</th></tr></thead>
          <tbody>{(data?.spikes ?? []).map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.hour}:00</td><td className={s.n > 30 ? "text-tomato font-semibold" : ""}>{s.n}</td><td>{s.total}</td></tr>)}</tbody>
        </table>
      )}
      <h2 className="text-2xl mb-3">Restricted accounts</h2>
      {data && data.restricted.length === 0 ? <p className="text-muted">None.</p> : (
        <table className="tbl"><tbody>
          {(data?.restricted ?? []).map((r) => (
            <tr key={r.id}><td><strong>{r.display_name ?? "—"}</strong><div className="text-xs text-muted">{r.email}</div></td>
              <td><button className="btn btn-sm btn-ghost" onClick={() => restrict(r.id, false)}>Unrestrict</button></td></tr>
          ))}
        </tbody></table>
      )}
      <p className="mt-8 text-xs text-muted">Built-in limits: 60 vote actions per account per hour, 6 per critic per 10 minutes, email verification required. Loaded {when(new Date().toISOString())}.</p>
    </>
  );
}
