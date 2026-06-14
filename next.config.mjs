/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — no server runtime. The whole app ships as static assets to
  // Cloudflare Pages. This is a hard requirement: nothing parses server-side.
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  // Trailing slashes keep static hosting (Cloudflare Pages) routing predictable.
  trailingSlash: true,
};

export default nextConfig;
