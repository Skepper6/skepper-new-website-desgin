import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["rooms", "dial"].flatMap((s) => ["studio", "projects", "checkout", "thanks"].map((p) => `/${s}/${p}/`)) }, sitemap: `${SITE_URL}/sitemap.xml` };
}
