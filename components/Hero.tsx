"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { identity } from "@/lib/data";
import { ArrowDown, ExternalLink } from "lucide-react";

// Animated words that cycle in the headline
const CYCLING_WORDS = ["Ambizione.", "Visione.", "Coraggio.", "Futuro."];

function CyclingWord() {
    return (
        <span className="cycling-word-wrapper">
            {CYCLING_WORDS.map((word, i) => (
                <motion.span
                    key={word}
                    className="cycling-word"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
                    transition={{
                        delay: i * 2,
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: (CYCLING_WORDS.length - 1) * 2,
                        ease: "easeInOut",
                        times: [0, 0.15, 0.85, 1],
                    }}
                    style={{
                        position: i === 0 ? "relative" : "absolute",
                        top: i === 0 ? "auto" : 0,
                        left: i === 0 ? "auto" : 0,
                        color: "var(--accent)",
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

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
                    {/* Eyebrow */}
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

                    {/* Hook — cycling motivational word + fixed line */}
                    <motion.h1
                        className="leading-none mb-4"
                        style={{
                            fontFamily: "var(--font-cormorant)",
                            color: "var(--text-heading)",
                            fontWeight: 600,
                            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        {/* Cycling accent word */}
                        <span
                            style={{
                                display: "inline-block",
                                position: "relative",
                                minWidth: "11ch",
                            }}
                        >
                            <CyclingWord />
                        </span>
                        <br />
                        <span style={{ color: "var(--text-heading)" }}>
                            Il tuo prossimo
                        </span>
                        <br />
                        <span
                            style={{
                                color: "var(--text-secondary)",
                                fontWeight: 300,
                                fontStyle: "italic",
                            }}
                        >
                            passo è adesso.
                        </span>
                    </motion.h1>

                    {/* Divider line */}
                    <motion.div
                        className="mb-6"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        style={{
                            height: "1px",
                            background:
                                "linear-gradient(to right, var(--accent), transparent)",
                            transformOrigin: "left",
                            maxWidth: "200px",
                            margin: "1.5rem 0 1.5rem",
                        }}
                    />

                    {/* Sub-tagline */}
                    <motion.p
                        className="text-base sm:text-lg leading-relaxed mb-4 max-w-xl"
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

                    {/* Connected to the future badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 }}
                    >
                        <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "var(--accent)",
                            }}
                        />
                        <span
                            style={{
                                fontFamily: "var(--font-dm)",
                                fontSize: "0.7rem",
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                color: "var(--accent)",
                                fontWeight: 500,
                            }}
                        >
                            Connected to the Future
                        </span>
                    </motion.div>

                    {/* CTAs */}
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

                {/* Futuristic Animation — 40% */}
                <motion.div
                    className="md:w-2/5 flex justify-center order-first md:order-last"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                        {/* Base ambient glow */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full blur-3xl opacity-30"
                            style={{ backgroundColor: "var(--accent)" }}
                        />

                        {/* Outer rotating ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-dashed"
                            style={{ borderColor: "var(--accent)", opacity: 0.5 }}
                        />

                        {/* Middle rotating ring (reverse) */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 rounded-full border"
                            style={{ borderColor: "var(--text-muted)", opacity: 0.3 }}
                        />

                        {/* Inner dots ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-10 rounded-full border-2 border-dotted"
                            style={{ borderColor: "var(--accent)", opacity: 0.6 }}
                        />

                        {/* Inner Glowing Core */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-16 h-16 rounded-full"
                            style={{
                                background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                                boxShadow: "0 0 40px var(--accent)",
                            }}
                        >
                            {/* Inner core pulse */}
                            <motion.div
                                animate={{ opacity: [1, 0], scale: [1, 1.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full blur-sm"
                                style={{ backgroundColor: "var(--accent)" }}
                            />
                        </motion.div>
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

