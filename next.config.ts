import type { NextConfig } from "next";

const wordpressHostname = process.env.WORDPRESS_HOSTNAME;
const wordpressUrl = process.env.WORDPRESS_URL;

// Allowed dev origins to permit cross-origin requests to `/_next/*` during development.
// Can be set via `ALLOWED_DEV_ORIGINS` (comma-separated). Defaults include common localhost origins.
const allowedDevOriginsEnv = process.env.ALLOWED_DEV_ORIGINS;
const allowedDevOrigins = allowedDevOriginsEnv
  ? allowedDevOriginsEnv.split(",").map((s) => s.trim())
  : [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://127.0.0.1:3000",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://localhost:3000",
      "http://127.0.0.1",
      "http://localhost",
      "127.0.0.1",
      "localhost",
      "http://10.0.3.35:3000",
      "http://10.0.3.35",
      "https://movieinsider.vercel.app/"
    ];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  images: {
    // Allow images from the configured WordPress hostname (both http and https)
    domains: wordpressHostname ? [wordpressHostname] : [],
    remotePatterns: wordpressHostname
      ? [
          {
            protocol: "https",
            hostname: wordpressHostname,
            port: "",
            pathname: "/**",
          },
          {
            protocol: "http",
            hostname: wordpressHostname,
            port: "",
            pathname: "/**",
          },
        ]
      : [],
  },
  async redirects() {
    if (!wordpressUrl) {
      return [];
    }
    return [
      {
        source: "/admin",
        destination: `${wordpressUrl}/wp-admin`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
