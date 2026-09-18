import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowDown, ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { site } from "@/lib/site";
import { prompts, getPrompt } from "@/lib/prompts";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import BinaryPortrait from "@/components/hub/BinaryPortrait";
import PromptBlock from "@/components/hub/PromptBlock";
import ShareBar from "@/components/hub/ShareBar";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
    return ["en", "it"].flatMap((locale) => prompts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale: raw, slug } = await params;
    const locale = raw === "it" ? "it" : "en";
    const p = getPrompt(slug);
    if (!p) return {};
    const url = `${site.url}/${locale}/prompts/${slug}`;
    return {
        title: `${p.title[locale]} — BuiltWithSabba`,
        description: p.tagline[locale],
        alternates: {
            canonical: url,
            languages: {
                en: `${site.url}/en/prompts/${slug}`,
                it: `${site.url}/it/prompts/${slug}`,
            },
        },
        openGraph: {
            title: p.title[locale],
            description: p.tagline[locale],
            url,
            type: "article",
            siteName: "BuiltWithSabba",
        },
        twitter: { card: "summary_large_image", title: p.title[locale], description: p.tagline[locale] },
    };
}

/** Prompt text, read at build time from content/prompts/<slug>.md */
function readPrompt(slug: string) {
    return fs.readFileSync(path.join(process.cwd(), "content", "prompts", `${slug}.md`), "utf8");
}

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">{children}</p>
    );
}

