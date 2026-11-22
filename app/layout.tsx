import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ViewBeacon } from "@/components/ViewBeacon";
import { SITE } from "@/lib/site";
import { isPreview } from "@/lib/data";
import { ViewerProvider } from "@/lib/viewer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.headline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_CA", url: SITE.url, images: [{ url: "/og/default.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og/default.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f6f1e6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn">Skip to content</a>
        {isPreview() && (
          <div className="bg-tomato text-sheet text-center text-xs tracking-[0.14em] uppercase py-2 px-4">
            Preview mode: Supabase isn't connected, so voting, comments and forms are off. See README.
          </div>
        )}
        <ViewerProvider>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
          <ViewBeacon />
        </ViewerProvider>
      </body>
    </html>
  );
}
