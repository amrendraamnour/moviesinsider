import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/wordpress";
import { siteConfig } from "@/site.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const urls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${siteConfig.site_domain}/posts/${post.slug}`,
    lastModified: post.modified ? new Date(post.modified) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return urls;
}
