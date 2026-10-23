import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { site } from "@/lib/site";
import { CHOICE_STEPS, LEAD_STATUSES, OPTION_LABEL, STATUS_LABEL, type Lead } from "@/lib/leads";
import { acceptLead, updateLead } from "../../actions";
import { AdminShell, StatusPill, fmtDate } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lead — BuiltWithSabba", robots: { index: false, follow: false } };

type Params = Promise<{ id: string }>;
type Search = Promise<{ saved?: string; accepted?: string }>;

/** wa.me wants an international number with digits only. */
function whatsappNumber(phone: string, locale: string | null): string {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (!phone.trim().startsWith("+") && locale === "it" && digits.length === 10) digits = `39${digits}`;
    return digits;
}

/** A stored timestamp as a Rome wall-clock value for <input type="datetime-local">. */
const toLocalInput = (iso: string) =>
    new Date(iso).toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16).replace(" ", "T");

export default async function LeadPage({ params, searchParams }: { params: Params; searchParams: Search }) {
    if (!(await isAdmin())) redirect("/en/admin");
    const { id } = await params;
    const { saved, accepted } = await searchParams;
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

    const supabase = getSupabaseAdmin();
    if (!supabase) return <AdminShell>Supabase is not configured.</AdminShell>;
    const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>();
    if (!lead) notFound();

    const first = lead.name.split(" ")[0];
    const it = lead.locale === "it";
    const replySubject = it ? "La tua richiesta su BuiltWithSabba" : "Your request on BuiltWithSabba";
    const replyBody = it ? `Ciao ${first},\n\n` : `Hi ${first},\n\n`;
    const label = "font-mono-meta text-[11px] uppercase text-[color:var(--muted)]";

    return (
        <AdminShell>
            <Link href="/en/admin" className={`${label} inline-flex items-center gap-1.5 hover:text-[color:var(--ink)]`}>
                <ArrowLeft size={14} /> All leads
            </Link>

            {saved && <p className="mt-4 rounded-xl bg-[color:var(--accent-dim)] px-4 py-3 text-sm text-[color:var(--ink)]">Saved.</p>}
            {accepted && (
                <p className="mt-4 rounded-xl bg-[color:var(--accent-dim)] px-4 py-3 text-sm text-[color:var(--ink)]">
                    {accepted === "sent"
                        ? `Accepted — ${lead.email} got the call invite${site.bookingUrl ? " with your booking link" : ""}.`
                        : "Accepted, but no email went out (Resend not configured). Write to them below."}
                </p>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] items-start">
                <div className="space-y-6">
                    <section className="card p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="font-display text-2xl text-[color:var(--ink)]">{lead.name}</h1>
                                <p className="mt-1 text-sm text-[color:var(--muted)]">
                                    {[lead.company, lead.email, lead.phone].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                            <StatusPill status={lead.status} />
                        </div>
                        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                            {CHOICE_STEPS.map((s) => (
                                <div key={s}>
                                    <dt className={label}>{s}</dt>
                                    <dd className="mt-1 text-[color:var(--ink)]">{lead[s] ? OPTION_LABEL[lead[s]!] ?? lead[s] : "—"}</dd>
                                </div>
                            ))}
                            <div>
                                <dt className={label}>Prefers</dt>
                                <dd className="mt-1 text-[color:var(--ink)]">{lead.contact_pref ? OPTION_LABEL[lead.contact_pref] : "—"}</dd>
                            </div>
                        </dl>
                        <p className={`${label} mt-6`}>Their words</p>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[color:var(--ink-2)]">{lead.description}</p>
                        <p className={`${label} mt-6`}>
                            {fmtDate(lead.created_at)} · source {lead.source || "direct"} · {lead.locale}
                        </p>
                    </section>

                    <form action={updateLead} className="card p-6 space-y-5">
                        <input type="hidden" name="id" value={lead.id} />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block">
                                <span className={label}>Status</span>
                                <select name="status" defaultValue={lead.status} className="field mt-1.5">
                                    {LEAD_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {STATUS_LABEL[s]}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className={label}>Call (Rome time)</span>
                                <input
                                    type="datetime-local"
                                    name="call_at"
                                    defaultValue={lead.call_at ? toLocalInput(lead.call_at) : ""}
                                    className="field mt-1.5"
                                />
                            </label>
                        </div>
                        <label className="block">
                            <span className={label}>Private notes</span>
                            <textarea
                                name="notes"
                                rows={6}
                                defaultValue={lead.notes ?? ""}
                                placeholder="Call notes, scope, quote…"
                                className="field mt-1.5 resize-y"
                            />
                        </label>
                        <button className="btn btn-primary">Save</button>
                    </form>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-6">
                    {lead.status === "new" && (
                        <form action={acceptLead} className="card p-5">
                            <input type="hidden" name="id" value={lead.id} />
                            <p className="font-medium text-[color:var(--ink)]">Accept & invite to a call</p>
                            <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
                                Emails {first} in {it ? "Italian" : "English"}{" "}
                                {site.bookingUrl ? "with your booking link" : "asking for a couple of times (no booking link set)"}.
                            </p>
                            <button className="btn btn-primary mt-4 w-full">Accept</button>
                        </form>
                    )}
                    <div className="card p-5 space-y-2">
                        <p className={label}>Reach out</p>
                        <a
                            className="btn btn-secondary w-full"
                            href={`mailto:${lead.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`}
                        >
                            <Mail size={16} /> Email
                        </a>
                        {lead.phone && (
                            <>
                                <a
                                    className="btn btn-secondary w-full"
                                    href={`https://wa.me/${whatsappNumber(lead.phone, lead.locale)}?text=${encodeURIComponent(replyBody.trim())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle size={16} /> WhatsApp
                                </a>
                                <a className="btn btn-secondary w-full" href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>
                                    <Phone size={16} /> Call
                                </a>
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </AdminShell>
    );
}
