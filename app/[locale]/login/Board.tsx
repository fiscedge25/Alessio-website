"use client";

// Pipeline board: one column per status, drag a card to move the lead.
// The move is optimistic; if the server refuses, the card snaps back.
import { useState, useTransition } from "react";
import Link from "next/link";
import { LEAD_STATUSES, OPTION_LABEL, STATUS_LABEL, type Lead, type LeadStatus } from "@/lib/leads";
import { moveLead } from "./actions";
import { STATUS_COLOR, fmtDate } from "./ui";

export type BoardLead = Pick<
    Lead,
    "id" | "name" | "company" | "need" | "budget" | "timeline" | "status" | "created_at" | "call_at" | "source"
> & { overdue: boolean; quote: string | null };

export default function Board({ initial }: { initial: BoardLead[] }) {
    const [leads, setLeads] = useState(initial);
    const [dragging, setDragging] = useState<string | null>(null);
    const [over, setOver] = useState<LeadStatus | null>(null);
    const [, startTransition] = useTransition();

    function drop(status: LeadStatus) {
        const id = dragging;
        setDragging(null);
        setOver(null);
        const lead = leads.find((l) => l.id === id);
        if (!id || !lead || lead.status === status) return;
        const before = lead.status;
        setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status, overdue: false } : l)));
        startTransition(async () => {
            const res = await moveLead(id, status).catch(() => ({ ok: false }));
            if (!res.ok) setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: before } : l)));
        });
    }

    return (
        <div className="-mx-5 md:mx-0 overflow-x-auto pb-4">
            <div className="flex gap-3 px-5 md:px-0 min-w-max">
                {LEAD_STATUSES.map((s) => {
                    const col = leads.filter((l) => l.status === s);
                    const closed = s === "lost" || s === "declined";
                    return (
                        <section
                            key={s}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (over !== s) setOver(s);
                            }}
                            onDragLeave={() => setOver((o) => (o === s ? null : o))}
                            onDrop={() => drop(s)}
                            className={`flex flex-col rounded-2xl border p-2 transition-colors ${closed ? "w-[210px]" : "w-[260px]"}`}
                            style={{
                                borderColor: over === s ? STATUS_COLOR[s] : "var(--line)",
                                background: over === s ? `color-mix(in srgb, ${STATUS_COLOR[s]} 8%, var(--surface))` : "var(--surface)",
                            }}
                        >
                            <header className="flex items-center justify-between px-2 py-2">
                                <span className="inline-flex items-center gap-2 font-mono-meta text-[11px] uppercase text-[color:var(--ink)]">
                                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                                    {STATUS_LABEL[s]}
                                </span>
                                <span className="font-mono-meta text-[11px] text-[color:var(--muted)]">{col.length}</span>
                            </header>
                            <ul className="flex min-h-24 flex-col gap-2">
                                {col.map((l) => (
                                    <li
                                        key={l.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = "move";
                                            setDragging(l.id);
                                        }}
                                        onDragEnd={() => {
                                            setDragging(null);
                                            setOver(null);
                                        }}
                                        className={`cursor-grab active:cursor-grabbing ${dragging === l.id ? "opacity-40" : ""}`}
                                    >
                                        <Link
                                            href={`/en/login/leads/${l.id}`}
                                            draggable={false}
                                            className="card card-hover block p-3.5"
                                            style={l.overdue ? { borderColor: "#e5484d" } : undefined}
                                        >
                                            <p className="text-sm font-medium leading-snug text-[color:var(--ink)]">
                                                {l.name}
                                                {l.company && <span className="text-[color:var(--muted)]"> · {l.company}</span>}
                                            </p>
                                            <p className="mt-1 text-xs leading-snug text-[color:var(--muted)]">
                                                {[l.need, l.budget].filter(Boolean).map((v) => OPTION_LABEL[v!] ?? v).join(" · ")}
                                            </p>
                                            <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono-meta text-[10px] uppercase text-[color:var(--muted)]">
                                                <span>{fmtDate(l.created_at)}</span>
                                                {l.overdue && <span style={{ color: "#e5484d" }}>48h+ no reply</span>}
                                                {l.call_at && <span style={{ color: STATUS_COLOR.call }}>call {fmtDate(l.call_at)}</span>}
                                                {l.quote && <span style={{ color: STATUS_COLOR.proposal }}>{l.quote}</span>}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
