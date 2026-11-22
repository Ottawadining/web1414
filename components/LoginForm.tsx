"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { signInWithGoogle } from "@/lib/api";
import { useViewer } from "@/lib/viewer";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function LoginForm() {
  const v = useViewer();
  const router = useRouter();
  const [params, setParams] = useState<{ next: string; error: boolean }>({ next: "/", error: false });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({ next: sp.get("next") ?? "/", error: sp.has("error") });
  }, []);
  useEffect(() => { if (v.user) router.replace(params.next.startsWith("/") ? params.next : "/"); }, [v.user, params.next, router]);

  return (
    <>
      {params.error && <p className="mb-6 text-tomato text-sm">Sign-in didn&rsquo;t finish. Try again.</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { const r = await signInWithGoogle(params.next); if (r && !r.ok) setMsg(r.message); })}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-ink bg-sheet px-6 py-4 text-[0.8125rem] font-semibold tracking-[0.08em] hover:bg-ink hover:text-sheet transition-colors disabled:opacity-50"
      >
        <span className="bg-white rounded-full p-1 inline-flex"><GoogleMark /></span>
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>
      {msg && <p className="mt-4 text-sm text-tomato" role="status">{msg}</p>}
      <p className="hint mt-5 max-w-md">
        We never show your name, email or photo from Google. You&rsquo;ll choose a public display name next. Pseudonyms welcome.
      </p>
    </>
  );
}
