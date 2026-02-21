"use client";

import { useTranslations } from "next-intl";
import { identity } from "@/lib/data";

export default function Footer() {
    const t = useTranslations("footer");

    return (
        <footer
            className="relative z-10 py-10 px-6"
            style={{ borderTop: "1px solid var(--border)" }}
        >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p
                    className="text-sm"
                    style={{
                        fontFamily: "var(--font-dm)",
                        color: "var(--text-muted)",
                    }}
                >
                    © {new Date().getFullYear()} {identity.name}. {t("rights")}
                </p>
                <p
                    className="text-sm"
                    style={{
                        fontFamily: "var(--font-dm)",
                        color: "var(--text-muted)",
                    }}
                >
                    {identity.city}
                </p>
            </div>
        </footer>
    );
}