export default async function PromptPage({ params }: { params: Params }) {
    const { locale: raw, slug } = await params;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(raw);
    const p = getPrompt(slug);
    if (!p) notFound();

    const t = await getTranslations({ locale: raw, namespace: "hub.prompts" });
    const text = readPrompt(slug);
    const pageUrl = `${site.url}/${locale}/prompts/${slug}`;

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <div className="max-w-6xl mx-auto">
                    {/* ── Hero ─────────────────────────────────────────── */}
                    <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1.05fr_1fr] items-center">
                        <Reveal className="min-w-0">
                            <Link
                                href={`/${locale}/prompts`}
                                className="inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                            >
                                <ArrowLeft size={14} />
                                {t("back")}
                            </Link>
                            <h1
                                className="mt-6 font-display text-[color:var(--ink)]"
                                style={{ fontSize: "clamp(2.3rem, 6vw, 4.2rem)", lineHeight: 1.0 }}
                            >
                                {p.title[locale]}
                            </h1>
                            <p className="mt-5 text-lg leading-relaxed text-[color:var(--ink)]">
                                {p.tagline[locale]}
                            </p>
                            <p className="mt-3 leading-relaxed text-[color:var(--muted)]">
                                {p.description[locale]}
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-2">
                                <span className="tag inline-flex items-center gap-1.5">
                                    <Clock size={12} /> ~{p.minutes} {t("minutes")}
                                </span>
                                <span className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] ml-1 mr-1">
                                    {t("worksWith")}
                                </span>
                                {p.worksWith.map((w) => (
                                    <span key={w} className="tag">
                                        {w}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a href="#prompt" className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-2.5 font-mono-meta text-[12px] uppercase text-[color:var(--paper)] hover:opacity-85 transition-opacity">
                                    {t("promptTitle")} <ArrowDown size={13} />
                                </a>
                                <a
                                    href={p.templateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] px-5 py-2.5 font-mono-meta text-[12px] uppercase text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-colors"
                                >
                                    {t("useTemplate")} <ArrowUpRight size={13} />
                                </a>
                            </div>

                            <p className="mt-7 text-sm text-[color:var(--muted)]">
                                {t("keyword")}{" "}
                                <span
                                    className="font-mono font-semibold rounded-md px-2 py-0.5"
                                    style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                                >
                                    {p.keyword.toUpperCase()}
                                </span>{" "}
                                {t("keywordAfter")}
                            </p>
                        </Reveal>

                        <Reveal delay={120} className="min-w-0">
                            <BinaryPortrait />
                        </Reveal>
                    </div>

                    {/* ── Result ───────────────────────────────────────── */}
                    <section className="mt-24 md:mt-32">
                        <Reveal>
                            <Eyebrow>
                                <span className="index-num">01</span>
                                <span className="mx-2 opacity-40">—</span>
                                {t("result")}
                            </Eyebrow>
                            <p className="max-w-2xl text-[color:var(--muted)] leading-relaxed">{t("resultIntro")}</p>
                        </Reveal>
                        <Reveal className="mt-8">
                            {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG must stay an <img> */}
                            <img
                                src={p.preview.heatmap}
                                alt="Contribution heatmap"
                                className="block w-full h-auto rounded-xl"
                            />
                            {/* Same proportions as the README: equal heights at 345 : 505. */}
                            <div className="mt-3 grid gap-3 sm:grid-cols-[345fr_505fr] items-start">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.preview.portrait} alt="ASCII portrait" className="block w-full h-auto rounded-xl" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.preview.card} alt="Info card" className="block w-full h-auto rounded-xl" />
                            </div>
                            <a
                                href={p.exampleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="u-link mt-5 inline-flex items-center gap-1 font-mono-meta text-[12px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                            >
                                {t("seeLive")} <ArrowUpRight size={13} />
                            </a>
                        </Reveal>
                    </section>

                    {/* ── Two paths ────────────────────────────────────── */}
                    <section className="mt-24 md:mt-32">
                        <Reveal>
                            <Eyebrow>
                                <span className="index-num">02</span>
                                <span className="mx-2 opacity-40">—</span>
                                {t("pathsTitle")}
                            </Eyebrow>
                        </Reveal>
                        <div className="grid gap-px border rule bg-[color:var(--line)] md:grid-cols-2 rounded-xl overflow-hidden">
                            {[
                                { title: t("pathPrompt"), sub: t("pathPromptSub"), steps: p.steps, tag: "A" },
                                { title: t("pathTemplate"), sub: t("pathTemplateSub"), steps: p.templateSteps, tag: "B" },
                            ].map((lane) => (
                                <div key={lane.tag} className="bg-[color:var(--paper)] p-7 md:p-9">
                                    <p className="font-mono-meta text-[11px] text-[color:var(--muted)]">{lane.tag}</p>
                                    <h3 className="mt-2 font-display text-2xl uppercase text-[color:var(--ink)]">
                                        {lane.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{lane.sub}</p>
                                    <ol className="mt-6 space-y-5">
                                        {lane.steps.map((s, i) => (
                                            <li key={i} className="flex gap-4">
                                                <span
                                                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] font-semibold"
                                                    style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-[color:var(--ink)]">{s.title[locale]}</p>
                                                    <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
                                                        {s.body[locale]}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                    {lane.tag === "B" && (
                                        <div className="mt-7 flex flex-wrap gap-3">
                                            <a
                                                href={p.templateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-2.5 font-mono-meta text-[12px] uppercase text-[color:var(--paper)] hover:opacity-85 transition-opacity"
                                            >
                                                {t("useTemplate")} <ArrowUpRight size={14} />
                                            </a>
                                            <a
                                                href={p.repo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="u-link inline-flex items-center gap-1 self-center font-mono-meta text-[12px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                                            >
                                                {t("viewRepo")} <ArrowUpRight size={13} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── The prompt ───────────────────────────────────── */}
                    <section id="prompt" className="mt-24 md:mt-32 scroll-mt-24">
                        <Reveal>
                            <Eyebrow>
                                <span className="index-num">03</span>
                                <span className="mx-2 opacity-40">—</span>
                                {t("promptTitle")}
                            </Eyebrow>
                            <p className="max-w-2xl mb-8 text-[color:var(--muted)] leading-relaxed">{t("promptIntro")}</p>
                        </Reveal>
                        <PromptBlock
                            slug={p.slug}
                            text={text}
                            freeLines={p.gated ? p.freeLines : Number.MAX_SAFE_INTEGER}
                            locale={locale}
                            labels={{
                                unlockTitle: t("unlockTitle"),
                                unlockBody: t("unlockBody"),
                                emailPlaceholder: t("emailPlaceholder"),
                                unlockCta: t("unlockCta"),
                                unlocking: t("unlocking"),
                                invalid: t("invalid"),
                                error: t("error"),
                                copy: t("copy"),
                                copied: t("copied"),
                                download: t("download"),
                                lines: t("lines"),
                                privacy: t("privacy"),
                            }}
                        />

                        <Reveal className="mt-6">
                            <div
                                className="rounded-xl border p-6"
                                style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                            >
                                <p className="font-semibold text-[color:var(--ink)]">{t("tipsTitle")}</p>
                                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{t("tips")}</p>
                            </div>
                        </Reveal>
                    </section>

                    {/* ── Share + CTA ──────────────────────────────────── */}
                    <section className="mt-20 md:mt-24 grid gap-10 md:grid-cols-2 border-t rule pt-12">
                        <ShareBar
                            url={pageUrl}
                            slug={p.slug}
                            text={t("shareText")}
                            labels={{
                                title: t("shareTitle"),
                                native: t("shareNative"),
                                copyLink: t("copyLink"),
                                copied: t("linkCopied"),
                            }}
                        />
                        <div className="md:text-right">
                            <p className="font-display text-xl text-[color:var(--ink)]">{t("ctaTitle")}</p>
                            <Link
                                href={`/${locale}/build-with-me`}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] px-5 py-2.5 font-mono-meta text-[12px] uppercase text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-colors"
                            >
                                {t("cta")} <ArrowUpRight size={13} />
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
