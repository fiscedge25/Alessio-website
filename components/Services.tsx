"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Layers, Cpu, BarChart3, Mail } from "lucide-react";
import { identity } from "@/lib/data";

// Extracted text content into the component to utilize next-intl later if needed,
// but keeping the user's provided structure for now.
const getServices = (t: any) => [
    {
        icon: Cpu,
        tag: "BUILD",
        title: "MVP Development",
        description: "Trasformo un'idea in un prodotto digitale funzionante. Architettura moderna, stack scalabile, tempi rapidi. Dal concept al deploy.",
        highlights: ["React / Next.js", "Supabase & API", "Deploy & CI/CD"],
    },
    {
        icon: BarChart3,
        tag: "STRATEGY",
        title: "Business Consulting",
        description: "Strategia digitale per aziende che vogliono crescere. Analisi del modello di business, roadmap operativa e posizionamento competitivo.",
        highlights: ["Market Analysis", "Go-to-Market", "Digital Roadmap"],
    },
    {
        icon: Layers,
        tag: "DIGITAL",
        title: "Digital Systems",
        description: "Sistemi integrati su misura: automazioni, piattaforme web, CRM e flussi operativi che fanno lavorare la tua azienda anche offline.",
        highlights: ["Automazioni", "Piattaforme custom", "Integrazioni"],
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Services() {
    const t = useTranslations("services"); // We will create this translation namespace
    const services = getServices(t);

    return (
        <section
            id="services"
            className="relative py-32 px-6 overflow-hidden"
            style={{ background: "var(--bg-primary)" }}
        >
            {/* Subtle background glow */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "600px",
                    height: "600px",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(var(--accent-rgb, 210,180,140), 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Section header */}
                <motion.div
                    className="mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <p
                        className="text-sm tracking-[0.3em] uppercase mb-4"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: "var(--text-muted)",
                        }}
                    >
                        {t("tagline")}
                    </p>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <h2
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 600,
                                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                                letterSpacing: "-0.03em",
                                lineHeight: 1.0,
                            }}
                        >
                            {t("title_1")}
                            <br />
                            <span
                                style={{
                                    color: "var(--accent)",
                                    fontStyle: "italic",
                                    fontWeight: 300,
                                }}
                            >
                                {t("title_2")}
                            </span>
                        </h2>

                        {/* Accent line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            style={{
                                height: "1px",
                                background:
                                    "linear-gradient(to right, var(--accent), transparent)",
                                transformOrigin: "left",
                                width: "160px",
                                marginBottom: "0.5rem",
                                flexShrink: 0,
                            }}
                        />
                    </div>
                </motion.div>

                {/* Service cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-px"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    style={{
                        border: "1px solid var(--border-hover)",
                        borderRadius: "1.5rem",
                        overflow: "hidden",
                        background: "var(--border-hover)",
                    }}
                >
                    {services.map((service, i) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={service.title}
                                variants={cardVariants}
                                className="group relative flex flex-col p-8 gap-6 transition-all duration-500"
                                style={{
                                    background: "var(--bg-surface)",
                                    cursor: "default",
                                }}
                                whileHover={{
                                    background: "var(--bg-elevated)",
                                }}
                            >
                                {/* Tag + Icon */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                fontSize: "0.65rem",
                                                letterSpacing: "0.25em",
                                                color: "var(--accent)",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {service.tag}
                                        </span>
                                        <motion.div
                                            whileHover={{ rotate: 12, scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Icon
                                                size={20}
                                                style={{ color: "var(--accent)", opacity: 0.7 }}
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Title */}
                                    <h3
                                        style={{
                                            fontFamily: "var(--font-cormorant)",
                                            color: "var(--text-heading)",
                                            fontWeight: 600,
                                            fontSize: "1.75rem",
                                            letterSpacing: "-0.02em",
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {service.title}
                                    </h3>
                                </div>

                                {/* Description */}
                                <p
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        color: "var(--text-secondary)",
                                        fontWeight: 300,
                                        fontSize: "0.9rem",
                                        lineHeight: 1.7,
                                        flexGrow: 1,
                                    }}
                                >
                                    {service.description}
                                </p>

                                {/* Highlights */}
                                <div className="flex flex-wrap gap-2">
                                    {service.highlights.map((h) => (
                                        <span
                                            key={h}
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                fontSize: "0.7rem",
                                                letterSpacing: "0.1em",
                                                color: "var(--text-muted)",
                                                border: "1px solid var(--border-hover)",
                                                borderRadius: "999px",
                                                padding: "0.2rem 0.75rem",
                                            }}
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>

                                {/* Bottom accent line on hover */}
                                <motion.div
                                    className="absolute bottom-0 left-0 h-[2px]"
                                    style={{
                                        background:
                                            "linear-gradient(to right, var(--accent), transparent)",
                                        width: 0,
                                    }}
                                    whileHover={{ width: "100%" }}
                                    transition={{ duration: 0.4 }}
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{
                        border: "1px solid var(--border-hover)",
                        background:
                            "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontFamily: "var(--font-cormorant)",
                                color: "var(--text-heading)",
                                fontWeight: 600,
                                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.2,
                                marginBottom: "0.4rem",
                            }}
                        >
                            {t("cta_title")}
                        </p>
                        <p
                            style={{
                                fontFamily: "var(--font-dm)",
                                color: "var(--text-muted)",
                                fontWeight: 300,
                                fontSize: "0.9rem",
                            }}
                        >
                            {t("cta_subtitle")}
                        </p>
                    </div>

                    <a
                        href={`mailto:${identity.email}`}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 flex-shrink-0 cursor-pointer"
                        style={{
                            fontFamily: "var(--font-dm)",
                            backgroundColor: "var(--accent)",
                            color: "var(--bg-primary)",
                            fontWeight: 500,
                        }}
                    >
                        <Mail size={15} />
                        {t("cta_btn")}
                        <ArrowUpRight size={15} />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
