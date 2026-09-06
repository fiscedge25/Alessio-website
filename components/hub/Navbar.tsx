"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { site } from "@/lib/site";
import { track } from "@/lib/analytics";
import ThemeToggle from "../ThemeToggle";
import LanguageToggle from "../LanguageToggle";

const SECTION_LINKS = [
    { key: "building", href: "#building" },
    { key: "projects", href: "#projects" },
    { key: "notes", href: "#notes" },
    { key: "about", href: "#about" },
] as const;

export default function Navbar() {
    const t = useTranslations("hub.nav");
    const locale = useLocale();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                backgroundColor: scrolled
                    ? "color-mix(in srgb, var(--paper) 88%, transparent)"
                    : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                borderBottom: scrolled
                    ? "1px solid var(--line)"
                    : "1px solid transparent",
            }}
        >
            <nav
                aria-label="Primary"
                className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-16"
            >
                <Link
                    href={`/${locale}`}
                    className="font-display text-[15px] tracking-[0.18em] uppercase text-[color:var(--ink)]"
                    aria-label="BuiltWithSabba — home"
                >
                    Sabba
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-7">
                    {SECTION_LINKS.map((l) => (
                        <Link
                            key={l.key}
                            href={`/${locale}${l.href}`}
                            className="u-link font-mono-meta text-[12px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            {t(l.key)}
                        </Link>
                    ))}
                    <Link
                        href={`/${locale}/build-with-me`}
                        className="font-mono-meta text-[12px] uppercase border border-[color:var(--line)] rounded-full px-4 py-2 text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] hover:border-[color:var(--ink)] transition-colors"
                    >
                        {t("buildWithMe")}
                    </Link>
                    <a
                        href={site.github.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("github_click", { from: "nav" })}
                        className="u-link inline-flex items-center gap-1 font-mono-meta text-[12px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                    >
                        GitHub <ArrowUpRight size={13} className="arrow-shift" />
                    </a>
                    <a
                        href={site.linkedin.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("linkedin_click", { from: "nav" })}
                        className="u-link inline-flex items-center gap-1 font-mono-meta text-[12px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                    >
                        LinkedIn <ArrowUpRight size={13} className="arrow-shift" />
                    </a>
                    <div className="flex items-center gap-1">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center gap-1">
                    <LanguageToggle />
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-label={open ? t("close") : t("menu")}
                        className="p-2 text-[color:var(--ink)]"
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {open && (
                <div
                    className="md:hidden border-t rule px-5 py-4 flex flex-col gap-4"
                    style={{ backgroundColor: "var(--paper)" }}
                >
                    {SECTION_LINKS.map((l) => (
                        <Link
                            key={l.key}
                            href={`/${locale}${l.href}`}
                            onClick={() => setOpen(false)}
                            className="font-mono-meta text-[13px] uppercase text-[color:var(--ink-2)]"
                        >
                            {t(l.key)}
                        </Link>
                    ))}
                    <Link
                        href={`/${locale}/build-with-me`}
                        onClick={() => setOpen(false)}
                        className="font-mono-meta text-[13px] uppercase text-[color:var(--ink-2)]"
                    >
                        {t("buildWithMe")}
                    </Link>
                    <div className="flex gap-6 pt-2 border-t rule">
                        <a
                            href={site.github.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono-meta text-[13px] uppercase text-[color:var(--muted)]"
                        >
                            GitHub <ArrowUpRight size={14} />
                        </a>
                        <a
                            href={site.linkedin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono-meta text-[13px] uppercase text-[color:var(--muted)]"
                        >
                            LinkedIn <ArrowUpRight size={14} />
                        </a>
                    </div>
                </div>
            )}
            <div className="scroll-progress" aria-hidden="true" />
        </header>
    );
}
