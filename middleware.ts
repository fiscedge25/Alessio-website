import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except for /api, /_next, static files, favicon, and
    // the /g/<id> gift links (kept short — no locale prefix).
    matcher: ["/((?!api|_next|_vercel|g/|.*\\..*).*)"],
};
