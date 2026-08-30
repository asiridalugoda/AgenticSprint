import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { after, before, test } from "node:test";

const port = 4178;
const baseUrl = `http://127.0.0.1:${port}`;
const root = new URL("..", import.meta.url);
let server;

before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: root,
    stdio: "ignore",
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error("Next.js production server did not start for rendered HTML tests");
});

after(() => {
  server?.kill("SIGTERM");
});

async function render(pathname = "/") {
  return fetch(`${baseUrl}${pathname}`, { headers: { accept: "text/html" } });
}

async function fetchResource(pathname) {
  return fetch(`${baseUrl}${pathname}`);
}

/** Every document's canonical path, read from the content files so the list cannot drift. */
async function documentPaths() {
  const paths = [];
  for (const section of ["methodology", "templates"]) {
    const directory = new URL(`../content/${section}/`, import.meta.url);
    for (const entry of (await readdir(directory)).filter((name) => name.endsWith(".mdx")).sort()) {
      const source = await readFile(new URL(entry, directory), "utf8");
      const canonical = source.match(/^canonical:\s*"([^"]+)"$/m)?.[1];
      const title = source.match(/^title:\s*"([^"]+)"$/m)?.[1];
      const slug = entry.slice(0, -4);
      assert.ok(canonical && title, `${entry} must declare canonical and title`);
      paths.push({ section, slug, canonical, title });
    }
  }
  return paths;
}

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");

