import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { projects, sortedNotes } from "@/lib/hub";

export default function sitemap(): MetadataRoute.Sitemap {
    const locales = ["en", "it"];
    const staticPaths = ["", "/notes", "/build-with-me"];
    const entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        for (const p of staticPaths) {
            entries.push({
                url: `${site.url}/${locale}${p}`,
                lastModified: new Date(),
                changeFrequency: p === "" ? "weekly" : "monthly",
                priority: p === "" ? 1 : 0.7,
            });
        }
        for (const proj of projects) {
            entries.push({
                url: `${site.url}/${locale}/projects/${proj.slug}`,
                lastModified: new Date(),
                changeFrequency: "monthly",
                priority: 0.8,
            });
        }
        for (const note of sortedNotes) {
            entries.push({
                url: `${site.url}/${locale}/notes/${note.slug}`,
                lastModified: new Date(note.date + "T00:00:00"),
                changeFrequency: "yearly",
                priority: 0.6,
            });
        }
    }
    return entries;
}
