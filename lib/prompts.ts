// ─── Prompt library ──────────────────────────────────────────────────────────
// Every prompt given away through Instagram lives here. One entry = one page
// at /[locale]/prompts/[slug], and one ManyChat keyword pointing at it.
//
// The prompt text itself lives in content/prompts/<slug>.md, read at build
// time. For github-profile the canonical copy is PROMPT.md in the
// profile-forge repo — keep the two in sync when either changes.

import type { Localized } from "./hub";

export interface PromptStep {
    title: Localized;
    body: Localized;
}

export interface PromptEntry {
    slug: string;
    /** The word people comment on Instagram to get this prompt via ManyChat. */
    keyword: string;
    title: Localized;
    tagline: Localized;
    description: Localized;
    /** Tools the prompt expects, shown as chips. */
    worksWith: string[];
    minutes: number;
    repo: string;
    templateUrl: string;
    /** Live example of the result. */
    exampleUrl: string;
    /** Images of the result, served from /public. */
    preview: { heatmap: string; portrait: string; card: string };
    /**
     * Ask for an email before the full prompt can be copied. Off means the
     * prompt is open to everyone and the newsletter form sits below it
     * instead — less friction for people who already commented on Instagram.
     */
    gated: boolean;
    /** How many lines are readable before the gate (ignored when not gated). */
    freeLines: number;
    steps: PromptStep[];
    templateSteps: PromptStep[];
}

export const prompts: PromptEntry[] = [
    {
        slug: "github-profile",
        keyword: "Github",
        title: {
            en: "Upgrade your GitHub profile with one prompt",
            it: "Trasforma il tuo profilo GitHub con un prompt",
        },
        tagline: {
            en: "An ASCII portrait that types itself in, a neofetch card, and a live contribution graph.",
            it: "Un ritratto ASCII che si scrive da solo, una card neofetch e il grafico dei contributi dal vivo.",
        },
        description: {
            en: "Three self-contained animated SVGs, generated in your own repo. No stats service, no token, no JavaScript — and a GitHub Action keeps the heatmap fresh every day.",
            it: "Tre SVG animate e autonome, generate nel tuo repo. Nessun servizio esterno, nessun token, nessun JavaScript — e una GitHub Action aggiorna la heatmap ogni giorno.",
        },
        worksWith: ["Claude Code", "Cursor", "Codex", "Copilot Agent"],
        minutes: 10,
        repo: "https://github.com/buildwithsabba/profile-forge",
        templateUrl: "https://github.com/new?template_name=profile-forge&template_owner=buildwithsabba",
        exampleUrl: "https://github.com/buildwithsabba",
        preview: {
            heatmap: "/prompts/github-profile/contrib-heatmap.svg",
            portrait: "/prompts/github-profile/sabba-ascii.svg",
            card: "/prompts/github-profile/info-card.svg",
        },
        gated: false,
        freeLines: 14,
        steps: [
            {
                title: { en: "Copy the prompt", it: "Copia il prompt" },
                body: {
                    en: "It's right below — one click copies it, or download it as a file.",
                    it: "È qui sotto — un clic per copiarlo, oppure scaricalo come file.",
                },
            },
            {
                title: { en: "Paste it into your agent", it: "Incollalo nel tuo agente" },
                body: {
                    en: "In an empty folder, in Claude Code, Cursor or Codex. It asks for your username, a photo and your details.",
                    it: "In una cartella vuota, dentro Claude Code, Cursor o Codex. Ti chiede username, una foto e i tuoi dati.",
                },
            },
            {
                title: { en: "Push to your username repo", it: "Pubblica nel repo col tuo username" },
                body: {
                    en: "Create a repo named exactly your GitHub username — that's the one GitHub shows on your profile — and push.",
                    it: "Crea un repo chiamato esattamente come il tuo username GitHub — è quello che GitHub mostra sul profilo — e fai push.",
                },
            },
        ],
        templateSteps: [
            {
                title: { en: "Use the template", it: "Usa il template" },
                body: {
                    en: "Name the new repo exactly your GitHub username.",
                    it: "Chiama il nuovo repo esattamente come il tuo username GitHub.",
                },
            },
            {
                title: { en: "Upload a photo", it: "Carica una foto" },
                body: {
                    en: "Into assets/, named photo.jpg. Straight from your phone is fine — HEIC works.",
                    it: "In assets/, chiamata photo.jpg. Va bene anche dal telefono — l'HEIC funziona.",
                },
            },
            {
                title: { en: "Edit profile.yml", it: "Modifica profile.yml" },
                body: {
                    en: "Your details, in plain text. Commit, and the build does the rest in about two minutes.",
                    it: "I tuoi dati, in testo semplice. Fai commit e la build fa il resto in circa due minuti.",
                },
            },
        ],
    },
];

export function getPrompt(slug: string): PromptEntry | undefined {
    return prompts.find((p) => p.slug === slug);
}
