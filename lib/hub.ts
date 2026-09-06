// ─── BuiltWithSabba — Data architecture ─────────────────────────────────────
// The whole hub grows by editing this file (later: MDX/Markdown collections).
// No layout code needs to change to add a project, note or idea.
//
// Content principle: real data only. No fabricated stats, clients, revenue,
// users or achievements.

import { site } from "./site";

export type Locale = "en" | "it";
export type Localized = Record<Locale, string>;

export type ProjectStatus = "LIVE" | "BUILDING" | "EXPERIMENT" | "ARCHIVED";
export type ProjectType =
    | "company"
    | "product"
    | "experiment"
    | "open-source"
    | "content";

export interface Project {
    title: string;
    slug: string;
    description: Localized;
    longDescription?: Localized;
    thesis?: Localized;
    category: Localized;
    status: ProjectStatus;
    year: string;
    tech: string[];
    website?: string;
    github?: string;
    featured?: boolean;
    /** "flagship" → Now Building + Selected Projects · "project" → Selected · "lab" → The Lab */
    placement: ("flagship" | "project" | "lab")[];
    type: ProjectType;
    problem?: Localized;
    built?: Localized;
    learnings?: Localized;
}

const L = (en: string, it: string): Localized => ({ en, it });

export const projects: Project[] = [
    {
        title: "Fiscedge",
        slug: "fiscedge",
        description: L(
            "An AI-powered company builder helping founders move from an idea to structured validation, strategy, financial thinking and execution.",
            "Un company builder basato sull'AI che aiuta i founder a passare dall'idea a validazione strutturata, strategia, pensiero finanziario ed esecuzione."
        ),
        thesis: L(
            "Most founders don't lack ideas — they lack a structured way to turn an idea into a company. Fiscedge is my attempt at that structure.",
            "Ai founder non mancano le idee — manca un modo strutturato per trasformare un'idea in un'azienda. Fiscedge è il mio tentativo di costruire quella struttura."
        ),
        category: L("Company builder · AI", "Company builder · AI"),
        status: "BUILDING",
        year: "2025",
        tech: ["TypeScript", "Next.js", "Supabase", "LLM APIs", "AI Agents"],
        website: site.fiscedge.url,
        featured: true,
        placement: ["flagship", "project"],
        type: "company",
        problem: L(
            "Early-stage founders work from scattered docs, gut feeling and generic advice. Assumptions never become structured, testable company memory.",
            "I founder early-stage lavorano su documenti sparsi, istinto e consigli generici. Le ipotesi non diventano mai memoria aziendale strutturata e verificabile."
        ),
        built: L(
            "A guided environment that turns startup assumptions into structured company memory — validation, strategy and financial reasoning in one place.",
            "Un ambiente guidato che trasforma le ipotesi di una startup in memoria aziendale strutturata — validazione, strategia e ragionamento finanziario in un unico posto."
        ),
        learnings: L(
            "Building for founders taught me that structure beats features: a simple shared canvas founders actually update is worth more than ten clever AI outputs nobody revisits.",
            "Costruire per i founder mi ha insegnato che la struttura batte le feature: un semplice canvas condiviso che i founder aggiornano davvero vale più di dieci output AI brillanti che nessuno rivisita."
        ),
    },
    {
        title: "Fiscedge Academy",
        slug: "fiscedge-academy",
        description: L(
            "A practitioner-led learning platform built around focused masterclasses, applied projects and direct access to experts working in AI, product and leadership.",
            "Una piattaforma di apprendimento guidata da professionisti, costruita su masterclass focalizzate, progetti applicati e accesso diretto a esperti di AI, prodotto e leadership."
        ),
        thesis: L(
            "Most online courses teach theory. I wanted a place where people learn by building, next to people who actually do the work.",
            "La maggior parte dei corsi online insegna teoria. Volevo un posto dove si impara costruendo, accanto a chi quel lavoro lo fa davvero."
        ),
        category: L("Education · Platform", "Formazione · Piattaforma"),
        status: "BUILDING",
        year: "2025",
        tech: ["React", "Supabase", "Vercel"],
        website: site.fiscedge.academyUrl,
        featured: true,
        placement: ["flagship", "project"],
        type: "product",
        problem: L(
            "Learning AI and product skills from recorded videos rarely survives contact with real work. People finish courses and still can't ship.",
            "Imparare AI e competenze di prodotto da video registrati raramente sopravvive al contatto con il lavoro reale. Le persone finiscono i corsi e comunque non riescono a pubblicare nulla."
        ),
        built: L(
            "Focused masterclasses with applied projects and direct access to working experts — small cohorts, real work, feedback from practitioners.",
            "Masterclass focalizzate con progetti applicati e accesso diretto a esperti operativi — piccole coorti, lavoro reale, feedback da professionisti."
        ),
        learnings: L(
            "I'm learning that education is a product problem: completion rates, feedback loops and applied projects matter more than the curriculum itself.",
            "Sto imparando che la formazione è un problema di prodotto: tassi di completamento, cicli di feedback e progetti applicati contano più del programma stesso."
        ),
    },
    {
        title: "Giurimi",
        slug: "giurimi",
        description: L(
            "A structured digital platform exploring better ways to support legal learning and academic preparation.",
            "Una piattaforma digitale strutturata che esplora modi migliori per supportare lo studio giuridico e la preparazione accademica."
        ),
        category: L("LegalTech · Education", "LegalTech · Formazione"),
        status: "LIVE",
        year: "2026",
        tech: ["React", "TypeScript", "AI"],
        website: "https://giurimi-project.vercel.app/",
        placement: ["project"],
        type: "product",
        learnings: L(
            "Domain-heavy subjects need structure more than content volume. Organizing legal topics into clear paths changed how students used the platform.",
            "Le materie dense di contenuti hanno bisogno di struttura più che di volume. Organizzare gli argomenti giuridici in percorsi chiari ha cambiato il modo in cui gli studenti usavano la piattaforma."
        ),
    },
    {
        title: "The Italians",
        slug: "the-italians",
        description: L(
            "A digital storytelling project collecting Italian entrepreneurial stories and innovation culture.",
            "Un progetto di storytelling digitale che raccoglie storie imprenditoriali italiane e cultura dell'innovazione."
        ),
        category: L("Content · Community", "Contenuti · Comunità"),
        status: "LIVE",
        year: "2024",
        tech: ["Web", "Content", "Branding"],
        website: "https://the-italians.it/",
        placement: ["project"],
        type: "content",
        learnings: L(
            "Stories compound. A small editorial project taught me more about distribution and audience than any marketing course.",
            "Le storie si accumulano. Un piccolo progetto editoriale mi ha insegnato più sulla distribuzione e sull'audience di qualsiasi corso di marketing."
        ),
    },
    {
        title: "Flowers",
        slug: "flowers",
        description: L(
            "Small internet experiment. Built out of curiosity, not a business plan.",
            "Piccolo esperimento internet. Costruito per curiosità, non da un business plan."
        ),
        category: L("Internet experiment", "Esperimento internet"),
        status: "EXPERIMENT",
        year: "2026",
        tech: ["TypeScript", "Next.js"],
        github: `${site.github.url}/flowers`,
        placement: ["lab"],
        type: "experiment",
        learnings: L(
            "Not everything needs to become a startup. Sometimes building something small is the fastest way to learn a new tool or test an idea.",
            "Non tutto deve diventare una startup. A volte costruire qualcosa di piccolo è il modo più veloce per imparare un nuovo strumento o testare un'idea."
        ),
    },
];

