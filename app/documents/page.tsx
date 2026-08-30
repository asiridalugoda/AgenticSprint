import { DocumentIndex } from "../components/document-index";
import { ArrowUpRight } from "../components/icons";
import { SiteShell } from "../components/site-shell";
import { BreadcrumbStructuredData, CollectionStructuredData, SeriesStructuredData } from "../components/structured-data";
import { getMethodologySeries, getTemplateSeries } from "@/lib/content";
import { site } from "@/lib/site";
import { listingKeywords, pageMetadata } from "@/lib/social";

const description =
  "The Agentic Sprint methodology in full: the normative specification and its companion standards, the informative documents that explain and measure them, and the working templates.";

const documents = getMethodologySeries();
const templates = getTemplateSeries();

export const metadata = pageMetadata({
  slug: "documents",
  title: "The documents",
  description,
  canonicalPath: "/documents",
  keywords: listingKeywords([...documents, ...templates], ["Agentic Sprint methodology", "agentic sprint specification"]),
});

export default function DocumentsPage() {
  const items = [...documents, ...templates].map((article) => ({ title: article.title, path: article.path }));

  return (
    <SiteShell current="/documents">
      <BreadcrumbStructuredData items={[{ name: "Manifesto", path: "/" }, { name: "Documents", path: "/documents" }]} />
      <CollectionStructuredData description={description} items={items} name="The documents" path="/documents" />
      <SeriesStructuredData documents={documents} templates={templates} />
      <div className="listing-page">
        <section className="listing-hero">
          <div>
            <h1>The documents</h1>
            <p className="listing-intro">
              {documents.length} numbered documents and {templates.length} templates. Each states what it requires, what it
              recommends and what it leaves open, and each carries a stable identifier.
            </p>
          </div>
          <aside className="listing-index-note">
            <p>Identifiers are stable. Cite a requirement by its document and identifier, not by a page position.</p>
          </aside>
        </section>
        <section className="listing-body" aria-label="Document index">
          <p className="further-reading">
            <span>Further reading</span>
            <a href={site.essayUrl} rel="noreferrer" target="_blank">The original Agentic Sprint essay on dalugoda.com<ArrowUpRight /></a>
            <a href={site.autonomousLoopUrl} rel="noreferrer" target="_blank">Autonomous Loop, the optional inner-loop implementation<ArrowUpRight /></a>
          </p>
          <DocumentIndex documents={documents} templates={templates} />
        </section>
      </div>
    </SiteShell>
  );
}
