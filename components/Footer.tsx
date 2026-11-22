import Link from "next/link";
import { Wordmark } from "./Wordmark";

const LINKS = [
  ["/about/", "About"],
  ["/critics/", "All Critics"],
  ["/nominate/", "Nominate a Critic"],
  ["/editorial-policy/", "Editorial Policy"],
  ["/community-guidelines/", "Community Guidelines"],
  ["/contact/", "Corrections & Right of Reply"],
  ["/privacy/", "Privacy"],
  ["/terms/", "Terms"],
];

export function Footer() {
  return (
    <footer className="mt-32 bg-ink text-sheet">
      <div className="wrap py-16 grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="text-sheet"><Wordmark size="lg" /></div>
          <p className="mt-6 max-w-md font-serif italic text-xl text-sheet/80">For once, the critics are on the menu.</p>
          <p className="mt-8 max-w-md text-sm text-sheet/55 leading-relaxed">
            Rotten Critics is satire and opinion about published professional work. The rankings are subjective.
            The receipts are sourced. The jokes are ours. If we got a fact wrong, <Link href="/contact/" className="underline hover:text-sheet">tell us</Link> and we will fix it in public.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 content-start text-sm">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="text-sheet/75 hover:text-sheet">{label}</Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-sheet/15">
        <div className="wrap py-5 flex flex-col sm:flex-row gap-2 justify-between text-[0.6875rem] tracking-[0.16em] uppercase text-sheet/45">
          <span>© {new Date().getFullYear()} Rotten Critics</span>
          <span>No stars were awarded in the making of this website</span>
        </div>
      </div>
    </footer>
  );
}
