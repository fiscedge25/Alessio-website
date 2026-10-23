// ─── Client leads — the guided "Start a project" flow ───────────────────────
// Option keys only; labels live in messages/*.json under hub.start.<step>.
// Safe to import from client components (no secrets, no server code).

export const LEAD_STEPS = {
    need: ["mvp", "app", "website", "tool", "ai", "unsure"],
    who: ["founder", "smallbiz", "freelancer", "company"],
    stage: ["idea", "notes", "existing"],
    timeline: ["asap", "month", "quarter", "flexible"],
    budget: ["lt2", "2to5", "5to10", "10plus", "unsure"],
} as const;

export type ChoiceStep = keyof typeof LEAD_STEPS;
export const CHOICE_STEPS = Object.keys(LEAD_STEPS) as ChoiceStep[];

export const CONTACT_PREFS = ["email", "whatsapp", "call"] as const;

export const LEAD_STATUSES = ["new", "accepted", "call", "proposal", "won", "lost", "declined"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
    new: "New",
    accepted: "Accepted",
    call: "Call booked",
    proposal: "Proposal sent",
    won: "Won",
    lost: "Lost",
    declined: "Declined",
};

/** English labels for the dashboard and the notification email. */
export const OPTION_LABEL: Record<string, string> = {
    mvp: "MVP / beta",
    app: "Web or mobile app",
    website: "Website / landing page",
    tool: "Internal tool / management software",
    ai: "AI automation or agent",
    unsure: "Not sure yet",
    founder: "Founder with an idea",
    smallbiz: "Small business",
    freelancer: "Professional / freelancer",
    company: "Company / team",
    idea: "Just an idea",
    notes: "Notes or designs",
    existing: "Something exists",
    asap: "ASAP",
    month: "Within a month",
    quarter: "1–3 months",
    flexible: "Flexible",
    lt2: "< €2k",
    "2to5": "€2–5k",
    "5to10": "€5–10k",
    "10plus": "€10k+",
    email: "Email",
    whatsapp: "WhatsApp",
    call: "Phone call",
};

export interface Lead {
    id: string;
    created_at: string;
    updated_at: string;
    need: string;
    who: string | null;
    stage: string | null;
    timeline: string | null;
    budget: string | null;
    description: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    contact_pref: string | null;
    locale: string | null;
    source: string | null;
    consent_at: string;
    status: LeadStatus;
    call_at: string | null;
    call_minutes: number | null;
    call_link: string | null;
    call_reminded_at: string | null;
    reminded_at: string | null;
    notes: string | null;
}
