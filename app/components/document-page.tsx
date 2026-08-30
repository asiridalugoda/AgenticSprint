import type { ReactNode } from "react";
import Link from "next/link";

import { extractArticleOutline, getMethodologySeries, getTemplateSeries, type Article } from "@/lib/content";
import { formatDate, site, type NavHref } from "@/lib/site";

import { ArticleOutline } from "./article-outline";
import { DocumentStatus, normativeLabel, versionLabel } from "./document-status";
import { ArrowUpRight } from "./icons";
import { MarkdownContent } from "./markdown-content";
import { ReadingInstruments } from "./reading-instruments";
import { SeriesNav, type SeriesLink } from "./series-nav";
import { SiteShell } from "./site-shell";
import { BreadcrumbStructuredData, DocumentStructuredData, licences } from "./structured-data";

function humanise(value: string) {
  return value.replace(/-+/g, " ").trim();
}

function truncateMiddle(value: string, limit = 64) {
  if (value.length <= limit) return value;
  const head = Math.ceil((limit - 1) / 2);
  const tail = limit - 1 - head;
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}

function referenceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Name a citation by what it is rather than by where it lives, so a reader
 * scanning the list can tell a standard from a preprint from a repository.
 */
function externalLabel(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];

    if (hostname === "rfc-editor.org" && last) return `IETF ${last.toUpperCase().replace(".HTML", "")}`;
    if (hostname === "datatracker.ietf.org" && segments[0] === "doc" && segments[1]) return `IETF Internet-Draft ${segments[1]}`;
    if (hostname === "github.com" && segments.length >= 2) return `Source on GitHub: ${segments[0]}/${segments[1]}`;
    if (hostname === "docs.github.com" && last) return `GitHub Docs: ${humanise(last)}`;
    if (hostname === "arxiv.org" && segments[0] === "abs" && segments[1]) return `arXiv preprint ${segments.slice(1).join("/")}`;
    if (hostname.endsWith("nist.gov")) {
      const name = last === "final" || last === "ipd" ? segments[segments.length - 2] : last;
      return name ? `NIST: ${humanise(name)}` : "NIST";
    }
    if (hostname === "learn.microsoft.com" && last) return `Microsoft Learn: ${humanise(last)}`;
    if (hostname === "microsoft.com" && last) return `Microsoft: ${humanise(last)}`;
    if (hostname === "openai.com" && segments[0] === "index" && segments[1]) return `OpenAI: ${humanise(segments[1])}`;
    if (hostname === "helixar.ai") return last ? `Helixar: ${humanise(last)}` : "Helixar";
    if (hostname === "dalugoda.com") return last ? `dalugoda.com: ${humanise(last)}` : "dalugoda.com";
    return truncateMiddle(`${hostname}${parsed.pathname.replace(/\/$/, "")}`);
  } catch {
    return url;
  }
}

/** True when the document body already carries its own bibliography. */
function hasOwnBibliography(article: Article) {
  return /^##\s+References\s*$/m.test(article.body);
}

function ReferenceLinks({ article }: { article: Article }) {
  const attributionOnly = hasOwnBibliography(article);
  const links = Array.from(
    new Set(attributionOnly ? (article.github ? [article.github] : []) : [...(article.github ? [article.github] : []), ...article.references, ...article.externalLinks]),
  );
  if (!links.length) return null;

  return (
    <section className="article-references" aria-labelledby="references-title">
      <h2 id="references-title">{attributionOnly ? "Source" : "Sources"}</h2>
      <ol>
        {links.map((link) => (
          <li key={link}>
            <a href={link} rel="noreferrer" target="_blank" title={link}>{externalLabel(link)}<ArrowUpRight /></a>
            <span className="reference-host">{referenceHost(link)}</span>
          </li>
        ))}
      </ol>
      <p className="corrections-note">Corrections and material updates are dated on this page and recorded in the document status.</p>
    </section>
  );
}