// ─── Build log ───────────────────────────────────────────────────────────────
// Short notes: release notes + founder notes. Not a blog.
// To add an entry, append an object — no layout changes needed.

export interface BuildNote {
    slug: string;
    date: string; // ISO yyyy-mm-dd
    title: Localized;
    description: Localized;
    project?: string; // project slug
    tags?: string[];
    externalUrl?: string; // e.g. LinkedIn post to discuss
    featured?: boolean;
}

export const buildNotes: BuildNote[] = [
    {
        slug: "reworking-academy-experience",
        date: "2026-09-05",
        title: L(
            "Reworking the Fiscedge Academy learning experience",
            "Riprogetto l'esperienza di apprendimento di Fiscedge Academy"
        ),
        description: L(
            "Rethinking how a masterclass flows from first click to finished project. Less video, more building.",
            "Ripenso il flusso di una masterclass dal primo click al progetto finito. Meno video, più costruzione."
        ),
        project: "fiscedge-academy",
        tags: ["academy", "product"],
        featured: true,
    },
    {
        slug: "startup-assumptions-company-memory",
        date: "2026-09-02",
        title: L(
            "Testing a different way to turn startup assumptions into structured company memory",
            "Testo un modo diverso per trasformare le ipotesi di una startup in memoria aziendale strutturata"
        ),
        description: L(
            "Prototyping a canvas where every assumption a founder makes becomes something testable and revisitable.",
            "Prototipo un canvas dove ogni ipotesi di un founder diventa qualcosa di verificabile e rivisitabile."
        ),
        project: "fiscedge",
        tags: ["fiscedge", "prototype"],
        featured: true,
    },
    {
        slug: "shipped-another-experiment",
        date: "2026-08-28",
        title: L("Shipped another small experiment", "Pubblicato un altro piccolo esperimento"),
        description: L(
            "Small, fast, slightly unfinished — on purpose. The point was to learn one new thing.",
            "Piccolo, veloce, leggermente incompiuto — di proposito. L'obiettivo era imparare una cosa nuova."
        ),
        project: "flowers",
        tags: ["experiment"],
    },
];

