import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentPage } from "../../components/document-page";
import { getDocumentByPath, getTemplateSeries } from "@/lib/content";
import { articleMetadata } from "@/lib/social";

export const dynamicParams = false;

function templateDocument(slug: string) {
  const article = getDocumentByPath(`/templates/${slug}`);
  if (!article || article.draft || article.collection !== "template") return undefined;
  return article;
}

export function generateStaticParams() {
  return getTemplateSeries().map((article) => ({ slug: article.path.split("/").filter(Boolean).pop() as string }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = templateDocument(slug);
  if (!article) return {};
  return articleMetadata(article);
}

export default async function TemplateDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = templateDocument(slug);
  if (!article) notFound();
  return <DocumentPage article={article} />;
}
