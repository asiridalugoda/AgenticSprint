# theagenticsprint.com: site design

Date: 30 August 2026
Status: approved for implementation
Author: Siri Dalugoda, with Claude Code

## Purpose

theagenticsprint.com is the home of the Agentic Sprint methodology. It publishes the Agentic Sprint Manifesto as its front page and, behind it, the full methodology: thirteen numbered documents (D1 to D13) and nine working templates (T1 to T9). The site is a document of record. It should read as something that could be printed and bound, and it should be as legible to a search engine or a retrieval agent as it is to a person.

The methodology was first published on dalugoda.com. This site takes it over outright. After this site is live, dalugoda.com removes its copies and redirects every old URL here. dalugoda.com keeps two related pieces that are not part of the methodology proper: the original Agentic Sprint essay and the Autonomous Loop project page. Each site references the other.

## Non-goals

- No signatories feature, no comments, no accounts.
- No dark theme. The site is light only, matching the author's rule for dalugoda.com.
- No ambient animation. Motion is limited to navigation state and a reduced-motion-safe fade on the principle rows.
- The introductory essay is not republished here. It stays on dalugoda.com and is linked as the original essay.
- The Autonomous Loop project page stays on dalugoda.com. D4 covers the profile here and links to GitHub.

## Content

### What moves

All 22 files under `content/methodology/` and `content/templates/` in the dalugoda.com repository, about 56,000 words, plus the 14 data-driven figures in `lib/methodology-figures.ts` and the hand-built figures the whitepaper uses.

### How it moves

The words are not edited. Three things are rewritten mechanically because the documents change address:

| In the dalugoda.com files | In this repository |
| --- | --- |
| `canonical: "/agentic-sprint/manifesto"` | `canonical: "/"` |
| `canonical: "/agentic-sprint/<slug>"` | `canonical: "/<slug>"` |
| `canonical: "/agentic-sprint/templates/<slug>"` | `canonical: "/templates/<slug>"` |
| `image: "/social/methodology-<name>"` and `"/social/template-<name>"` | `image: "/social/<slug>"` |
| Body links `](/agentic-sprint/manifesto)`, `](/agentic-sprint/<slug>)`, `](/agentic-sprint/templates/<slug>)` | The same paths as above |
| `citation: "... https://dalugoda.com/agentic-sprint/..."` | `https://theagenticsprint.com/...` |

`scripts/import-content.mjs` performs the rewrite from a dalugoda.com checkout. Run with `--check` it applies the rewrite in memory and diffs against `content/`, so parity can be proved at any time: the only permitted differences are the rewrites above.

Any other root-relative link found in a document is an error at import time, so a future link to a dalugoda.com-only page has to be written as an absolute URL.

### Registry

`lib/content.ts` is ported from dalugoda.com with the publication-only concerns removed (essays, topics, featured and pinned flags, LinkedIn source handling). Two collections remain, `methodology` and `template`, read from their directories at module load. The integrity checks stay: unique slugs, unique dates within the series, every `dependsOn` identifier resolves.

## Information architecture

| Route | Content |
| --- | --- |
| `/` | The Manifesto: D11 rendered as the front page |
| `/manifesto` | 301 to `/` |
| `/specification` | D1 |
| `/reference-architecture`, `/operating-model`, `/autonomous-loop-integration`, `/build-plan-standard`, `/definition-of-ready-and-done`, `/guardrails-and-security`, `/context-governance`, `/quality-and-verification`, `/metrics`, `/implementation-guide`, `/whitepaper` | D2 to D13 |
| `/documents` | The index: normative core, informative documents, working templates |
| `/templates` | The templates index |
| `/templates/<slug>` | T1 to T9 |
| `/about` | Authorship, status, licence, how to cite, how to contribute, relationship to dalugoda.com |
| `/md/<slug>` | Markdown edition of every document |
| `/llms.txt`, `/llms-full.txt` | Retrieval indexes |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/atom.xml` | Crawl and feed surfaces |
| `/social/<slug>` | Generated Open Graph image per page |

Primary navigation: Manifesto, Specification, Documents, Templates, About.

## Pages

### The front page

The page is the document. Composition, top to bottom:

1. Masthead: wordmark and navigation.
2. Title block: "Agentic Sprint Manifesto" at display scale; the description in italic; a monospace status line reading `D11 · v0.1 · 11 August 2026 · Siri Dalugoda`.
3. "Why this exists": the two opening paragraphs at lede size, with their links intact.
4. The ten principles. Each is a full-width row: the numeral in the accent colour in a left gutter, the principle title, the body paragraph, a hairline between rows.
5. "A compact test": the eight questions in a bordered panel with a checkbox glyph per question, followed by the closing paragraph.
6. "Document status and limitations": small, muted, in the flow.
7. Read on: three rows (Specification D1, The documents, The templates) and a link to the original essay on dalugoda.com.
8. Cite this document: the citation string with a copy button.

The presenter walks D11's parsed blocks. It recognises the four `##` sections by heading text and gives each its treatment; the `### N. Title` headings under Principles become the numbered rows. Any section it does not recognise is rendered with the standard article renderer, so an edit to the manifesto cannot leave the page blank.

A print stylesheet sets the manifesto for paper: no navigation, black ink, the principles kept together.

### Document pages