test("publishes the manifesto as the front page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>Agentic Sprint Manifesto · The Agentic Sprint<\/title>/);
  assert.match(html, /<h1 class="manifesto-title">Agentic Sprint Manifesto<\/h1>/);
  assert.equal((html.match(/class="principle" id="/g) || []).length, 10, "ten principle rows");
  assert.match(html, /Automate execution, not accountability/);
  assert.match(html, /Measure accepted outcomes, not raw activity/);
  assert.match(html, /id="a-compact-test"/);
  assert.equal((html.match(/class="tick"/g) || []).length, 8, "eight compact-test questions");
  assert.match(html, /Document status and limitations/);
  assert.match(html, /Cite this document/);
  assert.match(html, /"@type":"TechArticle"/);
  assert.match(html, /"identifier":"D11"/);
  assert.match(html, /rel="canonical" href="https:\/\/theagenticsprint\.com\/?"/);
  assert.match(html, /href="https:\/\/dalugoda\.com\/agentic-sprint"/, "links to the original essay");
  assert.doesNotMatch(html, /hero-field|Siri Dalugoda home/);
});

test("serves every document and template at its canonical path", async () => {
  for (const document of await documentPaths()) {
    const response = await render(document.canonical);
    assert.equal(response.status, 200, document.canonical);
    const html = await response.text();
    assert.ok(html.includes(escapeHtml(document.title)) || html.includes(document.title), `${document.canonical} shows its title`);
    if (document.canonical !== "/") {
      assert.match(html, /class="document-status"/, `${document.canonical} shows the document status`);
      assert.match(html, /Cite this document/, `${document.canonical} shows its citation`);
    }
  }
});

test("redirects the manifesto's document address to the front page", async () => {
  const response = await fetch(`${baseUrl}/manifesto`, { redirect: "manual" });
  assert.ok([301, 308].includes(response.status), `unexpected status ${response.status}`);
  assert.match(response.headers.get("location") ?? "", /^(https?:\/\/[^/]+)?\/$/);
});

test("leaves no dalugoda.com methodology address anywhere in the rendered site", async () => {
  const pages = ["/", "/documents", "/templates", "/about", ...(await documentPaths()).map((document) => document.canonical)];
  for (const path of pages) {
    const html = await (await render(path)).text();
    assert.doesNotMatch(html, /href="\/agentic-sprint/, `${path} links to an old /agentic-sprint path`);
    assert.doesNotMatch(html, /dalugoda\.com\/agentic-sprint\//, `${path} cites a dalugoda.com methodology URL`);
  }
});

test("resolves every figure to a renderer", async () => {
  for (const document of (await documentPaths()).filter((entry) => entry.section === "methodology")) {
    const html = await (await render(document.canonical)).text();
    assert.doesNotMatch(html, /article-visual-unknown|Figure definition pending/, `${document.canonical} has an unresolved figure`);
  }
  const whitepaper = await (await render("/whitepaper")).text();
  assert.match(whitepaper, /class="process-flow"/);
  assert.match(whitepaper, /class="maturity-ladder"/);
  const specification = await (await render("/specification")).text();
  assert.match(specification, /methodology-figure-flow|methodology-figure-boundary|methodology-figure-matrix|methodology-figure-progression/);
});

test("renders no em or en dashes on published pages", async () => {
  const paths = ["/", "/specification", "/whitepaper", "/documents", "/templates", "/templates/build-plan", "/about", "/llms.txt", "/llms-full.txt", "/md/agentic-sprint-manifesto"];
  for (const path of paths) {
    const response = await fetchResource(path);
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.doesNotMatch(body, /[—–]/, `${path} contains an em or en dash`);
  }
});

test("publishes the indexes with series structured data", async () => {
  const documents = await (await render("/documents")).text();
  assert.match(documents, /Normative core/);
  assert.match(documents, /Informative documents/);
  assert.match(documents, /Working templates/);
  assert.match(documents, /"@type":"CreativeWorkSeries"/);
  assert.match(documents, /"@type":"CollectionPage"/);
  assert.match(documents, /Builds on (?:<!-- -->)?D1/);

  const templates = await (await render("/templates")).text();
  assert.match(templates, /CC0 1\.0/);
  assert.match(templates, /href="\/templates\/build-plan"/);

  const about = await (await render("/about")).text();
  assert.match(about, /CC BY 4\.0/);
  assert.match(about, /Apache 2\.0/);
  assert.match(about, /Relationship to dalugoda\.com/);
});

test("serves Markdown editions with canonical headers and no indexing", async () => {
  const response = await fetchResource("/md/agentic-sprint-specification-v0-1");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/markdown\b/i);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.match(response.headers.get("link") ?? "", /<https:\/\/theagenticsprint\.com\/specification>; rel="canonical"/);
  const body = await response.text();
  assert.match(body, /^---\ntitle: "Agentic Sprint Specification v0\.1"/);
  assert.match(body, /documentId: "D1"/);
  assert.match(body, /licence: "CC-BY-4\.0"/);
  assert.match(body, /## Attribution and licence/);

  const missing = await fetchResource("/md/not-a-document");
  assert.equal(missing.status, 404);
});

test("publishes crawl and retrieval resources", async () => {
  const [robots, sitemap, llms, full, rss, atom] = await Promise.all([
    fetchResource("/robots.txt"),
    fetchResource("/sitemap.xml"),
    fetchResource("/llms.txt"),
    fetchResource("/llms-full.txt"),
    fetchResource("/rss.xml"),
    fetchResource("/atom.xml"),
  ]);
  for (const response of [robots, sitemap, llms, full, rss, atom]) assert.equal(response.status, 200);

  const robotsText = await robots.text();
  assert.match(robotsText, /User-Agent: GPTBot/i);
  assert.match(robotsText, /Sitemap: https:\/\/theagenticsprint\.com\/sitemap\.xml/);

  const sitemapText = await sitemap.text();
  assert.match(sitemapText, /<loc>https:\/\/theagenticsprint\.com\/<\/loc>/);
  assert.match(sitemapText, /<loc>https:\/\/theagenticsprint\.com\/specification<\/loc>/);
  assert.match(sitemapText, /<loc>https:\/\/theagenticsprint\.com\/templates\/build-plan<\/loc>/);
  assert.doesNotMatch(sitemapText, /\/md\//);
  assert.doesNotMatch(sitemapText, /\/manifesto</);
  assert.equal((sitemapText.match(/<url>/g) || []).length, 4 + 21, "front page, three indexes, twelve documents and nine templates");

  const llmsText = await llms.text();
  assert.match(llmsText, /^# theagenticsprint\.com/);
  assert.match(llmsText, /\(D1, Draft specification, normative\)/);
  assert.match(llmsText, /\(T9, Working template, informative\)/);
  assert.match(llmsText, /https:\/\/dalugoda\.com\/agentic-sprint\)/, "points at the original essay");

  const fullText = await full.text();
  assert.match(fullText, /## Methodology documents \(13\)/);
  assert.match(fullText, /## Working templates \(9\)/);

  assert.match(await rss.text(), /<title>D1: Agentic Sprint Specification v0\.1<\/title>/);
  assert.match(await atom.text(), /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
});

test("serves page-specific social images and exposes them in metadata", async () => {
  const [manifestoImage, documentImage, templateImage, home, document] = await Promise.all([
    fetchResource("/social/manifesto"),
    fetchResource("/social/specification"),
    fetchResource("/social/template-build-plan"),
    render("/"),
    render("/specification"),
  ]);
  assert.equal(manifestoImage.status, 200);
  assert.equal(documentImage.status, 200);
  assert.equal(templateImage.status, 200);
  assert.match(manifestoImage.headers.get("content-type") ?? "", /^image\/png/);

  assert.match(await home.text(), /property="og:image" content="https:\/\/theagenticsprint\.com\/social\/manifesto"/);
  assert.match(await document.text(), /property="og:image" content="https:\/\/theagenticsprint\.com\/social\/specification"/);
});

test("keeps the stylesheet guards that the rendered HTML cannot show", async () => {
  const [responsive, figures, globals] = await Promise.all([
    readFile(new URL("../app/responsive.css", import.meta.url), "utf8"),
    readFile(new URL("../app/figures.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  // The mobile panel is a grid; without this rule the hidden attribute loses and the menu is always open.
  assert.match(responsive, /\.mobile-nav-links\[hidden\] \{ display: none; \}/);
  // The hand-built figure lists sit inside .article-body, whose list rules outrank a bare class.
  assert.match(figures, /\.article-body ol\.process-flow[^{]*\{ list-style: none; \}/);
  // Document lists keep their markers: the reset must not strip them.
  assert.match(globals, /\.article-body ul \{ list-style-type: disc; \}/);
  assert.match(globals, /\.article-body ol \{ list-style-type: decimal; \}/);
  assert.doesNotMatch(globals, /prefers-color-scheme:\s*dark/);
});

test("serves a titled 404 for unknown documents", async () => {
  const missing = await render("/this-document-does-not-exist");
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /<title>Page not found · The Agentic Sprint<\/title>/);
});

test("keeps parity with the dalugoda.com source when a checkout is available", { skip: !existsSync(process.env.DALUGODA_ROOT ?? "") && "DALUGODA_ROOT is not set" }, () => {
  const result = spawnSync(process.execPath, ["scripts/import-content.mjs", "--check", process.env.DALUGODA_ROOT], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
