"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

function readCssVar(name: string, fallback: string) {
    if (typeof window === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    return v || fallback;
}

export default function ParticleBackground() {
    const [init, setInit] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("light");

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setInit(true));
    }, []);

    useEffect(() => {
        const sync = () => {
            const t = document.documentElement.getAttribute("data-theme");
            setTheme(t === "dark" ? "dark" : "light");
        };
        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });
        sync();
        return () => observer.disconnect();
    }, []);

    const isDark = theme === "dark";

    const options: ISourceOptions = useMemo(() => {
        const star = readCssVar("--star", isDark ? "rgba(226,232,255,0.85)" : "rgba(79,70,229,0.55)");
        const link = readCssVar("--star-link", isDark ? "rgba(165,180,252,0.30)" : "rgba(99,102,241,0.35)");
        return {
            fullScreen: { enable: false },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onHover: { enable: true, mode: "grab" },
                },
                modes: {
                    grab: {
                        distance: 170,
                        links: { opacity: isDark ? 0.55 : 0.4 },
                    },
                },
            },
            particles: {
                color: { value: star },
                links: {
                    color: link,
                    distance: 140,
                    enable: true,
                    opacity: isDark ? 0.14 : 0.12,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 0.35,
                    direction: "none" as const,
                    random: true,
                    straight: false,
                    outModes: { default: "out" as const },
                },
                number: {
                    density: { enable: true, width: 1200, height: 900 },
                    value: 130,
                },
                opacity: {
                    value: { min: 0.15, max: isDark ? 0.95 : 0.7 },
                    animation: {
                        enable: true,
                        speed: 0.7,
                        sync: false,
                        startValue: "random" as const,
                    },
                },
                shape: { type: "circle" },
                size: {
                    value: { min: 0.4, max: 1.8 },
                    animation: {
                        enable: true,
                        speed: 1.2,
                        sync: false,
                        startValue: "random" as const,
                    },
                },
                shadow: {
                    enable: isDark,
                    color: "#bfdbfe",
                    blur: 4,
                },
            },
            detectRetina: true,
        };
    }, [isDark]);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="fixed inset-0 z-0"
        />
    );
}
