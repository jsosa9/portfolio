---
title: Migrating 300+ E2E tests from Selenium to Cypress
date: 2026-07-14
noteUrl: https://obsidian.md/
commitUrl: https://github.com/jsosa9/portfolio/commit/0000000
excerpt: Notes on why the Selenium suite was serializing our CI/CD pipeline, and how the Cypress migration unblocked parallel builds.
---

The old Selenium suite ran serially — one big queue, ~40 minutes end to end
before a build could even start deploying. That was the real problem, not
Selenium itself.

Cypress's parallelization model let us split the suite across runners, which
is what actually bought back the time. The migration itself was mostly
mechanical (rewriting locators, replacing implicit waits with Cypress's
retry-ability), but the CI change is what mattered.

Linked commit has the before/after pipeline config if you want the specifics.
