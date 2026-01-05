import { NextResponse } from "next/server";

export async function GET() {
  const mod = await import("../sitemap-pages");
  const urls = await (mod.default ?? mod).call(null);

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u: any) => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${new Date(u.lastModified).toISOString()}</lastmod>\n  </url>`)
    .join("\n")}\n</urlset>`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
