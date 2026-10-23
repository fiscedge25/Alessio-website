"use client";

// Guided "Start a project" flow: one question per card, tap to answer and the
// next card slides in. Ends with contact details and lands in /admin.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Building2,
    Check,
    Globe,
    HelpCircle,
    Lightbulb,
    Loader2,
    Rocket,
    Smartphone,
    Store,
    Briefcase,
    Wrench,
    type LucideIcon,
} from "lucide-react";
import { track } from "@/lib/analytics";
import { CHOICE_STEPS, CONTACT_PREFS, LEAD_STEPS, type ChoiceStep } from "@/lib/leads";

const ICONS: Partial<Record<string, LucideIcon>> = {
    mvp: Rocket,
    app: Smartphone,
    website: Globe,
    tool: Wrench,
    ai: Bot,
    unsure: HelpCircle,
    founder: Lightbulb,
    smallbiz: Store,
    freelancer: Briefcase,
    company: Building2,
};

const STEPS = [...CHOICE_STEPS, "describe", "contact"] as const;
type Step = (typeof STEPS)[number];

export default function StartWizard() {
    const t = useTranslations("hub.start");
    const locale = useLocale();
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState(1);
    const [answers, setAnswers] = useState<Partial<Record<ChoiceStep, string>>>({});
    const [description, setDescription] = useState("");
    const [contact, setContact] = useState({ name: "", email: "", phone: "", company: "", contactPref: "email", website: "" });
    const [consent, setConsent] = useState(false);
    const [source, setSource] = useState("");
    const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

    // ?ref= from social links (reel-03, ig-bio…) tells which content brings clients.
    useEffect(() => {
        const ref = new URLSearchParams(window.location.search).get("ref");
        let external = "";
        try {
            if (document.referrer && new URL(document.referrer).host !== window.location.host) {
                external = new URL(document.referrer).host;
            }
        } catch {
            /* ignore */
        }
        setSource((ref || external).slice(0, 80));
    }, []);

    const step: Step = STEPS[index];
    const go = (to: number) => {
        setDir(to > index ? 1 : -1);
        setIndex(to);
    };

    const choose = (s: ChoiceStep, value: string) => {
        setAnswers((a) => ({ ...a, [s]: value }));
        track("lead_step", { step: s, value });
        // Let the selection register visually before the next card slides in.
        setTimeout(() => go(index + 1), 220);
    };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!consent || state === "loading") return;
        setState("loading");
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...answers, description, ...contact, consent, locale, source }),
            });
            if (!res.ok) throw new Error();
            setState("done");
            track("lead_submit", { need: answers.need ?? "" });
            window.gtag?.("event", "generate_lead", { lead_source: source || "direct", need: answers.need });
        } catch {
            setState("error");
        }
    }

    if (state === "done") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 md:p-12 text-center"
            >
                <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent)] text-white">
                    <Check size={26} />
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-[color:var(--ink)]">{t("doneTitle")}</h2>
                <p className="mt-4 text-lg leading-relaxed text-[color:var(--muted)] max-w-lg mx-auto">{t("doneBody")}</p>
                <ol className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                    {(["next1", "next2", "next3"] as const).map((k, i) => (
                        <li key={k} className="rounded-xl border rule p-4">
                            <p className="font-mono-meta text-[11px] text-[color:var(--muted)]">0{i + 1}</p>
                            <p className="mt-1 text-sm leading-relaxed text-[color:var(--ink-2)]">{t(k)}</p>
                        </li>
                    ))}
                </ol>
            </motion.div>
        );
    }

    const progress = (index + 1) / STEPS.length;
    const label = "font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-2 block";

    return (
        <div>
            {/* Progress */}
            <div className="mb-6 flex items-center gap-4">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--surface)]">
                    <motion.div
                        className="h-full bg-[color:var(--accent)]"
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: "spring", stiffness: 140, damping: 22 }}
                    />
                </div>
                <span className="font-mono-meta text-[11px] text-[color:var(--muted)]">
                    {index + 1}/{STEPS.length}
                </span>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                        key={step}
                        custom={dir}
                        initial={{ opacity: 0, x: dir * 60, rotate: dir * 2 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        exit={{ opacity: 0, x: dir * -60, rotate: dir * -2 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="card p-6 md:p-10"
                    >
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--accent)] mb-3">
                            {t(`${step}.eyebrow`)}
                        </p>
                        <h2
                            className="font-display text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.08 }}
                        >
                            {t(`${step}.q`)}
                        </h2>

                        {step in LEAD_STEPS && (
                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {LEAD_STEPS[step as ChoiceStep].map((v) => {
                                    const Icon = ICONS[v];
                                    const selected = answers[step as ChoiceStep] === v;
                                    return (
                                        <motion.button
                                            key={v}
                                            type="button"
                                            whileHover={{ y: -3 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => choose(step as ChoiceStep, v)}
                                            className="group flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors"
                                            style={{
                                                borderColor: selected ? "var(--accent)" : "var(--line)",
                                                background: selected ? "var(--accent-dim)" : "var(--paper-elevated)",
                                            }}
                                        >
                                            {Icon && (
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--surface)] text-[color:var(--ink)] group-hover:text-[color:var(--accent)] transition-colors">
                                                    <Icon size={20} />
                                                </span>
                                            )}
                                            <span>
                                                <span className="block font-medium text-[color:var(--ink)]">
                                                    {t(`${step}.${v}`)}
                                                </span>
                                                {t.has(`${step}.${v}Sub`) && (
                                                    <span className="mt-1 block text-sm leading-snug text-[color:var(--muted)]">
                                                        {t(`${step}.${v}Sub`)}
                                                    </span>
                                                )}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {step === "describe" && (
                            <div className="mt-8">
                                <textarea
                                    className="field resize-y"
                                    rows={6}
                                    maxLength={5000}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t("describe.ph")}
                                    autoFocus
                                />
                                <p className="mt-2 text-xs text-[color:var(--muted)]">{t("describe.hint")}</p>
                                <button
                                    type="button"
                                    className="btn btn-primary mt-6"
                                    disabled={description.trim().length < 15}
                                    onClick={() => go(index + 1)}
                                >
                                    {t("next")}
                                    <ArrowRight size={16} className="arrow-shift" />
                                </button>
                            </div>
                        )}

                        {step === "contact" && (
                            <form onSubmit={submit} className="mt-8 space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="lw-name" className={label}>{t("contact.name")}</label>
                                        <input id="lw-name" className="field" required autoComplete="name" maxLength={120}
                                            value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="lw-email" className={label}>{t("contact.email")}</label>
                                        <input id="lw-email" className="field" type="email" required autoComplete="email" maxLength={254}
                                            value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="lw-phone" className={label}>{t("contact.phone")}</label>
                                        <input id="lw-phone" className="field" type="tel" autoComplete="tel" maxLength={40}
                                            value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="lw-company" className={label}>{t("contact.company")}</label>
                                        <input id="lw-company" className="field" autoComplete="organization" maxLength={160}
                                            value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
                                    </div>
                                </div>
                                {/* Honeypot — hidden from people, filled by bots */}
                                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                                    className="hidden" value={contact.website}
                                    onChange={(e) => setContact({ ...contact, website: e.target.value })} />

                                <fieldset>
                                    <legend className={label}>{t("contact.pref")}</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {CONTACT_PREFS.map((p) => (
                                            <button key={p} type="button" onClick={() => setContact({ ...contact, contactPref: p })}
                                                className="tag cursor-pointer"
                                                style={contact.contactPref === p
                                                    ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
                                                    : undefined}>
                                                {t(`contact.${p}`)}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>

                                <label className="flex items-start gap-3 text-sm leading-relaxed text-[color:var(--ink-2)] cursor-pointer">
                                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                                        className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--accent)]" />
                                    <span>
                                        {t.rich("contact.consent", {
                                            privacy: (chunks) => (
                                                <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="link-blue">
                                                    {chunks}
                                                </a>
                                            ),
                                        })}
                                    </span>
                                </label>

                                <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={!consent || state === "loading"}>
                                    {state === "loading" && <Loader2 size={16} className="animate-spin" />}
                                    {t("contact.send")}
                                    {state !== "loading" && <ArrowRight size={16} className="arrow-shift" />}
                                </button>
                                {state === "error" && <p role="alert" className="text-sm text-red-500">{t("error")}</p>}
                            </form>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {index > 0 && (
                <button
                    type="button"
                    onClick={() => go(index - 1)}
                    className="mt-5 inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                >
                    <ArrowLeft size={14} />
                    {t("back")}
                </button>
            )}
        </div>
    );
}
