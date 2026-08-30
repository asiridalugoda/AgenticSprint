# Contributing

The Agentic Sprint is published so it can be read, adopted, adapted and argued with. Disagreement is the most useful contribution: a requirement that survives a serious objection is worth more than one nobody has tested.

This repository holds two different kinds of thing, and they are contributed to differently.

- **The methodology** in `content/methodology/` (D1 to D13) and `content/templates/` (T1 to T9). Changing these changes what the methodology says.
- **The site** that publishes it: everything else.

## Before you start

For anything larger than a typo, open an issue first. It costs you less than a rejected pull request and it lets the discussion happen where other people can find it.

## Contributing to the methodology

Every document carries frontmatter that is load-bearing:

| Field | What it means |
| --- | --- |
| `documentId` | The stable identifier, D1 to D13 or T1 to T9. Never reuse or renumber one. |
| `normative` | Whether the document states requirements. Normative documents use the RFC 2119 keywords. |
| `version` | The document's own version, independent of the series. |
| `status` | Draft specification, security model, working template, and so on. |
| `dependsOn` | The documents this one builds on. The build fails if an identifier does not resolve. |
| `citation` | The preferred citation, printed on the page and in the Markdown edition. |

Some rules follow from that structure:

- **D1 is the normative root.** No other document may contradict or override it. If your change requires D1 to change, say so explicitly; that is a larger change than it looks.
- **An informative document may not add a requirement.** D2, D3, D11, D12, D13 and every template explain, measure or apply the model. If your change adds a MUST to one of them, it belongs in a normative document instead.
- **Changing a requirement is a version change.** Edit `version`, `updated` and the `citation` in the same commit, so a reader can tell which text a citation refers to.
- **Dates are unique across the series.** The registry enforces it: the reading order of the series is its date order.
- **Do not renumber.** People cite by identifier. A new document gets the next free number.

### Editorial rules

The published prose follows a house style, and the tests enforce part of it:

- No em dashes or en dashes anywhere. Use a comma, a colon or a full stop.
- British and New Zealand spelling: authorisation, behaviour, organisation, licence (noun).
- Four or more enumerated items become a bullet list.
- State what is required, what is recommended and what is left open. A document that hides its own uncertainty is worse than one that admits it.

### Figures

Figures are data, not drawings. Add or change one in `lib/methodology-figures.ts` and reference it from a document with `:::figure <name>`. Every figure needs an `accessibleDescription` that conveys the same relationships as the picture, because the Markdown editions at `/md/<slug>` carry the directive rather than the rendered figure. State the figure's substance in the prose as well.

An unresolved figure name fails the test suite rather than rendering a placeholder.

## Contributing to the site

```bash
npm ci
npm run dev
```

Requires Node 22.13 or later. Before opening a pull request:

```bash
npm run lint
npm test
```

`npm test` builds the site, starts a production server and asserts against the rendered HTML: the ten principles on the front page, every document route, the redirects, that every figure resolves, that no em dash reaches a page, and that the machine-readable surfaces are present. It is the same command CI runs.

The site is plain CSS with no Tailwind, and light theme only. Design tokens live at the top of `app/globals.css`; the figure chart language is in `app/figures.css`.

## Pull requests

- One concern per pull request. A typo fix and a change to a requirement are two pull requests.
- Explain **why** in the description, not just what. The commit history is a record of reasoning.
- CI must be green. `main` requires it.
- Say if you used an AI agent to prepare the change. It is not a problem, and this is a methodology about exactly that. It just belongs in the record.

## Reporting a problem in the methodology

The most valuable issues are the ones that say a requirement does not survive contact with a real engineering system. Include:

- The document and identifier, for example "D5, T1-BP-007".
- What you tried and what happened.
- Whether you think the requirement is wrong, unclear, or right but impractical. They need different fixes.

## Licences

By contributing you agree that your contribution is published under the licence of the file you changed:

- Documents in `content/methodology/`: CC BY 4.0.
- Templates in `content/templates/`: CC0 1.0.
- Everything else: Apache 2.0.

See `LICENSE-CONTENT.md`.

## Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Argue with the work, not the person.
