---
title: Grounding NJ's AI Assistant in a 50-page Medicaid Doula knowledge base
date: 2026-10-02
noteUrl: https://obsidian.md/
commitUrl: https://github.com/jsosa9/portfolio/commit/0000000
excerpt: How document-referenced answers work in practice, and where naive chunking fell apart on a real state government PDF.
---

The knowledge base was a single 50+ page PDF with inconsistent heading
levels, which broke naive fixed-size chunking almost immediately — answers
would cite a chunk that split a table in half.

Switching to a structure-aware split (keeping headings and their following
paragraph together) fixed most of it. The remaining edge cases were tables,
which needed to be pulled out and linearized separately before chunking.

More detail — including the actual chunking code — is in the linked note.
