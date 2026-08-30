"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type OutlineItem = { id: string; level: 2 | 3; text: string };
type OutlineSection = OutlineItem & { children: OutlineItem[] };

/** Group a flat h2/h3 outline into sections so h3s can fold under their parent. */
function groupOutline(items: OutlineItem[]) {
  const sections: OutlineSection[] = [];
  for (const item of items) {
    if (item.level === 2) sections.push({ ...item, children: [] });
    else sections[sections.length - 1]?.children.push(item);
  }
  return sections;
}

export function ArticleOutline({ items }: { items: OutlineItem[] }) {
  const sections = groupOutline(items);
  const [activeId, setActiveId] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  const outlineIds = sections.flatMap((section) => [section.id, ...section.children.map((child) => child.id)]).join("|");

  useEffect(() => {
    const known = new Set(outlineIds.split("|").filter(Boolean));
    const body = document.querySelector(".article-body");
    if (!body || !known.size) return;

    const headings = Array.from(body.querySelectorAll<HTMLElement>("h2[id], h3[id]")).filter((heading) => known.has(heading.id));
    if (!headings.length) return;

    const visible = new Set<string>();
    let tops = headings.map((heading) => heading.getBoundingClientRect().top + window.scrollY);
    let frame = 0;

    /* Fallback for the long stretches, and the anchor jumps, where no heading
       sits inside the observed band: keep the last heading the reader passed. */
    const settle = () => {
      const line = window.scrollY + window.innerHeight * 0.3;
      let index = 0;
      while (index + 1 < tops.length && tops[index + 1] <= line) index += 1;
      setActiveId(headings[index].id);
    };
    const sync = () => {
      frame = 0;
      const current = headings.find((heading) => visible.has(heading.id));
      if (current) setActiveId(current.id);
      else settle();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const remeasure = () => {
      tops = headings.map((heading) => heading.getBoundingClientRect().top + window.scrollY);
      schedule();
    };

    sync();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const { id } = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        sync();
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
    };
  }, [outlineIds]);

  useEffect(() => {
    const nav = navRef.current;
    const marker = markerRef.current;
    if (!nav || !marker) return;

    const link = activeId ? linkRefs.current.get(activeId) : undefined;
    if (!link) {
      marker.style.height = "0px";
      return;
    }

    // The sub-list unfolds over 280ms, so the geometry keeps moving; measure
    // across that window and let the marker's own transition smooth the travel.
    let frame = 0;
    const started = performance.now();
    const measure = () => {
      const navBox = nav.getBoundingClientRect();
      const linkBox = link.getBoundingClientRect();
      marker.style.height = `${Math.round(linkBox.height)}px`;
      marker.style.transform = `translateY(${Math.round(linkBox.top - navBox.top)}px)`;
      frame = performance.now() - started < 380 ? requestAnimationFrame(measure) : 0;
    };
    const remeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    remeasure();
    window.addEventListener("resize", remeasure);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", remeasure);
    };
  }, [activeId]);

  if (sections.length < 2) return null;

  const openSection = sections.find((section) => section.id === activeId || section.children.some((child) => child.id === activeId));

  const registerLink = (id: string) => (node: HTMLAnchorElement | null) => {
    if (node) linkRefs.current.set(id, node);
    else linkRefs.current.delete(id);
  };

  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if (detailsRef.current && (event.target as HTMLElement).closest("a")) detailsRef.current.open = false;
  };

  return (
    <>
      <nav className="article-toc article-toc-desktop" aria-label="On this page" ref={navRef}>
        <span className="article-toc-marker" aria-hidden="true" ref={markerRef} />
        <span className="meta-label">On this page</span>
        <ol>
          {sections.map((section) => (
            <li className={openSection?.id === section.id ? "is-open" : undefined} key={section.id}>
              <a
                aria-current={activeId === section.id ? "location" : undefined}
                className={activeId === section.id ? "is-active" : undefined}
                href={`#${section.id}`}
                ref={registerLink(section.id)}
              >
                {section.text}
              </a>
              {section.children.length ? (
                <div className="article-toc-sub">
                  <ol>
                    {section.children.map((child) => (
                      <li key={child.id}>
                        <a
                          aria-current={activeId === child.id ? "location" : undefined}
                          className={activeId === child.id ? "is-active" : undefined}
                          href={`#${child.id}`}
                          ref={registerLink(child.id)}
                        >
                          {child.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      <details className="article-toc article-toc-mobile" ref={detailsRef}>
        <summary>On this page</summary>
        <nav aria-label="On this page" onClick={closeOnLink}>
          <ol>
            {sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.text}</a></li>
            ))}
          </ol>
        </nav>
      </details>
    </>
  );
}
