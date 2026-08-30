import type { ReactNode } from "react";

import type { NavHref } from "@/lib/site";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * `current` names the navigation section the page belongs to. Document pages
 * live at the root, so the header cannot infer the section from the path.
 */
export function SiteShell({ children, current }: { children: ReactNode; current?: NavHref }) {
  return (
    <div className="site-frame">
      <SiteHeader current={current} />
      <main id="content">{children}</main>
      <SiteFooter />
    </div>
  );
}
