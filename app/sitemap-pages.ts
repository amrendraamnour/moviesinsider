import { MetadataRoute } from "next";
import { getAllPages } from "@/lib/wordpress";
import { siteConfig } from "@/site.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  const urls: MetadataRoute.Sitemap = (pages || []).map((page) => ({
    url: `${siteConfig.site_domain}/pages/${page.slug}`,
    lastModified: page.modified ? new Date(page.modified) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return urls;
}
