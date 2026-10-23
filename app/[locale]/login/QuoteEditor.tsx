"use client";

// Quote builder on the lead page: line items with live totals and deposit.
// Items travel to the saveQuote server action as one JSON hidden field.
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { depositFor, eur, type Quote } from "@/lib/quotes";
import { saveQuote } from "./actions";

interface Row {
    label: string;
    detail: string;
    amount: string;
}

// One-tap starting points; edit the numbers per project.
const PRESETS: Record<"it" | "en", Row[]> = {
    it: [
        { label: "Analisi e design", detail: "Flussi, wireframe e interfaccia", amount: "" },
        { label: "Sviluppo", detail: "Frontend, backend e database", amount: "" },
        { label: "Pubblicazione", detail: "Dominio, hosting, email, analytics", amount: "" },
        { label: "Supporto 30 giorni", detail: "Bug fix e piccole modifiche dopo il lancio", amount: "" },
    ],
    en: [
        { label: "Discovery & design", detail: "Flows, wireframes and UI", amount: "" },
        { label: "Development", detail: "Frontend, backend and database", amount: "" },
        { label: "Launch", detail: "Domain, hosting, email, analytics", amount: "" },
        { label: "30-day support", detail: "Bug fixes and small changes after launch", amount: "" },
    ],
};

const toCents = (v: string) => Math.max(0, Math.round(Number(v.replace(",", ".")) * 100) || 0);
const inTwoWeeks = () => new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

export default function QuoteEditor({
    leadId,
    leadLocale,
    quote,
    onCancelHref,
}: {
    leadId: string;
    leadLocale: string | null;
    quote?: Quote;
    onCancelHref?: string;
}) {
    const [locale, setLocale] = useState<"it" | "en">((quote?.locale ?? leadLocale) === "en" ? "en" : "it");
    const [rows, setRows] = useState<Row[]>(
        quote
            ? quote.items.map((i) => ({ label: i.label, detail: i.detail ?? "", amount: String(i.amount_cents / 100) }))
            : [{ label: "", detail: "", amount: "" }],
    );
    const [pct, setPct] = useState(String(quote?.deposit_pct ?? 30));

    const total = rows.reduce((s, r) => s + toCents(r.amount), 0);
    const deposit = depositFor(total, Number(pct) || 0);
    const items = useMemo(
        () =>
            JSON.stringify(
                rows.filter((r) => r.label.trim()).map((r) => ({ label: r.label, detail: r.detail, amount_cents: toCents(r.amount) })),
            ),
        [rows],
    );
    const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    const label = "font-mono-meta text-[11px] uppercase text-[color:var(--muted)]";
    const unused = PRESETS[locale].filter((p) => !rows.some((r) => r.label === p.label));

    return (
        <form action={saveQuote} className="space-y-5">
            <input type="hidden" name="lead_id" value={leadId} />
            {quote && <input type="hidden" name="quote_id" value={quote.id} />}
            <input type="hidden" name="items" value={items} />

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <label className="block">
                    <span className={label}>Title</span>
                    <input
                        name="title"
                        required
                        maxLength={200}
                        defaultValue={quote?.title}
                        placeholder={locale === "it" ? "MVP app prenotazioni" : "Booking app MVP"}
                        className="field mt-1.5"
                    />
                </label>
                <label className="block">
                    <span className={label}>Language</span>
                    <select name="locale" value={locale} onChange={(e) => setLocale(e.target.value as "it" | "en")} className="field mt-1.5">
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                    </select>
                </label>
            </div>

            <div>
                <span className={label}>Items</span>
                <ul className="mt-1.5 space-y-2">
                    {rows.map((r, i) => (
                        <li key={i} className="grid gap-2 rounded-xl border rule p-3 sm:grid-cols-[1fr_120px_auto]">
                            <div className="space-y-2">
                                <input
                                    value={r.label}
                                    onChange={(e) => set(i, { label: e.target.value })}
                                    placeholder={locale === "it" ? "Voce" : "Item"}
                                    maxLength={200}
                                    className="field"
                                />
                                <input
                                    value={r.detail}
                                    onChange={(e) => set(i, { detail: e.target.value })}
                                    placeholder={locale === "it" ? "Dettaglio (facoltativo)" : "Detail (optional)"}
                                    maxLength={600}
                                    className="field text-sm"
                                />
                            </div>
                            <input
                                value={r.amount}
                                onChange={(e) => set(i, { amount: e.target.value })}
                                inputMode="decimal"
                                placeholder="€"
                                className="field self-start text-right"
                            />
                            <button
                                type="button"
                                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, j) => j !== i) : rs))}
                                className="self-start p-2 text-[color:var(--muted)] hover:text-red-500"
                                aria-label="Remove item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="tag cursor-pointer" onClick={() => setRows((rs) => [...rs, { label: "", detail: "", amount: "" }])}>
                        <Plus size={12} /> Line
                    </button>
                    {unused.map((p) => (
                        <button
                            key={p.label}
                            type="button"
                            className="tag cursor-pointer"
                            onClick={() => setRows((rs) => [...rs.filter((r) => r.label.trim() || r.amount), p])}
                        >
                            <Plus size={12} /> {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                    <span className={label}>Deposit %</span>
                    <input
                        name="deposit_pct"
                        type="number"
                        min={0}
                        max={100}
                        value={pct}
                        onChange={(e) => setPct(e.target.value)}
                        className="field mt-1.5"
                    />
                </label>
                <label className="block">
                    <span className={label}>Delivery</span>
                    <input
                        name="delivery"
                        maxLength={200}
                        defaultValue={quote?.delivery ?? ""}
                        placeholder={locale === "it" ? "3 settimane" : "3 weeks"}
                        className="field mt-1.5"
                    />
                </label>
                <label className="block">
                    <span className={label}>Valid until</span>
                    <input name="valid_until" type="date" defaultValue={quote?.valid_until ?? inTwoWeeks()} className="field mt-1.5" />
                </label>
            </div>

            <label className="block">
                <span className={label}>Notes for the client</span>
                <textarea
                    name="notes"
                    rows={3}
                    maxLength={4000}
                    defaultValue={quote?.notes ?? ""}
                    placeholder={
                        locale === "it"
                            ? "Cosa è incluso, cosa no, come lavoriamo. Il codice resta tuo."
                            : "What's included, what isn't, how we work. You own the code."
                    }
                    className="field mt-1.5 resize-y"
                />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[color:var(--surface)] px-4 py-3">
                <p className="text-sm text-[color:var(--ink-2)]">
                    Total <strong className="text-[color:var(--ink)]">{eur(total, locale)}</strong>
                    {deposit >= 100 && (
                        <>
                            {" "}
                            · deposit <strong className="text-[color:var(--ink)]">{eur(deposit, locale)}</strong> via Stripe
                        </>
                    )}
                </p>
                <div className="flex gap-2">
                    {onCancelHref && (
                        <a href={onCancelHref} className="btn btn-secondary">
                            Cancel
                        </a>
                    )}
                    <button className="btn btn-primary" disabled={total === 0}>
                        {quote ? "Save changes" : "Create quote"}
                    </button>
                </div>
            </div>
        </form>
    );
}
