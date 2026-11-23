import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { NominationForm } from "@/components/NominationForm";

export const metadata: Metadata = {
  title: "Nominate a Critic",
  description: "Nominate a Canadian restaurant critic for Rotten Critics. Every nomination is checked against the public record before anyone is listed.",
  alternates: { canonical: "/nominate" },
};

export default function Nominate() {
  return (
    <div className="wrap">
      <PageHeader
        kicker="Nominations"
        title={<>Nominate a <span className="italic text-tomato">critic</span></>}
        intro="Know a Canadian restaurant critic who belongs on the list? Make the case. Bring us a published review, not a grudge."
      />
      <div className="grid md:grid-cols-[1fr_20rem] gap-14">
        <div className="max-w-2xl">
          <NominationForm />
        </div>
        <aside className="text-sm text-ink-soft leading-relaxed md:border-l md:border-rule md:pl-8">
          <p className="kicker mb-4">What happens next</p>
          <ol className="space-y-4">
            <li><span className="font-serif italic text-tomato mr-2">1.</span>Your nomination goes to a private queue. Nobody sees it but the editors.</li>
            <li><span className="font-serif italic text-tomato mr-2">2.</span>We confirm the nominee is a genuine, public restaurant critic with published work.</li>
            <li><span className="font-serif italic text-tomato mr-2">3.</span>If approved, they get a profile and can be voted on. The ranking decides the rest.</li>
          </ol>
          <p className="mt-6 text-muted">We don&rsquo;t publish nominators&rsquo; names or anything in the &ldquo;why&rdquo; box. Allegations about a critic&rsquo;s private life are deleted.</p>
        </aside>
      </div>
    </div>
  );
}
