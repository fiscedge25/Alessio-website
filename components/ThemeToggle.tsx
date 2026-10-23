"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    // The server and the client's first render must be identical. The inline
    // script in layout.tsx already applies the saved theme before paint; after
    // hydration we only synchronise this button's icon with that decision.
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "dark" : "light"
        );
    }, [isDark, mounted]);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch {
            /* ignore */
        }
    };

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
            style={{ color: "var(--accent)" }}
        >
            <Sun
                size={20}
                className="absolute transition-all duration-500"
                style={{
                    opacity: isDark ? 0 : 1,
                    transform: isDark ? "rotate(-90deg) scale(0)" : "rotate(0) scale(1)",
                }}
            />
            <Moon
                size={20}
                className="absolute transition-all duration-500"
                style={{
                    opacity: isDark ? 1 : 0,
                    transform: isDark ? "rotate(0) scale(1)" : "rotate(90deg) scale(0)",
                }}
            />
        </button>
    );
}
