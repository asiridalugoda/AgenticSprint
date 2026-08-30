# theagenticsprint.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the Agentic Sprint methodology at theagenticsprint.com with the manifesto as the front page, every document and template behind it, and the machine surfaces a search engine or retrieval agent needs.

**Architecture:** A static Next.js site. The content pipeline (parser, registry, figure renderers, status and series components) is ported from the dalugoda.com repository; the shell, design system and front page are new. Content files are imported from dalugoda.com by a script that rewrites only paths, images and citation URLs, and can prove parity on demand.

**Tech Stack:** Next.js 16.3.3, React 19.2, TypeScript 5.9, plain CSS, `next/font/google` (Newsreader, IBM Plex Mono), Node 22 test runner, Netlify, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-30-theagenticsprint-site-design.md`

**Source repository for ported code:** `/Users/siri/dalugoda/.claude/worktrees/agent-never-logged-off` (a checkout at dalugoda.com `main`, commit `2af3129` or later). Referred to below as `DALUGODA`.

## Global Constraints

- Next.js `16.3.3`, React `19.2.6`, TypeScript `5.9.3`, Node `>=22.13.0`. No Tailwind.
- No em dash or en dash anywhere in rendered output. British and New Zealand spelling. Enumerations of four or more as bullet lists.
- Content words are never edited. Only `canonical`, `image`, body links under `/agentic-sprint/` and the `citation` URL change, mechanically, at import.
- Every page canonical to `https://theagenticsprint.com`. Title template `%s · The Agentic Sprint`.
- Light theme only. No ambient animation. Motion respects `prefers-reduced-motion`.
- Tokens: paper `#faf9f6`, canvas `#ffffff`, ink `#1a1917`, muted `#5c5955`, faint `#8a867f`, rule `#e3dfd6`, rule-strong `#c9c3b7`, accent `#a0361a`, accent-soft `#f4e5dc`.
- Commit after every task with a message that explains why.

---

### Task 1: Scaffold and tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `netlify.toml`, `.gitignore`, `.nvmrc`, `LICENSE`, `LICENSE-CONTENT.md`, `README.md`, `app/layout.tsx` (minimal), `app/page.tsx` (minimal, replaced in Task 5)

**Interfaces:**
- Produces: `npm run dev|build|build:netlify|start|test|lint` scripts matching dalugoda.com; `next.config.ts` exporting `redirects()` with `{ source: "/manifesto", destination: "/", permanent: true }`.

- [ ] Copy `package.json` from `DALUGODA`, rename to `theagenticsprint`, remove `@tailwindcss/postcss`, `tailwindcss`, `postcss.config.mjs`. Keep `next`, `react`, `react-dom`, `typescript`, `@types/*`, `eslint`, `eslint-config-next`.
- [ ] Copy `tsconfig.json`, `eslint.config.mjs`, `netlify.toml`, `.gitignore` from `DALUGODA`. Write `.nvmrc` containing `22.13.0`.
- [ ] Write `next.config.ts`: `turbopack.root`, `experimental.turbopackFileSystemCacheForBuild: false` (same reason as dalugoda.com), and the `/manifesto` redirect.
- [ ] Write `LICENSE` (Apache 2.0, copyright 2026 Siri Dalugoda) and `LICENSE-CONTENT.md` (CC BY 4.0 for `content/methodology/`, CC0 1.0 for `content/templates/`, with the canonical deed URLs).
- [ ] Write `README.md`: what the site is, `npm ci && npm run dev`, licence summary, `node scripts/import-content.mjs --check <path>` for parity.
- [ ] Run `npm install`. Verify: `npx next --version` prints `16.3.3`.
- [ ] Commit: "Scaffold the site".

### Task 2: Content import and parity

**Files:**
- Create: `scripts/import-content.mjs`, `content/methodology/*.mdx` (13), `content/templates/*.mdx` (9)

**Interfaces:**
- Produces: `rewrite(source: string, kind: "methodology" | "template"): string` (exported for tests), CLI `node scripts/import-content.mjs <dalugoda-root>` (writes) and `--check <dalugoda-root>` (diffs, exit 1 on drift).

Rewrite rules, applied in order, each a plain string or regex replacement:

