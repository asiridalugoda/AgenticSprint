"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems, type NavHref } from "@/lib/site";

function matches(pathname: string, route: string) {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * A page that knows its section passes it in; otherwise the path decides.
 * Document pages live at the root, so they always pass `current`.
 */
export function NavLinks({ current }: { current?: NavHref }) {
  const pathname = usePathname() || "/";

  return (
    <>
      {navItems.map((item) => {
        const isCurrent = current ? current === item.href : matches(pathname, item.href);
        return (
          <Link aria-current={isCurrent ? "page" : undefined} href={item.href} key={item.href}>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
