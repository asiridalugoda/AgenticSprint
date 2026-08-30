import type { MetadataRoute } from "next";

import { absoluteUrl, site } from "@/lib/site";

/**
 * The methodology wants to be read, quoted and cited by search engines and by
 * AI retrieval agents alike, so every crawler that publishes a token gets its
 * own named group. Several operators only honour a group that names their
 * agent and skip the wildcard entirely, which makes the explicit list the
 * permission rather than a decoration.
 *
 * Nothing is disallowed. `/social/` stays open because it serves the generated
 * og:image renders.
 */
const namedCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "Bytespider",
  "DuckAssistBot",
  "cohere-ai",
  "Diffbot",
  "Timpibot",
  "YouBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...namedCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: [absoluteUrl("/sitemap.xml")],
    host: site.baseUrl,
  };
}
