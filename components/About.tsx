"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { stats } from "@/lib/data";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6 },
    }),
};

export default function About() {
    const t = useTranslations("about");

    const statLabels = [
        t("stat_platforms"),
        t("stat_degrees"),
        t("stat_languages"),
    ];

    return (
        <section id="about" className="relative z-10 py-28 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Section header */}
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
                            fontStyle: "italic",
                            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}
                    >
                        {t("title")}
                    </h2>
                </motion.div>

                {/* Bio text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16 max-w-3xl"
                >
                    {[t("bio_1"), t("bio_2"), t("bio_3")].map((p, i) => (
                        <p
                            key={i}
                            className="text-base sm:text-lg leading-relaxed mb-6 last:mb-0"
                            style={{
                                fontFamily: "var(--font-dm)",
                                color: "var(--text-secondary)",
                                fontWeight: 300,
                            }}
                        >
                            {p}
                        </p>
                    ))}
                </motion.div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="p-8 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.borderColor = "var(--border-hover)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.borderColor = "var(--border)")
                            }
                        >
                            <p
                                className="mb-2"
                                style={{
                                    fontFamily: "var(--font-cormorant)",
                                    color: "var(--accent)",
                                    fontWeight: 300,
                                    fontSize: "3rem",
                                    lineHeight: 1.1,
                                }}
                            >
                                {s.value}
                            </p>
                            <p
                                className="text-sm tracking-wider uppercase"
                                style={{
                                    fontFamily: "var(--font-dm)",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {statLabels[i]}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
