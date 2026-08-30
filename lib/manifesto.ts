import { parseMarkdown, type ContentBlock } from "./content";

export type Principle = {
  number: number;
  id: string;
  title: string;
  blocks: ContentBlock[];
};

export type ManifestoSection = {
  heading: string;
  id: string;
  blocks: ContentBlock[];
};

export type Manifesto = {
  why: ContentBlock[];
  principles: Principle[];
  test: ContentBlock[];
  status: ContentBlock[];
  /** Any section the presenter does not recognise, rendered generically so an edit cannot blank the page. */
  other: ManifestoSection[];
};

const recognised = {
  why: /^why this exists$/i,
  principles: /^principles$/i,
  test: /^a compact test$/i,
  status: /^document status and limitations$/i,
};

function sectionsOf(blocks: ContentBlock[]) {
  const sections: ManifestoSection[] = [];
  let current: ManifestoSection | undefined;
  for (const block of blocks) {
    if (block.kind === "heading" && block.level === 2) {
      current = { heading: block.text, id: block.id, blocks: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { heading: "", id: "", blocks: [] };
      sections.push(current);
    }
    current.blocks.push(block);
  }
  return sections;
}

/** "### 3. Intent comes before implementation" becomes principle 3 with that title. */
function principlesOf(blocks: ContentBlock[]) {
  const principles: Principle[] = [];
  let current: Principle | undefined;
  for (const block of blocks) {
    if (block.kind === "heading" && block.level === 3) {
      const match = block.text.match(/^(\d+)\.\s+(.+)$/);
      current = {
        number: match ? Number(match[1]) : principles.length + 1,
        id: block.id,
        title: match ? match[2] : block.text,
        blocks: [],
      };
      principles.push(current);
      continue;
    }
    if (current) current.blocks.push(block);
  }
  return principles;
}

/**
 * Reshape the manifesto's parsed body for the front page. The four sections
 * the presenter knows are matched by heading text; anything else is passed
 * through in `other` for standard rendering.
 */
export function parseManifesto(body: string): Manifesto {
  const manifesto: Manifesto = { why: [], principles: [], test: [], status: [], other: [] };
  for (const section of sectionsOf(parseMarkdown(body))) {
    if (recognised.why.test(section.heading)) manifesto.why = section.blocks;
    else if (recognised.principles.test(section.heading)) manifesto.principles = principlesOf(section.blocks);
    else if (recognised.test.test(section.heading)) manifesto.test = section.blocks;
    else if (recognised.status.test(section.heading)) manifesto.status = section.blocks;
    else manifesto.other.push(section);
  }
  return manifesto;
}
