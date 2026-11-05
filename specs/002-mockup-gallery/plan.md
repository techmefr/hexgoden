# Implementation Plan: Mockup Gallery

**Branch**: `002-mockup-gallery` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

## Summary

Seven static, responsive HTML screens sharing one token sheet, a gallery index, design notes and a README with measured validation, deployed to GitHub Pages by a workflow that publishes the gallery under `/mockups/`.

## Technical Context

**Language/Version**: HTML5, CSS (custom properties, grid, `env(safe-area-inset-*)`); validation scripts in Node 24.

**Primary Dependencies**: none at runtime; Playwright (existing browser cache) for overflow checks and screenshots.

**Storage**: N/A

**Testing**: Node contrast script, Playwright overflow and target-size checks, label-length check.

**Target Platform**: modern mobile and desktop browsers; GitHub Pages.

**Project Type**: static design gallery.

**Constraints**: no framework, no build step, relative paths, no literal colours in screen files.

## Constitution Check

- Low-poly pastel identity (VI): respected by tokens and SVG hexagons.
- Responsive (V): content-driven breakpoint at 960 px.
- Modify and observe only (II): species panels have no actions.
- Never failing (I): no failure treatment.
- Gallery scope does not change the game stack (Svelte, Three.js, worker).

## Project Structure

```text
design/
  design.md
  mockups-brief.md
  mockups/
    index.html  01-planet.html ... 07-quiet.html
    tokens.css  reference.png  README.md
    shared.css  (planet, panels and controls shared by screens)
    screenshots/  scripts/mockups/ generates the screens
scripts/
  check-mockups.mjs   (contrast, labels, colours, targets)
  shoot-mockups.mjs   (overflow and screenshots)
.github/workflows/pages.yml
specs/002-mockup-gallery/{spec,plan,tasks}.md
```

## Decisions

- **Breakpoint**: 960 px; below, bottom dock and bottom sheets; above, left rail and right panel.
- **Planet**: one reusable SVG hex-patch pattern per screen, tile colours via `var(--tile-*)`.
- **Shared styles**: `shared.css` for common components; screens keep only their own styles inline.
- **Pages**: workflow copies `design/mockups` into `_site/mockups`; a root redirect page points to it.