// ─── "What should I build next?" ─────────────────────────────────────────────
// Base percentages seed the UI before any votes exist. Real votes accumulate
// on top via /api/ideas (Supabase when configured, graceful fallback otherwise).

export interface Idea {
    id: string;
    title: Localized;
    blurb: Localized;
    baseVotes: number;
}

export const ideas: Idea[] = [
    {
        id: "ai-founder-research",
        title: L("AI Founder Research Tool", "Strumento di ricerca AI per founder"),
        blurb: L(
            "Turn scattered market research into a structured briefing before you build.",
            "Trasforma ricerche di mercato sparse in un briefing strutturato prima di costruire."
        ),
        baseVotes: 42,
    },
    {
        id: "creator-automation",
        title: L("Creator Automation Experiment", "Esperimento di automazione per creator"),
        blurb: L(
            "Small automations that remove the repetitive work behind publishing.",
            "Piccole automazioni che eliminano il lavoro ripetitivo dietro la pubblicazione."
        ),
        baseVotes: 31,
    },
    {
        id: "legal-ai-study",
        title: L("Legal AI Study Tool", "Strumento AI per lo studio giuridico"),
        blurb: L(
            "Study companion for dense legal subjects, built on structured paths.",
            "Compagno di studio per materie giuridiche dense, costruito su percorsi strutturati."
        ),
        baseVotes: 27,
    },
];

// ─── Currently interested in / Stack ─────────────────────────────────────────

export const interests: Localized[] = [
    L("AI-native products", "Prodotti AI-native"),
    L("Agentic workflows", "Workflow agentici"),
    L("Company building", "Company building"),
    L("Product systems", "Sistemi di prodotto"),
    L("Developer tools", "Strumenti per sviluppatori"),
    L("Education technology", "Tecnologie per la formazione"),
    L("Founder infrastructure", "Infrastrutture per founder"),
    L("Digital communities", "Comunità digitali"),
    L("AI regulation & responsible deployment", "Regolamentazione AI e deployment responsabile"),
];

export const stack: string[] = [
    "TypeScript",
    "Next.js",
    "React",
    "Python",
    "Supabase",
    "PostgreSQL",
    "Vercel",
    "GitHub",
    "Docker",
    "LLM APIs",
    "AI Agents",
];

// ─── Selectors ───────────────────────────────────────────────────────────────

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const flagshipProjects = projects.filter((p) =>
    p.placement.includes("flagship")
);
export const selectedProjects = projects.filter(
    (p) => p.placement.includes("project") || p.placement.includes("flagship")
);
export const labProjects = projects.filter((p) => p.placement.includes("lab"));

export const sortedNotes = [...buildNotes].sort((a, b) =>
    a.date < b.date ? 1 : -1
);

export function formatNoteDate(iso: string, locale: Locale): string {
    const d = new Date(iso + "T00:00:00");
    return d
        .toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
            month: "short",
            day: "2-digit",
        })
        .toUpperCase()
        .replace(".", "");
}
