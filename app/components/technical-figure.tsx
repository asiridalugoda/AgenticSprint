import type { ReactNode } from "react";

export function TechnicalFigure({ children, caption }: { children: ReactNode; caption?: string }) {
  return <figure className="technical-figure">{children}{caption ? <figcaption>{caption}</figcaption> : null}</figure>;
}
