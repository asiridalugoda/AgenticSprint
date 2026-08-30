import { describeMermaid, parseMermaid, type MermaidDiagram, type MermaidFlowchart, type MermaidSequence } from "@/lib/mermaid";

import { FigureFrame } from "./article-figures";

function orderLabel(order: number) {
  return String(order).padStart(2, "0");
}

function ArrowGlyph() {
  return (
    <svg aria-hidden="true" className="methodology-arrow" viewBox="0 0 24 8" width="24" height="8" focusable="false">
      <path d="M0 4h20" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M17 1.4 20.4 4 17 6.6" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Ranks, not a free layout: the nodes are grouped by their distance from a
 * root, which is the part of a flowchart's shape that carries meaning. The
 * edges are listed underneath, because a branch or a join is a relationship
 * the ranks alone cannot show.
 */
function Flowchart({ diagram, instanceId }: { diagram: MermaidFlowchart; instanceId: string }) {
  const depth = Math.max(...diagram.nodes.map((node) => node.level));
  const ranks = Array.from({ length: depth + 1 }, (_, level) => diagram.nodes.filter((node) => node.level === level));
  const label = (id: string) => diagram.nodes.find((node) => node.id === id)?.label ?? id;
  const branching = diagram.edges.length > diagram.nodes.length - 1;

  return (
    <div className="methodology-figure-flow mermaid-flow">
      {ranks.map((nodes, level) => (
        <section aria-label={`Step ${level + 1}`} className="methodology-lane" key={level}>
          <div className="methodology-lane-head">
            <span className="methodology-lane-label">{orderLabel(level + 1)}</span>
          </div>
          <ol className="methodology-node-row">
            {nodes.map((node) => (
              <li className="methodology-node methodology-node-system" key={node.id}>
                <strong className="methodology-node-label">{node.label}</strong>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {branching ? (
        <div className="methodology-edges" role="group" aria-labelledby={`${instanceId}-edges`}>
          <span className="methodology-edges-label" id={`${instanceId}-edges`}>Edges</span>
          <ul className="methodology-edge-list">
            {diagram.edges.map((edge, index) => (
              <li className={`methodology-edge${edge.dashed ? " methodology-edge-feedback" : ""}`} key={`${edge.from}-${edge.to}-${index}`}>
                <span className="methodology-edge-node">{label(edge.from)}</span>
                <span className="methodology-edge-arrow"><span className="sr-only"> leads to </span><ArrowGlyph /></span>
                <span className="methodology-edge-node">{label(edge.to)}</span>
                {edge.label ? <span className="methodology-edge-label">{edge.label}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Sequence({ diagram, instanceId }: { diagram: MermaidSequence; instanceId: string }) {
  const label = (id: string) => diagram.participants.find((participant) => participant.id === id)?.label ?? id;

  return (
    <div className="methodology-figure-flow mermaid-flow">
      <section aria-label="Participants" className="methodology-lane">
        <div className="methodology-lane-head">
          <span className="methodology-lane-label">Participants</span>
        </div>
        <ol className="methodology-node-row">
          {diagram.participants.map((participant) => (
            <li className="methodology-node methodology-node-system" key={participant.id}>
              <strong className="methodology-node-label">{participant.label}</strong>
            </li>
          ))}
        </ol>
      </section>
      <div className="methodology-edges" role="group" aria-labelledby={`${instanceId}-messages`}>
        <span className="methodology-edges-label" id={`${instanceId}-messages`}>Messages, in order</span>
        <ol className="methodology-edge-list methodology-sequence-list">
          {diagram.messages.map((message, index) => (
            <li className={`methodology-edge${message.dashed ? " methodology-edge-feedback" : ""}`} key={index}>
              <span className="methodology-edge-step" aria-hidden="true">{orderLabel(index + 1)}</span>
              <span className="methodology-edge-node">{label(message.from)}</span>
              <span className="methodology-edge-arrow"><span className="sr-only"> sends to </span><ArrowGlyph /></span>
              <span className="methodology-edge-node">{label(message.to)}</span>
              <span className="methodology-edge-label">{message.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Body({ diagram, instanceId }: { diagram: MermaidDiagram; instanceId: string }) {
  return diagram.kind === "sequence"
    ? <Sequence diagram={diagram} instanceId={instanceId} />
    : <Flowchart diagram={diagram} instanceId={instanceId} />;
}

/**
 * Render a Mermaid block as a figure when the source is in the subset the
 * parser understands. Returns undefined otherwise, so the caller can fall back
 * to showing the source.
 */
export function MermaidFigure({ source, instanceId }: { source: string; instanceId: string }) {
  const diagram = parseMermaid(source);
  if (!diagram) return null;

  return (
    <FigureFrame
      caption="Rendered from the diagram source in this document. The source is preserved below for copying into a repository."
      className="methodology-figure methodology-figure-flow"
      description={describeMermaid(diagram)}
      instanceId={instanceId}
      render={() => (
        <>
          <Body diagram={diagram} instanceId={instanceId} />
          <details className="mermaid-source">
            <summary>Diagram source</summary>
            <pre className="diagram-source" data-diagram="mermaid"><code>{source}</code></pre>
          </details>
        </>
      )}
      title={diagram.kind === "sequence" ? "Sequence" : "Flow"}
    />
  );
}

export function canRenderMermaid(source: string) {
  return parseMermaid(source) !== undefined;
}
