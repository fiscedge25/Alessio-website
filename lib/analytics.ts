// ─── Lightweight analytics events ───────────────────────────────────────────
// Privacy-respecting: no cookies, no fingerprinting, no third-party tracker.
// Events are dispatched as CustomEvents on window ("bws:analytics") so any
// future provider can subscribe in one place. Safe to call anywhere.

export type AnalyticsEvent =
    | "project_view"
    | "project_external_click"
    | "github_click"
    | "linkedin_click"
    | "fiscedge_click"
    | "academy_click"
    | "newsletter_signup"
    | "idea_submission"
    | "idea_vote"
    | "contact_submit";

export function track(event: AnalyticsEvent, detail?: Record<string, string>) {
    if (typeof window === "undefined") return;
    try {
        window.dispatchEvent(
            new CustomEvent("bws:analytics", { detail: { event, ...detail } })
        );
        if (process.env.NODE_ENV === "development") {
            console.debug("[analytics]", event, detail);
        }
    } catch {
        // Analytics must never break the UI.
    }
}
