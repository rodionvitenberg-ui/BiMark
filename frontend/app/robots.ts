import { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bimark.org"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/profile/", "/*/checkout/", "/*/payment/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
