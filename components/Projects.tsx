"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function Projects() {
    const t = useTranslations("projects");

    const items = [
        {
            name: t("fiscedge_academy_name"),
            url: "https://academy.fiscedge.com",
            type: t("fiscedge_academy_type"),
            description: t("fiscedge_academy_desc"),
            stack: ["React", "Supabase", "Vercel"],
            image: "/projects/fiscedge-academy.png",
        },
        {
            name: t("fiscedge_mvp_name"),
            url: "https://fiscedge-mvp-general.vercel.app/",
            type: t("fiscedge_mvp_type"),
            description: t("fiscedge_mvp_desc"),
            stack: ["React", "Supabase", "Vercel"],
            image: "/projects/fiscedge-mvp.png",
        },
        {
            name: t("giurimi_name"),
            url: "https://giurimi-project.vercel.app/",
            type: t("giurimi_type"),
            description: t("giurimi_desc"),
            stack: ["React", "Vercel"],
            image: "/projects/giurimi.png",
        },
        {
            name: t("the_italians_name"),
            url: "https://the-italians.it/",
            type: t("the_italians_type"),
            description: t("the_italians_desc"),
            stack: ["Web", "Content Strategy", "Branding"],
            image: "/projects/the-italians.png",
        },
    ];

    return (
        <section id="projects" className="relative z-10 py-28 px-6">
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
                            fontStyle: "italic",
                            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}
                    >
                        {t("title")}
                    </h2>
                </motion.div>

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
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
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
                            {/* Image preview */}
                            <div className="relative w-full h-48 overflow-hidden">
                                <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(to top, var(--bg-surface) 0%, transparent 60%)",
                                    }}
                                />
                            </div>

                            {/* Card content */}
                            <div className="p-7 pt-2">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3
                                            className="text-xl sm:text-2xl mb-1"
                                            style={{
                                                fontFamily: "var(--font-cormorant)",
                                                color: "var(--text-heading)",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {p.name}
                                        </h3>
                                        <span
                                            className="text-xs tracking-wider uppercase"
                                            style={{
                                                fontFamily: "var(--font-dm)",
                                                color: "var(--accent)",
                                            }}
                                        >
                                            {p.type}
                                        </span>
                                    </div>
                                    <ExternalLink
                                        size={18}
                                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                                        style={{ color: "var(--text-muted)" }}
                                    />
                                </div>

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

                                <div className="flex flex-wrap gap-2">
                                    {p.stack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="text-xs px-3 py-1 rounded-full"
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
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
