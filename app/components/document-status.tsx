import type { ReactNode } from "react";
import Link from "next/link";

import { getArticleByDocumentId, type Article } from "@/lib/content";

/** Frontmatter records versions as "0.1" or "v0.1"; present one form. */
export function versionLabel(version?: string) {
  if (!version) return undefined;
  const trimmed = version.trim();
  if (!trimmed) return undefined;
  return /^v/i.test(trimmed) ? `v${trimmed.replace(/^v/i, "")}` : `v${trimmed}`;
}

export function normativeLabel(normative: boolean) {
  return normative ? "Normative" : "Informative";
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="document-status-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function DocumentStatus({ article }: { article: Article }) {
  const dependencies = article.dependsOn
    .map((id) => ({ id, document: getArticleByDocumentId(id) }))
    .filter((entry) => Boolean(entry.id));
  const version = versionLabel(article.version);

  return (
    <aside aria-labelledby="document-status-title" className="document-status">
      <h2 className="sr-only" id="document-status-title">Document status</h2>
      <dl className="document-status-list">
        {article.documentId ? <Row label="Document">{article.documentId}</Row> : null}
        {article.status ? <Row label="Status">{article.status}</Row> : null}
        {version ? <Row label="Version">{version}</Row> : null}
        <Row label="Normative status">{normativeLabel(article.normative)}</Row>
        {article.owner ? <Row label="Owner">{article.owner}</Row> : null}
        {dependencies.length ? (
          <Row label="Builds on">
            <ul className="document-status-links">
              {dependencies.map(({ id, document }) => (
                <li key={id}>
                  {document ? (
                    <Link href={document.path}>
                      <span className="document-status-id">{id}</span>
                      {document.title}
                    </Link>
                  ) : (
                    <span className="document-status-id">{id}</span>
                  )}
                </li>
              ))}
            </ul>
          </Row>
        ) : null}
        {article.claimClasses.length ? (
          <Row label="Claim classes">
            <span className="document-status-claims">{article.claimClasses.join(", ")}</span>
          </Row>
        ) : null}
      </dl>
    </aside>
  );
}
