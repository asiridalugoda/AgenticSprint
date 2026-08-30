import { getMethodologySeries, getTemplateSeries, type Article } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function label(value: string) {
  return value.replace(/[\[\]]/g, "\\$&");
}

function entry(article: Article) {
  const facets = [
    article.documentId ? `Identifier: ${article.documentId}` : "",
    article.status ? `Status: ${article.status}` : "",
    article.version ? `Version: ${article.version}` : "",
    article.normative ? "Normative: yes" : "Normative: no",
    `Published: ${article.date}`,
    article.updated && article.updated !== article.date ? `Updated: ${article.updated}` : "",
    article.dependsOn.length ? `Builds on: ${article.dependsOn.join(", ")}` : "",
    article.claimClasses.length ? `Claim classes: ${article.claimClasses.join(", ")}` : "",
    `Licence: ${article.collection === "template" ? "CC0 1.0" : "CC BY 4.0"}`,
    `Canonical: ${absoluteUrl(article.path)}`,
    `Markdown: ${absoluteUrl(`/md/${article.slug}`)}`,
    article.citation ? `Citation: ${article.citation}` : "",
  ].filter(Boolean);
  return [`### [${label(article.title)}](${absoluteUrl(`/md/${article.slug}`)})`, "", article.description, "", ...facets.map((facet) => `- ${facet}`), ""].join("\n");
}

export function GET() {
  const documents = getMethodologySeries();
  const templates = getTemplateSeries();
  const text = [
    `# ${site.domain}: full document index`,
    "",
    `> Every document in the Agentic Sprint methodology with its identifier, status, version, dependencies, licence and Markdown edition.`,
    "",
    "This index is generated from the site's content registry. Summaries are the descriptions supplied with each document; no additional findings or claims are inferred here.",
    "",
    `${site.author} (${site.authorUrl}) wrote the methodology. It is published independently at version ${site.version}. D1 is the normative root. Normative documents state requirements using the RFC 2119 keywords; informative documents explain, measure and apply those requirements without adding to them. Templates are informative artefacts, not standards.`,
    "",
    `## Methodology documents (${documents.length})`,
    "",
    ...documents.map(entry),
    `## Working templates (${templates.length})`,
    "",
    ...templates.map(entry),
    "## Related records elsewhere",
    "",
    `- The original Agentic Sprint essay: ${site.essayUrl}`,
    `- Autonomous Loop, the optional inner-loop implementation: ${site.autonomousLoopUrl} (source: ${site.autonomousLoopSource})`,
    `- Source repository for this site: ${site.github}`,
    `- Author: ${site.authorUrl}`,
  ].join("\n");

  return new Response(`${text}\n`, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
