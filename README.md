# theagenticsprint.com

The home of the Agentic Sprint: a human-governed operating model for software delivery with autonomous agents. The site publishes the Agentic Sprint Manifesto as its front page and, behind it, the full methodology: thirteen numbered documents (D1 to D13) and nine working templates (T1 to T9).

The methodology was first published on [dalugoda.com](https://dalugoda.com). This site now owns it. dalugoda.com keeps the [original essay](https://dalugoda.com/agentic-sprint) and the [Autonomous Loop](https://dalugoda.com/autonomous-loop) project record, and points here for the rest.

## Running the site

Requires Node 22.13 or later.

```bash
npm ci
npm run dev
```

`npm run build` produces the production build; `npm test` builds, starts a production server and runs the rendered-HTML tests in `tests/`.

## How the content is organised

- `content/methodology/` holds D1 to D13. Each file carries a document identifier, status, version, normative flag, dependencies and a citation in its frontmatter.
- `content/templates/` holds T1 to T9.
- `lib/methodology-figures.ts` holds the semantic data for the figures the documents embed through the `:::figure <name>` directive.
- Document identifiers are stable. Cite a requirement by its document and identifier, not by a page position.

Machine-readable editions of every document are served at `/md/<slug>`, and the site is indexed for retrieval agents at `/llms.txt` and `/llms-full.txt`.

## Checking parity with the source

The content was imported from a dalugoda.com checkout with only its addresses rewritten. To prove nothing else changed:

```bash
node scripts/import-content.mjs --check /path/to/dalugoda
```

The check exits non-zero if any file in `content/` differs from the rewritten source.

## Licences

- Site source code: Apache License 2.0 (`LICENSE`).
- Documents D1 to D13: CC BY 4.0.
- Templates T1 to T9: CC0 1.0.

See `LICENSE-CONTENT.md` for the details.

## Design

The design decisions are recorded in `docs/superpowers/specs/2026-08-30-theagenticsprint-site-design.md`.
