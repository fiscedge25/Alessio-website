import { ArrowUpRight } from "lucide-react";

export default function NoteDiscussLink({ url, label }: { url: string; label: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="u-link inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
        >
            {label}
            <ArrowUpRight size={15} className="arrow-shift" />
        </a>
    );
}
