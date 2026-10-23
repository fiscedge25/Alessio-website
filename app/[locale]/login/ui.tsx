import Link from "next/link";
import { STATUS_LABEL, type LeadStatus } from "@/lib/leads";
import { logout } from "./actions";

const STATUS_COLOR: Record<LeadStatus, string> = {
    new: "#0071e3",
    accepted: "#8e44ad",
    call: "#d97706",
    proposal: "#0e9f6e",
    won: "#1d8127",
    lost: "#86868b",
    declined: "#86868b",
};

export function StatusPill({ status }: { status: LeadStatus }) {
    const c = STATUS_COLOR[status];
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-meta text-[10.5px] uppercase"
            style={{ color: c, background: `color-mix(in srgb, ${c} 12%, transparent)` }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
            {STATUS_LABEL[status]}
        </span>
    );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[color:var(--surface)]">
            <header className="border-b rule bg-[color:var(--paper)]">
                <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
                    <Link href="/en/login" className="font-display text-[15px] tracking-[0.18em] uppercase text-[color:var(--ink)]">
                        Sabba · Leads
                    </Link>
                    <form action={logout}>
                        <button className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)]">
                            Log out
                        </button>
                    </form>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">{children}</main>
        </div>
    );
}

export const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("it-IT", {
        timeZone: "Europe/Rome",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
