"use client";

import Link from "next/link";
import type { PublicComment } from "@/lib/types";
import { useComments } from "@/lib/live";
import { participation, useViewer } from "@/lib/viewer";
import { CommentActions, CommentForm } from "./CommentForms";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

type Node = PublicComment & { children: Node[] };
function tree(list: PublicComment[]): Node[] {
  const map = new Map<string, Node>();
  list.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: Node[] = [];
  map.forEach((n) => (n.parent_id && map.get(n.parent_id) ? map.get(n.parent_id)!.children.push(n) : roots.push(n)));
  return roots;
}

function Item({ n, criticId, canPost, canReport, reload }: { n: Node; criticId: string; canPost: boolean; canReport: boolean; reload: () => void }) {
  return (
    <li className="pt-6">
      <div className="flex items-baseline gap-3">
        <span className="font-semibold text-sm">{n.display_name}</span>
        <time className="text-xs text-muted" dateTime={n.created_at}>{fmt(n.created_at)}</time>
      </div>
      <p className="mt-2 whitespace-pre-line text-ink-soft leading-relaxed">{n.body}</p>
      <CommentActions commentId={n.id} criticId={criticId} canReply={canPost && n.depth < 3} canReport={canReport} onPosted={reload} />
      {n.children.length > 0 && (
        <ul className="mt-2 pl-5 md:pl-8 border-l border-rule">
          {n.children.map((c) => <Item key={c.id} n={c} criticId={criticId} canPost={canPost} canReport={canReport} reload={reload} />)}
        </ul>
      )}
    </li>
  );
}

export function Comments({ criticId, slug }: { criticId: string; slug: string }) {
  const viewer = useViewer();
  const p = participation(viewer);
  const { data, reload } = useComments(criticId, viewer.user?.id);
  const roots = tree(data.published);
  const canReport = Boolean(viewer.user?.verified);

  return (
    <div>
      {p.canVote ? (
        <CommentForm criticId={criticId} onDone={reload} />
      ) : p.reason !== "loading" ? (
        <div className="border border-rule bg-sheet p-6 text-sm text-ink-soft">
          {p.reason === "signin" && <><Link href={`/login/?next=/critics/${slug}/`} className="underline font-semibold">Sign in</Link> with Google to join the conversation.</>}
          {p.reason === "verify" && <>Confirm your email address to comment.</>}
          {p.reason === "name" && <><Link href="/account/" className="underline font-semibold">Choose a display name</Link> before you comment. Pseudonyms welcome.</>}
          {p.reason === "restricted" && <>Commenting is unavailable on this account.</>}
          {p.reason === "offline" && <>Comments open when the database is connected.</>}
        </div>
      ) : null}

      {data.pending.length > 0 && (
        <div className="mt-8 border-l-2 border-tomato pl-5">
          <p className="kicker !text-tomato">Awaiting moderation · visible only to you</p>
          {data.pending.map((c) => <p key={c.id} className="mt-3 text-ink-soft whitespace-pre-line">{c.body}</p>)}
        </div>
      )}

      {roots.length === 0 ? (
        <p className="mt-10 placeholder-note text-lg">The dining room is quiet. No published comments yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-rule-soft">
          {roots.map((n) => <Item key={n.id} n={n} criticId={criticId} canPost={p.canVote} canReport={canReport} reload={reload} />)}
        </ul>
      )}
    </div>
  );
}
