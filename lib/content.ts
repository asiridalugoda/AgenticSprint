import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "./site";

export type ArticleType = "essay" | "research" | "concept" | "technical" | "field-note" | "opinion" | "project" | "review";

/**
 * Two collections make up the site. The methodology collection is the numbered
 * series D1 to D13; the template collection is T1 to T9. Both are read from
 * disk once, at module load, so a malformed document fails the build rather
 * than shipping a broken route.
 */
export type ArticleCollection = "methodology" | "template";

export type Article = {
  slug: string;
  section: string;
  collection: ArticleCollection;
  path: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  type: ArticleType;
  typeLabel: string;
  topics: string[];
  tags: string[];
  draft: boolean;
  canonical: string;
  image?: string;
  series?: string;
  seriesOrder?: number;
  version?: string;
  status?: string;
  documentId?: string;
  documentKind?: string;
  normative: boolean;
  owner?: string;
  dependsOn: string[];
  claimClasses: string[];
  citation?: string;
  references: string[];
  github?: string;
  externalLinks: string[];
  affiliation?: string;
  body: string;
  readingTime: number;
};

type SourceRecord = { section: string; slug: string; source: string };

type FrontmatterValue = string | number | boolean | string[];

function parseValue(value: string): FrontmatterValue | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  if (trimmed === "true" || trimmed === "false") return trimmed === "true";
  if (trimmed === "[]") return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1).split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  }
  // Unquoted numbers stay numbers so ordering keys such as `seriesOrder` sort
  // numerically. Quoted values keep their quotes at this point, so a version
  // string like "0.1" is never mistaken for a number.
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, "");
}

