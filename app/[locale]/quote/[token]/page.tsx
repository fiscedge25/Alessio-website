import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Check, Mail } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/site";
import { fulfillQuoteSession } from "@/lib/quote-store";
import { QUOTE_TOKEN_RE, eur, isExpired, type Quote } from "@/lib/quotes";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import { acceptQuote } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quote — BuiltWithSabba", robots: { index: false, follow: false } };

type Params = Promise<{ locale: string; token: string }>;
type Search = Promise<{ session_id?: string; done?: string; error?: string }>;

const COPY = {
    it: {
        eyebrow: "Preventivo",
        for: "Per",
        item: "Voce",
        total: "Totale",
        delivery: "Tempi",
        validUntil: "Valido fino al",
        deposit: "Acconto per partire",
        depositNote: (pct: number) => `${pct}% del totale, scalato dal saldo finale`,
        notes: "Note",
        how: "Come funziona",
        steps: [
            "Accetti il preventivo e versi l'acconto con carta tramite Stripe.",
            "Entro 24 ore ti scrivo per il kickoff e fissiamo le priorità.",
            "Ti mostro i progressi ogni settimana; il saldo alla consegna.",
        ],
        stepsNoDeposit: [
            "Accetti il preventivo con un clic.",
            "Entro 24 ore ti scrivo per il kickoff e fissiamo le priorità.",
            "Ti mostro i progressi ogni settimana fino alla consegna.",
        ],
        consent: "Ho letto il preventivo e lo accetto.",
        pay: (amount: string) => `Accetta e paga l'acconto · ${amount}`,
        accept: "Accetta il preventivo",
        secure: "Pagamento sicuro con Stripe. Riceverai la ricevuta via email.",
        paidTitle: "Acconto ricevuto, grazie!",
        paidBody: "Si parte. Entro 24 ore ti scrivo per il kickoff.",
        acceptedTitle: "Preventivo accettato, grazie!",
        acceptedBody: "Entro 24 ore ti scrivo per il kickoff.",
        expired: "Questo preventivo è scaduto. Scrivimi e lo aggiorno volentieri.",
        draft: "Bozza: solo tu la vedi finché non la invii.",
        errConsent: "Spunta la casella per accettare il preventivo.",
        errPay: "Il pagamento non è partito. Riprova, o scrivimi e risolviamo.",
        questions: "Domande? Scrivimi",
        date: "it-IT",
    },
    en: {
        eyebrow: "Quote",
        for: "For",
        item: "Item",
        total: "Total",
        delivery: "Timeline",
        validUntil: "Valid until",
        deposit: "Deposit to start",
        depositNote: (pct: number) => `${pct}% of the total, deducted from the final balance`,
        notes: "Notes",
        how: "How it works",
        steps: [
            "Accept the quote and pay the deposit by card through Stripe.",
            "Within 24 hours I'll reach out for the kickoff and we set priorities.",
            "You see progress every week; the balance is due on delivery.",
        ],
        stepsNoDeposit: [
            "Accept the quote with one click.",
            "Within 24 hours I'll reach out for the kickoff and we set priorities.",
            "You see progress every week until delivery.",
        ],
        consent: "I've read the quote and I accept it.",
        pay: (amount: string) => `Accept and pay the deposit · ${amount}`,
        accept: "Accept the quote",
        secure: "Secure payment with Stripe. You'll get the receipt by email.",
        paidTitle: "Deposit received — thank you!",
        paidBody: "We're on. I'll reach out within 24 hours for the kickoff.",
        acceptedTitle: "Quote accepted — thank you!",
        acceptedBody: "I'll reach out within 24 hours for the kickoff.",
        expired: "This quote has expired. Write to me and I'll happily refresh it.",
        draft: "Draft: only you can see it until you send it.",
        errConsent: "Tick the box to accept the quote.",
        errPay: "The payment didn't start. Try again, or write to me and we'll sort it out.",
        questions: "Questions? Write to me",
        date: "en-GB",
    },
};

