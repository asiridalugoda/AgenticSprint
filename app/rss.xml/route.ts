import { getAllPublishedDocuments } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function GET() {
  const items = getAllPublishedDocuments().map((article) => `
    <item>
      <title>${escapeXml(`${article.documentId ? `${article.documentId}: ` : ""}${article.title}`)}</title>
      <description>${escapeXml(article.description)}</description>
      <link>${absoluteUrl(article.path)}</link>
      <guid isPermaLink="true">${absoluteUrl(article.path)}</guid>
      <pubDate>${new Date(`${article.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escapeXml(article.collection === "template" ? "Working template" : article.normative ? "Normative document" : "Informative document")}</category>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0"><channel><title>${escapeXml(site.name)}</title><link>${site.baseUrl}</link><description>${escapeXml(site.description)}</description><language>en-NZ</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