```js
const rules = [
  [/^canonical: "\/agentic-sprint\/manifesto"$/m, 'canonical: "/"'],
  [/^canonical: "\/agentic-sprint\/templates\/([a-z-]+)"$/m, 'canonical: "/templates/$1"'],
  [/^canonical: "\/agentic-sprint\/([a-z-]+)"$/m, 'canonical: "/$1"'],
  [/^image: "\/social\/(?:methodology|template)-[a-z0-9-]+"$/m, (m, slug) => `image: "/social/${slug}"`], // slug is the file's slug, passed in
  [/\]\(\/agentic-sprint\/manifesto\)/g, "](/)"],
  [/\]\(\/agentic-sprint\/templates\/([a-z-]+)\)/g, "](/templates/$1)"],
  [/\]\(\/agentic-sprint\/([a-z-]+)\)/g, "](/$1)"],
  [/https:\/\/dalugoda\.com\/agentic-sprint\/manifesto/g, "https://theagenticsprint.com/"],
  [/https:\/\/dalugoda\.com\/agentic-sprint\/templates\//g, "https://theagenticsprint.com/templates/"],
  [/https:\/\/dalugoda\.com\/agentic-sprint\//g, "https://theagenticsprint.com/"],
];
```

After rewriting, the script asserts no `](/` link remains whose target is not `/`, `/templates/...` or a known document slug, and fails loudly if one does.

- [ ] Write the script. Run it against `DALUGODA`. Verify: 22 files written; `grep -r "agentic-sprint/" content/` returns nothing; `grep -r "dalugoda.com/agentic" content/` returns nothing; `--check DALUGODA` exits 0.
- [ ] Verify words unchanged: `for f in content/methodology/*.mdx; do diff <(sed -E '/^(canonical|image|citation):/d; s#\]\(/[a-z/-]+\)#](LINK)#g' $f) <(sed -E '/^(canonical|image|citation):/d; s#\]\(/[a-z/-]+\)#](LINK)#g' DALUGODA/$f); done` prints nothing.
- [ ] Commit: "Import the methodology and templates from dalugoda.com".

### Task 3: Engine port

**Files:**
- Create: `lib/site.ts`, `lib/content.ts`, `lib/methodology-figures.ts`, `lib/social.ts`, `app/components/markdown-content.tsx`, `app/components/methodology-figure.tsx`, `app/components/article-figures.tsx`, `app/components/technical-figure.tsx`, `app/components/icons.tsx`

**Interfaces:**
- Produces from `lib/site.ts`: `site` (`name: "The Agentic Sprint"`, `domain`, `baseUrl: "https://theagenticsprint.com"`, `author`, `authorUrl: "https://dalugoda.com"`, `essayUrl: "https://dalugoda.com/agentic-sprint"`, `autonomousLoopUrl`, `github: "https://github.com/asiridalugoda/AgenticSprint"`, `scholar`), `navItems`, `absoluteUrl`, `slugify`, `formatDate`.
- Produces from `lib/content.ts`: `Article` type (as dalugoda minus `featured`, `pinned`, `topics` stays), `articles`, `getAllPublishedDocuments()`, `getMethodologySeries()`, `getTemplateSeries()`, `getDocumentBySlug()`, `getDocumentByPath()`, `getDocumentByDocumentId()`, `getManifesto()` (the article with `documentId === "D11"`), `parseMarkdown`, `extractArticleOutline`, `ContentBlock`.
- `lib/methodology-figures.ts` is copied verbatim.
- `lib/social.ts` keeps `socialImage`, `pageMetadata`, `articleMetadata`, `socialPages`, `SOCIAL_IMAGE_*`; archive pages become home, documents, templates, about.

- [ ] Copy `lib/methodology-figures.ts`, `app/components/methodology-figure.tsx`, `app/components/technical-figure.tsx`, `app/components/icons.tsx` verbatim from `DALUGODA`.
- [ ] Copy `app/components/markdown-content.tsx` verbatim; it depends only on `parseMarkdown`, `ArticleFigure`, `LegacyFlowFigure`, `MethodologyFigure`, `TechnicalFigure`.
- [ ] Copy `app/components/article-figures.tsx`; remove the `delegation-narrowing`, `authority-states`, `continuous-agent-authority` definitions and aliases, and the `AgenticSprintFigures` and `AutonomousLoopFigures` exports.
- [ ] Write `lib/site.ts` fresh. Write `lib/content.ts` from the dalugoda file: `contentSections = ["methodology", "templates"]`, drop `featured`, `pinned`, `getPublishedArticles`, `getFeaturedArticles`, topic helpers; keep the parser and outline unchanged.
- [ ] Write `lib/social.ts` from the dalugoda file with the four archive pages and no topic pages; `articleMetadata` drops the HDP branch.
- [ ] Verify: `npx tsc --noEmit` passes (with the minimal layout and page from Task 1).
- [ ] Commit: "Port the content engine".

