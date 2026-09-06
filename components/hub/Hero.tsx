"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { track } from "@/lib/analytics";

export default function Hero() {
    const t = useTranslations("hub.hero");
    const locale = useLocale();

    return (
        <section
            id="top"
            aria-label={t("aria")}
            className="relative flex flex-col justify-center text-center px-5 md:px-8 pt-36 pb-24 md:pt-48 md:pb-32"
        >
            <div className="parallax-hero max-w-5xl mx-auto w-full flex flex-col items-center">
                <p className="status-pill font-mono-meta text-[11px] md:text-xs uppercase text-[color:var(--muted)] mb-9">
                    <span className="status-dot" aria-hidden="true" />
                    {t("status")}
                </p>

                <h1
                    className="font-display text-[color:var(--ink)]"
                    style={{
                        fontSize: "clamp(3rem, 10vw, 7.5rem)",
                        lineHeight: 0.98,
                    }}
                >
                    {t("line1")}
                    <br />
                    {t("line2")}
                </h1>

                <p className="mt-7 md:mt-8 max-w-2xl text-lg md:text-2xl leading-relaxed text-[color:var(--muted)]">
                    {t("sub1")}
                </p>
                <p className="mt-2 max-w-2xl text-base md:text-lg leading-relaxed text-[color:var(--muted)]">
                    {t("sub2")}
                </p>

                <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-4">
                    <Link href={`/${locale}#building`} className="btn btn-primary">
                        {t("ctaBuilding")}
                    </Link>
                    <a
                        href={site.github.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("github_click", { from: "hero" })}
                        className="btn btn-secondary"
                    >
                        GitHub
                        <ArrowUpRight size={16} className="arrow-shift" />
                    </a>
                </div>

                <a
                    href={site.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("linkedin_click", { from: "hero" })}
                    className="link-blue mt-7 inline-flex items-center gap-1.5 text-[15px] md:text-base"
                >
                    {t("linkedin")}
                    <ArrowUpRight size={15} className="arrow-shift" />
                </a>
            </div>
        </section>
    );
}
