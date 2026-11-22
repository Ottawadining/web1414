import { PageHeader } from "./PageHeader";

export function ProsePage({ kicker, title, intro, updated, children }: { kicker: string; title: React.ReactNode; intro?: React.ReactNode; updated?: string; children: React.ReactNode }) {
  return (
    <div className="wrap">
      <PageHeader kicker={kicker} title={title} intro={intro} />
      <div className="grid md:grid-cols-[14rem_1fr] gap-10">
        <div className="text-xs tracking-[0.14em] uppercase text-muted">{updated && <>Last updated<br /><span className="text-ink">{updated}</span></>}</div>
        <div className="prose-rc max-w-2xl text-[1.0625rem] leading-[1.75]">{children}</div>
      </div>
    </div>
  );
}
