"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

function monogram(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function domain(url: string) {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export default function Projects() {
    const t = useTranslations("projects");

    const items = [
        {
            name: t("fiscedge_academy_name"),
            url: "https://academy.fiscedge.com",
            type: t("fiscedge_academy_type"),
            description: t("fiscedge_academy_desc"),
            stack: ["React", "Supabase", "Vercel"],
        },
        {
            name: t("fiscedge_mvp_name"),
            url: "https://fiscedge-mvp-general.vercel.app/",
            type: t("fiscedge_mvp_type"),
            description: t("fiscedge_mvp_desc"),
            stack: ["React", "Supabase", "Vercel"],
        },
        {
            name: t("giurimi_name"),
            url: "https://www.giurimi.com/",
            type: t("giurimi_type"),
            description: t("giurimi_desc"),
            stack: ["React", "Vercel"],
        },
        {
            name: t("the_italians_name"),
            url: "https://the-italians.it/",
            type: t("the_italians_type"),
            description: t("the_italians_desc"),
            stack: ["Web", "Content", "Branding"],
        },
    ];

    return (
        <section id="projects" className="relative z-10 pt-10 pb-28 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {items.map((p, i) => (
                        <motion.a
                            key={p.name}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: i * 0.1, duration: 0.55 }}
                            className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                boxShadow: "0 1px 2px rgba(15, 26, 51, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "var(--border-hover)";
                                e.currentTarget.style.boxShadow =
                                    "0 22px 48px rgba(var(--accent-rgb), 0.18)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.boxShadow =
                                    "0 1px 2px rgba(15, 26, 51, 0.05)";
                            }}
                        >
                            {/* ── Cover masthead — deep "stellar" band ── */}
                            <div
                                className="relative h-[168px] overflow-hidden"
                                style={{
                                    background:
                                        "linear-gradient(150deg, #0a1430 0%, #14275e 55%, #0b1a3d 100%)",
                                }}
                            >
                                {/* cyan aurora glow */}
                                <div
                                    className="absolute -right-10 -top-12 w-52 h-52 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125"
                                    style={{ background: "rgba(14,165,233,0.35)" }}
                                />
                                {/* sapphire glow bottom-left */}
                                <div
                                    className="absolute -left-12 bottom-0 w-48 h-48 rounded-full blur-3xl"
                                    style={{ background: "rgba(37,99,235,0.30)" }}
                                />
                                {/* fine dot-grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.14]"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
                                        backgroundSize: "20px 20px",
                                        maskImage:
                                            "radial-gradient(circle at 75% 25%, black, transparent 78%)",
                                    }}
                                />
                                {/* twinkling stars */}
                                <span className="absolute top-6 left-[38%] w-1 h-1 rounded-full bg-white/80 glow-star" style={{ animation: "twinkle 3s ease-in-out infinite" }} />
                                <span className="absolute top-12 right-[28%] w-[3px] h-[3px] rounded-full bg-white glow-star" style={{ animation: "twinkle 4s ease-in-out .6s infinite" }} />
                                <span className="absolute top-8 right-[14%] w-1 h-1 rounded-full bg-cyan-200/80" style={{ animation: "twinkle 2.6s ease-in-out .3s infinite" }} />

                                {/* index number */}
                                <span
                                    className="absolute top-4 left-5 text-sm font-medium tabular-nums"
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        color: "rgba(255,255,255,0.35)",
                                        letterSpacing: "0.15em",
                                    }}
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </span>

                                {/* Live pill */}
                                <span
                                    className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] tracking-[0.12em] uppercase font-medium"
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        background: "rgba(255,255,255,0.12)",
                                        color: "#ffffff",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        backdropFilter: "blur(6px)",
                                    }}
                                >
                                    <span className="relative flex w-1.5 h-1.5">
                                        <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-300 opacity-75 animate-ping" />
                                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                    </span>
                                    {t("status_live")}
                                </span>

                                {/* masthead: app-icon tile + name */}
                                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3.5">
                                    <div
                                        className="relative flex items-center justify-center w-[52px] h-[52px] rounded-[14px] shrink-0 transition-transform duration-300 group-hover:scale-105"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
                                            boxShadow:
                                                "0 10px 24px rgba(var(--accent-rgb),0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        <span
                                            className="text-xl font-semibold"
                                            style={{
                                                fontFamily: "var(--font-cormorant)",
                                                color: "#fff",
                                                letterSpacing: "-0.02em",
                                            }}
                                        >
                                            {monogram(p.name)}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3
                                            className="text-lg sm:text-xl leading-tight truncate"
                                            style={{
                                                fontFamily: "var(--font-cormorant)",
                                                color: "#ffffff",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {p.name}
                                        </h3>
                                        <span
                                            className="text-[0.68rem] tracking-[0.14em] uppercase"
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                color: "#7dd3fc",
                                            }}
                                        >
                                            {p.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Body ── */}
                            <div className="flex flex-col flex-1 p-6">
                                <p
                                    className="text-sm leading-relaxed mb-5"
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        color: "var(--text-secondary)",
                                        fontWeight: 300,
                                    }}
                                >
                                    {p.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {p.stack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="text-[0.72rem] px-2.5 py-1 rounded-md"
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                backgroundColor: "var(--accent-dim)",
                                                color: "var(--accent)",
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div
                                    className="mt-auto pt-4 flex items-center justify-between text-xs"
                                    style={{
                                        fontFamily: "var(--font-dm)",
                                        color: "var(--text-muted)",
                                        borderTop: "1px solid var(--border)",
                                    }}
                                >
                                    <span
                                        className="transition-colors duration-300 group-hover:text-[color:var(--accent)] truncate"
                                        style={{ letterSpacing: "0.02em" }}
                                    >
                                        {domain(p.url)}
                                    </span>
                                    <ArrowUpRight
                                        size={16}
                                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                                        style={{ color: "var(--accent)" }}
                                    />
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
