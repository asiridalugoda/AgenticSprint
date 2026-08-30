import type { Metadata } from "next";

import { articles, type Article } from "./content";
import { absoluteUrl, site } from "./site";

export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

export type SocialPage = {
  slug: string;
  canonicalPath: string;
  title: string;
  description: string;
  type: string;
  documentId?: string;
};

const archivePages: SocialPage[] = [
  {
    slug: "documents",
    canonicalPath: "/documents",
    title: "The documents",
    description: "The Agentic Sprint methodology: the normative core, the informative documents and the working templates.",
    type: "Index",
  },
  {
    slug: "templates",
    canonicalPath: "/templates",
    title: "Working templates",
    description: "Nine templates a team fills in while running an Agentic Sprint.",
    type: "Index",
  },
  {
    slug: "about",
    canonicalPath: "/about",
    title: "About The Agentic Sprint",
    description: "Authorship, status, licence and how to cite the methodology.",
    type: "About",
  },
];

/**
 * Every document contributes one social page. The slug comes from the
 * document's own `image` path when it declares one, so the generated image URL
 * is owned by the content record; the import script derives it from the
 * document's address so it cannot collide with a page slug.
 */
export function socialSlugForArticle(article: Article) {
  if (article.image?.startsWith("/social/")) {
    const declared = article.image.split("/").filter(Boolean).pop();
    if (declared) return declared;
  }
  return article.slug;
}

export function socialTypeForArticle(article: Article) {
  if (article.documentId === "D11") return "Manifesto";
  if (article.collection === "template") return "Working template";
  return article.normative ? "Normative document" : "Informative document";
}

const articlePages: SocialPage[] = articles
  .filter((article) => !article.draft)
  .map((article) => ({
    slug: socialSlugForArticle(article),
    canonicalPath: article.path,
    title: article.title,
    description: article.description,
    type: socialTypeForArticle(article),
    documentId: article.documentId,
  }));

export const socialPages = [...articlePages, ...archivePages] as const;

if (new Set(socialPages.map((page) => page.slug)).size !== socialPages.length) {
  throw new Error("The social image catalogue must contain unique page slugs.");
}

export function getSocialPage(slug: string) {
  return socialPages.find((page) => page.slug === slug);
}

export function socialSlugForCanonicalPath(canonicalPath: string) {
  return socialPages.find((page) => page.canonicalPath === canonicalPath)?.slug;
}

export function socialImage(slug: string, title: string) {
  return {
    url: absoluteUrl(`/social/${slug}`),
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    alt: `${title} · ${site.name}`,
  };
}

/**
 * Feed autodiscovery has to survive per-page metadata: a page that declares
 * its own `alternates` replaces the layout's, so every page repeats the feed
 * link relations rather than inheriting them.
 */
export const feedAlternates = {
  "application/rss+xml": [{ url: absoluteUrl("/rss.xml"), title: `${site.name} · RSS feed` }],
  "application/atom+xml": [{ url: absoluteUrl("/atom.xml"), title: `${site.name} · Atom feed` }],
};

/**
 * Listing keywords are drawn from the entries the page actually shows, so the
 * keyword set moves with the series rather than drifting away from it.
 */
export function listingKeywords(
  entries: ReadonlyArray<{ topics: readonly string[]; tags: readonly string[] }>,
  leading: readonly string[] = [],
) {
  const values = [
    ...leading,
    ...entries.flatMap((entry) => entry.tags),
    ...entries.flatMap((entry) => entry.topics),
  ];
  return Array.from(new Set(values.filter(Boolean))).slice(0, 24);
}

type PageMetadataOptions = {
  slug: string;
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  metadataTitle?: Metadata["title"];
};

export function pageMetadata({ slug, title, description, canonicalPath, keywords, metadataTitle }: PageMetadataOptions): Metadata {
  const image = socialImage(slug, title);
  return {
    title: metadataTitle ?? title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    authors: [{ name: site.author, url: site.authorUrl }],
    alternates: { canonical: canonicalPath, types: feedAlternates },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      siteName: site.name,
      title,
      description,
      locale: "en_NZ",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function isoDate(value: string) {
  return value.length === 10 ? `${value}T00:00:00.000Z` : value;
}

export function articleMetadata(article: Article): Metadata {
  const socialSlug = socialSlugForCanonicalPath(article.path);
  if (!socialSlug) throw new Error(`Missing social image mapping for ${article.path}`);

  const image = socialImage(socialSlug, article.title);
  const modifiedDate = article.updated || article.date;

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    authors: [{ name: site.author, url: site.authorUrl }],
    alternates: {
      canonical: article.path,
      types: { ...feedAlternates, "text/markdown": absoluteUrl(`/md/${article.slug}`) },
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(article.path),
      siteName: site.name,
      title: article.title,
      description: article.description,
      locale: "en_NZ",
      images: [image],
      publishedTime: isoDate(article.date),
      modifiedTime: isoDate(modifiedDate),
      authors: [site.authorUrl],
      section: article.series || site.name,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}
