import { IndexGroup } from "../components/document-index";
import { ArrowUpRight } from "../components/icons";
import { SiteShell } from "../components/site-shell";
import { BreadcrumbStructuredData, CollectionStructuredData, licences } from "../components/structured-data";
import { getTemplateSeries } from "@/lib/content";
import { listingKeywords, pageMetadata } from "@/lib/social";

const description = "Nine working templates for running an Agentic Sprint: build plan, review and QA evidence, agent handover, security assessment and retrospective.";

const templates = getTemplateSeries();

export const metadata = pageMetadata({
  slug: "templates",
  title: "Working templates",
  description,
  canonicalPath: "/templates",
  keywords: listingKeywords(templates, ["Agentic Sprint templates", "build plan template"]),
});

export default function TemplatesPage() {
  const items = templates.map((article) => ({ title: article.title, path: article.path }));

  return (
    <SiteShell current="/templates">
      <BreadcrumbStructuredData items={[{ name: "Manifesto", path: "/" }, { name: "Templates", path: "/templates" }]} />
      <CollectionStructuredData description={description} items={items} name="Working templates" path="/templates" />
      <div className="listing-page">
        <section className="listing-hero">
          <div>
            <h1>Working templates</h1>
            <p className="listing-intro">
              The artefacts a team fills in while running a sprint: the build plan, the evidence records, the handover, the
              retrospective. They apply the methodology; they do not add requirements to it.
            </p>
          </div>
          <aside className="listing-index-note">
            <p>
              Templates are dedicated to the public domain under{" "}
              <a href={licences.template} rel="noreferrer" target="_blank">CC0 1.0<ArrowUpRight /></a>. Copy them into a repository without attribution.
            </p>
          </aside>
        </section>
        <section className="listing-body methodology-index" aria-label="Template index">
          <IndexGroup
            articles={templates}
            note="In series order. Each template names the documents it applies."
            title="T1 to T9"
          />
        </section>
      </div>
    </SiteShell>
  );
}
