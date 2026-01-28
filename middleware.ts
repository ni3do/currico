import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except:
  // - API routes (/api/*)
  // - Next.js internals (/_next/*)
  // - Static files (files with extensions like .ico, .svg, .png, etc.)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
