# CLAUDE.md — AI Assistant Guide for mattias.rocks

This file documents the codebase structure, development workflows, and conventions for AI assistants working in this repository.

---

## Project Overview

**mattias.rocks** is a personal blog/portfolio static website for Mattias Wikström. It is built with [Eleventy (11ty)](https://www.11ty.dev/) v3, uses Nunjucks as its template language, and PostCSS for styling. Content is authored in Markdown with YAML frontmatter.

- **Live URL:** https://mattias.rocks/
- **Deployment:** Netlify (Node.js v22)
- **CMS:** Forestry.io (headless, Markdown-based)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Static Site Generator | Eleventy (`@11ty/eleventy`) v3.1.2 |
| Template Engine | Nunjucks (`.njk`) |
| CSS Processing | PostCSS (`.pcss`) |
| Syntax Highlighting | Prism via `@11ty/eleventy-plugin-syntaxhighlight` |
| RSS Feed | `@11ty/eleventy-plugin-rss` |
| Navigation | `@11ty/eleventy-navigation` |
| Markdown Parser | `markdown-it` + `markdown-it-anchor` |
| Date Utilities | `dayjs`, `luxon` |
| Code Formatter | Prettier |
| Node.js Version | 22 (pinned in `.nvmrc`) |

---

## Repository Structure

```
mattias.rocks/
├── .eleventy.js          # Eleventy config: plugins, filters, passthrough, markdown
├── .eleventyignore       # Excludes draft posts and _site from Eleventy
├── .prettierrc.js        # Prettier formatting config
├── .nvmrc                # Node.js version pin (v22)
├── postcss.config.js     # PostCSS pipeline config
├── package.json          # Scripts and dependencies
├── index.njk             # Homepage template (lists all posts)
├── 404.md                # Custom 404 page
├── _data/
│   └── site.json         # Global site metadata (title, URL, author, feed)
├── _includes/
│   ├── layout.njk        # Base HTML layout (used by all pages)
│   └── post.njk          # Blog post layout
├── css/
│   ├── styles.pcss       # Main stylesheet (PostCSS source)
│   └── prism.pcss        # Syntax highlighting styles
├── img/
│   └── favicon/          # Favicon assets (passed through to _site/)
└── posts/
    └── *.md              # Blog post content (*.draft.md = unpublished)
```

**Build output:** `_site/` — generated, never committed (in `.gitignore`).

---

## Development Workflows

### Start development server

```bash
npm run dev
```

Runs both the PostCSS watcher and Eleventy dev server concurrently. Site is served at `http://localhost:8080`.

### Build for production

```bash
npm run build
```

1. Deletes `_site/`
2. Runs Eleventy (outputs HTML)
3. Runs PostCSS (outputs `_site/styles.min.css`)

### Other useful commands

```bash
npm run watch        # Eleventy file watcher (no dev server)
npm run css          # One-shot PostCSS build
npm run css:watch    # PostCSS watcher only
npm run clean        # Remove _site/ directory
npm run debug        # Eleventy build with full debug logging (DEBUG=*)
```

---

## Content Authoring

### Creating a new blog post

1. Create a Markdown file in `posts/` with the filename `my-post-title.md`.
2. Add YAML frontmatter:

```markdown
---
title: My Post Title
date: 2024-01-15
tags: post
layout: post
---

Post content goes here...
```

3. The `tags: post` field adds the post to Eleventy's `collections.post` collection, making it appear on the homepage.

### Draft posts

Suffix the filename with `.draft.md` (e.g., `my-idea.draft.md`). These files are listed in `.eleventyignore` and will **not** be processed or published.

### Removing a post from listings (without deleting)

Add to frontmatter:

```yaml
eleventyExcludeFromCollections: true
```

### Site-wide metadata

Edit `_data/site.json` to update the site title, description, URL, RSS feed settings, or author information.

---

## Templates & Layouts

Templates are in `_includes/`:

- **`layout.njk`** — Base HTML shell (head, nav, footer). All pages use this.
- **`post.njk`** — Extends `layout.njk`; wraps blog post content with title, date, and back link.

Reference layouts in frontmatter:

```yaml
layout: post      # uses _includes/post.njk
layout: layout    # uses _includes/layout.njk directly
```

---

## Styling (PostCSS)

The main stylesheet is `css/styles.pcss`. It uses:

- `postcss-import` — `@import` support
- `postcss-nested` — CSS nesting (similar to Sass)
- `postcss-each` — `@each` loops
- `postcss-preset-env` — Modern CSS features
- `@fullhuman/postcss-purgecss` — Removes unused CSS (references `_site/**/*.html`)
- `cssnano` — Minification

Output is written to `_site/styles.min.css`.

**CSS variables** are defined at `:root` in `styles.pcss`:

| Variable | Value | Use |
|----------|-------|-----|
| Primary dark | `#1e555c` | Headings, borders (dark mode) |
| Secondary dark | `#ff2e88` | Accents (dark mode) |
| Primary light | `#2332ea` | Headings, borders (light mode) |
| Secondary light | `#fc77b1` | Accents (light mode) |

Typography uses system fonts — no external web fonts are loaded.

---

## Eleventy Configuration (`.eleventy.js`)

Key things configured in `.eleventy.js`:

- **Plugins:** RSS, navigation, syntax highlighting (Prism)
- **Passthrough copy:** `img/` directory is copied as-is to `_site/`
- **`addHash` filter:** Cache-busting Nunjucks filter
  - CSS files: appends `?v=<timestamp>`
  - Other files: appends `?hash=<sha512-first-10-chars>`
- **Markdown:** `markdown-it` with `markdown-it-anchor` for heading permalinks
- **Input/output dirs:** Default Eleventy layout (root input, `_site` output)

---

## Code Style

Prettier is configured in `.prettierrc.js`:

| Setting | Value |
|---------|-------|
| Print width | 150 characters |
| Single quotes | Yes |
| Arrow function parens | Always |
| Trailing commas | ES5 |
| Tab width | 2 spaces |

Run Prettier manually with `npx prettier --write .` if needed. There is no automated lint/format script in `package.json`.

---

## Git Conventions

- **Main branch:** `master`
- **Feature/AI branches:** Use `claude/<description>-<id>` naming pattern
- No GitHub Actions workflows are configured
- Commits are descriptive and scoped

---

## Known Issues / Notes

- **Forestry CMS config** (`.forestry/settings.yml`) references an outdated Docker image (`forestryio/node:12`) and a non-existent script (`npm run develop` — should be `npm run dev`). These do not affect local development or Netlify deployment.
- There are currently **no published posts** — only two drafts (`floor-to-ceiling.draft.md`, `grief-driven-development.draft.md`).
- No test suite is configured. Validate changes by running `npm run build` and checking `_site/` output.
