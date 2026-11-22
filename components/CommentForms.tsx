"use client";

import { useState, useTransition } from "react";
import { postComment, reportComment, type Result } from "@/lib/api";

function Status({ state }: { state: Result }) {
  if (!state) return null;
  return <p className={`mt-3 text-sm ${state.ok ? "text-ink" : "text-tomato"}`} role="status">{state.message}</p>;
}

export function CommentForm({ criticId, parentId, onDone, compact = false }: { criticId: string; parentId?: string; onDone?: () => void; compact?: boolean }) {
  const [state, setState] = useState<Result>(null);
  const [pending, start] = useTransition();
  const key = parentId ?? "root";
  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await postComment(fd);
          setState(r);
          if (r?.ok) { form.reset(); onDone?.(); }
        });
      }}
    >
      <input type="hidden" name="critic_id" value={criticId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label htmlFor={`body-${key}`} className="sr-only">Your comment</label>
      <textarea
        id={`body-${key}`} name="body" required minLength={2} maxLength={2000} rows={compact ? 3 : 5} className="field resize-y"
        placeholder={parentId ? "Reply to this comment…" : "On the published work: what did they get right, wrong, or hilariously wrong?"}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">Pre-moderated. Criticize the work, not the person. <a href="/community-guidelines/" className="underline">Guidelines</a>.</p>
        <button className="btn btn-sm" disabled={pending}>{pending ? "Sending…" : parentId ? "Reply" : "Submit comment"}</button>
      </div>
      <Status state={state} />
    </form>
  );
}

export function CommentActions({ commentId, criticId, canReply, canReport, onPosted }: { commentId: string; criticId: string; canReply: boolean; canReport: boolean; onPosted?: () => void }) {
  const [open, setOpen] = useState<null | "reply" | "report">(null);
  const [state, setState] = useState<Result>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-3">
      <div className="flex gap-5 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase text-muted">
        {canReply && <button type="button" className="hover:text-ink" onClick={() => setOpen(open === "reply" ? null : "reply")}>Reply</button>}
        {canReport && <button type="button" className="hover:text-tomato" onClick={() => setOpen(open === "report" ? null : "report")}>Report</button>}
      </div>
      {open === "reply" && (
        <div className="mt-4"><CommentForm criticId={criticId} parentId={commentId} compact onDone={() => { onPosted?.(); setTimeout(() => setOpen(null), 2500); }} /></div>
      )}
      {open === "report" && (
        <form
          className="mt-4 p-4 border border-rule bg-sheet max-w-md"
          onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); start(async () => setState(await reportComment(fd))); }}
        >
          <input type="hidden" name="comment_id" value={commentId} />
          <label className="label" htmlFor={`reason-${commentId}`}>What&rsquo;s wrong with it?</label>
          <select id={`reason-${commentId}`} name="reason" className="field" required defaultValue="">
            <option value="" disabled>Choose a reason</option>
            <option value="threat">Threat or intimidation</option>
            <option value="doxxing">Personal information / doxxing</option>
            <option value="discrimination">Discriminatory abuse</option>
            <option value="invented_allegation">Unsupported allegation</option>
            <option value="private_life">Attacks private life or characteristics</option>
            <option value="spam">Spam</option>
            <option value="other">Something else</option>
          </select>
          <textarea name="details" maxLength={1000} rows={2} className="field mt-3" placeholder="Optional detail" />
          <button className="btn btn-sm mt-3" disabled={pending}>Send report</button>
          <Status state={state} />
        </form>
      )}
    </div>
  );
}
