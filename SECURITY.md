# Security policy

## Scope

This repository publishes a set of documents and the static site that serves them. It holds no user data, no accounts and no server-side application logic, so the realistic security surface is small:

- The site build and its dependencies.
- The published site at [theagenticsprint.com](https://theagenticsprint.com).
- The repository's own workflows.

## Reporting a vulnerability

Report privately through GitHub's [private vulnerability reporting](https://github.com/asiridalugoda/AgenticSprint/security/advisories/new) on this repository. That keeps the report confidential until there is a fix.

Please do not open a public issue for a vulnerability.

Include what you found, how to reproduce it, and what an attacker could do with it. A proof of concept helps; a working exploit against a third party does not, and should not be included.

You can expect an acknowledgement within a few days. This is a personal project maintained by one person, so please do not expect an enterprise response time. If you have had no reply within two weeks, open a public issue saying only that you are waiting on a private report, with no detail.

## What is not a vulnerability here

- A disagreement with something a document says. That is an issue or a pull request, and it is welcome.
- Missing security headers that a static host sets, unless you can show concrete impact.
- Findings from an automated scanner with no demonstrated impact.

## A note on the subject matter

The Agentic Sprint describes security controls for agentic software delivery. Those documents are a proposed methodology, not a certification, an audit standard, or a guarantee. Applying them does not make a system secure, and this policy makes no claim that it does. If you believe a document recommends something unsafe, that is worth an issue, and it is the kind of correction this project most wants.
