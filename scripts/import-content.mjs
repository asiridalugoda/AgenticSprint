#!/usr/bin/env node
/**
 * Import the Agentic Sprint methodology and templates from a dalugoda.com
 * checkout, or check that content/ still matches that source.
 *
 * The words are never edited. Only the addresses change, because the
 * documents moved house:
 *
 *   canonical  /agentic-sprint/manifesto      ->  /
 *   canonical  /agentic-sprint/templates/x    ->  /templates/x
 *   canonical  /agentic-sprint/x              ->  /x
 *   image      /social/methodology-... etc.   ->  /social/<derived from the new path>
 *   body links ](/agentic-sprint/...)         ->  the same paths as above
 *   citations  https://dalugoda.com/agentic-sprint/...  ->  https://theagenticsprint.com/...
 *
 * Usage:
 *   node scripts/import-content.mjs <dalugoda-root>            write content/
 *   node scripts/import-content.mjs --check <dalugoda-root>    compare, exit 1 on drift
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://theagenticsprint.com";
const OLD_SITE = "https://dalugoda.com";
const ESSAY = `${OLD_SITE}/agentic-sprint`;

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const sections = ["methodology", "templates"];

/** Map an old canonical path to its address on this site. */
export function localPath(oldPath) {
  if (oldPath === "/agentic-sprint/manifesto") return "/";
  const template = oldPath.match(/^\/agentic-sprint\/templates\/([a-z0-9-]+)$/);
  if (template) return `/templates/${template[1]}`;
  const document = oldPath.match(/^\/agentic-sprint\/([a-z0-9-]+)$/);
  if (document) return `/${document[1]}`;
  throw new Error(`Unrecognised canonical path: ${oldPath}`);
}

/** The social image slug is derived from the new path so it cannot collide with a page. */
export function socialSlug(path) {
  if (path === "/") return "manifesto";
  const template = path.match(/^\/templates\/([a-z0-9-]+)$/);
  if (template) return `template-${template[1]}`;
  return path.slice(1);
}

export function rewrite(source) {
  const canonicalLine = source.match(/^canonical:\s*"([^"]+)"$/m);
  if (!canonicalLine) throw new Error("Document has no canonical path");
  const path = localPath(canonicalLine[1]);

  return source
    .replace(/^canonical:\s*"[^"]+"$/m, `canonical: "${path}"`)
    .replace(/^image:\s*"\/social\/[^"]+"$/m, `image: "/social/${socialSlug(path)}"`)
    // Body links, with an optional fragment. Order matters: the manifesto and
    // the templates prefix are matched before the general document rule.
    .replace(/\]\(\/agentic-sprint\/manifesto(#[^)]*)?\)/g, (_, fragment = "") => `](/${fragment})`)
    .replace(/\]\(\/agentic-sprint\/templates\/([a-z0-9-]+)(#[^)]*)?\)/g, (_, slug, fragment = "") => `](/templates/${slug}${fragment})`)
    .replace(/\]\(\/agentic-sprint\/([a-z0-9-]+)(#[^)]*)?\)/g, (_, slug, fragment = "") => `](/${slug}${fragment})`)
    // The introductory essay stays on dalugoda.com.
    .replace(/\]\(\/agentic-sprint(#[^)]*)?\)/g, (_, fragment = "") => `](${ESSAY}${fragment})`)
    // Citation and reference URLs.
    .replace(/https:\/\/dalugoda\.com\/agentic-sprint\/manifesto\b/g, `${SITE}/`)
    .replace(/https:\/\/dalugoda\.com\/agentic-sprint\/templates\//g, `${SITE}/templates/`)
    .replace(/https:\/\/dalugoda\.com\/agentic-sprint\//g, `${SITE}/`);
}

function readSection(root, section) {
  const directory = join(root, "content", section);
  if (!existsSync(directory)) throw new Error(`Missing source directory: ${directory}`);
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(".mdx"))
    .sort()
    .map((entry) => ({ section, name: entry, source: readFileSync(join(directory, entry), "utf8") }));
}

/** Every root-relative link must resolve to a page this site serves. */
function validateLinks(files) {
  const known = new Set(files.map((file) => file.rewritten.match(/^canonical:\s*"([^"]+)"$/m)[1]));
  const problems = [];
  for (const file of files) {
    for (const match of file.rewritten.matchAll(/\]\((\/[^)#\s]*)(?:#[^)]*)?\)/g)) {
      if (!known.has(match[1])) problems.push(`${file.section}/${file.name}: unresolved link ${match[1]}`);
    }
    if (/\/agentic-sprint\b/.test(file.rewritten)) problems.push(`${file.section}/${file.name}: an /agentic-sprint path survived`);
    if (/dalugoda\.com\/agentic-sprint\//.test(file.rewritten)) problems.push(`${file.section}/${file.name}: a dalugoda.com methodology URL survived`);
  }
  return problems;
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const root = args.filter((arg) => arg !== "--check")[0];
  if (!root) {
    console.error("Usage: node scripts/import-content.mjs [--check] <dalugoda-root>");
    process.exit(2);
  }

  const files = sections.flatMap((section) => readSection(root, section)).map((file) => ({ ...file, rewritten: rewrite(file.source) }));
  const problems = validateLinks(files);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }

  if (check) {
    const drift = [];
    for (const file of files) {
      const target = join(repoRoot, "content", file.section, file.name);
      if (!existsSync(target)) drift.push(`missing: content/${file.section}/${file.name}`);
      else if (readFileSync(target, "utf8") !== file.rewritten) drift.push(`differs: content/${file.section}/${file.name}`);
    }
    for (const section of sections) {
      const present = new Set(files.filter((file) => file.section === section).map((file) => file.name));
      for (const entry of readdirSync(join(repoRoot, "content", section)).filter((entry) => entry.endsWith(".mdx"))) {
        if (!present.has(entry)) drift.push(`not in source: content/${section}/${entry}`);
      }
    }
    if (drift.length) {
      console.error(drift.join("\n"));
      process.exit(1);
    }
    console.log(`Parity confirmed for ${files.length} files.`);
    return;
  }

  for (const file of files) {
    const directory = join(repoRoot, "content", file.section);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, file.name), file.rewritten);
  }
  console.log(`Imported ${files.length} files.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
