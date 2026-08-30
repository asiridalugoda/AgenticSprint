"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUp } from "./icons";

export function ReadingInstruments() {
  const barRef = useRef<HTMLSpanElement>(null);
  const [atDepth, setAtDepth] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      setAtDepth(window.scrollY > window.innerHeight * 2);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const backToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <div className="reading-progress" aria-hidden="true"><span ref={barRef} /></div>
      <button
        className={atDepth ? "back-to-top is-visible" : "back-to-top"}
        onClick={backToTop}
        type="button"
      >
        Top<ArrowUp />
      </button>
    </>
  );
}
