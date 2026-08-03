import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

/**
 * Thin locale proxy for Next 16 + next-intl + basePath.
 *
 * DO NOT use next-intl createMiddleware() with basePath in production —
 * it hangs on locale routes (timeout, 0 bytes). See READ.md §5.2.
 *
 * next-intl still handles messages, Link, useTranslations via i18n/*.
 */
const LOCALES = routing.locales as readonly string[];
const DEFAULT_LOCALE = routing.defaultLocale;

function pathnameWithoutBasePath(pathname: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  if (base && (pathname === base || pathname.startsWith(`${base}/`))) {
    const stripped = pathname.slice(base.length) || "/";
    return stripped.startsWith("/") ? stripped : `/${stripped}`;
  }
  return pathname;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = pathnameWithoutBasePath(pathname);

  // Skip Next internals / static files (matcher also filters, belt-and-suspenders)
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = path.split("/").filter(Boolean);
  const first = segments[0];

  if (first && LOCALES.includes(first)) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", first, {
      path: process.env.NEXT_PUBLIC_BASE_PATH || "/",
      sameSite: "lax",
    });
    return response;
  }

  // No locale prefix → redirect to default locale, preserve rest of path
  const rest = segments.length ? `/${segments.join("/")}` : "";
  const url = request.nextUrl.clone();
  // nextUrl.pathname is without basePath when basePath is configured;
  // set relative path — Next will apply basePath on redirect.
  url.pathname = `/${DEFAULT_LOCALE}${rest}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/(ru|en|es)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
