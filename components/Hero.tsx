"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { identity } from "@/lib/data";
import { ArrowDown, ExternalLink } from "lucide-react";

export default function Hero() {
    const t = useTranslations("hero");

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center px-6"
        >
            <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 md:gap-16 pt-20">
                {/* Text — 60% */}
                <motion.div
                    className="md:w-3/5 text-center md:text-left"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                >
                    <motion.p
                        className="text-sm tracking-[0.3em] uppercase mb-6"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: "var(--text-muted)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {t("headline")}
                    </motion.p>

                    <motion.h1
                        className="leading-none mb-8"
                        style={{
                            fontFamily: "var(--font-cormorant)",
                            color: "var(--text-heading)",
                            fontWeight: 600,
                            fontSize: "clamp(3.5rem, 9vw, 7rem)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.0,
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        {identity.name}
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: "var(--text-secondary)",
                            fontWeight: 300,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {t("tagline")}
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <a
                            href="#projects"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
                            style={{
                                fontFamily: "var(--font-dm)",
                                backgroundColor: "var(--accent)",
                                color: "var(--bg-primary)",
                                fontWeight: 500,
                            }}
                        >
                            {t("cta_projects")}
                            <ArrowDown size={16} />
                        </a>
                        <a
                            href={identity.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
                            style={{
                                fontFamily: "var(--font-dm)",
                                border: "1px solid var(--border-hover)",
                                color: "var(--text-primary)",
                                fontWeight: 400,
                            }}
                        >
                            {t("cta_portfolio")}
                            <ExternalLink size={14} />
                        </a>
                    </motion.div>
                </motion.div>

                {/* Image — 40% */}
                <motion.div
                    className="md:w-2/5 flex justify-center order-first md:order-last"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <div
                        className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden glow-ring"
                        style={{ border: "2px solid var(--accent)" }}
                    >
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
                                color: "var(--accent)",
                                fontFamily: "var(--font-cormorant)",
                                fontWeight: 300,
                                fontSize: "3rem",
                            }}
                        >
                            AS
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ArrowDown size={20} style={{ color: "var(--text-muted)" }} />
                </motion.div>
            </motion.div>
        </section>
    );
}
