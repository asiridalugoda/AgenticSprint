export const site = {
  name: "The Agentic Sprint",
  domain: "theagenticsprint.com",
  baseUrl: "https://theagenticsprint.com",
  description:
    "The Agentic Sprint: a human-governed operating model for software delivery with autonomous agents. The manifesto, the normative specification, its companion standards and the working templates.",
  version: "0.1",
  author: "Siri Dalugoda",
  authorUrl: "https://dalugoda.com",
  authorGithub: "https://github.com/asiridalugoda",
  scholar: "https://scholar.google.com/citations?user=T6qJcHUAAAAJ&hl=en&oi=ao",
  github: "https://github.com/asiridalugoda/AgenticSprint",
  essayUrl: "https://dalugoda.com/agentic-sprint",
  autonomousLoopUrl: "https://dalugoda.com/autonomous-loop",
  autonomousLoopSource: "https://github.com/asiridalugoda/autonomous-loop",
  seriesCitation: "Dalugoda, Siri. Agentic Sprint Methodology, v0.1. https://theagenticsprint.com/",
} as const;

export const navItems = [
  { label: "Manifesto", href: "/" },
  { label: "Specification", href: "/specification" },
  { label: "Documents", href: "/documents" },
  { label: "Templates", href: "/templates" },
  { label: "About", href: "/about" },
] as const;

export type NavHref = (typeof navItems)[number]["href"];

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${site.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

/** The long form used on the front page and in citations: "11 August 2026". */
export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
