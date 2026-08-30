import { getManifesto, getMethodologySeries, getSpecification, getTemplateSeries, type Article } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function label(value: string) {
  return value.replace(/[\[\]]/g, "\\$&");
}

function markdownEdition(article: Article) {
  return absoluteUrl(`/md/${article.slug}`);
}

/**
 * Series entries carry the identifier, status and whether the document states
 * requirements, so a retrieval agent can tell a normative standard from an
 * informative guide without opening it.
 */
function seriesLink(article: Article) {
  const facets = [article.documentId, article.status, article.normative ? "normative" : "informative"].filter(Boolean);
  return `- [${label(article.title)}](${markdownEdition(article)}): ${article.description} (${facets.join(", ")})`;
}

export function GET() {
  const manifesto = getManifesto();
  const specification = getSpecification();
  const documents = getMethodologySeries();
  const templates = getTemplateSeries();
  const text = [
    `# ${site.domain}`,
    "",
    `> ${site.description}`,
    "",
    `The Agentic Sprint is a proposed operating model for software delivery in which autonomous agents execute bounded engineering work and people keep authority over intent, architecture, acceptance and release. It was written by ${site.author} (${site.authorUrl}) and is published here independently, at version ${site.version}.`,
    "",
    "The `/md/` links are clean Markdown editions of each document, intended for reading, citation and machine-assisted research. Each carries the document identifier, version, status, dependencies, canonical URL and licence in its frontmatter.",
    "",
    "Document identifiers (D1 to D13, T1 to T9) are stable. Cite a requirement by its document and identifier, not by a page position. D1 is the normative root; the manifesto (D11) introduces no requirements and cannot override D1.",
    "",
    `Licences: documents CC BY 4.0; templates CC0 1.0. Citation for the series: ${site.seriesCitation}`,
    "",
    "## Start here",
    "",
    `- [${label(manifesto.title)}](${markdownEdition(manifesto)}): ${manifesto.description} This is the front page of the site.`,
    `- [${label(specification.title)}](${markdownEdition(specification)}): ${specification.description} The normative core.`,
    "",
    "## Methodology documents",
    "",
    ...documents.map(seriesLink),
    "",
    "## Working templates",
    "",
    ...templates.map(seriesLink),
    "",
    "## Machine-readable resources",
    "",
    `- [Full document index](${absoluteUrl("/llms-full.txt")}): Metadata-backed summaries, dependencies and links for every document.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): All indexable routes.`,
    `- [RSS feed](${absoluteUrl("/rss.xml")}): Document entries.`,
    `- [Atom feed](${absoluteUrl("/atom.xml")}): Document entries in Atom format.`,
    "",
    "## Related records elsewhere",
    "",
    `- [The original Agentic Sprint essay](${site.essayUrl}): The plain-language introduction, which remains on the author's site.`,
    `- [Autonomous Loop](${site.autonomousLoopUrl}): An open-source implementation of the optional inner execution loop described in D4. Source: ${site.autonomousLoopSource}`,
    `- [Source repository for this site](${site.github}): Content, code and the design record.`,
    `- [Author](${site.authorUrl}): ${site.author}'s writing and research.`,
  ].join("\n");

  return new Response(`${text}\n`, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
