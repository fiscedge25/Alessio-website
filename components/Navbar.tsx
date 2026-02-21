"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { identity } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const SECTIONS = ["about", "education", "experience", "projects", "skills", "contact"];

export default function Navbar() {
    const t = useTranslations("nav");
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("");

    const navLinks = [
        { label: t("about"), href: "#about", id: "about" },
        { label: t("education"), href: "#education", id: "education" },
        { label: t("experience"), href: "#experience", id: "experience" },
        { label: t("projects"), href: "#projects", id: "projects" },
        { label: t("skills"), href: "#skills", id: "skills" },
        { label: t("contact"), href: "#contact", id: "contact" },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // IntersectionObserver for active section detection
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        SECTIONS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSection(id);
                    }
                },
                {
                    rootMargin: "-30% 0px -60% 0px",
                    threshold: 0,
                }
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            style={{
                backgroundColor: scrolled ? "rgba(10,10,10,0.75)" : "transparent",
                backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
                borderBottom: scrolled ? "1px solid var(--border)" : "none",
            }}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
                {/* Logo */}
                <a
                    href="#"
                    className="text-lg tracking-widest uppercase transition-colors duration-300"
                    style={{
                        fontFamily: "var(--font-cormorant)",
                        color: "var(--accent)",
                    }}
                >
                    {identity.name.split(" ")[0]}
                </a>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="text-sm tracking-wider uppercase transition-all duration-300 relative"
                            style={{
                                fontFamily: "var(--font-dm)",
                                color:
                                    activeSection === l.id
                                        ? "var(--accent)"
                                        : "var(--text-secondary)",
                                fontWeight: activeSection === l.id ? 500 : 400,
                            }}
                            onMouseEnter={(e) => {
                                if (activeSection !== l.id) {
                                    e.currentTarget.style.color = "var(--text-primary)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color =
                                    activeSection === l.id
                                        ? "var(--accent)"
                                        : "var(--text-secondary)";
                            }}
                        >
                            {l.label}
                            {/* Active indicator dot */}
                            <span
                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: "var(--accent)",
                                    opacity: activeSection === l.id ? 1 : 0,
                                    transform: `translateX(-50%) scale(${activeSection === l.id ? 1 : 0})`,
                                }}
                            />
                        </a>
                    ))}
                    <LanguageToggle />
                    <ThemeToggle />
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center gap-3">
                    <LanguageToggle />
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Menu"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className="md:hidden overflow-hidden transition-all duration-500"
                style={{
                    maxHeight: mobileOpen ? "400px" : "0px",
                    backgroundColor: "rgba(10,10,10,0.95)",
                    backdropFilter: "blur(20px)",
                }}
            >
                <div className="px-6 py-4 flex flex-col gap-4">
                    {navLinks.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm tracking-wider uppercase py-2 transition-colors duration-300 flex items-center gap-2"
                            style={{
                                fontFamily: "var(--font-dm)",
                                color:
                                    activeSection === l.id
                                        ? "var(--accent)"
                                        : "var(--text-secondary)",
                                fontWeight: activeSection === l.id ? 500 : 400,
                            }}
                        >
                            {activeSection === l.id && (
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: "var(--accent)" }}
                                />
                            )}
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}
