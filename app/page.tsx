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

/**
 * The manifesto's own description is the right line on the page and on the
 * social card, but at 75 characters it gives a search engine too little to
 * show. Only the meta description is widened; `og:description` keeps the dek,
 * because the generated card image carries that same wording.
 */
const searchDescription =
  "Ten principles for software delivery with autonomous AI agents: agents run the execution loops, humans control the gates. The Agentic Sprint manifesto, v0.1.";

export const metadata: Metadata = {
  ...base,
  title: { absolute: `${article.title} · ${site.name}` },
  description: searchDescription,
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
