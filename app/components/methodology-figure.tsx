import type { ReactNode } from "react";

import {
  getMethodologyFigure,
  methodologyFigureNames,
  type MethodologyEdge,
  type MethodologyFigure as MethodologyFigureData,
  type MethodologyFigureName,
  type MethodologyLegendItem,
  type MethodologyNode,
} from "@/lib/methodology-figures";

import { FigureFrame } from "./article-figures";

const figureNameSet = new Set<string>(methodologyFigureNames);

/** Directive names are author-written, so normalise before matching. */
export function normaliseFigureName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isMethodologyFigureName(name: string): name is MethodologyFigureName {
  return figureNameSet.has(normaliseFigureName(name));
}

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "methodology-figure";
}

function orderLabel(order: number) {
  return String(order).padStart(2, "0");
}

function byOrder(a: MethodologyNode, b: MethodologyNode) {
  return a.order - b.order;
}

/** The card order carries the primary sequence, so only the exceptions are listed. */
function noteworthyEdges(figure: MethodologyFigureData) {
  return figure.edges.filter((edge) => edge.style !== "normal");
}

const edgeStyleLabels: Record<MethodologyEdge["style"], string> = {
  normal: "Sequence",
  gated: "Gated",
  feedback: "Feedback",
  failure: "Failure",
};