function parseSource(source: string, record: Omit<SourceRecord, "source">) {
  const normalized = source.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter in ${record.slug}`);

  const frontmatter = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const separator = line.indexOf(":");
      if (separator < 0) return [];
      const key = line.slice(0, separator).trim();
      const value = parseValue(line.slice(separator + 1));
      return value === undefined ? [] : [[key, value]];
    }),
  ) as Record<string, FrontmatterValue>;

  return { frontmatter, body: match[2].trim() };
}

function asString(value: FrontmatterValue | undefined, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function asStringArray(value: FrontmatterValue | undefined) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function asBoolean(value: FrontmatterValue | undefined, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: FrontmatterValue | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/^['"]|['"]$/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function typeLabel(type: ArticleType) {
  const labels: Record<ArticleType, string> = {
    essay: "Essay",
    research: "Research",
    concept: "Concept",
    technical: "Technical",
    "field-note": "Field note",
    opinion: "Opinion",
    project: "Project",
    review: "Review",
  };
  return labels[type];
}

const contentSections = ["methodology", "templates"] as const;

function collectionForSection(section: string): ArticleCollection {
  return section === "templates" ? "template" : "methodology";
}

const sourceRecords: SourceRecord[] = contentSections.flatMap((section) => {
  const directory = join(process.cwd(), "content", section);
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(".mdx"))
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => ({
      section,
      slug: entry.slice(0, -".mdx".length),
      source: readFileSync(join(directory, entry), "utf8"),
    }));
});

export const articles: Article[] = sourceRecords.map(({ section, slug, source }) => {
  const { frontmatter, body } = parseSource(source, { section, slug });
  const type = asString(frontmatter.type, "technical") as ArticleType;
  const canonical = asString(frontmatter.canonical, `/${slug}`);
  return {
    slug,
    section,
    collection: collectionForSection(section),
    path: canonical,
    title: asString(frontmatter.title, slug),
    description: asString(frontmatter.description),
    date: asString(frontmatter.date, "2026-08-11"),
    updated: asString(frontmatter.updated) || undefined,
    type,
    typeLabel: typeLabel(type),
    topics: asStringArray(frontmatter.topics),
    tags: asStringArray(frontmatter.tags),
    draft: asBoolean(frontmatter.draft),
    canonical,
    image: asString(frontmatter.image) || undefined,
    series: asString(frontmatter.series) || undefined,
    seriesOrder: asNumber(frontmatter.seriesOrder),
    version: asString(frontmatter.version) || undefined,
    status: asString(frontmatter.status) || undefined,
    documentId: asString(frontmatter.documentId) || undefined,
    documentKind: asString(frontmatter.documentKind) || undefined,
    normative: asBoolean(frontmatter.normative),
    owner: asString(frontmatter.owner) || undefined,
    dependsOn: asStringArray(frontmatter.dependsOn),
    claimClasses: asStringArray(frontmatter.claimClasses),
    citation: asString(frontmatter.citation) || undefined,
    references: asStringArray(frontmatter.references),
    github: asString(frontmatter.github) || undefined,
    externalLinks: asStringArray(frontmatter.externalLinks),
    affiliation: asString(frontmatter.affiliation) || undefined,
    body,
    readingTime: Math.max(2, Math.ceil(wordCount(body) / 220)),
  };
});

/**
 * Registry integrity is checked once, at module load, so a malformed document
 * fails the build rather than shipping a broken route or a silent duplicate.
 */
function assertRegistryIntegrity(records: Article[]) {
  const seenSlugs = new Map<string, string>();
  const seenPaths = new Map<string, string>();
  for (const article of records) {
    const existingSlug = seenSlugs.get(article.slug);
    if (existingSlug) throw new Error(`Duplicate document slug "${article.slug}" in content/${existingSlug} and content/${article.section}`);
    seenSlugs.set(article.slug, article.section);
    const existingPath = seenPaths.get(article.path);
    if (existingPath) throw new Error(`Duplicate canonical path "${article.path}" in "${existingPath}" and "${article.slug}"`);
    seenPaths.set(article.path, article.slug);
  }

  // Unique publication dates are a stated requirement of the series: the
  // reading order of the series is its date order.
  const seenDates = new Map<string, string>();
  for (const article of records) {
    const existing = seenDates.get(article.date);
    if (existing) throw new Error(`Duplicate series date ${article.date} shared by "${existing}" and "${article.slug}"`);
    seenDates.set(article.date, article.slug);
  }

  const documentIds = new Set(records.map((article) => article.documentId).filter((id): id is string => Boolean(id)));
  for (const article of records) {
    if (!article.documentId) throw new Error(`Document "${article.slug}" has no documentId`);
    for (const dependency of article.dependsOn) {
      if (!documentIds.has(dependency)) throw new Error(`Unresolved dependsOn id "${dependency}" in "${article.slug}"`);
    }
  }

  if (!records.some((article) => article.documentId === "D11" && article.path === "/")) {
    throw new Error("The manifesto (D11) must be published at the front page");
  }
}

assertRegistryIntegrity(articles);

function byDateDescending(a: Article, b: Article) {
  return b.date.localeCompare(a.date);
}

function bySeriesOrder(a: Article, b: Article) {
  return (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER) || a.date.localeCompare(b.date);
}

/** Every published document, newest first. */
export function getAllPublishedDocuments() {
  return articles.filter((article) => !article.draft).sort(byDateDescending);
}

/** D1 to D13 in series order. */
export function getMethodologySeries() {
  return articles.filter((article) => !article.draft && article.collection === "methodology").sort(bySeriesOrder);
}

/** T1 to T9 in series order. */
export function getTemplateSeries() {
  return articles.filter((article) => !article.draft && article.collection === "template").sort(bySeriesOrder);
}

export function getManifesto() {
  const manifesto = articles.find((article) => article.documentId === "D11");
  if (!manifesto) throw new Error("The manifesto (D11) is missing");
  return manifesto;
}

export function getSpecification() {
  const specification = articles.find((article) => article.documentId === "D1");
  if (!specification) throw new Error("The specification (D1) is missing");
  return specification;
}

export function getDocumentBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getDocumentByPath(path: string) {
  return articles.find((article) => article.path === path);
}

export function getDocumentByDocumentId(id: string) {
  return articles.find((article) => article.documentId === id);
}

/** Kept under its dalugoda.com name so ported components compile unchanged. */
export const getArticleByDocumentId = getDocumentByDocumentId;

export type ContentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: number; text: string; id: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "table"; headers: string[]; rows: string[][]; alignments: TableAlignment[] }
  | { kind: "code"; language: string; text: string }
  | { kind: "figure"; name: string; title?: string; caption?: string; description?: string }
  | { kind: "flow"; items: string[]; title?: string; description?: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "rule" };

export type TableAlignment = "left" | "center" | "right" | undefined;

export type HeadingOutlineItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(`{1,3}|\*{1,3}|_{1,3}|~{2})/g, "")
    .replace(/\s+\{#[-\w:]+\}\s*$/, "")
    .trim();
}

/**
 * Return the canonical, URL-safe base slug used by article headings.
 *
 * Keeping this in the content module means a table of contents and the
 * rendered heading can share the same naming rules. Duplicate handling is
 * intentionally left to `parseMarkdown`, since it depends on document order.
 */
export function headingSlug(text: string) {
  const explicit = text.match(/\s+\{#([-\w:]+)\}\s*$/)?.[1];
  return explicit || slugify(stripInlineMarkdown(text)) || "section";
}

function headingId(text: string, usedIds: Map<string, number>) {
  const base = headingSlug(text);
  const count = (usedIds.get(base) || 0) + 1;
  usedIds.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
}

function headingText(text: string) {
  return text.replace(/\s+\{#[-\w:]+\}\s*$/, "").trim();
}

function isFenceStart(line: string) {
  return line.match(/^\s*(`{3,}|~{3,})(.*)$/);
}

function isHeading(line: string) {
  return /^\s*#{1,6}\s+/.test(line);
}

function isListItem(line: string) {
  return line.match(/^\s{0,3}([-*+])\s+(.+)$/) || line.match(/^\s{0,3}(\d+)[.)]\s+(.+)$/);
}

function isBlockQuote(line: string) {
  return /^\s*>/.test(line);
}

function splitTableRow(line: string) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|") && !value.endsWith("\\|")) value = value.slice(0, -1);

  const cells: string[] = [];
  let cell = "";
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  if (escaped) cell += "\\";
  cells.push(cell.trim());
  return cells;
}

function tableAlignment(value: string): TableAlignment {
  const trimmed = value.trim();
  if (!/^:?-{3,}:?$/.test(trimmed)) return undefined;
  if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
  if (trimmed.endsWith(":")) return "right";
  return "left";
}

function isTableDivider(line: string) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function isTableStart(lines: string[], index: number) {
  return index + 1 < lines.length && lines[index].includes("|") && isTableDivider(lines[index + 1]);
}

function parseDirectiveAttributes(value: string) {
  const attributes: Record<string, string> = {};
  const pattern = /(title|caption|description|alt)\s*=\s*("[^"]*"|'[^']*'|[^\s]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value))) attributes[match[1].toLowerCase()] = match[2].replace(/^['"]|['"]$/g, "");
  return attributes;
}

function parseFigureDirective(lines: string[], startIndex: number) {
  const opener = lines[startIndex].trim().match(/^:::\s*figure(?:\s+([\w-]+))?(?:\s+(.*))?$/i);
  if (!opener) return undefined;

  const name = opener[1] || "custom";
  const attributes = parseDirectiveAttributes(opener[2] || "");
  const freeText: string[] = [];
  let index = startIndex + 1;
  while (index < lines.length && lines[index].trim() !== ":::") {
    const line = lines[index].trim();
    const metadata = line.match(/^(title|caption|description|alt)\s*:\s*(.+)$/i);
    if (metadata) attributes[metadata[1].toLowerCase()] = metadata[2].trim();
    else if (line) freeText.push(line);
    index += 1;
  }

  if (!attributes.description && freeText.length) attributes.description = freeText.join(" ");
  if (!attributes.description && attributes.alt) attributes.description = attributes.alt;
  return {
    nextIndex: index < lines.length ? index + 1 : index,
    block: {
      kind: "figure" as const,
      name,
      title: attributes.title,
      caption: attributes.caption,
      description: attributes.description,
    },
  };
}

function isArrow(value: string) {
  return /^[↓↑←→↔]+$/.test(value.trim());
}

function flowParts(value: string) {
  const cleaned = stripInlineMarkdown(value).replace(/^[↓↑←→↔]\s*/, "").trim();
  return cleaned.split(/\s*(?:→|↓|↑|←|↔)\s*/).map((part) => part.trim()).filter(Boolean);
}

function isLegacyFlowBlock(block: ContentBlock) {
  if (block.kind === "heading") return /^human gate\b/i.test(block.text);
  if (block.kind !== "paragraph") return false;
  const value = block.text.trim();
  if (isArrow(value)) return true;
  if (/[→↓↑←↔]/.test(value)) return flowParts(value).length > 1;
  return /^\*\*[^*]+\*\*$/.test(value) || /^__[^_]+__$/.test(value);
}

function coalesceLegacyFlows(blocks: ContentBlock[]) {
  const result: ContentBlock[] = [];
  let index = 0;
  while (index < blocks.length) {
    if (!isLegacyFlowBlock(blocks[index])) {
      result.push(blocks[index]);
      index += 1;
      continue;
    }

    const candidate: ContentBlock[] = [];
    let cursor = index;
    while (cursor < blocks.length && isLegacyFlowBlock(blocks[cursor])) {
      candidate.push(blocks[cursor]);
      cursor += 1;
    }
    const hasArrow = candidate.some((block) => block.kind === "paragraph" && /[→↓↑←↔]/.test(block.text));
    const items = candidate.flatMap((block) => {
      if (block.kind === "heading") return [block.text];
      if (block.kind !== "paragraph" || isArrow(block.text)) return [];
      return flowParts(block.text);
    });
    if (hasArrow && items.length >= 2 && candidate.length >= 2) {
      result.push({ kind: "flow", items });
      index = cursor;
    } else {
      result.push(blocks[index]);
      index += 1;
    }
  }
  return result;
}

export function parseMarkdown(markdown: string): ContentBlock[] {
  const lines = markdown.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  const usedIds = new Map<string, number>();
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) { index += 1; continue; }

    const directive = parseFigureDirective(lines, index);
    if (directive) {
      blocks.push(directive.block);
      index = directive.nextIndex;
      continue;
    }

    const fence = isFenceStart(line);
    if (fence) {
      const marker = fence[1];
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ kind: "code", language: fence[2].trim(), text: codeLines.join("\n") });
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const text = headingText(heading[2]);
      blocks.push({ kind: "heading", level: Math.max(2, Math.min(6, heading[1].length)), text, id: headingId(text, usedIds) });
      index += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) { blocks.push({ kind: "rule" }); index += 1; continue; }

    const image = trimmed.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\)$/);
    if (image) { blocks.push({ kind: "image", src: image[2], alt: image[1], caption: image[3] }); index += 1; continue; }

    if (isTableStart(lines, index)) {
      const headers = splitTableRow(lines[index]);
      const divider = splitTableRow(lines[index + 1]);
      const alignments = headers.map((_, cellIndex) => tableAlignment(divider[cellIndex] || ""));
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim() && lines[index].includes("|") && !isBlockQuote(lines[index]) && !isHeading(lines[index]) && !isFenceStart(lines[index])) {
        const cells = splitTableRow(lines[index]);
        rows.push(headers.map((_, cellIndex) => cells[cellIndex] || ""));
        index += 1;
      }
      blocks.push({ kind: "table", headers, rows, alignments });
      continue;
    }

    if (isBlockQuote(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const quoteLine = lines[index].match(/^\s*>\s?(.*)$/);
        if (!quoteLine) break;
        quoteLines.push(quoteLine[1]);
        index += 1;
      }
      blocks.push({ kind: "quote", text: quoteLines.join("\n") });
      continue;
    }

    const list = isListItem(line);
    if (list) {
      const ordered = Boolean(line.match(/^\s{0,3}\d+[.)]\s+/));
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(ordered ? /^\s{0,3}\d+[.)]\s+(.+)$/ : /^\s{0,3}[-*+]\s+(.+)$/);
        if (item) {
          items.push(item[1].trim());
          index += 1;
          continue;
        }
        if (items.length && lines[index].trim() && /^\s{2,}\S/.test(lines[index])) {
          items[items.length - 1] += `\n${lines[index].trim()}`;
          index += 1;
          continue;
        }
        break;
      }
      blocks.push({ kind: "list", items, ordered });
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index];
      if (isHeading(next) || isFenceStart(next) || isBlockQuote(next) || isListItem(next) || isTableStart(lines, index) || parseFigureDirective(lines, index) || /^\s*!\[/.test(next)) break;
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(next)) break;
      paragraphLines.push(next.trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") });
  }

  return coalesceLegacyFlows(blocks);
}

export function getMarkdownOutline(markdown: string): HeadingOutlineItem[] {
  return parseMarkdown(markdown)
    .filter((block): block is Extract<ContentBlock, { kind: "heading" }> => block.kind === "heading" && (block.level === 2 || block.level === 3))
    .map(({ id, level, text }) => ({ id, level: level === 2 ? 2 : 3, text }));
}

export const extractOutline = getMarkdownOutline;

/** Extract the h2/h3 outline used by the article table of contents. */
export function extractArticleOutline(source: string): HeadingOutlineItem[] {
  return getMarkdownOutline(source);
}