export default async function QuotePage({ params, searchParams }: { params: Params; searchParams: Search }) {
    const { locale: raw, token } = await params;
    const { session_id, error } = await searchParams;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(locale);
    if (!QUOTE_TOKEN_RE.test(token)) notFound();

    const supabase = getSupabaseAdmin();
    if (!supabase) notFound();
    let { data: quote } = await supabase.from("quotes").select("*").eq("token", token).maybeSingle<Quote>();
    if (!quote || quote.status === "void") notFound();
    const owner = await isAdmin();
    if (quote.status === "draft" && !owner) notFound();

    // Back from Stripe: confirm the payment ourselves instead of waiting for the webhook.
    if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id) && quote.status !== "paid") {
        try {
            const session = await getStripe()?.checkout.sessions.retrieve(session_id);
            if (session?.metadata?.quote_id === quote.id) quote = (await fulfillQuoteSession(session)) ?? quote;
        } catch (err) {
            console.error("[quote] session lookup failed:", (err as Error).message);
        }
    }
    if (!owner && quote.status === "sent" && !quote.viewed_at) {
        await supabase.from("quotes").update({ viewed_at: new Date().toISOString() }).eq("id", quote.id);
    }

    const { data: lead } = await supabase.from("leads").select("name, company").eq("id", quote.lead_id).single();
    const t = COPY[locale];
    const fmt = (d: string) => new Date(d).toLocaleDateString(t.date, { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
    const expired = isExpired(quote);
    const done = quote.status === "paid" || quote.status === "accepted";
    const label = "font-mono-meta text-[11px] uppercase text-[color:var(--muted)]";
    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`${t.eyebrow}: ${quote.title}`)}`;

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 pb-24">
                <div className="max-w-3xl mx-auto">
                    {quote.status === "draft" && (
                        <p className="mb-6 rounded-xl bg-[color:var(--accent-dim)] px-4 py-3 text-sm text-[color:var(--ink)]">{t.draft}</p>
                    )}

                    <p className={label}>
                        {t.eyebrow} · {fmt(quote.sent_at ?? quote.created_at)}
                    </p>
                    <h1 className="mt-3 font-display text-[color:var(--ink)]" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.05 }}>
                        {quote.title}
                    </h1>
                    {lead && (
                        <p className="mt-3 text-[color:var(--muted)]">
                            {t.for} {lead.name}
                            {lead.company && ` · ${lead.company}`} — Alessio Sabatino, {site.name}
                        </p>
                    )}

                    {done && (
                        <div className="card mt-8 flex items-start gap-4 p-6" style={{ borderColor: "var(--accent)" }}>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white">
                                <Check size={20} />
                            </span>
                            <div>
                                <p className="font-display text-xl text-[color:var(--ink)]">{quote.status === "paid" ? t.paidTitle : t.acceptedTitle}</p>
                                <p className="mt-1 text-[color:var(--muted)]">{quote.status === "paid" ? t.paidBody : t.acceptedBody}</p>
                            </div>
                        </div>
                    )}

                    <section className="card mt-8 overflow-hidden">
                        <ul>
                            {quote.items.map((item, i) => (
                                <li key={i} className="flex items-start justify-between gap-6 border-b rule px-6 py-4">
                                    <div>
                                        <p className="font-medium text-[color:var(--ink)]">{item.label}</p>
                                        {item.detail && <p className="mt-0.5 text-sm leading-relaxed text-[color:var(--muted)]">{item.detail}</p>}
                                    </div>
                                    <p className="shrink-0 tabular-nums text-[color:var(--ink)]">{eur(item.amount_cents, locale)}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between gap-6 bg-[color:var(--surface)] px-6 py-5">
                            <p className="font-medium text-[color:var(--ink)]">{t.total}</p>
                            <p className="font-display text-2xl tabular-nums text-[color:var(--ink)]">{eur(quote.total_cents, locale)}</p>
                        </div>
                    </section>

                    <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                        {quote.delivery && (
                            <div className="card p-5">
                                <dt className={label}>{t.delivery}</dt>
                                <dd className="mt-1.5 text-[color:var(--ink)]">{quote.delivery}</dd>
                            </div>
                        )}
                        {quote.deposit_cents > 0 && (
                            <div className="card p-5">
                                <dt className={label}>{t.deposit}</dt>
                                <dd className="mt-1.5 text-[color:var(--ink)]">{eur(quote.deposit_cents, locale)}</dd>
                                <dd className="mt-1 text-xs text-[color:var(--muted)]">{t.depositNote(quote.deposit_pct)}</dd>
                            </div>
                        )}
                        {quote.valid_until && !done && (
                            <div className="card p-5">
                                <dt className={label}>{t.validUntil}</dt>
                                <dd className="mt-1.5 text-[color:var(--ink)]">{fmt(quote.valid_until)}</dd>
                            </div>
                        )}
                    </dl>

                    {quote.notes && (
                        <section className="mt-8">
                            <p className={label}>{t.notes}</p>
                            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[color:var(--ink-2)]">{quote.notes}</p>
                        </section>
                    )}

                    {!done && (
                        <section id="accept" className="mt-10 scroll-mt-28">
                            <p className={label}>{t.how}</p>
                            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                                {(quote.deposit_cents > 0 ? t.steps : t.stepsNoDeposit).map((s, i) => (
                                    <li key={i} className="rounded-xl border rule p-4">
                                        <p className="font-mono-meta text-[11px] text-[color:var(--muted)]">0{i + 1}</p>
                                        <p className="mt-1 text-sm leading-relaxed text-[color:var(--ink-2)]">{s}</p>
                                    </li>
                                ))}
                            </ol>

                            {expired ? (
                                <p className="card mt-6 p-5 text-[color:var(--ink-2)]">{t.expired}</p>
                            ) : (
                                quote.status === "sent" && (
                                    <form action={acceptQuote} className="card mt-6 p-6">
                                        <input type="hidden" name="token" value={quote.token} />
                                        <label className="flex items-start gap-3 text-sm leading-relaxed text-[color:var(--ink-2)] cursor-pointer">
                                            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--accent)]" />
                                            <span>{t.consent}</span>
                                        </label>
                                        {error && (
                                            <p role="alert" className="mt-3 text-sm text-red-500">
                                                {error === "consent" ? t.errConsent : t.errPay}
                                            </p>
                                        )}
                                        <button className="btn btn-primary mt-5 w-full sm:w-auto">
                                            {quote.deposit_cents > 0 ? t.pay(eur(quote.deposit_cents, locale)) : t.accept}
                                        </button>
                                        {quote.deposit_cents > 0 && <p className="mt-3 text-xs text-[color:var(--muted)]">{t.secure}</p>}
                                    </form>
                                )
                            )}
                        </section>
                    )}

                    <a href={mailto} className={`${label} mt-10 inline-flex items-center gap-2 hover:text-[color:var(--ink)]`}>
                        <Mail size={14} /> {t.questions}
                    </a>
                </div>
            </main>
            <Footer />
        </>
    );
}
