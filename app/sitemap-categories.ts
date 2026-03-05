import { MetadataRoute } from "next";
import { getAllCategories } from "@/lib/wordpress";
import { siteConfig } from "@/site.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getAllCategories();

  const urls: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${siteConfig.site_domain}/posts/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return urls;
}
