import Image from "next/image";
import type { Critic } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

/** Portrait if we have one; otherwise a typographic plate of the critic's initials. */
export function Portrait({ critic, size = "md", caption = false }: { critic: Critic; size?: "sm" | "md" | "lg"; caption?: boolean }) {
  const dims = { sm: "w-20 h-24", md: "w-28 h-36 md:w-32 md:h-40", lg: "w-full aspect-[4/5]" }[size];
  const hasPhoto = Boolean(critic.portrait_url);
  return (
    <figure className="m-0">
      <div className={`relative ${dims} overflow-hidden border border-rule bg-sheet`}>
        {hasPhoto ? (
          <Image
            src={critic.portrait_url!}
            alt={`Portrait of ${critic.name}`}
            fill
            sizes={size === "lg" ? "(min-width: 768px) 30vw, 90vw" : "128px"}
            className="object-cover grayscale-[35%] contrast-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-serif italic text-ink/85 leading-none"
              style={{ fontSize: size === "lg" ? "9rem" : size === "md" ? "3.2rem" : "2.2rem", fontVariationSettings: '"opsz" 96' }}
              aria-hidden="true"
            >
              {initials(critic.name)}
            </span>
            <span className="absolute inset-2 border border-rule-soft pointer-events-none" />
          </div>
        )}
      </div>
      {caption && hasPhoto && critic.portrait_credit && (
        <figcaption className="mt-2 text-[0.6875rem] tracking-[0.12em] uppercase text-muted">Photo: {critic.portrait_credit}</figcaption>
      )}
    </figure>
  );
}
