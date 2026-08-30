import { getAllPublishedDocuments } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function GET() {
  const documents = getAllPublishedDocuments();
  const latest = documents.reduce((newest, article) => ((article.updated ?? article.date) > newest ? (article.updated ?? article.date) : newest), "2026-08-11");
  const entries = documents.map((article) => `
    <entry>
      <title>${escapeXml(`${article.documentId ? `${article.documentId}: ` : ""}${article.title}`)}</title>
      <id>${absoluteUrl(article.path)}</id>
      <link href="${absoluteUrl(article.path)}" />
      <updated>${new Date(`${article.updated ?? article.date}T00:00:00Z`).toISOString()}</updated>
      <summary>${escapeXml(article.description)}</summary>
    </entry>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeXml(site.name)}</title><id>${site.baseUrl}/</id><link href="${site.baseUrl}/" /><link rel="self" href="${absoluteUrl("/atom.xml")}" /><updated>${new Date(`${latest}T00:00:00Z`).toISOString()}</updated><author><name>${escapeXml(site.author)}</name><uri>${site.authorUrl}</uri></author><subtitle>${escapeXml(site.description)}</subtitle>${entries}</feed>`;
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
