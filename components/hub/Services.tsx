import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Bot, Check, Globe, Rocket, Wrench, X } from "lucide-react";
import { type Locale } from "@/lib/hub";
import Reveal from "./Reveal";

const OFFERS = [
    { key: "mvp", Icon: Rocket },
    { key: "web", Icon: Globe },
    { key: "tool", Icon: Wrench },
    { key: "ai", Icon: Bot },
] as const;

const COMPARE = ["team", "time", "cost", "talk"] as const;

/**
 * The pitch right under the hero: what I build for small businesses and
 * founders, and why one AI-native builder beats a software house on cost
 * and speed. Every CTA goes to the guided /start flow.
 */
export default function Services({ locale, index }: { locale: Locale; index: string }) {
    const t = useTranslations("hub.services");

    return (
        <section id="services" aria-label={t("title")} className="px-5 md:px-8 py-20 md:py-28 scroll-mt-20">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                        {index} — {t("eyebrow")}
                    </p>
                    <h2
                        className="font-display text-[color:var(--ink)] max-w-3xl"
                        style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", lineHeight: 1.02 }}
                    >
                        {t("title")}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-[color:var(--muted)]">
                        {t("intro")}
                    </p>
                </Reveal>

                {/* What I build */}
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {OFFERS.map(({ key, Icon }, i) => (
                        <Reveal key={key} delay={i * 60}>
                            <Link
                                href={`/${locale}/start`}
                                className="card card-hover group flex h-full flex-col p-6"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--accent-dim)] text-[color:var(--accent)]">
                                    <Icon size={21} />
                                </span>
                                <p className="mt-5 font-display text-lg text-[color:var(--ink)]">{t(`${key}.title`)}</p>
                                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)] flex-1">
                                    {t(`${key}.body`)}
                                </p>
                                <p className="mt-4 font-mono-meta text-[11px] uppercase text-[color:var(--ink)]">
                                    {t(`${key}.eg`)}
                                </p>
                            </Link>
                        </Reveal>
                    ))}
                </div>

                {/* Software house vs me */}
                <Reveal className="mt-14">
                    <div className="card overflow-hidden">
                        <div className="grid grid-cols-[1fr_1fr] md:grid-cols-[0.8fr_1fr_1fr] border-b rule">
                            <div className="hidden md:block" />
                            <p className="px-5 py-4 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                {t("vs.agency")}
                            </p>
                            <p className="px-5 py-4 font-mono-meta text-[11px] uppercase text-[color:var(--accent)] bg-[color:var(--accent-dim)]">
                                {t("vs.me")}
                            </p>
                        </div>
                        {COMPARE.map((row) => (
                            <div
                                key={row}
                                className="grid grid-cols-[1fr_1fr] md:grid-cols-[0.8fr_1fr_1fr] border-b rule last:border-b-0"
                            >
                                <p className="col-span-2 md:col-span-1 px-5 pt-4 md:py-4 font-medium text-[color:var(--ink)]">
                                    {t(`vs.${row}`)}
                                </p>
                                <p className="flex items-start gap-2 px-5 py-4 text-sm leading-relaxed text-[color:var(--muted)]">
                                    <X size={15} className="mt-0.5 shrink-0" />
                                    {t(`vs.${row}Agency`)}
                                </p>
                                <p className="flex items-start gap-2 px-5 py-4 text-sm leading-relaxed text-[color:var(--ink)] bg-[color:var(--accent-dim)]">
                                    <Check size={15} className="mt-0.5 shrink-0 text-[color:var(--accent)]" />
                                    {t(`vs.${row}Me`)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-[color:var(--muted)]">{t("vs.note")}</p>
                </Reveal>

                <Reveal className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Link href={`/${locale}/start`} className="btn btn-primary">
                        {t("cta")}
                        <ArrowRight size={16} className="arrow-shift" />
                    </Link>
                    <span className="text-sm text-[color:var(--muted)]">{t("ctaSub")}</span>
                </Reveal>
            </div>
        </section>
    );
}
