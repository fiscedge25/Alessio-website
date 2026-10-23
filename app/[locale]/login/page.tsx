import type { Metadata } from "next";
import Link from "next/link";
import { adminConfigured, currentSessionId, listSessions } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { LEAD_STATUSES, OPTION_LABEL, STATUS_LABEL, type Lead, type LeadStatus } from "@/lib/leads";
import { eur, type Quote } from "@/lib/quotes";
import { endSession, login, logoutEverywhere } from "./actions";
import { AdminShell, StatusPill, fmtDate } from "./ui";
import Board, { type BoardLead } from "./Board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads — BuiltWithSabba", robots: { index: false, follow: false } };

type Search = Promise<{ status?: string; error?: string; view?: string }>;

/** A lead still "new" this long after it arrived needs an answer. */
const OVERDUE_MS = 48 * 3_600_000;

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
    const { status, error, view } = await searchParams;
    const sessionId = await currentSessionId();
    if (!sessionId) return <Login error={error} configured={adminConfigured()} />;

    const supabase = getSupabaseAdmin();
    if (!supabase) return <AdminShell>Supabase is not configured.</AdminShell>;

    const [{ data, error: dbError }, { data: quoteRows }, sessions] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("quotes").select("lead_id, status, total_cents, deposit_cents, amount_paid, created_at").neq("status", "void"),
        listSessions(),
    ]);
    if (dbError) {
        return (
            <AdminShell>
                <p className="text-red-500">Could not load leads: {dbError.message}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Did you run supabase/leads.sql and leads-v2.sql?</p>
            </AdminShell>
        );
    }
    const all = (data ?? []) as Lead[];
    const quotes = (quoteRows ?? []) as Pick<Quote, "lead_id" | "status" | "total_cents" | "deposit_cents" | "amount_paid" | "created_at">[];
    const now = Date.now();
    const isOverdue = (l: Lead) => l.status === "new" && now - new Date(l.created_at).getTime() > OVERDUE_MS;
    const overdue = all.filter(isOverdue);

    // Latest quote per lead, for the card badge.
    const latestQuote = new Map<string, (typeof quotes)[number]>();
    for (const q of quotes) {
        const prev = latestQuote.get(q.lead_id);
        if (!prev || prev.created_at < q.created_at) latestQuote.set(q.lead_id, q);
    }
    const pipeline = quotes.filter((q) => q.status === "sent").reduce((s, q) => s + q.total_cents, 0);
    const won = quotes.filter((q) => q.status === "paid" || q.status === "accepted").reduce((s, q) => s + q.total_cents, 0);
    const collected = quotes.reduce((s, q) => s + (q.amount_paid ?? 0), 0);

    const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, all.filter((l) => l.status === s).length]));
    const active = (LEAD_STATUSES as readonly string[]).includes(status ?? "") ? (status as LeadStatus) : null;
    const isList = view === "list" || !!active;
    // Default list hides closed leads.
    const leads = active ? all.filter((l) => l.status === active) : all.filter((l) => !["lost", "declined"].includes(l.status));

    const sources = Object.entries(
        all.reduce<Record<string, { n: number; won: number }>>((acc, l) => {
            const k = l.source || "direct";
            acc[k] ??= { n: 0, won: 0 };
            acc[k].n += 1;
            if (l.status === "won") acc[k].won += 1;
            return acc;
        }, {}),
    ).sort((a, b) => b[1].n - a[1].n);

    const boardLeads: BoardLead[] = all.map((l) => {
        const q = latestQuote.get(l.id);
        return {
            id: l.id,
            name: l.name,
            company: l.company,
            need: l.need,
            budget: l.budget,
            timeline: l.timeline,
            status: l.status,
            created_at: l.created_at,
            call_at: l.call_at,
            source: l.source,
            overdue: isOverdue(l),
            quote: q ? `${eur(q.total_cents)}${q.status === "paid" ? " ✓" : ""}` : null,
        };
    });

    const tab = (on: boolean) => (on ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : undefined);

    return (
        <AdminShell>
            {overdue.length > 0 && (
                <div className="mb-5 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#e5484d", background: "color-mix(in srgb, #e5484d 8%, var(--paper))" }}>
                    <span className="font-medium text-[color:var(--ink)]">
                        {overdue.length === 1 ? "1 lead is" : `${overdue.length} leads are`} waiting for a reply for more than 48h:
                    </span>{" "}
                    {overdue.map((l, i) => (
                        <span key={l.id}>
                            {i > 0 && ", "}
                            <Link href={`/en/login/leads/${l.id}`} className="link-blue">
                                {l.name}
                            </Link>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <Link href="/en/login" className="tag" style={tab(!isList)}>
                    Board
                </Link>
                <Link href="/en/login?view=list" className="tag" style={tab(isList && !active)}>
                    List · {all.length - counts.lost - counts.declined}
                </Link>
                <span className="mx-1 h-4 w-px bg-[color:var(--line)]" />
                {LEAD_STATUSES.map((s) => (
                    <Link key={s} href={`/en/login?status=${s}`} className="tag" style={tab(active === s)}>
                        {STATUS_LABEL[s]} · {counts[s]}
                    </Link>
                ))}
            </div>

            <div className={`mt-6 grid gap-6 items-start ${isList ? "lg:grid-cols-[1fr_260px]" : ""}`}>
                {isList ? (
                    <ul className="space-y-3">
                        {leads.length === 0 && <li className="card p-6 text-[color:var(--muted)]">No leads here yet.</li>}
                        {leads.map((l) => (
                            <li key={l.id}>
                                <Link
                                    href={`/en/login/leads/${l.id}`}
                                    className="card card-hover block p-5"
                                    style={isOverdue(l) ? { borderColor: "#e5484d" } : undefined}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-medium text-[color:var(--ink)]">
                                            {l.name}
                                            {l.company && <span className="text-[color:var(--muted)]"> · {l.company}</span>}
                                        </p>
                                        <StatusPill status={l.status} />
                                    </div>
                                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                                        {[l.need, l.budget, l.timeline].filter(Boolean).map((v) => OPTION_LABEL[v!] ?? v).join(" · ")}
                                    </p>
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[color:var(--ink-2)]">{l.description}</p>
                                    <p className="mt-3 font-mono-meta text-[10.5px] uppercase text-[color:var(--muted)]">
                                        {fmtDate(l.created_at)} · {l.source || "direct"} · {l.locale}
                                        {l.call_at && ` · call ${fmtDate(l.call_at)}`}
                                        {isOverdue(l) && <span style={{ color: "#e5484d" }}> · 48h+ no reply</span>}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Board initial={boardLeads} />
                )}

                <aside className={`grid gap-4 ${isList ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    <div className="card p-5">
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">Money</p>
                        <dl className="space-y-1.5 text-sm">
                            {[
                                ["Quotes out", pipeline],
                                ["Won", won],
                                ["Deposits collected", collected],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3">
                                    <dt className="text-[color:var(--ink-2)]">{k}</dt>
                                    <dd className="text-[color:var(--ink)]">{eur(v as number)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="card p-5">
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">Leads by source · won</p>
                        <ul className="space-y-1.5 text-sm">
                            {sources.map(([k, v]) => (
                                <li key={k} className="flex justify-between gap-3">
                                    <span className="truncate text-[color:var(--ink-2)]">{k}</span>
                                    <span className="text-[color:var(--muted)]">
                                        {v.n} · {v.won}
                                    </span>
                                </li>
                            ))}
                            {sources.length === 0 && <li className="text-[color:var(--muted)]">—</li>}
                        </ul>
                        <p className="mt-4 text-xs leading-relaxed text-[color:var(--muted)]">
                            Add <code>?ref=reel-03</code> to links in bios and captions to see which content brings clients.
                        </p>
                    </div>

                    <div className="card p-5">
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">Logged-in devices</p>
                        <ul className="space-y-3 text-sm">
                            {sessions.map((s) => (
                                <li key={s.id} className="flex items-start justify-between gap-3">
                                    <span>
                                        <span className="block text-[color:var(--ink)]">
                                            {deviceName(s.user_agent)}
                                            {s.id === sessionId && <span className="text-[color:var(--accent)]"> · this one</span>}
                                        </span>
                                        <span className="block text-xs text-[color:var(--muted)]">
                                            {s.ip} · seen {fmtDate(s.last_seen_at)}
                                        </span>
                                    </span>
                                    {s.id !== sessionId && (
                                        <form action={endSession}>
                                            <input type="hidden" name="id" value={s.id} />
                                            <button className="font-mono-meta text-[10.5px] uppercase text-[color:var(--muted)] hover:text-red-500">
                                                End
                                            </button>
                                        </form>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <form action={logoutEverywhere} className="mt-4">
                            <button className="btn btn-secondary w-full text-sm">Log out everywhere</button>
                        </form>
                    </div>
                </aside>
            </div>
        </AdminShell>
    );
}

function deviceName(ua: string | null): string {
    if (!ua) return "Unknown device";
    const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Device";
    const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
    return browser ? `${browser} on ${os}` : os;
}

const LOGIN_ERRORS: Record<string, string> = {
    "1": "Wrong password.",
    locked: "Too many wrong attempts. Try again in 15 minutes.",
    setup: "Login is not set up yet: run supabase/leads-v2.sql.",
    signedout: "Logged out on every device.",
};

function Login({ error, configured }: { error?: string; configured: boolean }) {
    const message = error ? LOGIN_ERRORS[error] : null;
    return (
        <div className="min-h-screen flex items-center justify-center px-5 bg-[color:var(--surface)]">
            <form action={login} className="card w-full max-w-sm p-8">
                <p className="font-display text-xl text-[color:var(--ink)]">Leads dashboard</p>
                {!configured ? (
                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                        Set <code>ADMIN_PASSWORD</code> (12+ characters) in the environment to enable it.
                    </p>
                ) : (
                    <>
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                            className="field mt-6"
                            autoFocus
                        />
                        {message && (
                            <p className={`mt-2 text-sm ${error === "signedout" ? "text-[color:var(--muted)]" : "text-red-500"}`}>{message}</p>
                        )}
                        <button className="btn btn-primary mt-4 w-full">Log in</button>
                    </>
                )}
            </form>
        </div>
    );
}
