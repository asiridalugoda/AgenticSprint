import { Fragment, type ReactNode } from "react";
import Image from "next/image";

import { parseMarkdown, type ContentBlock } from "@/lib/content";
import { ArticleFigure, LegacyFlowFigure } from "./article-figures";
import { isMethodologyFigureName, MethodologyFigure, normaliseFigureName } from "./methodology-figure";
import { TechnicalFigure } from "./technical-figure";

function safeHref(value: string) {
  const href = value.trim();
  if (/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(href) && !/^javascript:/i.test(href)) return href;
  return undefined;
}

function linkDestination(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("<")) {
    const end = trimmed.indexOf(">");
    return end > 0 ? trimmed.slice(1, end) : trimmed;
  }
  return trimmed.split(/\s+/)[0];
}

function closingMarker(value: string, start: number, marker: string) {
  let cursor = start;
  while (cursor < value.length) {
    const found = value.indexOf(marker, cursor);
    if (found < 0) return -1;
    if (found === 0 || value[found - 1] !== "\\") return found;
    cursor = found + marker.length;
  }
  return -1;
}

function closingLink(value: string, start: number) {
  let depth = 0;
  let quote: string | undefined;
  for (let cursor = start; cursor < value.length; cursor += 1) {
    const character = value[cursor];
    if (quote) {
      if (character === quote && value[cursor - 1] !== "\\") quote = undefined;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") depth += 1;
    if (character === ")") {
      if (depth === 0) return cursor;
      depth -= 1;
    }
  }
  return -1;
}

function inlineContent(text: string, keyPrefix = "inline"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let plain = "";
  const flush = () => {
    if (plain) {
      nodes.push(plain);
      plain = "";
    }
  };
  const key = () => `${keyPrefix}-${nodes.length}`;

  for (let index = 0; index < text.length;) {
    if (text[index] === "\\" && /[\\`*_[\]{}()#+.!~<>|]/.test(text[index + 1] || "")) {
      plain += text[index + 1];
      index += 2;
      continue;
    }

    if (text[index] === "\n") {
      flush();
      nodes.push(<br key={key()} />);
      index += 1;
      continue;
    }

    if (text[index] === "`") {
      const marker = text.startsWith("```", index) ? "```" : "`";
      const end = closingMarker(text, index + marker.length, marker);
      if (end >= 0) {
        flush();
        nodes.push(<code key={key()}>{text.slice(index + marker.length, end)}</code>);
        index = end + marker.length;
        continue;
      }
    }

    if (text[index] === "[" && !text.startsWith("![", index)) {
      const labelEnd = text.indexOf("]", index + 1);
      if (labelEnd > index && text[labelEnd + 1] === "(") {
        const destinationEnd = closingLink(text, labelEnd + 2);
        if (destinationEnd > labelEnd) {
          const label = text.slice(index + 1, labelEnd);
          const href = safeHref(linkDestination(text.slice(labelEnd + 2, destinationEnd)));
          if (href) {
            flush();
            const external = /^https?:\/\//i.test(href);
            nodes.push(
              <a href={href} key={key()} rel={external ? "noreferrer" : undefined} target={external ? "_blank" : undefined}>
                {inlineContent(label, `${keyPrefix}-link`)}
              </a>,
            );
            index = destinationEnd + 1;
            continue;
          }
        }
      }
    }

    if (text[index] === "<") {
      const end = text.indexOf(">", index + 1);
      const candidate = end > index ? text.slice(index + 1, end) : "";
      const href = safeHref(candidate);
      if (href && /^https?:\/\//i.test(href)) {
        flush();
        nodes.push(<a href={href} key={key()} rel="noreferrer" target="_blank">{candidate}</a>);
        index = end + 1;
        continue;
      }
    }

    const strongMarker = text.startsWith("**", index) ? "**" : text.startsWith("__", index) ? "__" : undefined;
    if (strongMarker) {
      const end = closingMarker(text, index + strongMarker.length, strongMarker);
      if (end > index + strongMarker.length) {
        flush();
        nodes.push(<strong key={key()}>{inlineContent(text.slice(index + strongMarker.length, end), `${keyPrefix}-strong`)}</strong>);
        index = end + strongMarker.length;
        continue;
      }
    }

    if (text.startsWith("~~", index)) {
      const end = closingMarker(text, index + 2, "~~");
      if (end > index + 2) {
        flush();
        nodes.push(<del key={key()}>{inlineContent(text.slice(index + 2, end), `${keyPrefix}-strike`)}</del>);
        index = end + 2;
        continue;
      }
    }

    if (text[index] === "*" || text[index] === "_") {
      const marker = text[index];
      const canOpen = marker === "*" || !/[A-Za-z0-9]/.test(text[index - 1] || "");
      const end = canOpen ? closingMarker(text, index + 1, marker) : -1;
      if (end > index + 1 && !/\s/.test(text[index + 1] || "")) {
        flush();
        nodes.push(<em key={key()}>{inlineContent(text.slice(index + 1, end), `${keyPrefix}-em`)}</em>);
        index = end + 1;
        continue;
      }
    }

    plain += text[index];
    index += 1;
  }
  flush();
  return nodes;
}

function Heading({ block }: { block: Extract<ContentBlock, { kind: "heading" }> }) {
  const children = inlineContent(block.text, `heading-${block.id}`);
  if (block.level === 2) return <h2 id={block.id}>{children}</h2>;
  if (block.level === 3) return <h3 id={block.id}>{children}</h3>;
  if (block.level === 4) return <h4 id={block.id}>{children}</h4>;
  if (block.level === 5) return <h5 id={block.id}>{children}</h5>;
  return <h6 id={block.id}>{children}</h6>;
}

function Quote({ block, index }: { block: Extract<ContentBlock, { kind: "quote" }>; index: number }) {
  const paragraphs = block.text.split(/\n{2,}/);
  return (
    <blockquote>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p key={`quote-${index}-${paragraphIndex}`}>{inlineContent(paragraph, `quote-${index}-${paragraphIndex}`)}</p>
      ))}
    </blockquote>
  );
}

