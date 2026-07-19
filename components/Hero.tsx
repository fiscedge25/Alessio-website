"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { identity } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";
import Newsletter from "./Newsletter";

export default function Hero() {
    const t = useTranslations("hero");
    const locale = useLocale();

    return (
        <section
            id="hero"
            className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
        >
            <motion.div
                className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
            >
                {/* Eyebrow */}
                <motion.p
                    className="text-xs sm:text-sm tracking-[0.35em] uppercase mb-8"
                    style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    {t("headline")}
                </motion.p>

                {/* Brand line */}
                <h1
                    className="mb-6"
                    style={{
                        fontFamily: "var(--font-cormorant)",
                        color: "var(--text-heading)",
                        fontWeight: 600,
                        fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
                        letterSpacing: "-0.035em",
                        lineHeight: 1.02,
                    }}
                >
                    <span style={{ color: "var(--text-heading)" }}>
                        {t("hook_line_1")}
                    </span>
                    <br />
                    <span className="accent-gradient">{t("hook_line_2")}</span>
                </h1>

                {/* Subtitle */}
                <motion.p
                    className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
                    style={{
                        fontFamily: "var(--font-dm)",
                        color: "var(--text-secondary)",
                        fontWeight: 300,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    {t("tagline")}
                </motion.p>

                {/* Newsletter */}
                <motion.div
                    className="flex justify-center w-full"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Newsletter />
                </motion.div>

                {/* Secondary CTAs */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                >
                    <Link
                        href={`/${locale}/portfolio`}
                        className="group inline-flex items-center gap-1.5 text-sm tracking-wider uppercase transition-colors duration-300"
                        style={{ fontFamily: "var(--font-dm)", color: "var(--text-primary)" }}
                    >
                        {t("cta_portfolio")}
                        <ArrowUpRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            style={{ color: "var(--accent)" }}
                        />
                    </Link>

                    <span
                        className="hidden sm:block w-px h-4"
                        style={{ backgroundColor: "var(--border-hover)" }}
                    />

                    <a
                        href={`mailto:${identity.email}`}
                        className="group inline-flex items-center gap-1.5 text-sm tracking-wider uppercase transition-colors duration-300"
                        style={{ fontFamily: "var(--font-dm)", color: "var(--text-primary)" }}
                    >
                        {t("cta_contact")}
                        <ArrowUpRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            style={{ color: "var(--accent)" }}
                        />
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}
