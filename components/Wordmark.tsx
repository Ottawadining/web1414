import Link from "next/link";

/**
 * ROTTEN CRITICS — set in high-contrast Bodoni caps. The second T of
 * ROTTEN has gone off: it slumps, tilts, and turns tomato.
 */
export function Wordmark({ size = "md", asLink = true }: { size?: "sm" | "md" | "lg" | "xl"; asLink?: boolean }) {
  const cls = {
    sm: "text-[1.05rem] tracking-[0.14em]",
    md: "text-[1.35rem] md:text-[1.6rem] tracking-[0.16em]",
    lg: "text-[2.2rem] md:text-[3rem] tracking-[0.14em]",
    xl: "text-[clamp(1.8rem,8.2vw,7.6rem)] tracking-[0.08em]",
  }[size];
  const mark = (
    <span
      className={`font-serif font-medium leading-none whitespace-nowrap select-none ${cls}`}
      style={{ fontVariationSettings: size === "xl" ? '"opsz" 96' : size === "lg" ? '"opsz" 40' : '"opsz" 14', fontWeight: size === "xl" ? 500 : 600 }}
      aria-label="Rotten Critics"
    >
      <span aria-hidden="true">
        ROT
        <span className="inline-block text-tomato origin-bottom-left" style={{ transform: "rotate(9deg) translateY(0.06em)" }}>T</span>
        EN
        <span className="inline-block w-[0.42em]" />
        CRITICS
      </span>
    </span>
  );
  return asLink ? (
    <Link href="/" className="inline-block hover:text-ink">
      {mark}
    </Link>
  ) : (
    mark
  );
}
