"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { identity } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const linkStyle = {
        fontFamily: "var(--font-dm)",
        color: "var(--text-secondary)",
    } as const;

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            style={{
                background: scrolled
                    ? "color-mix(in srgb, var(--bg-primary) 78%, transparent)"
                    : "transparent",
                backdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
                borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
            }}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
                {/* Logo */}
                <Link
                    href={`/${locale}`}
                    className="text-lg tracking-[0.25em] uppercase transition-opacity duration-300 hover:opacity-80"
                    style={{
                        fontFamily: "var(--font-cormorant)",
                        color: "var(--accent)",
                        fontWeight: 600,
                    }}
                >
                    {identity.name.split(" ")[0]}
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-6 sm:gap-8">
                    <Link
                        href={`/${locale}/portfolio`}
                        className="text-sm tracking-wider uppercase transition-colors duration-300 hover:text-[color:var(--text-primary)]"
                        style={linkStyle}
                    >
                        {t("portfolio")}
                    </Link>

                    <a
                        href={`mailto:${identity.email}`}
                        className="hidden sm:inline text-sm tracking-wider uppercase transition-colors duration-300 hover:text-[color:var(--text-primary)]"
                        style={linkStyle}
                    >
                        {t("contact")}
                    </a>

                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
