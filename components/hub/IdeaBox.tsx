"use client";

// "What should I build next?" — lightweight voting + idea suggestion.
// One vote per idea per browser (localStorage). No registration.
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { ideas, type Locale } from "@/lib/hub";
import { track } from "@/lib/analytics";
import Reveal from "./Reveal";

const VOTED_KEY = "bws-voted-ideas";

function readVoted(): string[] {
    try {
        return JSON.parse(localStorage.getItem(VOTED_KEY) || "[]");
    } catch {
        return [];
    }
}

export default function IdeaBox({ locale }: { locale: Locale }) {
    const t = useTranslations("hub.ideas");
    const [extraVotes, setExtraVotes] = useState<Record<string, number>>({});
    const [serverVotes, setServerVotes] = useState<Record<string, number>>({});
    // Browser vote memory starts in the initializer, not in an effect.
    const [voted, setVoted] = useState<string[]>(() => readVoted());
    const [voting, setVoting] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [suggestState, setSuggestState] = useState<"idle" | "loading" | "done" | "error">("idle");

    useEffect(() => {
        fetch("/api/ideas/votes")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d?.votes) setServerVotes(d.votes);
            })
            .catch(() => {});
    }, []);

    const totals = useMemo(() => {
        const base = ideas.map((i) => ({
            id: i.id,
            count: i.baseVotes + (serverVotes[i.id] || 0) + (extraVotes[i.id] || 0),
        }));
        const sum = base.reduce((s, b) => s + b.count, 0) || 1;
        return base.map((b) => ({ ...b, pct: Math.round((b.count / sum) * 100) }));
    }, [serverVotes, extraVotes]);

    const vote = async (id: string) => {
        if (voted.includes(id) || voting) return;
        setVoting(id);
        try {
            const voter = getVoterId();
            const res = await fetch("/api/ideas/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ideaId: id, voter }),
            });
            if (res.ok) {
                const next = [...voted, id];
                setVoted(next);
                localStorage.setItem(VOTED_KEY, JSON.stringify(next));
                setExtraVotes((v) => ({ ...v, [id]: (v[id] || 0) + 1 }));
                track("idea_vote", { idea: id });
            }
        } catch {
            // Local fallback: still count it in this browser.
            const next = [...voted, id];
            setVoted(next);
            localStorage.setItem(VOTED_KEY, JSON.stringify(next));
            setExtraVotes((v) => ({ ...v, [id]: (v[id] || 0) + 1 }));
        } finally {
            setVoting(null);
        }
    };

    const submitIdea = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (suggestState === "loading") return;
        setSuggestState("loading");
        const fd = new FormData(e.currentTarget);
        try {
            const res = await fetch("/api/ideas/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(fd.get("name") || ""),
                    email: String(fd.get("email") || ""),
                    idea: String(fd.get("idea") || ""),
                }),
            });
            if (res.ok) {
                setSuggestState("done");
                track("idea_submission", {});
            } else {
                setSuggestState("error");
            }
        } catch {
            setSuggestState("error");
        }
    };

    return (
        <section aria-label={t("title")} className="px-5 md:px-8 py-20 md:py-28">
            <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 md:gap-16">
                <Reveal>
                    <div>
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                            05 — {t("eyebrow")}
                        </p>
                        <h2
                            className="font-display text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.05 }}
                        >
                            {t("title")}
                        </h2>
                        <p className="mt-4 leading-relaxed text-[color:var(--muted)]">{t("intro")}</p>

                        <div className="mt-8 border-t rule pt-8">
                            <p className="font-medium text-[color:var(--ink)]">{t("suggestTitle")}</p>
                            <p className="mt-1 text-sm text-[color:var(--muted)]">{t("suggestIntro")}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setModalOpen(true);
                                    setSuggestState("idle");
                                }}
                                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)] px-6 py-3 text-sm font-medium text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-colors"
                            >
                                {t("suggestCta")}
                                <ArrowRight size={15} className="arrow-shift" />
                            </button>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <ol className="flex flex-col gap-6">
                        {ideas.map((idea) => {
                            const row = totals.find((x) => x.id === idea.id)!;
                            const hasVoted = voted.includes(idea.id);
                            return (
                                <li
                                    key={idea.id}
                                    className="border rule rounded-sm p-5 md:p-6 bg-[color:var(--paper-elevated)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-[color:var(--ink)]">
                                                {idea.title[locale]}
                                            </p>
                                            <p className="mt-1 text-sm text-[color:var(--muted)]">
                                                {idea.blurb[locale]}
                                            </p>
                                        </div>
                                        <span className="font-mono-meta text-sm text-[color:var(--ink)] shrink-0">
                                            {row.pct}%
                                        </span>
                                    </div>
                                    <div
                                        className="mt-4 h-1 rounded-full bg-[color:var(--line)] overflow-hidden"
                                        role="img"
                                        aria-label={`${row.pct}%`}
                                    >
                                        <div
                                            className="h-full bg-[color:var(--ink)] transition-all duration-700"
                                            style={{ width: `${row.pct}%` }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        disabled={hasVoted || voting === idea.id}
                                        onClick={() => vote(idea.id)}
                                        className="mt-4 inline-flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors disabled:opacity-70 disabled:cursor-default"
                                    >
                                        {voting === idea.id ? (
                                            <Loader2 size={13} className="animate-spin" />
                                        ) : hasVoted ? (
                                            <Check size={13} />
                                        ) : null}
                                        {hasVoted ? t("voted") : t("vote")}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </Reveal>
            </div>

            {modalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("modalTitle")}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-5"
                    style={{ backgroundColor: "rgba(10,10,10,0.5)" }}
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-sm p-7 md:p-8 bg-[color:var(--paper)] border rule"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="font-display text-2xl text-[color:var(--ink)]">
                                {t("modalTitle")}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                aria-label={t("close")}
                                className="p-1 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {suggestState === "done" ? (
                            <p className="mt-4 leading-relaxed text-[color:var(--ink)]">
                                {t("success")}
                            </p>
                        ) : (
                            <form onSubmit={submitIdea} className="mt-5 flex flex-col gap-4">
                                <div>
                                    <label
                                        htmlFor="idea-name"
                                        className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]"
                                    >
                                        {t("name")}
                                    </label>
                                    <input
                                        id="idea-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        className="mt-1.5 w-full border rule rounded-sm bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)]"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="idea-email"
                                        className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]"
                                    >
                                        {t("email")}
                                    </label>
                                    <input
                                        id="idea-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className="mt-1.5 w-full border rule rounded-sm bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)]"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="idea-text"
                                        className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]"
                                    >
                                        {t("ideaLabel")}
                                    </label>
                                    <textarea
                                        id="idea-text"
                                        name="idea"
                                        required
                                        rows={4}
                                        maxLength={2000}
                                        className="mt-1.5 w-full border rule rounded-sm bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)] resize-y"
                                    />
                                </div>
                                {suggestState === "error" && (
                                    <p role="alert" className="text-sm text-red-600">
                                        {t("error")}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={suggestState === "loading"}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] px-6 py-3 text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-60"
                                >
                                    {suggestState === "loading" && (
                                        <Loader2 size={15} className="animate-spin" />
                                    )}
                                    {t("send")}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

function getVoterId(): string {
    try {
        let id = localStorage.getItem("bws-voter");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("bws-voter", id);
        }
        return id;
    } catch {
        return "anonymous";
    }
}
