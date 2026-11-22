export const SITE = {
  name: "Rotten Critics",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rottencritics.com").replace(/\/$/, ""),
  tagline: "For once, the critics are on the menu.",
  headline: "Canada's 10 Worst Food Critics",
  description:
    "A satirical Canadian publication that reviews the restaurant reviewers. An editorial Top 10, community voting, receipts, and a right of reply.",
  email: "editors@rottencritics.com",
};

/** Absolute URL with the trailing slash GitHub Pages serves canonically. */
export function absoluteUrl(path = "/") {
  let p = path.startsWith("/") ? path : `/${path}`;
  if (!p.endsWith("/") && !/\.[a-z0-9]+$/i.test(p)) p += "/";
  return `${SITE.url}${p}`;
}
