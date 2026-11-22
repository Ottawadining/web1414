export function PageHeader({ kicker, title, intro }: { kicker: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <header className="pt-14 md:pt-20 pb-10">
      <p className="kicker">{kicker}</p>
      <h1 className="mt-3 text-5xl md:text-7xl leading-[0.98]" style={{ fontVariationSettings: '"opsz" 96' }}>{title}</h1>
      {intro && <div className="mt-6 text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl">{intro}</div>}
      <div className="rule-double mt-10" />
    </header>
  );
}
