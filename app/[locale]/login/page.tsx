import type { Metadata } from "next";
import Link from "next/link";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { LEAD_STATUSES, OPTION_LABEL, STATUS_LABEL, type Lead, type LeadStatus } from "@/lib/leads";
import { login } from "./actions";
import { AdminShell, StatusPill, fmtDate } from "./ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads — BuiltWithSabba", robots: { index: false, follow: false } };

type Search = Promise<{ status?: string; error?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
    const { status, error } = await searchParams;
    if (!(await isAdmin())) return <Login error={!!error} configured={adminConfigured()} />;

    const supabase = getSupabaseAdmin();
    if (!supabase) return <AdminShell>Supabase is not configured.</AdminShell>;

    const { data, error: dbError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
    if (dbError) {
        return (
            <AdminShell>
                <p className="text-red-500">Could not load leads: {dbError.message}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Did you run supabase/leads.sql?</p>
            </AdminShell>
        );
    }
    const all = (data ?? []) as Lead[];
    const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, all.filter((l) => l.status === s).length]));
    const active = (LEAD_STATUSES as readonly string[]).includes(status ?? "") ? (status as LeadStatus) : null;
    // Default view hides closed leads.
    const leads = active ? all.filter((l) => l.status === active) : all.filter((l) => !["lost", "declined"].includes(l.status));

    const sources = Object.entries(
        all.reduce<Record<string, number>>((acc, l) => {
            const k = l.source || "direct";
            acc[k] = (acc[k] ?? 0) + 1;
            return acc;
        }, {}),
    ).sort((a, b) => b[1] - a[1]);

    return (
        <AdminShell>
            <div className="flex flex-wrap gap-2">
                <Link href="/en/login" className="tag" style={!active ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : undefined}>
                    Open · {all.length - counts.lost - counts.declined}
                </Link>
                {LEAD_STATUSES.map((s) => (
                    <Link
                        key={s}
                        href={`/en/login?status=${s}`}
                        className="tag"
                        style={active === s ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : undefined}
                    >
                        {STATUS_LABEL[s]} · {counts[s]}
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_240px] items-start">
                <ul className="space-y-3">
                    {leads.length === 0 && <li className="card p-6 text-[color:var(--muted)]">No leads here yet.</li>}
                    {leads.map((l) => (
                        <li key={l.id}>
                            <Link href={`/en/login/leads/${l.id}`} className="card card-hover block p-5">
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
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>

                <aside className="card p-5">
                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">Leads by source</p>
                    <ul className="space-y-1.5 text-sm">
                        {sources.map(([k, n]) => (
                            <li key={k} className="flex justify-between gap-3">
                                <span className="truncate text-[color:var(--ink-2)]">{k}</span>
                                <span className="text-[color:var(--muted)]">{n}</span>
                            </li>
                        ))}
                        {sources.length === 0 && <li className="text-[color:var(--muted)]">—</li>}
                    </ul>
                    <p className="mt-4 text-xs leading-relaxed text-[color:var(--muted)]">
                        Add <code>?ref=reel-03</code> to links in bios and captions to see which content brings clients.
                    </p>
                </aside>
            </div>
        </AdminShell>
    );
}

function Login({ error, configured }: { error: boolean; configured: boolean }) {
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
                        {error && <p className="mt-2 text-sm text-red-500">Wrong password.</p>}
                        <button className="btn btn-primary mt-4 w-full">Log in</button>
                    </>
                )}
            </form>
        </div>
    );
}
