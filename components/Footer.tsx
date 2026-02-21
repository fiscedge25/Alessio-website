"use client";

import { useTranslations } from "next-intl";
import { identity } from "@/lib/data";
import Link from "next/link";

export default function Footer() {
    const t = useTranslations("footer");

    return (
        <footer
            className="relative z-10 py-10 px-6"
            style={{ borderTop: "1px solid var(--border)" }}
        >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
                    <p
                        className="text-sm"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: "var(--text-muted)",
                        }}
                    >
                        © {new Date().getFullYear()} {identity.name}. {t("rights")}
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/privacy"
                            className="text-sm transition-colors hover:text-[var(--accent)]"
                            style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}
                        >
                            {t("privacy")}
                        </Link>
                        <span style={{ color: "var(--border)" }}>|</span>
                        <Link
                            href="/privacy"
                            className="text-sm transition-colors hover:text-[var(--accent)]"
                            style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}
                        >
                            {t("cookie")}
                        </Link>
                    </div>
                </div>
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
