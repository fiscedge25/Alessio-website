"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only run on desktop
        if (window.matchMedia("(pointer: coarse)").matches) {
            return;
        }

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleLinkHoverEvents = () => {
            const interactables = document.querySelectorAll(
                'a, button, input, textarea, select, [role="button"], .cursor-hover'
            );

            interactables.forEach((el) => {
                el.addEventListener("mouseenter", () => setIsHovering(true));
                el.addEventListener("mouseleave", () => setIsHovering(false));
            });
        };

        window.addEventListener("mousemove", updateMousePosition);
        document.body.addEventListener("mouseleave", handleMouseLeave);
        document.body.addEventListener("mouseenter", handleMouseEnter);

        // Initial check for interactables
        handleLinkHoverEvents();

        // MutationObserver to catch dynamically added elements (like mobile menu)
        const observer = new MutationObserver(() => {
            handleLinkHoverEvents();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Hide default cursor across the body
        document.body.style.cursor = "none";

        // Reset cursor to default for interactive elements to prevent double cursor bugs
        // if they have hardcoded cursor styles, though we aim to override it globally
        const style = document.createElement("style");
        style.innerHTML = `
            * { cursor: none !important; }
        `;
        document.head.appendChild(style);


        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            observer.disconnect();
            document.head.removeChild(style);
            document.body.style.cursor = "auto";
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
            animate={{
                x: mousePosition.x - (isHovering ? 40 : 20),
                y: mousePosition.y - (isHovering ? 40 : 20),
                scale: isHovering ? 1.5 : 1,
                rotate: isHovering ? 90 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 28,
                mass: 0.5,
            }}
            style={{
                width: isHovering ? "80px" : "40px",
                height: isHovering ? "80px" : "40px",
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <defs>
                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4B896" />
                        <stop offset="100%" stopColor="#8B6E52" />
                    </linearGradient>
                    <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D4B896" stopOpacity="0.2" />
                        <stop offset="60%" stopColor="#D4B896" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#D4B896" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="g3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D4B896" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#D4B896" stopOpacity="0.35" />
                    </linearGradient>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#D4B896" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#D4B896" stopOpacity="0" />
                    </radialGradient>
                    <filter id="blur1">
                        <feGaussianBlur stdDeviation="3" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="blur2">
                        <feGaussianBlur stdDeviation="1.5" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="softBlur">
                        <feGaussianBlur stdDeviation="5" />
                    </filter>
                    <clipPath id="hexClip">
                        <polygon points="100,15 172,57.5 172,142.5 100,185 28,142.5 28,57.5" />
                    </clipPath>
                </defs>

                {/* Outer glow halo */}
                <circle cx="100" cy="100" r="78" fill="url(#centerGlow)" filter="url(#softBlur)" />

                {/* Hexagonal outer frame — tech precision */}
                <polygon
                    points="100,18 168,59 168,141 100,182 32,141 32,59"
                    stroke="url(#g1)"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                    fill="url(#g3)"
                />

                {/* Inner hexagon — rotated 30deg */}
                <polygon
                    points="100,42 134,61 134,99 100,118 66,99 66,61"
                    stroke="#D4B896"
                    strokeWidth="0.6"
                    strokeOpacity="0.35"
                    fill="none"
                />

                {/* Diagonal tech lines — left to right */}
                <line x1="32" y1="59" x2="66" y2="61" stroke="#D4B896" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1="168" y1="59" x2="134" y2="61" stroke="#D4B896" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1="32" y1="141" x2="66" y2="99" stroke="#D4B896" strokeWidth="0.5" strokeOpacity="0.25" />
                <line x1="168" y1="141" x2="134" y2="99" stroke="#D4B896" strokeWidth="0.5" strokeOpacity="0.25" />
                <line x1="100" y1="182" x2="100" y2="118" stroke="#D4B896" strokeWidth="0.5" strokeOpacity="0.3" />
                <line x1="100" y1="18" x2="100" y2="42" stroke="#D4B896" strokeWidth="0.5" strokeOpacity="0.3" />

                {/* Central fluid orbit — ellipse tilted */}
                <ellipse
                    cx="100" cy="100" rx="36" ry="18"
                    transform="rotate(-30 100 100)"
                    stroke="url(#g1)"
                    strokeWidth="1.2"
                    fill="none"
                    filter="url(#blur2)"
                />

                {/* Second orbit — opposite tilt */}
                <ellipse
                    cx="100" cy="100" rx="36" ry="18"
                    transform="rotate(30 100 100)"
                    stroke="url(#g2)"
                    strokeWidth="0.8"
                    fill="none"
                />

                {/* Vertical orbit */}
                <ellipse
                    cx="100" cy="100" rx="36" ry="18"
                    transform="rotate(90 100 100)"
                    stroke="#D4B896"
                    strokeWidth="0.6"
                    strokeOpacity="0.3"
                    fill="none"
                />

                {/* Scanning arc — partial, top right quadrant */}
                <path
                    d="M 100 62 A 38 38 0 0 1 133 81"
                    stroke="#D4B896"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#blur1)"
                />

                {/* Scanning arc — bottom left */}
                <path
                    d="M 100 138 A 38 38 0 0 1 67 119"
                    stroke="#D4B896"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeOpacity="0.5"
                    fill="none"
                />

                {/* Corner accent markers — hex vertices */}
                <circle cx="100" cy="18" r="2.5" fill="#D4B896" filter="url(#blur2)" />
                <circle cx="168" cy="59" r="1.8" fill="#D4B896" opacity="0.6" />
                <circle cx="168" cy="141" r="1.8" fill="#D4B896" opacity="0.4" />
                <circle cx="100" cy="182" r="2" fill="#D4B896" opacity="0.5" filter="url(#blur2)" />
                <circle cx="32" cy="141" r="1.5" fill="#D4B896" opacity="0.3" />
                <circle cx="32" cy="59" r="1.5" fill="#D4B896" opacity="0.3" />

                {/* Core nucleus */}
                <circle cx="100" cy="100" r="5" fill="#D4B896" filter="url(#blur1)" />
                <circle cx="100" cy="100" r="2.5" fill="#1a1a1a" opacity="0.9" />

                {/* Orbiting particle — top */}
                <circle cx="100" cy="62" r="3" fill="#D4B896" filter="url(#blur2)" opacity="0.9" />

                {/* Orbiting particle — right tilted */}
                <circle cx="131" cy="83" r="2" fill="#D4B896" opacity="0.7" />

                {/* Micro tick marks on outer hex edges */}
                <line x1="100" y1="18" x2="100" y2="24" stroke="#D4B896" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="100" y1="182" x2="100" y2="176" stroke="#D4B896" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="168" y1="100" x2="162" y2="100" stroke="#D4B896" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="32" y1="100" x2="38" y2="100" stroke="#D4B896" strokeWidth="1" strokeOpacity="0.3" />
            </svg>
        </motion.div>
    );
}
