import Link from "next/link";

import type { Article } from "@/lib/content";
import { formatDate, slugify } from "@/lib/site";

import { versionLabel } from "./document-status";
import { ArrowRight } from "./icons";

function metaLine(article: Article) {
  return [article.status, versionLabel(article.version), formatDate(article.date)].filter(Boolean).join(" · ");
}

function IndexRow({ article }: { article: Article }) {
  return (
    <li>
      <Link className="methodology-index-row" href={article.path}>
        <span aria-hidden="true" className="methodology-index-id">{article.documentId}</span>
        <span className="methodology-index-main">
          <span className="methodology-index-title">
            {article.documentId ? <span className="sr-only">{article.documentId}. </span> : null}
            {article.title}
          </span>
          <span className="methodology-index-summary">{article.description}</span>
        </span>
        <span className="methodology-index-side">
          <span className="methodology-index-meta">{metaLine(article)}</span>
          {article.dependsOn.length ? (
            <span className="methodology-index-depends">Builds on {article.dependsOn.join(", ")}</span>
          ) : null}
        </span>
        <ArrowRight className="methodology-index-arrow" />
      </Link>
    </li>
  );
}

export function IndexGroup({ title, note, articles, id }: { title: string; note: string; articles: readonly Article[]; id?: string }) {
  if (!articles.length) return null;
  const headingId = `index-group-${slugify(title)}`;
  return (
    <section aria-labelledby={headingId} className="methodology-index-group" id={id}>
      <h3 id={headingId}>{title}</h3>
      <p className="methodology-index-group-note">{note}</p>
      <ol className="methodology-index-list">
        {articles.map((article) => <IndexRow article={article} key={article.slug} />)}
      </ol>
    </section>
  );
}

/**
 * The full index. The manifesto is listed in its series position even though
 * it is the front page, because the identifier D11 has to resolve somewhere
 * a reader can find it.
 */
export function DocumentIndex({ documents, templates }: { documents: readonly Article[]; templates: readonly Article[] }) {
  const normative = documents.filter((article) => article.normative);
  const informative = documents.filter((article) => !article.normative);

  return (
    <section aria-labelledby="document-index-title" className="methodology-index" id="document-index">
      <h2 className="sr-only" id="document-index-title">Agentic Sprint methodology</h2>
      <p className="methodology-index-intro">
        The normative core states what a conforming Agentic Sprint requires. The informative documents explain, measure and apply
        that core without adding requirements of their own. The working templates are the artefacts a team fills in while running a
        sprint. Autonomous Loop is an optional execution profile: a team can conform to Agentic Sprint without it.
      </p>
      <IndexGroup
        articles={normative}
        note="Requirements a conforming implementation must meet."
        title="Normative core"
      />
      <IndexGroup
        articles={informative}
        note="Guidance, measurement and argument that support the core without adding requirements."
        title="Informative documents"
      />
      <IndexGroup
        articles={templates}
        id="templates"
        note="Artefacts to copy into a repository and fill in during a sprint. Released under CC0, so no attribution is required."
        title="Working templates"
      />
    </section>
  );
}
