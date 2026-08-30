"use client";

import { useState } from "react";
import Link from "next/link";

import { ArrowRight } from "./icons";

export type SeriesLink = {
  title: string;
  path: string;
  documentId?: string;
};

function SeriesItem({ direction, link }: { direction: "Previous" | "Next"; link: SeriesLink }) {
  return (
    <Link className={`methodology-series-link methodology-series-${direction.toLowerCase()}`} href={link.path}>
      <span className="methodology-series-direction">{direction}</span>
      <span className="methodology-series-body">
        {link.documentId ? <span className="methodology-series-id">{link.documentId}</span> : null}
        <span className="methodology-series-title">{link.title}</span>
      </span>
      <ArrowRight className="methodology-series-arrow" />
    </Link>
  );
}

export function CiteBlock({ citation }: { citation: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="methodology-cite">
      <span className="meta-label">Cite this document</span>
      <p className="methodology-cite-text">{citation}</p>
      <button className="methodology-cite-copy" onClick={copy} type="button">
        {copied ? "Citation copied" : "Copy citation"}
      </button>
      <span aria-live="polite" className="sr-only">{copied ? "Citation copied to the clipboard." : ""}</span>
    </div>
  );
}

export function SeriesNav({
  previous,
  next,
  citation,
}: {
  previous?: SeriesLink;
  next?: SeriesLink;
  citation?: string;
}) {
  if (!previous && !next && !citation) return null;

  return (
    <nav aria-label="Series navigation" className="methodology-series-nav">
      {previous || next ? (
        <div className="methodology-series-links">
          {previous ? <SeriesItem direction="Previous" link={previous} /> : <span className="methodology-series-empty" />}
          {next ? <SeriesItem direction="Next" link={next} /> : null}
        </div>
      ) : null}
      {citation ? <CiteBlock citation={citation} /> : null}
    </nav>
  );
}
