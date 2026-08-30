/**
 * A parser for the small slice of Mermaid the documents actually use.
 *
 * The site renders its other figures as semantic HTML from data, with no
 * client-side JavaScript, and the diagrams in the templates should read the
 * same way: legible in print, legible to a screen reader, and legible with
 * scripting off. Loading a diagram engine in the browser to draw four
 * flowcharts would undo that.
 *
 * So this understands `flowchart`/`graph` edges and `sequenceDiagram`
 * messages, and nothing else. Anything it does not recognise returns
 * `undefined`, and the caller falls back to showing the source, which is what
 * the site did before. A template is meant to be copied into someone else's
 * repository, so the source stays available either way.
 */

export type MermaidNode = Readonly<{ id: string; label: string; level: number }>;

export type MermaidEdge = Readonly<{ from: string; to: string; label?: string; dashed: boolean }>;

export type MermaidFlowchart = Readonly<{
  kind: "flowchart";
  nodes: readonly MermaidNode[];
  edges: readonly MermaidEdge[];
}>;

export type MermaidParticipant = Readonly<{ id: string; label: string }>;

export type MermaidMessage = Readonly<{ from: string; to: string; text: string; dashed: boolean }>;

export type MermaidSequence = Readonly<{
  kind: "sequence";
  participants: readonly MermaidParticipant[];
  messages: readonly MermaidMessage[];
}>;

export type MermaidDiagram = MermaidFlowchart | MermaidSequence;

/** `A[Text]`, `A(Text)`, `A{Text}` or a bare `A`. */
const NODE = /^([A-Za-z0-9_-]+)(?:\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\})?$/;

/** `-->`, `---`, `-.->`, `==>`, each optionally carrying `|a label|`. */
const EDGE = /^(.*?)\s*(-{2,}>|-\.->|={2,}>|-{3,})\s*(?:\|([^|]*)\|)?\s*(.*)$/;

const PARTICIPANT = /^(?:participant|actor)\s+([A-Za-z0-9_-]+)(?:\s+as\s+(.+))?$/i;

/** `U->>O: text`, `V-->>O: text`, `A->B: text`. */
const MESSAGE = /^([A-Za-z0-9_-]+)\s*(-{1,2}>>?|-{2}>>|--?>>?)\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/;

function meaningfulLines(source: string) {
  return source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("%%"));
}

function readNode(text: string) {
  const match = text.trim().match(NODE);
  if (!match) return undefined;
  const label = match[2] ?? match[3] ?? match[4];
  return { id: match[1], label: (label ?? match[1]).trim().replace(/^["']|["']$/g, "") };
}

/**
 * Depth from the roots, so a renderer can lay the graph out in ranks the way
 * Mermaid would. Nodes in a cycle, or reachable only through one, keep the
 * depth they were first given rather than looping.
 */
function assignLevels(ids: readonly string[], edges: readonly MermaidEdge[]) {
  const level = new Map(ids.map((id) => [id, 0]));
  const targets = new Set(edges.map((edge) => edge.to));
  const queue = ids.filter((id) => !targets.has(id));
  const seen = new Set(queue);

  // Bounded: a rank can never exceed the number of nodes.
  for (let pass = 0; pass < ids.length && queue.length; pass += 1) {
    const current = queue.splice(0, queue.length);
    for (const id of current) {
      for (const edge of edges.filter((candidate) => candidate.from === id)) {
        const next = (level.get(id) ?? 0) + 1;
        if (next > (level.get(edge.to) ?? 0)) level.set(edge.to, next);
        if (!seen.has(edge.to)) {
          seen.add(edge.to);
          queue.push(edge.to);
        }
      }
    }
  }
  return level;
}

function parseFlowchart(lines: readonly string[]): MermaidFlowchart | undefined {
  const labels = new Map<string, string>();
  const order: string[] = [];
  const edges: MermaidEdge[] = [];

  const remember = (node: { id: string; label: string }) => {
    if (!labels.has(node.id)) order.push(node.id);
    // A later mention that carries a label wins over a bare identifier.
    if (!labels.has(node.id) || node.label !== node.id) labels.set(node.id, node.label);
  };

  for (const line of lines) {
    const match = line.match(EDGE);
    if (!match) {
      // A standalone node declaration is legitimate; anything else is not.
      const node = readNode(line);
      if (node) remember(node);
      else if (!/^(subgraph|end|direction|classDef|class|style|linkStyle|click)\b/i.test(line)) return undefined;
      continue;
    }
    const from = readNode(match[1]);
    const to = readNode(match[4]);
    if (!from || !to) return undefined;
    remember(from);
    remember(to);
    edges.push({ from: from.id, to: to.id, label: match[3]?.trim() || undefined, dashed: match[2].includes(".") });
  }

  if (!edges.length) return undefined;
  const level = assignLevels(order, edges);
  return {
    kind: "flowchart",
    nodes: order.map((id) => ({ id, label: labels.get(id) ?? id, level: level.get(id) ?? 0 })),
    edges,
  };
}

function parseSequence(lines: readonly string[]): MermaidSequence | undefined {
  const labels = new Map<string, string>();
  const order: string[] = [];
  const messages: MermaidMessage[] = [];

  const remember = (id: string, label?: string) => {
    if (!labels.has(id)) order.push(id);
    if (label || !labels.has(id)) labels.set(id, label ?? labels.get(id) ?? id);
  };

  for (const line of lines) {
    const participant = line.match(PARTICIPANT);
    if (participant) {
      remember(participant[1], participant[2]?.trim());
      continue;
    }
    const message = line.match(MESSAGE);
    if (message) {
      remember(message[1]);
      remember(message[3]);
      messages.push({ from: message[1], to: message[3], text: message[4].trim(), dashed: message[2].includes("--") });
      continue;
    }
    if (!/^(autonumber|activate|deactivate|note|loop|alt|else|opt|par|end)\b/i.test(line)) return undefined;
    return undefined;
  }

  if (!messages.length) return undefined;
  return { kind: "sequence", participants: order.map((id) => ({ id, label: labels.get(id) ?? id })), messages };
}

export function parseMermaid(source: string): MermaidDiagram | undefined {
  const lines = meaningfulLines(source);
  if (!lines.length) return undefined;
  const [header, ...body] = lines;

  if (/^sequenceDiagram\b/i.test(header)) return parseSequence(body);
  if (/^(flowchart|graph)\b/i.test(header)) return parseFlowchart(body);
  return undefined;
}

/** A sentence describing the diagram, for readers who do not see the layout. */
export function describeMermaid(diagram: MermaidDiagram) {
  if (diagram.kind === "sequence") {
    const names = diagram.participants.map((participant) => participant.label).join(", ");
    const steps = diagram.messages
      .map((message, index) => {
        const from = diagram.participants.find((participant) => participant.id === message.from)?.label ?? message.from;
        const to = diagram.participants.find((participant) => participant.id === message.to)?.label ?? message.to;
        return `${index + 1}. ${from} to ${to}: ${message.text}`;
      })
      .join(" ");
    return `A sequence between ${names}. ${steps}`;
  }

  const label = (id: string) => diagram.nodes.find((node) => node.id === id)?.label ?? id;
  const steps = diagram.edges
    .map((edge) => `${label(edge.from)} leads to ${label(edge.to)}${edge.label ? ` (${edge.label})` : ""}`)
    .join("; ");
  return `A flow of ${diagram.nodes.length} steps. ${steps}.`;
}
