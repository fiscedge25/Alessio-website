"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

function DotRating({ level, max = 4 }: { level: number; max?: number }) {
    return (
        <div className="flex gap-1.5">
            {Array.from({ length: max }).map((_, i) => (
                <span
                    key={i}
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        display: "inline-block",
                        backgroundColor:
                            i < level ? "var(--accent)" : "var(--text-muted)",
                        opacity: i < level ? 1 : 0.3,
                        transition: "background-color 0.3s ease",
                    }}
                />
            ))}
        </div>
    );
}

export default function Skills() {
    const t = useTranslations("skills");

    const strategy = [
        { name: t("s_business_strategy"), level: 4 },
        { name: t("s_consulting"), level: 4 },
        { name: t("s_innovation"), level: 4 },
        { name: t("s_project_mgmt"), level: 3 },
        { name: t("s_green"), level: 3 },
        { name: t("s_stakeholder"), level: 4 },
        { name: t("s_ecommerce"), level: 3 },
    ];

    const technical = [
        { name: t("t_react"), level: 3 },
        { name: t("t_html"), level: 3 },
        { name: t("t_python"), level: 2 },
        { name: t("t_supabase"), level: 3 },
        { name: t("t_ai"), level: 4 },
        { name: t("t_cloud"), level: 2 },
        { name: t("t_git"), level: 3 },
        { name: t("t_vibe"), level: 4 },
    ];

    const langs = [
        { name: t("l_italian"), level: t("l_italian_level") },
        { name: t("l_english"), level: t("l_english_level") },
        { name: t("l_spanish"), level: t("l_spanish_level") },
    ];

    return (
        <section id="skills" className="relative z-10 py-28 px-6">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="p-6 rounded-2xl"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <h3
                            className="mb-6"
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 500,
                                fontSize: "1.25rem",
                            }}
                        >
                            {t("strategy_title")}
                        </h3>
                        <div className="space-y-4">
                            {strategy.map((s) => (
                                <motion.div
                                    key={s.name}
                                    whileHover={{ x: 5, color: "var(--accent)" }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between gap-3 cursor-default"
                                >
                                    <span
                                        className="text-sm transition-colors duration-200"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            color: "inherit",
                                        }}
                                    >
                                        {s.name}
                                    </span>
                                    <DotRating level={s.level} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="p-6 rounded-2xl"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <h3
                            className="mb-6"
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 500,
                                fontSize: "1.25rem",
                            }}
                        >
                            {t("technical_title")}
                        </h3>
                        <div className="space-y-4">
                            {technical.map((s) => (
                                <motion.div
                                    key={s.name}
                                    whileHover={{ x: 5, color: "var(--accent)" }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between gap-3 cursor-default"
                                >
                                    <span
                                        className="text-sm transition-colors duration-200"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            color: "inherit",
                                        }}
                                    >
                                        {s.name}
                                    </span>
                                    <DotRating level={s.level} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="p-6 rounded-2xl"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <h3
                            className="mb-6"
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 500,
                                fontSize: "1.25rem",
                            }}
                        >
                            {t("languages_title")}
                        </h3>
                        <div className="space-y-5">
                            {langs.map((l) => (
                                <motion.div
                                    key={l.name}
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="cursor-default"
                                >
                                    <p
                                        className="text-base mb-1 transition-colors duration-200"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            color: "var(--accent)",
                                        }}
                                    >
                                        {l.name}
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {l.level}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
