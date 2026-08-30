import Link from "next/link";

import { getMethodologySeries, getSpecification, getTemplateSeries, type Article } from "@/lib/content";
import { parseManifesto } from "@/lib/manifesto";
import { formatLongDate, site } from "@/lib/site";

import { versionLabel } from "./document-status";
import { ArrowRight, ArrowUpRight } from "./icons";
import { ContentBlocks, InlineText } from "./markdown-content";
import { CiteBlock } from "./series-nav";

function ReadOnRow({ href, id, title, summary }: { href: string; id: string; title: string; summary: string }) {
  return (
    <li>
      <Link className="read-on-row" href={href}>
        <span className="read-on-id">{id}</span>
        <span className="read-on-main">
          <span className="read-on-title">{title}</span>
          <span className="read-on-summary">{summary}</span>
        </span>
        <ArrowRight className="read-on-arrow" />
      </Link>
    </li>
  );
}

/**
 * The page is the document. The manifesto's body is reshaped so its ten
 * principles carry the page, with the surrounding sections set as furniture.
 */
export function ManifestoPage({ article }: { article: Article }) {
  const manifesto = parseManifesto(article.body);
  const specification = getSpecification();
  const documents = getMethodologySeries();
  const templates = getTemplateSeries();
  const version = versionLabel(article.version);

  return (
    <article className="manifesto">
      <header className="manifesto-head">
        <p className="manifesto-kicker mono-label">Agentic Sprint Methodology · {article.documentId}</p>
        <h1 className="manifesto-title">{article.title}</h1>
        <p className="manifesto-dek">{article.description}</p>
        <p className="manifesto-status" aria-label="Document status">
          {version ? <span>{version}</span> : null}
          <span>{formatLongDate(article.date)}</span>
          <span><a href={site.authorUrl} rel="noreferrer" target="_blank">{site.author}</a></span>
          {article.status ? <span>{article.status}</span> : null}
        </p>
      </header>

      <section className="manifesto-why" aria-labelledby="why-this-exists">
        <h2 className="section-label" id="why-this-exists">Why this exists</h2>
        <div className="manifesto-lede"><ContentBlocks blocks={manifesto.why} keyPrefix="why" /></div>
      </section>

      <section className="manifesto-principles" aria-labelledby="principles">
        <h2 className="section-label" id="principles">Principles</h2>
        <ol className="principles">
          {manifesto.principles.map((principle) => (
            <li className="principle" id={principle.id} key={principle.number}>
              <span className="principle-number" aria-hidden="true">{String(principle.number).padStart(2, "0")}</span>
              <div className="principle-body">
                <h3 className="principle-title">
                  <span className="sr-only">{principle.number}. </span>
                  <InlineText keyPrefix={`principle-title-${principle.number}`} text={principle.title} />
                </h3>
                <ContentBlocks blocks={principle.blocks} keyPrefix={`principle-${principle.number}`} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="compact-test" aria-labelledby="a-compact-test">
        <h2 className="section-label" id="a-compact-test">A compact test</h2>
        {manifesto.test.map((block, index) =>
          block.kind === "list" ? (
            <ul className="compact-test-list" key={`test-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`test-${index}-${itemIndex}`}>
                  <span className="tick" aria-hidden="true" />
                  <span><InlineText keyPrefix={`test-${index}-${itemIndex}`} text={item} /></span>
                </li>
              ))}
            </ul>
          ) : (
            <ContentBlocks blocks={[block]} key={`test-${index}`} keyPrefix={`test-${index}`} />
          ),
        )}
      </section>

      {manifesto.other.map((section) => (
        <section className="manifesto-other" key={section.id || section.heading}>
          {section.heading ? <h2 id={section.id}>{section.heading}</h2> : null}
          <ContentBlocks blocks={section.blocks} keyPrefix={`other-${section.id}`} />
        </section>
      ))}

      <section className="manifesto-footnote" aria-labelledby="document-status-and-limitations">
        <h2 className="section-label" id="document-status-and-limitations">Document status and limitations</h2>
        <ContentBlocks blocks={manifesto.status} keyPrefix="status" />
      </section>

      <nav className="read-on" aria-labelledby="read-on-title">
        <h2 className="section-label" id="read-on-title">Read the methodology</h2>
        <ol className="read-on-list">
          <ReadOnRow
            href={specification.path}
            id={specification.documentId || "D1"}
            summary={`The normative core. ${specification.description}`}
            title={specification.title}
          />
          <ReadOnRow
            href="/documents"
            id={`D1 to D${documents.length}`}
            summary="The full series: the normative core, the companion standards and the informative documents, with what each requires and what it leaves open."
            title="The documents"
          />
          <ReadOnRow
            href="/templates"
            id={`T1 to T${templates.length}`}
            summary="Working artefacts to copy into a repository and fill in while running a sprint. Released without an attribution requirement."
            title="The templates"
          />
        </ol>
        <p className="read-on-essay">
          The methodology began as an essay, which remains on the author&rsquo;s site.{" "}
          <a href={site.essayUrl} rel="noreferrer" target="_blank">Read the original essay<ArrowUpRight /></a>
        </p>
      </nav>

      {article.citation ? <CiteBlock citation={article.citation} /> : null}
    </article>
  );
}