One route component serves D1 to D13 and T1 to T9. Structure, ported from dalugoda.com: breadcrumb; title; description; a monospace meta line with document identifier, status, version, normative or informative, publication date, reading time; the document status list (identifier, status, version, normative status, owner, builds on, claim classes); the body with figures; previous and next in series order; the citation block; sources and attribution. A sticky on-this-page outline sits in the left rail on wide screens and folds into a disclosure on narrow ones.

### Documents index

Title, an introductory paragraph, then three groups: normative core, informative documents, working templates. Each row shows identifier, title, summary, status, version, date and what it builds on. A note explains that identifiers are stable and should be used for citation. A link to the original essay on dalugoda.com sits above the groups as further reading, not as a series member.

### Templates index

The templates group alone, with its own introduction and the licence statement that templates may be copied without attribution.

### About

Written fresh. Sections: what this site is; authorship and ownership (Siri Dalugoda, linking to dalugoda.com); status (v0.1, a proposed methodology, not a claim of consensus); licence; how to cite (the series citation and a pointer to each document's own); how to contribute (the GitHub repository); relationship to dalugoda.com (where the methodology was first published, and where the original essay and Autonomous Loop remain); machine-readable resources.

### Not found

A titled 404 listing the front page, the specification and the documents index.

## Identity

A document of record.

- Paper `#faf9f6`, a barely warm white. Cards and figure canvases on `#ffffff`.
- Ink `#1a1917`. Muted `#5c5955`. Faint `#8a867f`. Rules `#e3dfd6` and `#c9c3b7`.
- One accent, burnt sienna `#a0361a`, with `#f4e5dc` as its soft tint. It reads as red ink on a standard. Gates and normative markers take it. Failure edges and risk nodes in the figures stay in ink, as they do today.
- Type: Newsreader for display and body, with its optical size axis, italic for descriptions; IBM Plex Mono for identifiers, status lines, navigation, labels and code. Both self-hosted through `next/font/google`.
- Measure: manifesto body 64ch, document body 68ch, page frame 1120px.
- Motion: navigation underline on hover and current; the principle rows fade in on first paint, disabled under `prefers-reduced-motion`.

The figure chart language is ported from dalugoda.com and recoloured through the tokens: nodes white on paper, gates in the soft accent with an accent border, regions with a stronger rule, edges as lines.

## Machine surfaces

- Every page declares `rel="canonical"` on theagenticsprint.com.
- Title tags: `Agentic Sprint Manifesto · The Agentic Sprint` on the front page; `<Title> · The Agentic Sprint` elsewhere.
- JSON-LD: `WebSite`; `Person` for the author with `sameAs` to dalugoda.com, GitHub and Google Scholar; `CreativeWorkSeries` on `/documents` listing every document with identifier and position; `TechArticle` on each document with `identifier`, `version`, `isPartOf`, `position`, `citation`, `wordCount`, `timeRequired`; `BreadcrumbList` on every page below the root.
- Sitemap priorities: front page 1.0, specification 0.9, other normative documents 0.8, informative documents 0.7, templates 0.5, about 0.4. Change frequency monthly for the series, weekly for the indexes.
- Robots allows every crawler and names the AI crawlers explicitly, as dalugoda.com does.
- `/md/<slug>` serves the document body as Markdown with a frontmatter block, a `Link: rel="canonical"` header and `X-Robots-Tag: noindex, follow`.
- `/llms.txt` describes the site and lists every document with its identifier, status and normative flag. `/llms-full.txt` repeats that with full descriptions and dependencies.
- Open Graph images are generated per page in the site's identity.

## Repository

- Next.js 16.3.3, React 19, TypeScript, plain CSS. No Tailwind: dalugoda.com used it only for its reset, and that reset caused the list-marker regression.
- `netlify.toml` matching dalugoda.com: `npm run build:netlify`, Node 22.13.0.
- `.github/workflows/ci.yml`: on push and pull request, install, lint, build, run the rendered-HTML tests.
- `tests/rendered-html.test.mjs`: starts `next start` on a spare port and asserts against the rendered pages. Minimum coverage: the ten principles render on `/`; every document and template route returns 200 with its title; `/manifesto` redirects to `/`; no `/agentic-sprint/` href survives anywhere; every figure resolves to a renderer, never the pending fallback; no em or en dash on any page; `/md/`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, feeds and one social image respond correctly; JSON-LD series and article types are present.
- `scripts/import-content.mjs`: the rewrite and parity tool described above.
- Licences: `LICENSE` (Apache 2.0) for the site's source code; `LICENSE-CONTENT.md` stating CC BY 4.0 for `content/methodology/` and CC0 1.0 for `content/templates/`.
- `README.md`: what the site is, how to run it, how content is licensed, how parity with the source is checked.

## Sequencing

1. Build this repository, push to `main`.
2. Import the repository into Netlify; point `theagenticsprint.com` at it.
3. Verify the live site: front page, a normative document, a template, the machine surfaces.
4. Open the dalugoda.com pull request: remove the methodology and template content, routes, figure system, navigation item and home section; add 301 redirects from every old URL to its new address; rewrite the essay's series note and the home page to point here; update the tests. This waits for step 3 because a redirect to an unresolved domain takes the pages offline.

## Open questions carried forward

- Whether the series should later gain a versioned archive (`/v0.1/...`) when v0.2 documents are published. Not needed for v0.1.
- Whether the front page should carry translations. Not in scope.
