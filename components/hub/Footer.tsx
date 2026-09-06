import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { site } from "@/lib/site";
import Newsletter from "../Newsletter";

export default function Footer() {
    const t = useTranslations("hub.footer");
    const locale = useLocale();
    const year = new Date().getFullYear();

    return (
        <footer className="px-5 md:px-8 pt-20 md:pt-28 pb-10 border-t rule">
            <div className="max-w-6xl mx-auto">
                {/* Newsletter */}
                <div className="grid gap-8 md:grid-cols-2 md:items-end pb-16 md:pb-20">
                    <div>
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                            {t("newsletterEyebrow")}
                        </p>
                        <h2
                            className="font-display text-[color:var(--ink)] uppercase"
                            style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", lineHeight: 1.05 }}
                        >
                            {t("newsletterTitle")}
                        </h2>
                        <p className="mt-3 max-w-md leading-relaxed text-[color:var(--muted)]">
                            {t("newsletterIntro")}
                        </p>
                    </div>
                    <div className="md:justify-self-end w-full md:max-w-md">
                        <Newsletter />
                        <p className="mt-2 text-xs text-[color:var(--muted)] px-2">
                            {t("newsletterMicro")}
                        </p>
                    </div>
                </div>

                {/* Giant sign-off */}
                <p
                    aria-hidden="true"
                    className="font-display uppercase text-[color:var(--ink)] border-t rule pt-12 select-none"
                    style={{ fontSize: "clamp(3rem, 12vw, 9rem)", lineHeight: 0.95 }}
                >
                    {t("signoff")}
                </p>

                <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm text-[color:var(--muted)]">
                            Built by {site.owner}.
                        </p>
                        <p className="mt-1 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                            {site.localeBase}
                        </p>
                    </div>
                    <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
                        <a
                            href={site.github.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link inline-flex items-center gap-1 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            GitHub <ArrowUpRight size={13} className="arrow-shift" />
                        </a>
                        <a
                            href={site.linkedin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link inline-flex items-center gap-1 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            LinkedIn <ArrowUpRight size={13} className="arrow-shift" />
                        </a>
                        <a
                            href={site.fiscedge.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link inline-flex items-center gap-1 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            Fiscedge <ArrowUpRight size={13} className="arrow-shift" />
                        </a>
                        <a
                            href={site.fiscedge.academyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link inline-flex items-center gap-1 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            Academy <ArrowUpRight size={13} className="arrow-shift" />
                        </a>
                        <a
                            href={`mailto:${site.email}`}
                            className="u-link inline-flex items-center gap-1 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            Email <ArrowUpRight size={13} className="arrow-shift" />
                        </a>
                    </nav>
                </div>

                <div className="mt-8 pt-6 border-t rule flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                        © {year} {site.owner}
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href={`/${locale}/privacy`}
                            className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href={`/${locale}/notes`}
                            className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            {t("notes")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
