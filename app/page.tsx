import type { Metadata } from "next";

import { ManifestoPage } from "./components/manifesto";
import { ReadingInstruments } from "./components/reading-instruments";
import { SiteShell } from "./components/site-shell";
import { DocumentStructuredData } from "./components/structured-data";
import { getManifesto } from "@/lib/content";
import { site } from "@/lib/site";
import { articleMetadata } from "@/lib/social";

const article = getManifesto();

const base = articleMetadata(article);

export const metadata: Metadata = {
  ...base,
  title: { absolute: `${article.title} · ${site.name}` },
};

export default function Home() {
  return (
    <SiteShell current="/">
      <DocumentStructuredData article={article} />
      <ManifestoPage article={article} />
      <ReadingInstruments />
    </SiteShell>
  );
}