### Task 4: Design system, shell and document pages

**Files:**
- Create: `app/globals.css`, `app/layout.tsx` (replace), `app/components/site-shell.tsx`, `site-header.tsx`, `site-footer.tsx`, `nav-links.tsx`, `mobile-nav.tsx`, `document-page.tsx`, `document-status.tsx`, `series-nav.tsx`, `article-outline.tsx`, `reading-instruments.tsx`, `structured-data.tsx`, `app/[slug]/page.tsx`, `app/templates/[slug]/page.tsx`, `app/not-found.tsx`, `public/favicon.svg`

**Interfaces:**
- `DocumentPage({ article, beforeBody?, afterBody? })` renders a document; breadcrumb trail is `Home / Documents / <title>` or `Home / Templates / <title>`.
- `structured-data.tsx` exports `SiteStructuredData`, `DocumentStructuredData({ article })` (TechArticle), `SeriesStructuredData({ documents })`, `CollectionStructuredData`, `BreadcrumbStructuredData`.
- `app/[slug]/page.tsx` sets `dynamicParams = false` and only serves `collection === "methodology"` documents with `documentId !== "D11"` (D11 is the front page).

- [ ] Write `app/globals.css`: tokens, reset (box-sizing, margins, `img{max-width:100%}`, list-style preserved), type scale, shell, article layout, figure chart language (port the `.methodology-*`, `.process-*`, `.responsibility-*`, `.learning-loop`, `.metric-table`, `.maturity-*`, `.legacy-flow`, `.article-visual-*`, `.diagram-*` rules from `DALUGODA/app/globals.css`, recoloured through the tokens), document status, series nav, cite block, references, outline rail, reading progress, mobile nav, responsive breakpoints at 980, 850, 560.
- [ ] Write `app/layout.tsx`: `Newsreader({ subsets:["latin"], style:["normal","italic"], axes:["opsz"], variable:"--font-serif" })`, `IBM_Plex_Mono({ subsets:["latin"], weight:["400","500","600"], variable:"--font-mono" })`, metadata with `metadataBase`, title template, robots, feeds; `<html lang="en-NZ">`; `SiteStructuredData`.
- [ ] Port `article-outline.tsx`, `reading-instruments.tsx`, `mobile-nav.tsx`, `nav-links.tsx` from `DALUGODA` unchanged except nav items.
- [ ] Port `document-status.tsx` and `methodology-series-nav.tsx` (as `series-nav.tsx`) unchanged.
- [ ] Write `document-page.tsx` from `DALUGODA/app/components/article-page.tsx`: remove HDP, LinkedIn, `relatedArticles` for publications; keep `externalLabel` (with the NIST, Microsoft, RFC labels), `ReferenceLinks`, series previous and next, `DocumentStatus`, cite block; add an author line "Siri Dalugoda" linking to `site.authorUrl`.
- [ ] Write `structured-data.tsx` fresh for the new site.
- [ ] Write the two routes and the 404.
- [ ] Verify: `npm run build` passes; `npm start` then `curl` `/specification` shows `class="methodology-figure"`, `/templates/build-plan` shows `Working template`, `/whitepaper` shows `class="process-flow"`.
- [ ] Commit: "Add the design system, shell and document pages".

### Task 5: The front page

**Files:**
- Create: `lib/manifesto.ts`, `app/components/manifesto.tsx`, `app/page.tsx` (replace)

**Interfaces:**
- `lib/manifesto.ts` exports `parseManifesto(body: string): ManifestoSections` where
  ```ts
  type Principle = { number: number; title: string; blocks: ContentBlock[] };
  type ManifestoSections = {
    why: ContentBlock[];            // blocks under "## Why this exists"
    principles: Principle[];        // "### N. Title" groups under "## Principles"
    test: ContentBlock[];           // blocks under "## A compact test"
    status: ContentBlock[];         // blocks under "## Document status and limitations"
    other: { heading: string; blocks: ContentBlock[] }[]; // any unrecognised section, rendered generically
  };
  ```
- `app/components/manifesto.tsx` exports `ManifestoPage({ article })` composing the eight parts in the spec.

