"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import BinaryPortrait from "./BinaryPortrait";

export default function Hero() {
    const t = useTranslations("hub.hero");
    const locale = useLocale();
    const reduceMotion = useReducedMotion();
    const [word, setWord] = useState(0);
    const words = [t("word1"), t("word2"), t("word3")];

    useEffect(() => {
        if (reduceMotion) return;
        const id = window.setInterval(() => setWord((current) => (current + 1) % words.length), 2200);
        return () => window.clearInterval(id);
    }, [reduceMotion, words.length]);

    return (
        <section
            id="top"
            aria-label={t("aria")}
            className="relative flex flex-col justify-center px-5 md:px-8 pt-36 pb-24 md:pt-44 md:pb-32"
        >
            <div className="max-w-6xl mx-auto w-full grid gap-14 lg:gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
                <div className="parallax-hero min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left">
                    <p className="status-pill font-mono-meta text-[11px] md:text-xs uppercase text-[color:var(--muted)] mb-8">
                        <span className="status-dot" aria-hidden="true" />
                        {t("status")}
                    </p>

                    <h1
                        className="font-display text-[color:var(--ink)] max-w-3xl"
                        style={{
                            fontSize: "clamp(3rem, 7vw, 5.25rem)",
                            lineHeight: 0.98,
                        }}
                    >
                        <span className="block">{t("headlineLead")}</span>
                        <span className="relative block min-h-[1.05em] overflow-hidden text-[color:var(--accent)]">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={word}
                                    className="block"
                                    initial={reduceMotion ? false : { y: "70%", opacity: 0, filter: "blur(8px)" }}
                                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                    exit={reduceMotion ? undefined : { y: "-70%", opacity: 0, filter: "blur(8px)" }}
                                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    {words[word]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </h1>

                    <p className="mt-7 md:mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-[color:var(--muted)]">
                        {t("sub1")}
                    </p>

                    <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <Link href={`/${locale}/start?ref=hero`} className="btn btn-primary">
                            {t("ctaStart")}
                            <ArrowRight size={16} className="arrow-shift" />
                        </Link>
                        <Link href={`/${locale}#building`} className="btn btn-secondary">
                            {t("ctaBuilding")}
                        </Link>
                    </div>
                    <p className="mt-5 font-mono-meta text-[11px] md:text-xs uppercase text-[color:var(--muted)]">
                        {t("proof")}
                    </p>

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
