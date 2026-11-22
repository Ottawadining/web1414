import { ImageResponse } from "next/og";
import { OG, OgWordmark, ogFonts } from "@/lib/og";
import { getPublishedCritics } from "@/lib/data";

// Social share images, exported as real .png files (GitHub Pages needs the
// extension to send the right content type): /og/default.png, /og/<slug>.png
export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

export async function generateStaticParams() {
  const critics = await getPublishedCritics();
  return [{ file: "default.png" }, ...critics.map((c) => ({ file: `${c.slug}.png` }))];
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.png$/, "");
  const fonts = await ogFonts();
  if (slug === "default") {
    return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: OG.paper, display: "flex", flexDirection: "column", padding: "64px 72px", justifyContent: "space-between" }}>
        <OgWordmark size={40} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: 36 }}><div style={{ height: 1, background: OG.ink }} /><div style={{ height: 3 }} /><div style={{ height: 1, background: OG.ink }} /></div>
          <div style={{ display: "flex", fontFamily: "Bodoni", fontSize: 104, lineHeight: 1, color: OG.ink }}>
            Canada&rsquo;s&nbsp;<span style={{ fontStyle: "italic", color: OG.tomato }}>10 Worst</span>
          </div>
          <div style={{ display: "flex", fontFamily: "Bodoni", fontSize: 104, lineHeight: 1.05, color: OG.ink }}>Food Critics</div>
          <div style={{ display: "flex", marginTop: 28, fontFamily: "Bodoni", fontStyle: "italic", fontSize: 38, color: OG.muted }}>
            &ldquo;For once, the critics are on the menu.&rdquo;
          </div>
        </div>
      </div>
    ),
      { ...size, fonts },
    );
  }
  const c = (await getPublishedCritics()).find((x) => x.slug === slug) ?? null;
  const name = c?.name ?? slug;
  const rank = c?.editorial_rank;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: OG.paper, display: "flex", padding: "60px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <OgWordmark size={30} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {c?.nickname && (
              <div style={{ display: "flex", fontFamily: "Bodoni", fontStyle: "italic", fontSize: 40, color: OG.tomato, marginBottom: 12 }}>&ldquo;{c.nickname}&rdquo;</div>
            )}
            <div style={{ display: "flex", fontFamily: "Bodoni", fontSize: name.length > 16 ? 96 : 120, lineHeight: 0.98, color: OG.ink, maxWidth: 820 }}>{name}</div>
            <div style={{ display: "flex", marginTop: 30, fontFamily: "Sans", fontSize: 20, letterSpacing: 4, color: OG.muted, textTransform: "uppercase" }}>
              The file · The receipts · The verdict
            </div>
          </div>
        </div>
        {rank && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", fontFamily: "Sans", fontSize: 18, letterSpacing: 4, color: OG.muted }}>NO.</div>
            <div style={{ display: "flex", fontFamily: "Bodoni", fontSize: 300, lineHeight: 0.8, color: rank === 1 ? OG.tomato : OG.ink }}>{rank}</div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
