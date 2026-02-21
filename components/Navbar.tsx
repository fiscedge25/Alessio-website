"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { identity } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const SECTIONS = ["about", "services", "education", "experience", "projects", "skills", "contact"];

export default function Navbar() {
    const t = useTranslations("nav");
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [backgroundDropdownOpen, setBackgroundDropdownOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("");

    // These don't go in the main loop anymore, they are grouped
    const backgroundLinks = [
        { label: t("education"), href: "#education", id: "education" },
        { label: t("experience"), href: "#experience", id: "experience" },
        { label: t("projects"), href: "#projects", id: "projects" },
        { label: t("skills"), href: "#skills", id: "skills" },
    ];

    const mainNavLinks = [
        { label: t("about"), href: "#about", id: "about" },
        { label: "Servizi", href: "#services", id: "services" }, // Will translate later
    ];

    // Determine if any background section is active
    const isBackgroundActive = backgroundLinks.some(l => l.id === activeSection);

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
                    {mainNavLinks.map((l) => (
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

                    {/* Background Dropdown */}
                    <div
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setBackgroundDropdownOpen(true)}
                        onMouseLeave={() => setBackgroundDropdownOpen(false)}
                    >
                        <div
                            className="text-sm tracking-wider uppercase transition-all duration-300 relative py-2"
                            style={{
                                fontFamily: "var(--font-dm)",
                                color: isBackgroundActive || backgroundDropdownOpen
                                    ? "var(--accent)"
                                    : "var(--text-secondary)",
                                fontWeight: isBackgroundActive ? 500 : 400,
                            }}
                        >
                            Background
                            {/* Active indicator dot */}
                            <span
                                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: "var(--accent)",
                                    opacity: isBackgroundActive ? 1 : 0,
                                    transform: `translateX(-50%) scale(${isBackgroundActive ? 1 : 0})`,
                                }}
                            />
                        </div>

                        {/* Dropdown Menu */}
                        <div
                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-300 ${backgroundDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
                        >
                            <div
                                className="flex flex-col rounded-xl overflow-hidden min-w-[160px] shadow-lg"
                                style={{
                                    backgroundColor: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                {backgroundLinks.map((l) => (
                                    <a
                                        key={l.href}
                                        href={l.href}
                                        className="text-xs tracking-wider uppercase px-5 py-3 transition-colors duration-200"
                                        style={{
                                            fontFamily: "var(--font-dm)",
                                            color: activeSection === l.id ? "var(--accent)" : "var(--text-primary)",
                                            backgroundColor: activeSection === l.id ? "rgba(255,255,255,0.03)" : "transparent"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeSection !== l.id) {
                                                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeSection !== l.id) {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }
                                        }}
                                    >
                                        {l.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <a
                        href="#contact"
                        className="text-sm tracking-wider uppercase transition-all duration-300 relative"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: activeSection === "contact" ? "var(--accent)" : "var(--text-secondary)",
                            fontWeight: activeSection === "contact" ? 500 : 400,
                        }}
                        onMouseEnter={(e) => {
                            if (activeSection !== "contact") {
                                e.currentTarget.style.color = "var(--text-primary)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = activeSection === "contact" ? "var(--accent)" : "var(--text-secondary)";
                        }}
                    >
                        {t("contact")}
                    </a>

                    <LanguageToggle />
                    <ThemeToggle />
                </div>

                {/* Mobile Icons */}
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
                    maxHeight: mobileOpen ? "800px" : "0px",
                    backgroundColor: "rgba(10,10,10,0.95)",
                    backdropFilter: "blur(20px)",
                }}
            >
                <div className="px-6 py-4 flex flex-col gap-4">
                    {/* Main Nav Links Mobile */}
                    {mainNavLinks.map((l) => (
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

                    {/* Background Links Group Mobile */}
                    <div className="flex flex-col py-2 border-t border-b" style={{ borderColor: "var(--border)" }}>
                        <span
                            className="text-xs tracking-wider uppercase mb-3"
                            style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}
                        >
                            Background
                        </span>
                        <div className="flex flex-col gap-3 pl-4">
                            {backgroundLinks.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm tracking-wider uppercase transition-colors duration-300 flex items-center gap-2"
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

                    {/* Contact Link Mobile */}
                    <a
                        href="#contact"
                        onClick={() => setMobileOpen(false)}
                        className="text-sm tracking-wider uppercase py-2 transition-colors duration-300 flex items-center gap-2"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color:
                                activeSection === "contact"
                                    ? "var(--accent)"
                                    : "var(--text-secondary)",
                            fontWeight: activeSection === "contact" ? 500 : 400,
                        }}
                    >
                        {activeSection === "contact" && (
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: "var(--accent)" }}
                            />
                        )}
                        {t("contact")}
                    </a>
                </div>
            </div>
        </nav>
    );
}
