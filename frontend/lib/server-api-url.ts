/**
 * Absolute API base for server-side fetch (RSC, sitemap, generateMetadata).
 * Browser must use same-origin NEXT_PUBLIC_API_URL (/bimark/api via nginx).
 * Node cannot resolve relative /bimark/api — use loopback to Gunicorn.
 */
export function getServerApiUrl(): string {
  const fromEnv =
    process.env.API_URL ||
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (fromEnv) {
    // Absolute URL already (http://127.0.0.1:8001/api)
    if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
      return fromEnv.replace(/\/$/, "");
    }
  }

  // Local default (dev Django on :8000). Deploy sets API_URL=http://127.0.0.1:8001/api.
  return "http://127.0.0.1:8000/api";
}

/**
 * Normalize a public API base so callers can append paths like `/ai/chat/`.
 * Accepts either `https://host/api` or `https://host` (legacy).
 */
export function resolvePublicApiBase(raw?: string | null): string {
  const fallback = "http://127.0.0.1:8000";
  return (raw || fallback).replace(/\/$/, "");
}

/** API root that already includes `/api` (for axios baseURL and fetch to `/assets/`). */
export function getBrowserApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    return "http://127.0.0.1:8000/api";
  }
  const base = raw.replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return base;
  }
  return `${base}/api`;
}

/**
 * Origin (or path prefix) for endpoints that still concatenate `/api/...`.
 * If NEXT_PUBLIC_API_URL already ends with /api, return without trailing /api.
 */
export function getPublicOriginForApi(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  if (!raw) {
    return "http://127.0.0.1:8000";
  }
  const base = raw.replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return base.slice(0, -4) || base;
  }
  return base;
}