function ArrowGlyph() {
  return (
    <svg aria-hidden="true" className="methodology-arrow" viewBox="0 0 24 8" width="24" height="8" focusable="false">
      <path d="M0 4h20" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M17 1.4 20.4 4 17 6.6" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function NodeCard({ node }: { node: MethodologyNode }) {
  return (
    <li className={`methodology-node methodology-node-${node.role}`}>
      <span className="methodology-node-order" aria-hidden="true">{orderLabel(node.order)}</span>
      {node.role === "risk" ? <span className="methodology-node-tag">Risk</span> : null}
      <strong className="methodology-node-label">{node.label}</strong>
      <span className="methodology-node-detail">{node.detail}</span>
    </li>
  );
}

function NodeRow({ nodes, label }: { nodes: readonly MethodologyNode[]; label: string }) {
  return (
    <ol className="methodology-node-row" aria-label={label}>
      {[...nodes].sort(byOrder).map((node) => <NodeCard key={node.id} node={node} />)}
    </ol>
  );
}

type Band = { key: string; label: string; detail: string; nodes: MethodologyNode[]; order: number };

/**
 * Lanes are the author's grouping, but a few figures leave a node out of every
 * lane. Those fall back to their group so nothing disappears from the diagram.
 */
function flowBands(figure: MethodologyFigureData): Band[] {
  const nodesById = new Map(figure.nodes.map((node) => [node.id, node]));
  const bands: Band[] = [];
  const placed = new Set<string>();

  for (const lane of figure.lanes || []) {
    const nodes = lane.nodeIds.map((id) => nodesById.get(id)).filter((node): node is MethodologyNode => Boolean(node));
    nodes.forEach((node) => placed.add(node.id));
    if (!nodes.length) continue;
    bands.push({ key: lane.id, label: lane.label, detail: lane.detail, nodes, order: Math.min(...nodes.map((node) => node.order)) });
  }

  const leftovers = figure.nodes.filter((node) => !placed.has(node.id));
  for (const node of leftovers) {
    const group = figure.groups?.find((candidate) => candidate.id === node.group);
    const key = group?.id || node.group || node.id;
    const existing = bands.find((band) => band.key === `group-${key}`);
    if (existing) {
      existing.nodes.push(node);
      existing.order = Math.min(existing.order, node.order);
      continue;
    }
    bands.push({
      key: `group-${key}`,
      label: group?.label || "Additional elements",
      detail: group?.detail || "",
      nodes: [node],
      order: node.order,
    });
  }

  return bands.sort((a, b) => a.order - b.order);
}

function boundaryRegions(figure: MethodologyFigureData): Band[] {
  const regions: Band[] = (figure.groups || []).map((group) => ({
    key: group.id,
    label: group.label,
    detail: group.detail,
    nodes: figure.nodes.filter((node) => node.group === group.id),
    order: 0,
  }));
  const known = new Set(regions.map((region) => region.key));
  const orphans = figure.nodes.filter((node) => !node.group || !known.has(node.group));
  if (orphans.length) {
    regions.push({ key: "unbounded", label: "Additional elements", detail: "", nodes: orphans, order: 0 });
  }
  return regions
    .filter((region) => region.nodes.length)
    .map((region) => ({ ...region, order: Math.min(...region.nodes.map((node) => node.order)) }))
    .sort((a, b) => a.order - b.order);
}

function EdgeStrip({ figure, instanceId }: { figure: MethodologyFigureData; instanceId: string }) {
  const edges = noteworthyEdges(figure);
  if (!edges.length) return null;
  const labels = new Map(figure.nodes.map((node) => [node.id, node.label]));
  const headingId = `${instanceId}-edges`;

  return (
    <div className="methodology-edges" role="group" aria-labelledby={headingId}>
      <span className="methodology-edges-label" id={headingId}>Edges</span>
      <ul className="methodology-edge-list">
        {edges.map((edge, index) => (
          <li className={`methodology-edge methodology-edge-${edge.style}`} key={`${edge.from}-${edge.to}-${index}`}>
            <span className="methodology-edge-node">{labels.get(edge.from) || edge.from}</span>
            <span className="methodology-edge-arrow">
              <span className="sr-only"> leads to </span>
              <ArrowGlyph />
            </span>
            <span className="methodology-edge-node">{labels.get(edge.to) || edge.to}</span>
            <span className="methodology-edge-label">{edge.label}</span>
            <span className="methodology-edge-style">{edgeStyleLabels[edge.style]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function swatchClass(item: MethodologyLegendItem) {
  if (item.edgeStyle) return `methodology-swatch-edge-${item.edgeStyle}`;
  if (item.role) return `methodology-swatch-role-${item.role}`;
  return "methodology-swatch-region";
}

function Legend({ items, instanceId }: { items: readonly MethodologyLegendItem[]; instanceId: string }) {
  if (!items.length) return null;
  const headingId = `${instanceId}-legend`;

  /**
   * Some legends name two concepts the figure draws identically, such as a
   * maker and an independent checker that are both agent nodes. Repeating the
   * swatch would claim a distinction the drawing does not make, so a treatment
   * is keyed on its first entry and the later ones keep the label alone. Where
   * every entry shares one treatment the swatches key nothing at all, and the
   * legend reads as the glossary it is.
   */
  const treatments = items.map(swatchClass);
  const glossary = new Set(treatments).size === 1;
  const keys = treatments.map((treatment, index) => !glossary && treatments.indexOf(treatment) === index);

  return (
    <div className="methodology-legend" role="group" aria-labelledby={headingId}>
      <span className="methodology-legend-heading" id={headingId}>Legend</span>
      <ul className="methodology-legend-list">
        {items.map((item, index) => (
          <li key={item.id}>
            <span
              aria-hidden="true"
              className={`methodology-swatch ${keys[index] ? treatments[index] : "methodology-swatch-none"}`}
            />
            <span className="methodology-legend-label">{item.label}</span>
            <span className="methodology-legend-detail">{item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlowBody({ figure, instanceId }: { figure: MethodologyFigureData; instanceId: string }) {
  const bands = figure.lanes?.length ? flowBands(figure) : [];
  return (
    <div className="methodology-figure-flow">
      {bands.length ? (
        bands.map((band) => (
          <section aria-labelledby={`${instanceId}-${safeId(band.key)}`} className="methodology-lane" key={band.key}>
            <div className="methodology-lane-head">
              <span className="methodology-lane-label" id={`${instanceId}-${safeId(band.key)}`}>{band.label}</span>
              {band.detail ? <span className="methodology-lane-detail">{band.detail}</span> : null}
            </div>
            <NodeRow label={band.label} nodes={band.nodes} />
          </section>
        ))
      ) : (
        <NodeRow label={figure.title} nodes={figure.nodes} />
      )}
      <EdgeStrip figure={figure} instanceId={instanceId} />
    </div>
  );
}

function BoundaryBody({ figure, instanceId }: { figure: MethodologyFigureData; instanceId: string }) {
  return (
    <div className="methodology-figure-boundary">
      {boundaryRegions(figure).map((region) => (
        <section aria-labelledby={`${instanceId}-${safeId(region.key)}`} className="methodology-region" key={region.key}>
          <div className="methodology-region-head">
            <span className="methodology-region-label" id={`${instanceId}-${safeId(region.key)}`}>{region.label}</span>
            {region.detail ? <span className="methodology-region-detail">{region.detail}</span> : null}
          </div>
          <NodeRow label={region.label} nodes={region.nodes} />
        </section>
      ))}
      <EdgeStrip figure={figure} instanceId={instanceId} />
    </div>
  );
}

function MatrixBody({ figure, instanceId }: { figure: MethodologyFigureData; instanceId: string }) {
  const matrix = figure.matrix;
  if (!matrix) return null;
  const cells = new Map(matrix.cells.map((cell) => [`${cell.row}::${cell.column}`, cell]));

  return (
    <div aria-label={figure.title} className="methodology-matrix-scroll" role="region" tabIndex={0}>
      <table className="methodology-matrix">
        <caption className="sr-only">{figure.caption}</caption>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Dimension</span></th>
            {matrix.columns.map((column) => (
              <th key={column.id} scope="col">
                <span className="methodology-axis-label">{column.label}</span>
                <span className="methodology-axis-detail">{column.detail}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <span className="methodology-axis-label">{row.label}</span>
                <span className="methodology-axis-detail">{row.detail}</span>
              </th>
              {matrix.columns.map((column) => {
                const cell = cells.get(`${row.id}::${column.id}`);
                return (
                  <td key={`${instanceId}-${row.id}-${column.id}`}>
                    {cell ? (
                      <>
                        <strong className="methodology-cell-label">{cell.label}</strong>
                        <span className="methodology-cell-detail">{cell.detail}</span>
                      </>
                    ) : (
                      <span className="methodology-cell-detail">Not specified.</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressionBody({ figure }: { figure: MethodologyFigureData }) {
  const progression = figure.progression;
  if (!progression) return null;
  const stages = [...progression.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="methodology-figure-progression">
      <ol aria-label={figure.title} className="methodology-ladder">
        {stages.map((stage) => (
          <li key={stage.id}>
            <span className="methodology-ladder-step" aria-hidden="true">{orderLabel(stage.order)}</span>
            <span className="methodology-ladder-label">{stage.label}</span>
            <span className="methodology-ladder-detail">{stage.detail}</span>
          </li>
        ))}
      </ol>
      <p className="methodology-ladder-note">{progression.note}</p>
    </div>
  );
}

function FigureBody({ figure, instanceId }: { figure: MethodologyFigureData; instanceId: string }): ReactNode {
  switch (figure.kind) {
    case "flow": return <FlowBody figure={figure} instanceId={instanceId} />;
    case "boundary": return <BoundaryBody figure={figure} instanceId={instanceId} />;
    case "matrix": return <MatrixBody figure={figure} instanceId={instanceId} />;
    case "progression": return <ProgressionBody figure={figure} />;
  }
}

export function MethodologyFigure({ name, instanceId }: { name: MethodologyFigureName; instanceId?: string }) {
  const figure = getMethodologyFigure(name);
  const scopeId = safeId(instanceId || name);

  return (
    <FigureFrame
      caption={figure.caption}
      className={`methodology-figure methodology-figure-${figure.kind}`}
      description={figure.accessibleDescription}
      instanceId={scopeId}
      render={() => (
        <>
          <FigureBody figure={figure} instanceId={scopeId} />
          <Legend instanceId={scopeId} items={figure.legend || []} />
        </>
      )}
      title={figure.title}
    />
  );
}
