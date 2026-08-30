import type { Article } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";
import { socialImage, socialSlugForCanonicalPath } from "@/lib/social";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const personId = `${site.baseUrl}/#author`;
const websiteId = `${site.baseUrl}/#website`;
const seriesId = `${site.baseUrl}/documents#series`;

const person = {
  "@type": "Person",
  "@id": personId,
  name: site.author,
  url: site.authorUrl,
  sameAs: [site.authorUrl, site.authorGithub, site.scholar],
};

export const licences = {
  methodology: "https://creativecommons.org/licenses/by/4.0/",
  template: "https://creativecommons.org/publicdomain/zero/1.0/",
} as const;

export function SiteStructuredData() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", ...person }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": websiteId,
          name: site.name,
          url: site.baseUrl,
          description: site.description,
          inLanguage: "en-NZ",
          author: { "@id": personId },
          publisher: { "@id": personId },
        }}
      />
    </>
  );
}

/** Word count is a retrieval signal, so it is measured on the published body. */
function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Every document is a TechArticle in the methodology series. The identifier,
 * version, position and licence travel with the markup, so a retrieval agent
 * can tell D1 from T1 and a normative document from an informative one without
 * opening the page.
 */
export function DocumentStructuredData({ article }: { article: Article }) {
  const references = article.references.map((reference) => absoluteUrl(reference));
  const externalLinks = article.externalLinks.map((link) => absoluteUrl(link));
  const socialSlug = socialSlugForCanonicalPath(article.path);
  const image = socialSlug ? socialImage(socialSlug, article.title).url : absoluteUrl("/social/manifesto");

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "@id": `${absoluteUrl(article.path)}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        ...(article.updated ? { dateModified: article.updated } : {}),
        author: { "@id": personId },
        publisher: { "@id": personId },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(article.path) },
        isPartOf: [
          { "@type": "WebSite", "@id": websiteId },
          { "@type": "CreativeWorkSeries", "@id": seriesId, name: "Agentic Sprint Methodology" },
        ],
        ...(article.seriesOrder === undefined ? {} : { position: article.seriesOrder }),
        ...(article.documentId ? { identifier: article.documentId } : {}),
        ...(article.version ? { version: article.version } : {}),
        url: absoluteUrl(article.path),
        inLanguage: "en-NZ",
        articleSection: article.collection === "template" ? "Working templates" : article.normative ? "Normative core" : "Informative documents",
        keywords: article.tags.join(", "),
        wordCount: countWords(article.body),
        timeRequired: `PT${article.readingTime}M`,
        ...(article.topics.length ? { about: article.topics.map((topic) => ({ "@type": "Thing", name: topic })) } : {}),
        image: [image],
        isAccessibleForFree: true,
        license: licences[article.collection],
        ...(article.citation ? { citation: article.citation } : {}),
        ...(references.length ? { isBasedOn: references } : {}),
        ...(externalLinks.length ? { sameAs: externalLinks } : {}),
      }}
    />
  );
}

/**
 * The methodology is a numbered series before it is a set of pages, so the
 * index publishes the series itself: identifiers and reading order travel
 * with the markup rather than being inferred from the navigation.
 */
export function SeriesStructuredData({ documents, templates }: { documents: readonly Article[]; templates: readonly Article[] }) {
  const part = (document: Article) => ({
    "@type": "TechArticle",
    url: absoluteUrl(document.path),
    name: document.title,
    ...(document.seriesOrder === undefined ? {} : { position: document.seriesOrder }),
    ...(document.documentId ? { identifier: document.documentId } : {}),
  });

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWorkSeries",
        "@id": seriesId,
        name: "Agentic Sprint Methodology",
        url: absoluteUrl("/documents"),
        description:
          "A numbered series of documents defining a human-governed delivery model for bounded agent execution: the normative specification, its scoped companions, the informative guides and the working templates.",
        author: { "@id": personId },
        publisher: { "@id": personId },
        isPartOf: { "@type": "WebSite", "@id": websiteId },
        inLanguage: "en-NZ",
        license: licences.methodology,
        numberOfItems: documents.length + templates.length,
        hasPart: [...documents.map(part), ...templates.map(part)],
      }}
    />
  );
}

export type CollectionItem = { title: string; path: string };

export function CollectionStructuredData({ name, description, path, items }: { name: string; description: string; path: string; items: readonly CollectionItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(path)}#collection`,
        url: absoluteUrl(path),
        name,
        description,
        isPartOf: { "@type": "WebSite", "@id": websiteId },
        inLanguage: "en-NZ",
        mainEntity: {
          "@type": "ItemList",
          name,
          numberOfItems: items.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(item.path),
            name: item.title,
          })),
        },
      }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}
