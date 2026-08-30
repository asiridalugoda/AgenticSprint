import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentPage } from "../components/document-page";
import { getDocumentByPath, getMethodologySeries } from "@/lib/content";
import { articleMetadata } from "@/lib/social";

/**
 * D1 to D13 live at the root, one segment deep. The manifesto (D11) is the
 * front page and is excluded here; /manifesto redirects to / in next.config.
 * The static folders (documents, templates, about) resolve before this route.
 */
export const dynamicParams = false;

function methodologyDocument(slug: string) {
  const article = getDocumentByPath(`/${slug}`);
  if (!article || article.draft || article.collection !== "methodology" || article.path === "/") return undefined;
  return article;
}

export function generateStaticParams() {
  return getMethodologySeries()
    .filter((article) => article.path !== "/")
    .map((article) => ({ slug: article.path.slice(1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = methodologyDocument(slug);
  if (!article) return {};
  return articleMetadata(article);
}

export default async function MethodologyDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = methodologyDocument(slug);
  if (!article) notFound();
  return <DocumentPage article={article} />;
}
