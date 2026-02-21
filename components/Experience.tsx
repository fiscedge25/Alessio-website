"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Briefcase } from "lucide-react";

export default function Experience() {
    const t = useTranslations("experience");

    const items = [
        {
            role: t("role_1_title"),
            subtitle: t("role_1_subtitle"),
            period: "Dec 2025",
            highlights: [t("role_1_h1"), t("role_1_h2"), t("role_1_h3")],
        },
        {
            role: t("role_2_title"),
            subtitle: t("role_2_subtitle"),
            period: "2024",
            highlights: [t("role_2_h1"), t("role_2_h2"), t("role_2_h3")],
            brands: ["AutoScout", "Knorr", "Head & Shoulders"],
        },
        {
            role: t("role_3_title"),
            subtitle: t("role_3_subtitle"),
            period: t("period_current"),
            highlights: [t("role_3_h1"), t("role_3_h2"), t("role_3_h3")],
        },
        {
            role: t("role_4_title"),
            subtitle: t("role_4_subtitle"),
            period: "2024",
            highlights: [t("role_4_h1")],
        },
        {
            role: t("role_5_title"),
            subtitle: t("role_5_subtitle"),
            period: t("period_previous"),
            highlights: [t("role_5_h1"), t("role_5_h2"), t("role_5_h3"), t("role_5_h4")],
        },
    ];

    return (
        <section id="experience" className="relative z-10 py-28 px-6">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <p
                        className="text-sm tracking-[0.3em] uppercase mb-3"
                        style={{ fontFamily: "var(--font-dm)", color: "var(--accent)" }}
                    >
                        {t("label")}
                    </p>
                    <h2
                        style={{
                            fontFamily: "var(--font-cormorant)",
                            color: "var(--text-heading)",
                            fontWeight: 500,
                            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}
                    >
                        {t("title")}
                    </h2>
                </motion.div>

                <div className="relative">
                    <div
                        className="absolute left-4 md:left-6 top-0 bottom-0 w-px"
                        style={{ backgroundColor: "var(--border)" }}
                    />

                    {items.map((item, i) => (
                        <motion.div
                            key={item.role}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            className="relative pl-14 md:pl-20 mb-10 last:mb-0 group"
                        >
                            <div
                                className="absolute left-2.5 md:left-4.5 top-1 w-3 h-3 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_16px_var(--accent)]"
                                style={{
                                    backgroundColor: "var(--accent)",
                                    boxShadow: "0 0 8px var(--accent-dim)",
                                }}
                            />

                            <div
                                className="p-6 rounded-xl transition-all duration-300 group-hover:border-[var(--border-hover)]"
                                style={{
                                    backgroundColor: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                    <div className="flex items-start gap-3">
                                        <Briefcase
                                            size={18}
                                            style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }}
                                        />
                                        <div>
                                            <h3
                                                className="text-lg sm:text-xl"
                                                style={{
                                                    fontFamily: "var(--font-cormorant)",
                                                    color: "var(--text-heading)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {item.role}
                                            </h3>
                                            {item.subtitle && (
                                                <p
                                                    className="text-sm mt-0.5"
                                                    style={{
                                                        fontFamily: "var(--font-dm)",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    {item.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs tracking-wider uppercase px-3 py-1 rounded-full self-start whitespace-nowrap"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            backgroundColor: "var(--accent-dim)",
                                            color: "var(--accent)",
                                        }}
                                    >
                                        {item.period}
                                    </span>
                                </div>

                                <ul className="mt-4 space-y-2">
                                    {item.highlights.map((h, j) => (
                                        <li
                                            key={j}
                                            className="text-sm flex items-start gap-2"
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            <span
                                                className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: "var(--accent)" }}
                                            />
                                            {h}
                                        </li>
                                    ))}
                                </ul>

                                {item.brands && item.brands.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {item.brands.map((b) => (
                                            <span
                                                key={b}
                                                className="text-xs px-3 py-1 rounded-full"
                                                style={{
                                                    fontFamily: "var(--font-dm)",
                                                    border: "1px solid var(--border)",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
