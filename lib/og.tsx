import { readFile } from "node:fs/promises";
import path from "node:path";

const FONTS = path.join(process.cwd(), "assets", "fonts");

export async function ogFonts() {
  const [serif, serifItalic, sans] = await Promise.all([
    readFile(path.join(FONTS, "bodoni-moda-latin-500-normal.woff")),
    readFile(path.join(FONTS, "bodoni-moda-latin-500-italic.woff")),
    readFile(path.join(FONTS, "instrument-sans-latin-600-normal.woff")),
  ]);
  return [
    { name: "Bodoni", data: serif, style: "normal" as const, weight: 500 as const },
    { name: "Bodoni", data: serifItalic, style: "italic" as const, weight: 500 as const },
    { name: "Sans", data: sans, style: "normal" as const, weight: 600 as const },
  ];
}

export const OG = { paper: "#f6f1e6", ink: "#15120f", tomato: "#9c1c12", muted: "#6f675c", rule: "#d8cfbf" };

export function OgWordmark({ size = 34, color = OG.ink }: { size?: number; color?: string }) {
  return (
    <div style={{ display: "flex", fontFamily: "Bodoni", fontSize: size, letterSpacing: size * 0.16, color }}>
      <span>ROT</span>
      <span style={{ color: OG.tomato, transform: "rotate(9deg) translateY(3px)" }}>T</span>
      <span>EN</span>
      <span style={{ width: size * 0.45 }} />
      <span>CRITICS</span>
    </div>
  );
}
