import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, ExternalLink, Mail, MessageCircle, Phone, Video } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { site } from "@/lib/site";
import { getSetting, type LeadEmail } from "@/lib/lead-mail";
import { CHOICE_STEPS, LEAD_STATUSES, OPTION_LABEL, STATUS_LABEL, type Lead } from "@/lib/leads";
import { QUOTE_STATUS_LABEL, eur, isExpired, type Quote } from "@/lib/quotes";
import { acceptLead, cancelCall, scheduleCall, sendQuote, updateLead, voidQuote } from "../../actions";
import { AdminShell, StatusPill, fmtDate } from "../../ui";
import QuoteEditor from "../../QuoteEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lead — BuiltWithSabba", robots: { index: false, follow: false } };

type Params = Promise<{ id: string }>;
type Search = Promise<{ saved?: string; accepted?: string; quote?: string; edit?: string; newquote?: string; call?: string }>;

const CALL_FLASH: Record<string, string> = {
    saved: "Call saved (no email sent).",
    sent: "Invite sent with the calendar event — you got a copy for your calendar too.",
    nomail: "Call saved, but the invite email didn't go out. Check the email log below.",
    invalid: "Pick a date/time and a meeting link starting with https://",
    cancelled: "Call cancelled.",
};

const EMAIL_KIND: Record<string, string> = {
    confirmation: "Request confirmation",
    accept: "Accepted · call invite",
    call_invite: "Call invite",
    call_update: "Call moved",
    call_cancel: "Call cancelled",
    call_reminder: "Call reminder",
    quote: "Quote",
};

const EMAIL_STATUS_COLOR: Record<string, string> = {
    sent: "#86868b",
    delayed: "#d97706",
    delivered: "#0071e3",
    opened: "#1d8127",
    clicked: "#1d8127",
    bounced: "#e5484d",
    complained: "#e5484d",
    failed: "#e5484d",
    suppressed: "#e5484d",
};

const QUOTE_FLASH: Record<string, string> = {
    saved: "Quote saved. Check the client page, then send it.",
    sent: "Quote emailed — the lead moved to Proposal sent.",
    nomail: "The email didn't go out (Resend not configured?). Copy the link and send it yourself.",
    invalid: "A quote needs a title and at least one item.",
};

