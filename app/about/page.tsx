import Link from "next/link";

import { ArrowUpRight } from "../components/icons";
import { CiteBlock } from "../components/series-nav";
import { SiteShell } from "../components/site-shell";
import { BreadcrumbStructuredData, licences } from "../components/structured-data";
import { getMethodologySeries, getTemplateSeries } from "@/lib/content";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/social";

const description = "Who wrote the Agentic Sprint, its status as a version 0.1 proposal open to critique, how it is licensed under CC BY 4.0 and CC0, and how to cite it.";

export const metadata = pageMetadata({
  slug: "about",
  title: "About",
  description,
  canonicalPath: "/about",
});

export default function AboutPage() {
  const documents = getMethodologySeries();
  const templates = getTemplateSeries();

  return (
    <SiteShell current="/about">
      <BreadcrumbStructuredData items={[{ name: "Manifesto", path: "/" }, { name: "About", path: "/about" }]} />
      <div className="about-page">
        <div className="about-layout">
          <div className="about-copy">
            <h1>About The Agentic Sprint</h1>
            <p className="lead">
              The Agentic Sprint is a proposed operating model for software delivery in which autonomous agents execute bounded
              engineering work and people keep authority over intent, architecture, acceptance and release. This site is its home.
            </p>

            <h2>What this site is</h2>
            <p>
              The <Link href="/">manifesto</Link> is the front page: ten principles and a compact test. Behind it sit {documents.length}{" "}
              numbered documents, D1 to D{documents.length}, and {templates.length} working templates, T1 to T{templates.length}. The{" "}
              <Link href="/specification">specification</Link> (D1) is the normative core: it states what a conforming Agentic Sprint
              requires, using the RFC 2119 keywords. The companion standards scope that core; the informative documents explain,
              measure and apply it without adding requirements; the templates are the artefacts a team fills in.
            </p>
            <p>
              Every document carries a stable identifier, a status, a version and the documents it builds on. Cite a requirement by
              its document and identifier, not by a page position.
            </p>

            <h2>Authorship</h2>
            <p>
              The methodology was written by <a href={site.authorUrl} rel="noreferrer" target="_blank">{site.author}</a>, a
              technology executive and researcher based in Auckland, New Zealand. It is published independently. No organisation
              owns it, and nothing here should be read as a claim about the practices of any employer or client.
            </p>

            <h2>Status</h2>
            <p>
              The series is at version {site.version}. It is a proposed methodology, offered for adoption, pilots and critique. It is
              not a claim of industry consensus, a safety certification, or evidence that current AI systems can reliably perform all
              professional engineering work without supervision. Changes are versioned and dated on each document, and a new version
              of a document never silently replaces the requirements of the one before it.
            </p>

            <h2>Licence</h2>
            <ul>
              <li>
                The documents, D1 to D{documents.length}, are published under{" "}
                <a href={licences.methodology} rel="noreferrer" target="_blank">CC BY 4.0</a>. Share and adapt them for any purpose,
                including commercially, with attribution.
              </li>
              <li>
                The templates, T1 to T{templates.length}, are dedicated to the public domain under{" "}
                <a href={licences.template} rel="noreferrer" target="_blank">CC0 1.0</a>. A team may copy them into a repository
                without attribution.
              </li>
              <li>
                The source code of this site is licensed under Apache 2.0 and is on{" "}
                <a href={site.github} rel="noreferrer" target="_blank">GitHub</a>.
              </li>
            </ul>
            <p>None of these licences grants the right to imply that a derived work is endorsed by, or is the official work of, the author.</p>

            <h2>How to cite</h2>
            <p>To cite the methodology as a whole:</p>
            <CiteBlock citation={site.seriesCitation} />
            <p>
              To cite a single document, use the citation at the foot of that document. It names the document, its identifier, its
              version and its date, so a reader can tell which text was being referred to.
            </p>

            <h2>How to contribute</h2>
            <p>
              The site and its content are maintained in the open. Open an issue or a pull request on{" "}
              <a href={site.github} rel="noreferrer" target="_blank">GitHub</a> to propose a correction, argue with a requirement or
              report an implementation experience. Proposals that change a normative requirement are handled as a new version of the
              affected document, with the change dated.
            </p>

            <h2>Relationship to dalugoda.com</h2>
            <p>
              The methodology was first published on the author&rsquo;s site, <a href={site.authorUrl} rel="noreferrer" target="_blank">dalugoda.com</a>.
              This site is now the canonical home of every document and template. Two related pieces remain on dalugoda.com and are
              not part of the methodology proper: the{" "}
              <a href={site.essayUrl} rel="noreferrer" target="_blank">original essay</a>, which introduced the model in plain language,
              and <a href={site.autonomousLoopUrl} rel="noreferrer" target="_blank">Autonomous Loop</a>, an open-source implementation
              of the optional inner execution loop that D4 describes.
            </p>

            <h2>For machines</h2>
            <p>
              Every document has a clean Markdown edition at <code>/md/&lt;slug&gt;</code>, linked from the page as its{" "}
              <code>text/markdown</code> alternate. The site is indexed for retrieval agents at{" "}
              <Link href="/llms.txt">/llms.txt</Link> and <Link href="/llms-full.txt">/llms-full.txt</Link>, and publishes{" "}
              <Link href="/sitemap.xml">a sitemap</Link>, <Link href="/rss.xml">RSS</Link> and <Link href="/atom.xml">Atom</Link> feeds.
              Each page carries structured data naming the document, its identifier, its version and its place in the series.
            </p>
          </div>

          <aside className="about-sidebar" aria-label="Site details">
            <div className="about-sidebar-block">
              <span className="meta-label">Author</span>
              <p><a href={site.authorUrl} rel="noreferrer" target="_blank">{site.author}<ArrowUpRight /></a></p>
            </div>
            <div className="about-sidebar-block">
              <span className="meta-label">Version</span>
              <p>{site.version}, a proposed methodology open for critique.</p>
            </div>
            <div className="about-sidebar-block">
              <span className="meta-label">Source</span>
              <p><a href={site.github} rel="noreferrer" target="_blank">GitHub<ArrowUpRight /></a></p>
            </div>
            <div className="about-sidebar-block">
              <span className="meta-label">Licences</span>
              <p>Documents CC BY 4.0. Templates CC0 1.0. Site code Apache 2.0.</p>
            </div>
            <div className="about-sidebar-block">
              <span className="meta-label">Feeds</span>
              <p><Link href="/rss.xml">RSS</Link> · <Link href="/atom.xml">Atom</Link> · <Link href="/llms.txt">llms.txt</Link></p>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
