"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [switching, setSwitching] = useState(false);

    const switchLocale = useCallback(
        (newLocale: string) => {
            if (newLocale === locale || switching) return;

            setSwitching(true);

            // Fade out the page
            document.body.style.transition = "opacity 0.2s ease";
            document.body.style.opacity = "0";

            setTimeout(() => {
                // Navigate to new locale
                const segments = pathname.split("/");
                segments[1] = newLocale;
                router.push(segments.join("/"));

                // Fade back in after navigation
                setTimeout(() => {
                    document.body.style.opacity = "1";
                    setSwitching(false);
                }, 100);
            }, 200);
        },
        [locale, pathname, router, switching]
    );

    return (
        <div
            className="flex items-center gap-1 text-sm tracking-wider"
            style={{ fontFamily: "var(--font-dm)" }}
        >
            <button
                onClick={() => switchLocale("en")}
                disabled={switching}
                className="transition-colors duration-300 px-1"
                style={{
                    color: locale === "en" ? "#ffffff" : "var(--text-muted)",
                    fontWeight: locale === "en" ? 500 : 400,
                }}
                aria-label="Switch to English"
            >
                EN
            </button>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <button
                onClick={() => switchLocale("it")}
                disabled={switching}
                className="transition-colors duration-300 px-1"
                style={{
                    color: locale === "it" ? "#ffffff" : "var(--text-muted)",
                    fontWeight: locale === "it" ? 500 : 400,
                }}
                aria-label="Passa all'italiano"
            >
                IT
            </button>
        </div>
    );
}
