"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.setAttribute(
            "data-theme",
            next ? "dark" : "light"
        );
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
