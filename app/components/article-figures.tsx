import type { ReactNode } from "react";

type FigureKind =
  | "agentic-sprint-architecture"
  | "learning-loop"
  | "responsibilities"
  | "metrics"
  | "maturity"
  | "autonomous-loop-topology";

type FigureDefinition = {
  title: string;
  caption: string;
  description: string;
  render: () => ReactNode;
};

type FigureFrameProps = FigureDefinition & {
  instanceId: string;
  className?: string;
};

function figureId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "article-figure";
}

export function FigureFrame({ title, caption, description, render, instanceId, className = "" }: FigureFrameProps) {
  const safeInstanceId = figureId(instanceId);
  const titleId = `${safeInstanceId}-title`;
  const descriptionId = `${safeInstanceId}-description`;
  return (
    <figure className={`diagram-figure article-visual-figure ${className}`.trim()} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <div className="article-visual-heading">
        <span className="article-visual-kicker">Conceptual model</span>
        <h3 id={titleId}>{title}</h3>
      </div>
      <p className="sr-only article-visual-description" id={descriptionId}>{description}</p>
      <div className="article-visual-canvas">{render()}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function ProcessStep({ number, label, detail, gate = false }: { number: string; label: string; detail: string; gate?: boolean }) {
  return (
    <li className={`process-step${gate ? " process-step-gate" : ""}`}>
      <span className="process-step-number" aria-hidden="true">{number}</span>
      <div className="process-step-copy">
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
    </li>
  );
}

function AgenticSprintArchitecture() {
  return (
    <div className="process-visual">
      <ol className="process-flow" aria-label="Agentic Sprint delivery stages">
        <ProcessStep number="01" label="Issue or requirement" detail="Jira or GitHub provides the work item." />
        <ProcessStep number="02" label="Context assembly" detail="Requirements, architecture and engineering standards." />
        <ProcessStep number="03" label="Build plan" detail="Scope, dependencies, risk and verification conditions." />
        <ProcessStep number="G1" label="Plan approval" detail="A human approves the design before implementation." gate />
      </ol>
      <div className="process-branch" role="group" aria-label="Parallel implementation and verification">
        <div className="process-branch-heading">Authorised execution</div>
        <div className="process-branch-grid">
          <div className="process-branch-node"><strong>Implementation</strong><span>Maker agents in isolated workspaces.</span></div>
          <div className="process-branch-node"><strong>Verification</strong><span>Tests, contracts and static checks.</span></div>
          <div className="process-branch-node"><strong>Independent review</strong><span>Security and requirements checks.</span></div>
        </div>
      </div>
      <ol className="process-flow process-flow-after" start={5} aria-label="Agentic Sprint acceptance stages">
        <ProcessStep number="G2" label="Engineering review" detail="A human accepts the implementation and its evidence." gate />
        <ProcessStep number="04" label="QA and product assurance" detail="Functional, exploratory and regression testing." />
        <ProcessStep number="G3" label="Release authority" detail="A human decides whether the change can merge and ship." gate />
        <ProcessStep number="05" label="Merge and release" detail="Protected branches and production controls remain in force." />
      </ol>
      <aside className="process-feedback" aria-label="Learning loop">
        <strong>Learning loop</strong>
        <span>Human corrections can become reviewed agent context for future runs.</span>
      </aside>
    </div>
  );
}

function Responsibilities() {
  const agents = ["Repository analysis and planning", "Implementation and repetitive remediation", "Unit, integration and contract tests", "Evidence collection and documentation"];
  const humans = ["Product intent and requirement quality", "Architecture and engineering trade-offs", "Risk acceptance and quality decisions", "Merge, release and production authority"];
  return (
    <div className="responsibility-matrix" role="group" aria-label="Agent and human responsibilities">
      <section className="responsibility-column responsibility-agents">
        <span className="responsibility-role">Machine responsibility</span>
        <h4>Agents execute</h4>
        <ul>{agents.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="responsibility-column responsibility-humans">
        <span className="responsibility-role">Human responsibility</span>
        <h4>People govern</h4>
        <ul>{humans.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </div>
  );
}

function LearningLoop() {
  const steps = [
    ["01", "Agent output", "A run produces an implementation or a finding."],
    ["02", "Human review", "An engineer identifies a correction or a missing rule."],
    ["03", "Context decision", "The team decides whether the lesson is reusable."],
    ["04", "Reviewed update", "A skill, rule, example or test is versioned and reviewed."],
    ["05", "Future run", "Later work starts with better organisational context."],
  ];
  return (
    <div className="learning-loop-visual">
      <ol className="learning-loop" aria-label="Human feedback learning loop">
        {steps.map(([number, label, detail]) => (
          <li key={number}>
            <span className="learning-loop-number">{number}</span>
            <span className="learning-loop-copy"><strong>{label}</strong><span>{detail}</span></span>
          </li>
        ))}
      </ol>
      <p className="visual-callout"><strong>Guardrail:</strong> reusable context may improve future work, but security invariants and release authority remain human-controlled.</p>
    </div>
  );
}

function Metrics() {
  const rows = [
    ["Human intervention minutes", "Lower", "Review effort per accepted change."],
    ["Repeat mistake rate", "Lower", "Whether corrected patterns recur."],
    ["First-pass acceptance", "Higher", "How often work meets the bar without material rework."],
    ["Validated throughput", "Higher", "Accepted work, not raw agent output."],
    ["Escaped defects", "Lower", "Production defects attributable to an agent-created change."],
    ["Quality", "Stable or higher", "A guardrail, never a trade for speed."],
  ];
  return (
    <div className="metric-table-wrap">
      <table className="metric-table">
        <caption className="sr-only">Suggested Agentic Sprint measurement directions</caption>
        <thead><tr><th scope="col">Metric</th><th scope="col">Desired direction</th><th scope="col">What it tells you</th></tr></thead>
        <tbody>{rows.map(([metric, direction, meaning]) => <tr key={metric}><th scope="row">{metric}</th><td>{direction}</td><td>{meaning}</td></tr>)}</tbody>
      </table>
      <p className="visual-footnote">These are proposed measures and directional guardrails, not observed performance data.</p>
    </div>
  );
}

function Maturity() {
  const levels = [
    ["L0", "Human development"],
    ["L1", "AI assisted"],
    ["L2", "Agent delegation"],
    ["L3", "Human-gated sprint"],
    ["L4", "Multi-agent delivery"],
    ["L5", "Learning delivery"],
    ["L6", "High-autonomy engineering"],
  ];
  return (
    <ol className="maturity-ladder" aria-label="Possible Agentic Sprint maturity levels">
      {levels.map(([level, label], index) => (
        <li key={level} className={level === "L3" ? "maturity-current" : undefined}>
          <span className="maturity-level">{level}</span>
          <span className="maturity-label">{label}</span>
          {index < levels.length - 1 ? <span className="maturity-connector" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

function AutonomousLoopTopology() {
  return (
    <div className="autonomous-topology">
      <section className="execution-spine" aria-label="Persistent project spine">
        <span className="topology-label">Persistent state</span>
        <h4>Project spine</h4>
        <ul>
          <li><code>LOOP.md</code></li>
          <li><code>GOALS.md</code></li>
          <li><code>BOARD.md</code></li>
          <li><code>handover.md</code></li>
          <li>Audit artefacts</li>
        </ul>
        <p>State survives interruption, restart and context loss.</p>
      </section>
      <section className="inner-loop" aria-label="Autonomous Loop inner execution loop">
        <span className="topology-label">Execution protocol</span>
        <h4>Inner loop</h4>
        <ol>
          <li><span>01</span><strong>Coordinator</strong><small>Selects the next bounded goal.</small></li>
          <li><span>02</span><strong>Maker</strong><small>Implements against a verification condition.</small></li>
          <li><span>03</span><strong>Independent review</strong><small>Challenges correctness and risk.</small></li>
          <li><span>04</span><strong>Verifier</strong><small>Records evidence or returns a rework hypothesis.</small></li>
        </ol>
        <p className="topology-recovery"><strong>Failure is state.</strong> Record the attempt and next hypothesis; resume from the spine.</p>
      </section>
    </div>
  );
}

const figureDefinitions: Record<FigureKind, Omit<FigureDefinition, "render"> & { render: () => ReactNode }> = {
  "agentic-sprint-architecture": {
    title: "Human-gated Agentic Sprint topology",
    description: "A requirement becomes a plan, crosses a human approval gate, moves through parallel implementation and independent verification, and reaches release only after further human decisions.",
    caption: "A conceptual operating model: agents run the execution loops while humans retain authority at the decision gates.",
    render: AgenticSprintArchitecture,
  },
  responsibilities: {
    title: "Who executes and who governs",
    description: "Agents handle high-volume implementation and verification work. Humans retain authority over intent, architecture, risk, acceptance and release.",
    caption: "The boundary is about authority, not a claim that every task must be performed by one role.",
    render: Responsibilities,
  },
  "learning-loop": {
    title: "The organisational learning loop",
    description: "Human review turns a correction into a decision about reusable context, which is reviewed and made available to future agent runs.",
    caption: "A proposed feedback loop for improving agent context without allowing agents to rewrite security or release controls.",
    render: LearningLoop,
  },
  metrics: {
    title: "Suggested Agentic Sprint measures",
    description: "A table of proposed metric directions: reduce human intervention, repeat mistakes and escaped defects; increase accepted throughput and first-pass acceptance; keep quality stable or higher.",
    caption: "Directional measures only. No observed performance data is implied.",
    render: Metrics,
  },
  maturity: {
    title: "A possible Agentic Sprint maturity ladder",
    description: "Seven conceptual levels move from human development through AI assistance, delegation, human-gated delivery, multi-agent work, learning delivery and high autonomy.",
    caption: "A maturity model, not a target scorecard. Risk profile should determine where an organisation stops.",
    render: Maturity,
  },
  "autonomous-loop-topology": {
    title: "Autonomous Loop execution topology",
    description: "A persistent project spine sits beside an inner loop of coordination, making, independent review and verification. Failed attempts return to recorded state with a new hypothesis.",
    caption: "Autonomous Loop is an execution protocol for bounded, resumable engineering work; it does not grant production authority.",
    render: AutonomousLoopTopology,
  },
};

const aliases: Record<string, FigureKind> = {
  "agentic-sprint": "agentic-sprint-architecture",
  "agentic-sprint-topology": "agentic-sprint-architecture",
  "agentic-sprint-learning-loop": "learning-loop",
  "agentic-sprint-responsibilities": "responsibilities",
  "agentic-sprint-metrics": "metrics",
  "agentic-sprint-maturity": "maturity",
  "autonomous-loop": "autonomous-loop-topology",
  "autonomous-loop-learning-loop": "learning-loop",
};

function resolveFigure(name: string) {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "-");
  return figureDefinitions[normalized as FigureKind] || figureDefinitions[aliases[normalized]];
}

export function ArticleFigure({ name, title, caption, description, instanceId }: { name: string; title?: string; caption?: string; description?: string; instanceId?: string }) {
  const definition = resolveFigure(name);
  if (!definition) {
    const fallbackTitle = title || name.replace(/[-_]+/g, " ");
    return (
      <figure className="diagram-figure article-visual-figure article-visual-unknown" aria-label={fallbackTitle}>
        <div className="article-visual-heading"><span className="article-visual-kicker">Conceptual model</span><h3>{fallbackTitle}</h3></div>
        <p className="article-visual-description">This figure has been named in the article but does not yet have a visual renderer.</p>
        <figcaption>{caption || "Figure definition pending."}</figcaption>
      </figure>
    );
  }
  return <FigureFrame {...definition} title={title || definition.title} caption={caption || definition.caption} description={description || definition.description} instanceId={instanceId || name} />;
}

export function LegacyFlowFigure({ items, title = "Conceptual delivery sequence", description = "A sequence of related engineering stages recovered from the article text.", instanceId = "legacy-flow" }: { items: string[]; title?: string; description?: string; instanceId?: string }) {
  return (
    <FigureFrame
      title={title}
      description={description}
      caption="A semantic rendering of a text flow. It describes sequence, not measured performance."
      instanceId={instanceId}
      render={() => <ol className="legacy-flow" aria-label={description}>{items.map((item, index) => <li key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></li>)}</ol>}
    />
  );
}
