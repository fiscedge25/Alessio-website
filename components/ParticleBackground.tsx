"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function ParticleBackground() {
    const [init, setInit] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setInit(true));
    }, []);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const t = document.documentElement.getAttribute("data-theme");
            setTheme(t === "light" ? "light" : "dark");
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });
        const t = document.documentElement.getAttribute("data-theme");
        setTheme(t === "light" ? "light" : "dark");
        return () => observer.disconnect();
    }, []);

    const isDark = theme === "dark";

    const options: ISourceOptions = useMemo(
        () => ({
            fullScreen: { enable: false },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onHover: { enable: true, mode: "grab" },
                },
                modes: {
                    grab: {
                        distance: 160,
                        links: { opacity: 0.4 },
                    },
                },
            },
            particles: {
                color: { value: isDark ? "#c8c0b0" : "#8a7e6d" },
                links: {
                    color: isDark ? "#c8c0b0" : "#8a7e6d",
                    distance: 150,
                    enable: true,
                    opacity: isDark ? 0.12 : 0.15,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 0.6,
                    direction: "none" as const,
                    outModes: { default: "bounce" as const },
                },
                number: {
                    density: { enable: true },
                    value: 60,
                },
                opacity: { value: isDark ? 0.35 : 0.45 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 2.5 } },
            },
            detectRetina: true,
        }),
        [isDark]
    );

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="fixed inset-0 z-0"
        />
    );
}