function List({ block, index }: { block: Extract<ContentBlock, { kind: "list" }>; index: number }) {
  const items = block.items.map((item, itemIndex) => <li key={`list-${index}-${itemIndex}`}>{inlineContent(item, `list-${index}-${itemIndex}`)}</li>);
  return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
}

function Table({ block, index }: { block: Extract<ContentBlock, { kind: "table" }>; index: number }) {
  return (
    <div className="content-table-scroll" role="region" aria-label={`Table ${index + 1}`} tabIndex={0}>
      <table>
        <caption className="sr-only">Table {index + 1}</caption>
        <thead>
          <tr>
            {block.headers.map((header, cellIndex) => (
              <th key={`table-${index}-head-${cellIndex}`} scope="col" style={{ textAlign: block.alignments[cellIndex] || "left" }}>
                {inlineContent(header, `table-${index}-head-${cellIndex}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`table-${index}-row-${rowIndex}`}>
              {block.headers.map((_, cellIndex) => (
                <td key={`table-${index}-${rowIndex}-${cellIndex}`} style={{ textAlign: block.alignments[cellIndex] || "left" }}>
                  {inlineContent(row[cellIndex] || "", `table-${index}-${rowIndex}-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MermaidCode({ block, index }: { block: Extract<ContentBlock, { kind: "code" }>; index: number }) {
  return (
    <TechnicalFigure caption="Mermaid diagram source. The source is preserved for accessibility and portability.">
      <div className="mermaid-source-label" id={`mermaid-label-${index}`}>Mermaid diagram source</div>
      <pre className="diagram-source" data-diagram="mermaid" aria-labelledby={`mermaid-label-${index}`}>
        <code>{block.text}</code>
      </pre>
    </TechnicalFigure>
  );
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.kind) {
    case "heading": return <Heading key={`heading-${index}`} block={block} />;
    case "quote": return <Quote key={`quote-${index}`} block={block} index={index} />;
    case "list": return <List key={`list-${index}`} block={block} index={index} />;
    case "table": return <Table key={`table-${index}`} block={block} index={index} />;
    case "figure": {
      const figureName = normaliseFigureName(block.name);
      if (isMethodologyFigureName(figureName)) {
        return <MethodologyFigure key={`figure-${index}`} name={figureName} instanceId={`content-figure-${index}-${figureName}`} />;
      }
      return <ArticleFigure key={`figure-${index}`} name={block.name} title={block.title} caption={block.caption} description={block.description} instanceId={`content-figure-${index}`} />;
    }
    case "flow":
      return <LegacyFlowFigure key={`flow-${index}`} items={block.items} title={block.title} description={block.description} instanceId={`content-flow-${index}`} />;
    case "code": return block.language.toLowerCase() === "mermaid" ? <MermaidCode key={`mermaid-${index}`} block={block} index={index} /> : <pre key={`code-${index}`}><code data-language={block.language || undefined}>{block.text}</code></pre>;
    case "image":
      return <TechnicalFigure key={`image-${index}`} caption={block.caption || block.alt}><Image src={block.src} alt={block.alt} width={1200} height={720} unoptimized /></TechnicalFigure>;
    case "rule": return <hr key={`rule-${index}`} />;
    case "paragraph": return <p key={`paragraph-${index}`}>{inlineContent(block.text, `paragraph-${index}`)}</p>;
  }
}

export function MarkdownContent({ source }: { source: string }) {
  return <>{parseMarkdown(source).map(renderBlock)}</>;
}

/** Render blocks that have already been parsed, for presenters that reshape a document. */
export function ContentBlocks({ blocks, keyPrefix = "block" }: { blocks: ContentBlock[]; keyPrefix?: string }) {
  return <>{blocks.map((block, index) => <Fragment key={`${keyPrefix}-${index}`}>{renderBlock(block, index)}</Fragment>)}</>;
}

/** Inline Markdown (emphasis, code, links) for a single run of text. */
export function InlineText({ text, keyPrefix = "inline" }: { text: string; keyPrefix?: string }) {
  return <>{inlineContent(text, keyPrefix)}</>;
}