- [ ] Write `parseManifesto` by walking `parseMarkdown(body)`; recognise `##` headings case-insensitively by their text; split `### (\d+)\. (.+)` inside Principles.
- [ ] Write the presenter: title block, `why` through `MarkdownContent`-style block rendering, principle rows (`<ol class="principles">`), compact test panel (`<ul class="compact-test">` with `<li>` containing a `<span class="tick" aria-hidden>`), status footnote, read-on rows, cite block reusing `CiteBlock` from `series-nav.tsx` (export it).
- [ ] Write `app/page.tsx` using `articleMetadata(getManifesto())` with `title: { absolute: "Agentic Sprint Manifesto · The Agentic Sprint" }` and `DocumentStructuredData`.
- [ ] Add the print stylesheet to `globals.css` under `@media print`.
- [ ] Verify: `curl /` contains ten `class="principle"` rows, `Automate execution, not accountability`, `A compact test`, and `Cite this document`.
- [ ] Commit: "Publish the manifesto as the front page".

### Task 6: Indexes and About

**Files:**
- Create: `app/components/document-index.tsx`, `app/documents/page.tsx`, `app/templates/page.tsx`, `app/about/page.tsx`

- [ ] Port `methodology-index.tsx` as `document-index.tsx` with `IndexGroup` exported so `/templates` can render the templates group alone.
- [ ] Write `/documents` with `CollectionStructuredData`, `SeriesStructuredData`, the intro, a "Further reading" link to `site.essayUrl`, and the three groups.
- [ ] Write `/templates` with the templates group and the CC0 statement.
- [ ] Write `/about` per the spec's section list. Licence text: "The documents (D1 to D13) are published under CC BY 4.0. The templates (T1 to T9) are dedicated to the public domain under CC0 1.0, so a team may copy them into a repository without attribution. The source code of this site is Apache 2.0."
- [ ] Verify: `/documents` contains `Normative core`, `Informative documents`, `Working templates` and `"CreativeWorkSeries"`; `/about` contains `CC BY 4.0`.
- [ ] Commit: "Add the document indexes and About".

### Task 7: Machine surfaces

**Files:**
- Create: `app/md/[slug]/route.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/rss.xml/route.ts`, `app/atom.xml/route.ts`, `app/social/[slug]/route.tsx`

- [ ] Port each from `DALUGODA`; replace publication wording; sitemap priorities per spec; the social image uses Newsreader and the sienna accent (load the font file through `fetch` of the Google Fonts CSS as dalugoda does, or embed a static TTF under `public/fonts/`).
- [ ] Verify with `curl`: `/md/specification` has `Content-Type: text/markdown` and `X-Robots-Tag: noindex`; `/llms.txt` lists 22 documents; `/sitemap.xml` has 27 URLs (1 home, 12 documents, 9 templates, documents, templates, about, plus none for md); `/robots.txt` names `GPTBot`; `/rss.xml` is valid XML; `/social/specification` is `image/png`.
- [ ] Commit: "Add the machine-readable surfaces".

### Task 8: Tests and CI

**Files:**
- Create: `tests/rendered-html.test.mjs`, `.github/workflows/ci.yml`

- [ ] Write the test file with the harness from `DALUGODA/tests/rendered-html.test.mjs` (port 4178) and these tests: front page principles; every methodology and template route 200 with its title; `/manifesto` 301 to `/`; no `/agentic-sprint/` href on any page; no `Figure definition pending` or `article-visual-unknown`; no em or en dash on a sample of ten pages plus `llms.txt`; machine surfaces; JSON-LD `TechArticle` and `CreativeWorkSeries`; parity script `--check` against `DALUGODA` skipped when the path is absent.
- [ ] Write `ci.yml`: Node 22, `npm ci`, `npm run lint`, `npm test`.
- [ ] Verify: `npm test` passes locally.
- [ ] Commit: "Add rendered-HTML tests and CI".

### Task 9: Visual QA, push, handover

- [ ] Start the production server; screenshot `/`, `/specification`, `/documents`, `/templates/build-plan`, `/about` at 1440 and 390 wide. Fix what is wrong. No horizontal overflow anywhere.
- [ ] Run `npm run lint && npm test` once more.
- [ ] `git push -u origin main`.
- [ ] Report: repository URL, Netlify import steps (New site from Git, build command `npm run build:netlify`, publish `.next`, Node 22.13.0), DNS records (Netlify's apex and `www` targets), and the note that the dalugoda.com removal PR waits for DNS.
