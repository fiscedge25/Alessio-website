// ─── GitHub integration (server-side only) ───────────────────────────────────
// Proof of building, not a developer scoreboard. Curated repos only, cached,
// graceful fallback when the API is rate-limited or unreachable.
//
// NEVER import anything with a token client-side. Public API needs no secret;
// if a token is ever added, it must live in env vars and stay server-side.

import { site } from "./site";

export interface CuratedRepo {
    name: string;
    description: string | null;
    language: string | null;
    updatedAt: string;
    stars: number;
    url: string;
}

// Curated fallback — real projects from this portfolio, shown when the API
// fails so the section never renders empty or broken.
const FALLBACK_REPOS: CuratedRepo[] = [
    {
        name: "fiscedge-mvp",
        description:
            "Structured digital frameworks for business creation and operational planning.",
        language: "TypeScript",
        updatedAt: new Date().toISOString(),
        stars: 0,
        url: "https://fiscedge-mvp-general.vercel.app/",
    },
    {
        name: "giurimi",
        description:
            "Structured legal-education platform for academic preparation.",
        language: "TypeScript",
        updatedAt: new Date().toISOString(),
        stars: 0,
        url: "https://giurimi-project.vercel.app/",
    },
    {
        name: "flowers",
        description: "Small internet experiment. Built out of curiosity.",
        language: "TypeScript",
        updatedAt: new Date().toISOString(),
        stars: 0,
        url: `${site.github.url}/flowers`,
    },
];

interface CacheEntry {
    at: number;
    repos: CuratedRepo[];
}

// Simple in-memory cache: 10 minutes. Avoids an API call on every render.
let cache: CacheEntry | null = null;
const TTL_MS = 10 * 60 * 1000;
const MAX_REPOS = 5;

interface GitHubApiRepo {
    name: string;
    description: string | null;
    language: string | null;
    updated_at: string;
    stargazers_count: number;
    html_url: string;
    fork: boolean;
    archived: boolean;
}

export async function getCuratedRepos(): Promise<{
    repos: CuratedRepo[];
    live: boolean;
}> {
    if (cache && Date.now() - cache.at < TTL_MS) {
        return { repos: cache.repos, live: true };
    }

    try {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github+json",
        };
        // Higher rate limits only; never exposed to the client.
        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }
        const res = await fetch(
            `https://api.github.com/users/${site.github.username}/repos?per_page=100&sort=updated`,
            { headers, next: { revalidate: 600 } }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data = (await res.json()) as GitHubApiRepo[];
        const repos = data
            .filter((r) => !r.fork && !r.archived)
            .slice(0, MAX_REPOS)
            .map((r) => ({
                name: r.name,
                description: r.description,
                language: r.language,
                updatedAt: r.updated_at,
                stars: r.stargazers_count,
                url: r.html_url,
            }));
        if (repos.length === 0) throw new Error("No public repos");
        cache = { at: Date.now(), repos };
        return { repos, live: true };
    } catch (err) {
        console.error("[github] falling back to curated data:", err);
        return { repos: FALLBACK_REPOS, live: false };
    }
}
