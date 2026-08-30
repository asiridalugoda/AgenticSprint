import Link from "next/link";

import { site } from "@/lib/site";

import { ArrowUpRight, FeedIcon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="footer-label">The Agentic Sprint</span>
        <span>
          Version {site.version} · Documents CC BY 4.0 · Templates CC0 · Site code Apache 2.0
        </span>
      </div>
      <div>
        <span className="footer-label">Author and source</span>
        <div className="footer-links">
          <a href={site.authorUrl} rel="noreferrer" target="_blank">{site.author}<ArrowUpRight /></a>
          <a href={site.github} rel="noreferrer" target="_blank">GitHub<ArrowUpRight /></a>
          <Link href="/rss.xml"><FeedIcon />RSS</Link>
          <Link href="/atom.xml"><FeedIcon />Atom</Link>
        </div>
      </div>
      <div className="footer-right">
        <span className="footer-label">For machines</span>
        <span>
          Every document has a Markdown edition at <Link href="/llms.txt">/llms.txt</Link>. Document identifiers are stable; cite by
          identifier, not by page position.
        </span>
      </div>
    </footer>
  );
}
