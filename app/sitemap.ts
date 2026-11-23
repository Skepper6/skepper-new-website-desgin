import type { MetadataRoute } from "next";
import { CATS, SERVICES } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/content";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "services/", "work/", "about/", "contact/", "terms/", "privacy/", ...CATS.map((c) => `room/${c.id}/`), ...SERVICES.map((s) => `service/${s.id}/`)];
  return ["rooms", "dial"].flatMap((site) => paths.map((p) => ({ url: `${SITE_URL}/${site}/${p}` })));
}
