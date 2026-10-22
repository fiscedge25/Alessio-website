import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    // Gift animations are read from disk at request time — make sure the
    // serverless bundles for these routes ship the HTML files.
    outputFileTracingIncludes: {
        "/g/[id]": ["./content/gifts/**"],
        "/api/gift/preview/[slug]": ["./content/gifts/**"],
    },
};

export default withNextIntl(nextConfig);
