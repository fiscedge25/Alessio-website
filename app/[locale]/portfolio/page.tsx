"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import AboutPanel from "@/components/AboutPanel";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";

const ParticleBackground = dynamic(
    () => import("@/components/ParticleBackground"),
    { ssr: false }
);

export default function PortfolioPage() {
    const t = useTranslations("portfolio");
    const locale = useLocale();

    return (
        <>
            <ParticleBackground />
            <div className="grain-overlay" />

            <Navbar />

            <main>
                {/* Intro */}
                <section className="relative z-10 pt-36 pb-4 px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <Link
                                href={`/${locale}`}
                                className="group inline-flex items-center gap-1.5 text-xs tracking-wider uppercase mb-8 transition-colors duration-300"
                                style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}
                            >
                                <ArrowLeft
                                    size={14}
                                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                                />
                                {t("back")}
                            </Link>

                            <p
                                className="text-sm tracking-[0.3em] uppercase mb-4"
                                style={{ fontFamily: "var(--font-dm)", color: "var(--accent)" }}
                            >
                                {t("label")}
                            </p>
                            <h1
                                className="mb-5"
                                style={{
                                    fontFamily: "var(--font-cormorant)",
                                    color: "var(--text-heading)",
                                    fontWeight: 600,
                                    fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
                                    letterSpacing: "-0.03em",
                                    lineHeight: 1.05,
                                }}
                            >
                                {t("title")}
                            </h1>
                            <p
                                className="text-base sm:text-lg leading-relaxed max-w-2xl"
                                style={{
                                    fontFamily: "var(--font-dm)",
                                    color: "var(--text-secondary)",
                                    fontWeight: 300,
                                }}
                            >
                                {t("intro")}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Chi sono — overview */}
                <AboutPanel />

                {/* Selected projects */}
                <section className="relative z-10 px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 500,
                                fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {t("projects_title")}
                        </motion.h2>
                    </div>
                </section>

                <Projects />
            </main>

            <Footer />
        </>
    );
}
