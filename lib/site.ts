// ─── BuiltWithSabba — Central site configuration ────────────────────────────
// Every external touchpoint lives here. If a URL is missing, add it here
// once and reference `site` everywhere — never hardcode URLs in components.

export const site = {
    name: "BuiltWithSabba",
    owner: "Alessio Sabatino",
    // Canonical origin. Override with NEXT_PUBLIC_SITE_URL in production.
    url:
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        "https://www.builtwithsabba.com",
    email: "alessio.sabatino@fiscedge.com",
    localeBase: "Rome / Building globally",

    github: {
        username: "buildwithsabba",
        url: "https://github.com/buildwithsabba",
    },

    // LinkedIn is a connection channel, not a content source.
    // Do NOT scrape it; keep any LinkedIn content manually curated.
    linkedin: {
        url: "https://www.linkedin.com/in/alessio-sabatino29",
    },

    fiscedge: {
        url: "https://www.fiscedge.com",
        academyUrl: "https://academy.fiscedge.com",
    },
} as const;

export type SiteConfig = typeof site;