/** Still upcoming, or started less than an hour ago. */
const notPast = (iso: string) => new Date(iso).getTime() > Date.now() - 3_600_000;

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
    if (!(await isAdmin())) redirect("/en/login");
    const { id } = await params;
    const { saved, accepted, quote: quoteFlash, edit, newquote, call: callFlash } = await searchParams;
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

    const supabase = getSupabaseAdmin();
    if (!supabase) return <AdminShell>Supabase is not configured.</AdminShell>;
    const [{ data: lead }, { data: quoteRows }, { data: emailRows }, meetUrl] = await Promise.all([
        supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>(),
        supabase.from("quotes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
        supabase.from("lead_emails").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
        getSetting("meet_url"),
    ]);
    if (!lead) notFound();
    const quotes = (quoteRows ?? []) as Quote[];
    const emails = (emailRows ?? []) as LeadEmail[];
    const upcoming = !!lead.call_at && notPast(lead.call_at);
    const editing = quotes.find((q) => q.id === edit && ["draft", "sent"].includes(q.status));
    const showEditor = !!editing || !!newquote || quotes.every((q) => q.status === "void");

    const first = lead.name.split(" ")[0];
    const it = lead.locale === "it";
    const replySubject = it ? "La tua richiesta su BuiltWithSabba" : "Your request on BuiltWithSabba";
    const replyBody = it ? `Ciao ${first},\n\n` : `Hi ${first},\n\n`;
    const label = "font-mono-meta text-[11px] uppercase text-[color:var(--muted)]";

    return (
        <AdminShell>
            <Link href="/en/login" className={`${label} inline-flex items-center gap-1.5 hover:text-[color:var(--ink)]`}>
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

                    <section id="call" className="card p-6 scroll-mt-6">
                        <p className="flex items-center gap-2 font-medium text-[color:var(--ink)]">
                            <Video size={17} className="text-[color:var(--accent)]" /> Intro call
                        </p>
                        {callFlash && CALL_FLASH[callFlash] && (
                            <p className="mt-4 rounded-xl bg-[color:var(--accent-dim)] px-4 py-3 text-sm text-[color:var(--ink)]">
                                {CALL_FLASH[callFlash]}
                            </p>
                        )}
                        {upcoming && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border rule p-4">
                                <div>
                                    <p className="flex items-center gap-2 text-[color:var(--ink)]">
                                        <CalendarClock size={16} /> {fmtDate(lead.call_at!)} · {lead.call_minutes ?? 30} min
                                    </p>
                                    {lead.call_link && (
                                        <a href={lead.call_link} target="_blank" rel="noopener noreferrer" className="link-blue mt-1 block break-all text-sm">
                                            {lead.call_link}
                                        </a>
                                    )}
                                </div>
                                <form action={cancelCall} className="flex items-center gap-3">
                                    <input type="hidden" name="id" value={lead.id} />
                                    <label className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                                        <input type="checkbox" name="notify" defaultChecked className="accent-[color:var(--accent)]" /> tell {first}
                                    </label>
                                    <button className="btn btn-secondary text-sm">Cancel call</button>
                                </form>
                            </div>
                        )}
                        <form action={scheduleCall} className="mt-4 space-y-4">
                            <input type="hidden" name="id" value={lead.id} />
                            <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                                <label className="block">
                                    <span className={label}>{upcoming ? "Move to (Rome time)" : "When (Rome time)"}</span>
                                    <input
                                        type="datetime-local"
                                        name="call_at"
                                        required
                                        defaultValue={lead.call_at ? toLocalInput(lead.call_at) : ""}
                                        className="field mt-1.5"
                                    />
                                </label>
                                <label className="block">
                                    <span className={label}>Minutes</span>
                                    <select name="call_minutes" defaultValue={String(lead.call_minutes ?? 30)} className="field mt-1.5">
                                        {[15, 20, 30, 45, 60].map((m) => (
                                            <option key={m}>{m}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className="block">
                                <span className={label}>Meeting link</span>
                                <input
                                    type="url"
                                    name="call_link"
                                    required
                                    defaultValue={lead.call_link ?? meetUrl ?? ""}
                                    placeholder="https://meet.google.com/…"
                                    className="field mt-1.5"
                                />
                            </label>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <label className="flex items-center gap-2 text-sm text-[color:var(--ink-2)]">
                                    <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-[color:var(--accent)]" />
                                    Email {first} the invite + calendar event ({it ? "Italian" : "English"})
                                </label>
                                <button className="btn btn-primary">{upcoming ? "Move call" : "Book call"}</button>
                            </div>
                        </form>
                    </section>

                    <form action={updateLead} className="card p-6 space-y-5">
                        <input type="hidden" name="id" value={lead.id} />
                        <label className="block max-w-xs">
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

                    <section id="quote" className="card p-6 scroll-mt-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-[color:var(--ink)]">Quote</p>
                            {!showEditor && (
                                <Link href={`/en/login/leads/${lead.id}?newquote=1#quote`} className={`${label} hover:text-[color:var(--ink)]`}>
                                    + New quote
                                </Link>
                            )}
                        </div>
                        {quoteFlash && QUOTE_FLASH[quoteFlash] && (
                            <p className="mt-4 rounded-xl bg-[color:var(--accent-dim)] px-4 py-3 text-sm text-[color:var(--ink)]">
                                {QUOTE_FLASH[quoteFlash]}
                            </p>
                        )}

                        {quotes.filter((q) => q.id !== editing?.id).length > 0 && (
                            <ul className="mt-4 space-y-3">
                                {quotes
                                    .filter((q) => q.id !== editing?.id)
                                    .map((q) => {
                                        const url = `${site.url}/${q.locale === "en" ? "en" : "it"}/quote/${q.token}`;
                                        const open = ["draft", "sent"].includes(q.status);
                                        return (
                                            <li key={q.id} className="rounded-xl border rule p-4" style={q.status === "void" ? { opacity: 0.55 } : undefined}>
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium text-[color:var(--ink)]">{q.title}</p>
                                                        <p className="mt-0.5 text-sm text-[color:var(--muted)]">
                                                            {eur(q.total_cents)}
                                                            {q.deposit_cents > 0 && ` · deposit ${eur(q.deposit_cents)}`}
                                                            {q.delivery && ` · ${q.delivery}`}
                                                        </p>
                                                    </div>
                                                    <span className={label}>
                                                        {isExpired(q) ? "Expired" : QUOTE_STATUS_LABEL[q.status]}
                                                    </span>
                                                </div>
                                                <p className={`${label} mt-3 normal-case`}>
                                                    {[
                                                        `created ${fmtDate(q.created_at)}`,
                                                        q.sent_at && `sent ${fmtDate(q.sent_at)}`,
                                                        q.viewed_at && `opened ${fmtDate(q.viewed_at)}`,
                                                        q.accepted_at && `accepted ${fmtDate(q.accepted_at)}`,
                                                        q.paid_at && `paid ${fmtDate(q.paid_at)}`,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                                {q.status !== "void" && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">
                                                            <ExternalLink size={14} /> Client page
                                                        </a>
                                                        {open && (
                                                            <>
                                                                <form action={sendQuote}>
                                                                    <input type="hidden" name="quote_id" value={q.id} />
                                                                    <button className="btn btn-primary text-sm">
                                                                        <Mail size={14} /> {q.status === "draft" ? "Send to " + first : "Send again"}
                                                                    </button>
                                                                </form>
                                                                <Link href={`/en/login/leads/${lead.id}?edit=${q.id}#quote`} className="btn btn-secondary text-sm">
                                                                    Edit
                                                                </Link>
                                                                <form action={voidQuote}>
                                                                    <input type="hidden" name="quote_id" value={q.id} />
                                                                    <input type="hidden" name="lead_id" value={lead.id} />
                                                                    <button className="btn btn-secondary text-sm">Withdraw</button>
                                                                </form>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {q.status !== "void" && (
                                                    <p className="mt-3 break-all text-xs text-[color:var(--muted)] select-all">{url}</p>
                                                )}
                                            </li>
                                        );
                                    })}
                            </ul>
                        )}

                        {showEditor && (
                            <div className="mt-5">
                                <QuoteEditor
                                    key={editing?.id ?? "new"}
                                    leadId={lead.id}
                                    leadLocale={lead.locale}
                                    quote={editing}
                                    onCancelHref={editing || newquote ? `/en/login/leads/${lead.id}#quote` : undefined}
                                />
                            </div>
                        )}
                    </section>
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
                    <div className="card p-5">
                        <p className={label}>Emails to {first}</p>
                        {emails.length === 0 ? (
                            <p className="mt-3 text-sm text-[color:var(--muted)]">None logged yet.</p>
                        ) : (
                            <ul className="mt-3 space-y-3">
                                {emails.map((e) => (
                                    <li key={e.id} className="text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[color:var(--ink)]">{EMAIL_KIND[e.kind] ?? e.kind}</span>
                                            <span
                                                className="rounded-full px-2 py-0.5 font-mono-meta text-[10px] uppercase"
                                                style={{
                                                    color: EMAIL_STATUS_COLOR[e.status] ?? "#86868b",
                                                    background: `color-mix(in srgb, ${EMAIL_STATUS_COLOR[e.status] ?? "#86868b"} 12%, transparent)`,
                                                }}
                                            >
                                                {e.status}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                                            {fmtDate(e.created_at)}
                                            {e.status !== "sent" && e.updated_at !== e.created_at && ` · ${e.status} ${fmtDate(e.updated_at)}`}
                                        </p>
                                        {e.detail && <p className="mt-1 text-xs text-red-500">{e.detail}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="mt-4 text-xs leading-relaxed text-[color:var(--muted)]">
                            “Opened” needs open tracking on in Resend; Apple Mail can show opens that didn’t happen.
                        </p>
                    </div>
                </aside>
            </div>
        </AdminShell>
    );
}
