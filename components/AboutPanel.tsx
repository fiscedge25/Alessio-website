"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { stats } from "@/lib/data";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function AboutPanel() {
    const t = useTranslations("about");

    const statLabels = [
        t("stat_platforms"),
        t("stat_degrees"),
        t("stat_languages"),
    ];

    const focus = [t("focus_1"), t("focus_2"), t("focus_3"), t("focus_4")];

    return (
        <section id="about" className="relative z-10 py-20 sm:py-24 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
                    {/* Portrait */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative w-full max-w-[360px] mx-auto md:mx-0"
                    >
                        {/* glow */}
                        <div
                            className="absolute -inset-3 rounded-[28px] blur-2xl opacity-50"
                            style={{
                                background:
                                    "linear-gradient(140deg, var(--accent), var(--accent-2))",
                            }}
                        />
                        <div
                            className="relative aspect-[4/5] rounded-3xl overflow-hidden"
                            style={{
                                border: "1px solid var(--border-hover)",
                                boxShadow: "0 24px 60px rgba(var(--accent-rgb), 0.22)",
                            }}
                        >
                            <Image
                                src="/images/profile.jpg"
                                alt="Alessio Sabatino"
                                fill
                                sizes="(max-width: 768px) 100vw, 360px"
                                className="object-cover"
                                priority
                            />
                            {/* bottom gradient for badge legibility */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(to top, rgba(8,16,38,0.88) 0%, transparent 42%)",
                                }}
                            />
                            {/* location / role badge */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                                <span className="relative flex w-2 h-2 shrink-0">
                                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-300 opacity-75 animate-ping" />
                                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-300" />
                                </span>
                                <span
                                    className="text-xs tracking-wide"
                                    style={{ fontFamily: "var(--font-dm)", color: "#eaf1ff" }}
                                >
                                    {t("badge")}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <p
                            className="text-sm tracking-[0.3em] uppercase mb-3"
                            style={{ fontFamily: "var(--font-dm)", color: "var(--accent)" }}
                        >
                            {t("label")}
                        </p>
                        <h2
                            className="mb-6"
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 600,
                                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.08,
                            }}
                        >
                            {t("title")}
                        </h2>

                        {[t("bio_1"), t("bio_2")].map((p, i) => (
                            <p
                                key={i}
                                className="text-base leading-relaxed mb-5 last:mb-0"
                                style={{
                                    fontFamily: "var(--font-dm)",
                                    color: "var(--text-secondary)",
                                    fontWeight: 300,
                                }}
                            >
                                {p}
                            </p>
                        ))}

                        {/* Focus chips */}
                        <div className="flex flex-wrap gap-2.5 mt-7">
                            {focus.map((f) => (
                                <span
                                    key={f}
                                    className="text-xs px-3.5 py-1.5 rounded-full"
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        backgroundColor: "var(--accent-dim)",
                                        color: "var(--accent)",
                                        border: "1px solid var(--border-hover)",
                                    }}
                                >
                                    {f}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-14">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: i * 0.12, duration: 0.55 }}
                            className="p-5 sm:p-7 rounded-2xl text-center transition-all duration-300"
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
                                className="mb-1"
                                style={{
                                    fontFamily: "var(--font-cormorant)",
                                    color: "var(--accent)",
                                    fontWeight: 400,
                                    fontSize: "clamp(2rem, 5vw, 2.8rem)",
                                    lineHeight: 1.1,
                                }}
                            >
                                <AnimatedNumber value={s.value} />
                            </p>
                            <p
                                className="text-[0.7rem] sm:text-xs tracking-wider uppercase"
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