/** The other documents in this document's own series, in series order. */
function seriesDocuments(article: Article) {
  return article.collection === "template" ? getTemplateSeries() : getMethodologySeries();
}

function seriesLink(article?: Article): SeriesLink | undefined {
  if (!article) return undefined;
  return { title: article.title, path: article.path, documentId: article.documentId };
}

function navSection(article: Article): NavHref {
  if (article.collection === "template") return "/templates";
  if (article.documentId === "D1") return "/specification";
  return "/documents";
}

function LicenceBlock({ article }: { article: Article }) {
  const template = article.collection === "template";
  return (
    <div className="aside-block">
      <span className="meta-label">Licence</span>
      <p>
        <a href={licences[article.collection]} rel="noreferrer" target="_blank">{template ? "CC0 1.0" : "CC BY 4.0"}<ArrowUpRight /></a>
        {template ? " Copy this template into a repository without attribution." : " Share and adapt with attribution."}
      </p>
    </div>
  );
}

function EditionsBlock({ article }: { article: Article }) {
  return (
    <div className="aside-block">
      <span className="meta-label">Editions</span>
      <ul className="aside-list">
        <li><a href={`/md/${article.slug}`}>Markdown edition</a></li>
        <li><a href={site.github} rel="noreferrer" target="_blank">Source repository<ArrowUpRight /></a></li>
      </ul>
    </div>
  );
}

export function DocumentPage({ article, beforeBody, afterBody }: { article: Article; beforeBody?: ReactNode; afterBody?: ReactNode }) {
  const version = versionLabel(article.version);
  const documents = seriesDocuments(article);
  const position = documents.findIndex((candidate) => candidate.slug === article.slug);
  const previous = position > 0 ? seriesLink(documents[position - 1]) : undefined;
  const next = position >= 0 && position < documents.length - 1 ? seriesLink(documents[position + 1]) : undefined;
  const template = article.collection === "template";

  const trail = [
    { name: "Manifesto", path: "/" },
    template ? { name: "Templates", path: "/templates" } : { name: "Documents", path: "/documents" },
    { name: article.title, path: article.path },
  ];

  return (
    <SiteShell current={navSection(article)}>
      <article className="article-page">
        <BreadcrumbStructuredData items={trail} />
        <DocumentStructuredData article={article} />
        <p className="breadcrumb">
          {trail.slice(0, -1).map((step) => (
            <span key={step.path}>
              <Link href={step.path}>{step.name}</Link> <span aria-hidden="true">/</span>{" "}
            </span>
          ))}
          {article.documentId}
        </p>

        <header className="article-header">
          <p className="article-kicker mono-label">
            {article.documentId} · {template ? "Working template" : normativeLabel(article.normative)}
          </p>
          <h1>{article.title}</h1>
          <p className="article-dek">{article.description}</p>
          <div className="article-meta-line" aria-label="Document metadata">
            <span><a href={site.authorUrl} rel="noreferrer" target="_blank">{site.author}</a></span>
            {article.status ? <span>{article.status}</span> : null}
            {version ? <span>{version}</span> : null}
            <span>Published {formatDate(article.date)}</span>
            {article.updated && article.updated !== article.date ? <span>Updated {formatDate(article.updated)}</span> : null}
            <span>{article.readingTime} min read</span>
          </div>
        </header>

        <div className="article-layout">
          <aside className="article-aside" aria-label="Document navigation and details">
            <ArticleOutline items={extractArticleOutline(article.body)} />
            <LicenceBlock article={article} />
            <EditionsBlock article={article} />
          </aside>

          <div className="article-body">
            <DocumentStatus article={article} />
            {beforeBody}
            <MarkdownContent source={article.body} />
            {afterBody}
            <SeriesNav citation={article.citation} next={next} previous={previous} />
            <ReferenceLinks article={article} />
          </div>

          <div className="article-tail">
            <LicenceBlock article={article} />
            <EditionsBlock article={article} />
          </div>
        </div>
      </article>
      <ReadingInstruments />
    </SiteShell>
  );
}
