"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { track } from "@/lib/analytics";
import BinaryPortrait from "./BinaryPortrait";

export default function Hero() {
    const t = useTranslations("hub.hero");
    const locale = useLocale();

    return (
        <section
            id="top"
            aria-label={t("aria")}
            className="relative flex flex-col justify-center px-5 md:px-8 pt-36 pb-24 md:pt-44 md:pb-32"
        >
            <div className="max-w-6xl mx-auto w-full grid gap-14 lg:gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
                <div className="parallax-hero min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left">
                    <p className="status-pill font-mono-meta text-[11px] md:text-xs uppercase text-[color:var(--muted)] mb-9">
                        <span className="status-dot" aria-hidden="true" />
                        {t("status")}
                    </p>

                    <h1
                        className="font-display text-[color:var(--ink)]"
                        style={{
                            fontSize: "clamp(3rem, 7vw, 5.25rem)",
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

                    <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4">
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

                {/* Me, in 0s and 1s — and the way into the prompt that makes it. */}
                <div className="min-w-0 w-full max-w-sm mx-auto lg:max-w-none">
                    <BinaryPortrait />
                    <p className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                        <span>{t("portraitCaption")}</span>
                        <Link
                            href={`/${locale}/prompts/github-profile`}
                            className="u-link inline-flex items-center gap-1 text-[color:var(--ink)]"
                        >
                            {t("portraitCta")}
                            <ArrowUpRight size={12} className="arrow-shift" />
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
