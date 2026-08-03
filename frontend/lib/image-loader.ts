/**
 * Custom next/image loader for sub-path deploys (basePath=/bimark).
 *
 * Local public/ assets must be requested as /bimark/logo.png, not /logo.png.
 * We serve them as plain static URLs (no /_next/image) — the built-in optimizer
 * under loader:"custom" does not resolve basePath correctly and returns 400.
 *
 * Remote absolute URLs pass through unchanged.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Absolute / protocol-relative remote URLs — leave as-is
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const path = src.startsWith("/") ? src : `/${src}`;

  // Prefer basePath + path. width/quality unused for static public files.
  void width;
  void quality;

  return `${basePath}${path}`;
}
