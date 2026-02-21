"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GraduationCap, Award } from "lucide-react";

export default function Education() {
    const t = useTranslations("education");

    const items = [
        {
            title: t("master_title"),
            institution: t("master_institution"),
            year: "2025",
            focus: t("master_focus"),
        },
        {
            title: t("mba_title"),
            institution: t("mba_institution"),
            year: "2023 – 2025",
            focus: t("mba_focus"),
        },
        {
            title: t("bsc_title"),
            institution: t("bsc_institution"),
            year: "2018 – 2022",
            focus: t("bsc_focus"),
        },
    ];

    const certs = [t("cert_1"), t("cert_2"), t("cert_3")];

    return (
        <section id="education" className="relative z-10 py-28 px-6">
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
                            key={item.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                            className="relative pl-14 md:pl-20 mb-12 last:mb-0"
                        >
                            <div
                                className="absolute left-2.5 md:left-4.5 top-1 w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor: "var(--accent)",
                                    boxShadow: "0 0 12px var(--accent-dim)",
                                }}
                            />
                            <div
                                className="p-6 rounded-xl transition-all duration-300"
                                style={{
                                    backgroundColor: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <GraduationCap
                                        size={20}
                                        style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}
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
                                            {item.title}
                                        </h3>
                                        <p
                                            className="text-sm mt-1"
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {item.institution}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <span
                                        className="text-xs tracking-wider uppercase px-3 py-1 rounded-full"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            backgroundColor: "var(--accent-dim)",
                                            color: "var(--accent)",
                                        }}
                                    >
                                        {item.year}
                                    </span>
                                    <span
                                        className="text-sm"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {item.focus}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="mt-16"
                >
                    <h3
                        className="mb-6"
                        style={{
                            fontFamily: "var(--font-cormorant)",
                            color: "var(--text-heading)",
                            fontWeight: 500,
                            fontSize: "1.5rem",
                        }}
                    >
                        {t("certifications_title")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certs.map((cert, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-xl flex items-start gap-3 transition-all duration-300"
                                style={{
                                    backgroundColor: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <Award
                                    size={16}
                                    style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}
                                />
                                <p
                                    className="text-sm"
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    {cert}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
