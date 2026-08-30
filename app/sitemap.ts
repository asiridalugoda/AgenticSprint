import type { MetadataRoute } from "next";

import { getAllPublishedDocuments, type Article } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

/**
 * Left out on purpose: `/md/<slug>` editions (alternate representations of the
 * canonical pages, announced by `rel="alternate"` and their own canonical
 * header), `/llms.txt`, `/llms-full.txt`, the feeds (announced in the document
 * head) and `/manifesto` (a redirect).
 */
const staticRoutes = ["/", "/documents", "/templates", "/about"];

const FALLBACK_MODIFIED = "2026-08-30";

function priorityFor(path: string, article: Article | undefined) {
  if (path === "/") return 1;
  if (article?.documentId === "D1") return 0.9;
  if (article?.collection === "methodology") return article.normative ? 0.8 : 0.7;
  if (path === "/documents" || path === "/templates") return 0.7;
  if (article?.collection === "template") return 0.5;
  return 0.4;
}

function changeFrequencyFor(path: string, article: Article | undefined): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (path === "/documents" || path === "/templates") return "weekly";
  if (article) return "monthly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllPublishedDocuments();
  const paths = [...new Set([...staticRoutes, ...articles.map((article) => article.path)])];

  return paths.map((path) => {
    const article = articles.find((candidate) => candidate.path === path);
    const lastModified = new Date(`${article ? article.updated ?? article.date : FALLBACK_MODIFIED}T00:00:00Z`);
    return {
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: changeFrequencyFor(path, article),
      priority: priorityFor(path, article),
    };
  });
}
