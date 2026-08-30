import Link from "next/link";

import { ArrowRight } from "./components/icons";
import { SiteShell } from "./components/site-shell";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SiteShell>
      <div className="not-found">
        <h1>That document is not here.</h1>
        <p>The link may be old, or the document may have been renumbered. Every document in the series is listed in the index.</p>
        <div className="not-found-links">
          <Link className="text-link" href="/">The manifesto<ArrowRight /></Link>
          <Link className="text-link" href="/specification">The specification<ArrowRight /></Link>
          <Link className="text-link" href="/documents">All documents<ArrowRight /></Link>
        </div>
      </div>
    </SiteShell>
  );
}
