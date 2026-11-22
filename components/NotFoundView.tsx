"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CriticView } from "./CriticView";

export function NotFoundView() {
  const [slug, setSlug] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const m = window.location.pathname.match(/^\/critics\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    setSlug(m ? m[1] : null);
  }, []);
  if (slug === undefined) return <div className="min-h-[50vh]" />;
  if (slug) return <CriticView slug={slug} initial={null} />;
  return (
    <div className="wrap py-28 text-center">
      <p className="numeral text-[9rem] text-tomato">86</p>
      <h1 className="mt-6 text-4xl md:text-5xl">That page has been eighty-sixed.</h1>
      <p className="mt-4 text-muted">Whatever you ordered isn&rsquo;t on tonight&rsquo;s menu.</p>
      <Link href="/" className="mt-10 btn">Back to the list</Link>
    </div>
  );
}
