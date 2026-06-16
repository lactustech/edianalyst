import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// Generated at build into out/robots.txt (works with output: 'export').
export const dynamic = "force-static";

/**
 * AI / LLM *training* crawlers we disallow site-wide. Blocking these keeps our
 * hand-written content out of model training, and costs us nothing: they send
 * no referral traffic and Google-Extended doesn't affect Google Search ranking.
 *
 * We deliberately do NOT block AI *answer engines* (Perplexity, ChatGPT-Search,
 * You.com) — those cite us and drive referral clicks, a discovery channel worth
 * keeping, much like classic SEO.
 *
 * NOTE: robots.txt is honor-system. It stops compliant bots (the ones below,
 * plus Google/Bing respecting Allow); it does NOT stop anonymous/malicious
 * scrapers. For hard enforcement, enable Cloudflare's "Block AI bots" + Bot
 * Fight Mode on the Pages project.
 */
const AI_TRAINING_CRAWLERS = [
  "GPTBot", // OpenAI training
  "ClaudeBot", // Anthropic
  "anthropic-ai",
  "Claude-Web",
  "CCBot", // Common Crawl (feeds many AI datasets)
  "Google-Extended", // Google AI training (Gemini/Vertex) — does NOT affect Google Search
  "Applebot-Extended", // Apple AI training — regular Applebot (Siri/Spotlight) still allowed
  "meta-externalagent", // Meta AI
  "FacebookBot",
  "Bytespider", // ByteDance
  "Amazonbot",
  "Diffbot",
  "Omgilibot",
  "Omgili",
  "ImagesiftBot",
  "cohere-ai",
  "AI2Bot",
  "Timpibot",
  "Webzio-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines, AI answer engines, and everyone else: full access
      // (keeps SEO and AI-search discoverability intact).
      { userAgent: "*", allow: "/" },
      // AI training crawlers: blocked from the whole site.
      { userAgent: AI_TRAINING_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
