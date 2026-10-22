import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    // Gift animations are read from disk at request time — make sure the
    // serverless bundles for these routes ship the HTML files.
    outputFileTracingIncludes: {
        "/g/[id]": ["./content/gifts/**"],
        "/g/[id]/[slug]": ["./content/gifts/**"],
        "/api/gift/preview/[slug]": ["./content/gifts/**"],
    },
    // The gift shop is English-only: its buyers come from Instagram worldwide.
    // Stripe redirects to /unlock/… and the i18n middleware may pick /it — this
    // sends both the shop and the success page to /en (query string kept).
    async redirects() {
        return [
            { source: "/it/gift", destination: "/en/gift", permanent: false },
            { source: "/it/gift/:path*", destination: "/en/gift/:path*", permanent: false },
            { source: "/it/unlock/:path*", destination: "/en/unlock/:path*", permanent: false },
            { source: "/it/terms", destination: "/en/terms", permanent: false },
        ];
    },
};

export default withNextIntl(nextConfig);
