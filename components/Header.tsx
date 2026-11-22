import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { HeaderAccount } from "./HeaderAccount";

const NAV = [
  { href: "/#ranking", label: "The Ten" },
  { href: "/critics/", label: "All Critics" },
  { href: "/nominate/", label: "Nominate" },
  { href: "/about/", label: "About" },
];

export function Header() {
  return (
    <header className="border-b border-ink/90">
      <div className="wrap flex items-center justify-between py-2 text-[0.6875rem] tracking-[0.18em] uppercase text-muted border-b border-rule">
        <span>Reviewing the reviewers since 2026</span>
        <HeaderAccount />
      </div>
      <div className="wrap flex flex-col md:flex-row md:items-end md:justify-between gap-3 py-5">
        <Wordmark size="md" />
        <nav aria-label="Primary" className="-mx-1 flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="px-2 py-1 text-[0.75rem] font-semibold tracking-[0.16em] uppercase whitespace-nowrap hover:text-tomato">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
