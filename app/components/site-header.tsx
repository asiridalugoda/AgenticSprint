import Link from "next/link";

import { site, type NavHref } from "@/lib/site";

import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader({ current }: { current?: NavHref }) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label={`${site.name} home`}>
        <span className="wordmark-mark" aria-hidden="true">A</span>
        <span>{site.name}</span>
      </Link>
      <nav className="primary-nav" aria-label="Primary navigation"><NavLinks current={current} /></nav>
      <MobileNav current={current} />
    </header>
  );
}
