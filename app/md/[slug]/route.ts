import { getAllPublishedDocuments, getDocumentBySlug, type Article } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPublishedDocuments().map((article) => ({ slug: article.slug }));
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function uniqueLinks(article: Article) {
  return Array.from(new Set([...article.references, ...article.externalLinks]));
}

function licenceLine(article: Article) {
  return article.collection === "template"
    ? "CC0 1.0. This template may be copied and changed without attribution. https://creativecommons.org/publicdomain/zero/1.0/"
    : "CC BY 4.0. Share and adapt with attribution. https://creativecommons.org/licenses/by/4.0/";
}

function frontmatter(article: Article) {
  const lines = [
    "---",
    `title: ${yamlString(article.title)}`,
    `description: ${yamlString(article.description)}`,
    `date: ${yamlString(article.date)}`,
    ...(article.updated ? [`updated: ${yamlString(article.updated)}`] : []),
    `canonical: ${yamlString(absoluteUrl(article.path))}`,
    ...(article.documentId ? [`documentId: ${yamlString(article.documentId)}`] : []),
    ...(article.series ? [`series: ${yamlString(article.series)}`] : []),
    ...(article.seriesOrder === undefined ? [] : [`seriesOrder: ${article.seriesOrder}`]),
    ...(article.version ? [`version: ${yamlString(article.version)}`] : []),
    ...(article.status ? [`status: ${yamlString(article.status)}`] : []),
    `normative: ${article.normative}`,
    ...(article.dependsOn.length ? ["dependsOn:", ...article.dependsOn.map((id) => `  - ${yamlString(id)}`)] : []),
    ...(article.citation ? [`citation: ${yamlString(article.citation)}`] : []),
    `author: ${yamlString(site.author)}`,
    `licence: ${yamlString(article.collection === "template" ? "CC0-1.0" : "CC-BY-4.0")}`,
    "topics:",
    ...(article.topics.length ? article.topics.map((topic) => `  - ${yamlString(topic)}`) : ["  - none"]),
  ];
  const links = uniqueLinks(article);
  if (links.length) lines.push("sources:", ...links.map((link) => `  - ${yamlString(link)}`));
  lines.push("---");
  return lines.join("\n");
}

function attribution(article: Article) {
  const links = uniqueLinks(article);
  const lines = [
    "## Attribution and licence",
    "",
    `${article.title} is part of the Agentic Sprint methodology by ${site.author}, published at ${absoluteUrl(article.path)}.`,
    "",
    `Licence: ${licenceLine(article)}`,
  ];
  if (links.length) lines.push("", "Sources:", "", ...links.map((link) => `- ${link}`));
  return lines.join("\n");
}

function markdownEdition(article: Article) {
  return `${frontmatter(article)}\n\n# ${article.title}\n\n${article.body.trim()}\n\n${attribution(article)}\n`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getDocumentBySlug(slug);
  if (!article || article.draft) {
    return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  return new Response(markdownEdition(article), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Location": absoluteUrl(`/md/${article.slug}`),
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${absoluteUrl(article.path)}>; rel="canonical", <${absoluteUrl("/llms.txt")}>; rel="describedby"`,
      // The Markdown edition is an alternate representation, not a second
      // document. Keeping it out of the index stops it competing with the
      // canonical HTML page, while leaving it fully fetchable by agents.
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
