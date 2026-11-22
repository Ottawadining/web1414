"use client";
import { useState, useTransition } from "react";
import type { Result } from "@/lib/api";

/** Client form that calls an async handler and shows its result. */
export function ClientForm({
  onSubmit, children, submit, className = "", successHides = false, disabled = false,
}: {
  onSubmit: (f: FormData) => Promise<Result>;
  children: React.ReactNode;
  submit: string;
  className?: string;
  successHides?: boolean;
  disabled?: boolean;
}) {
  const [state, setState] = useState<Result>(null);
  const [pending, start] = useTransition();
  if (successHides && state?.ok) {
    return <div className="border-l-2 border-tomato pl-5 py-2 text-lg font-serif italic text-ink" role="status">{state.message}</div>;
  }
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await onSubmit(fd);
          setState(r);
          if (r?.ok && !successHides) form.reset();
        });
      }}
    >
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {children}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button className="btn" disabled={pending || disabled}>{pending ? "Sending…" : submit}</button>
        {state && <p className={`text-sm ${state.ok ? "text-ink" : "text-tomato"}`} role="status">{state.message}</p>}
      </div>
    </form>
  );
}
