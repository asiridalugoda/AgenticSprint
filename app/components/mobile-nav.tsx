"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { NavHref } from "@/lib/site";

import { NavLinks } from "./nav-links";

export function MobileNav({ current }: { current?: NavHref }) {
  const pathname = usePathname();
  // Storing the route the panel was opened for closes it on navigation
  // without an effect that has to chase the pathname.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenFor(null);
      toggleRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpenFor(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="mobile-nav" ref={containerRef}>
      <button
        aria-controls="mobile-nav-panel"
        aria-expanded={open}
        className="mobile-nav-toggle"
        onClick={() => setOpenFor(open ? null : pathname)}
        ref={toggleRef}
        type="button"
      >
        Menu<span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <nav aria-label="Mobile navigation" className="mobile-nav-links" hidden={!open} id="mobile-nav-panel">
        <NavLinks current={current} />
      </nav>
    </div>
  );
}
