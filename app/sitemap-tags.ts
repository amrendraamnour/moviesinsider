import { MetadataRoute } from "next";
import { getAllTags } from "@/lib/wordpress";
import { siteConfig } from "@/site.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tags = await getAllTags();

  const urls: MetadataRoute.Sitemap = (tags || []).map((tag) => ({
    url: `${siteConfig.site_domain}/posts/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return urls;
}
