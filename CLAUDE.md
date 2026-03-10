# mattias.rocks — Claude instructions

## After every git push

After each successful `git push`, fetch the Netlify deploy preview URL from the GitHub commit statuses API and share it with the user:

```bash
COMMIT=$(git rev-parse HEAD)
curl -s "https://api.github.com/repos/fyrkant/mattias.rocks/commits/${COMMIT}/statuses" \
  | python3 -c "
import sys, json
statuses = json.load(sys.stdin)
netlify = [s for s in statuses if 'netlify' in s.get('context','').lower() or 'netlify' in s.get('target_url','').lower()]
if netlify:
    s = netlify[0]
    print(s.get('state'), s.get('target_url'))
else:
    print('No Netlify status found yet')
"
```

The deploy URL looks like: `https://deploy-preview-XX--festive-almeida-150daf.netlify.app`

---

## Codebase overview

Personal blog and portfolio site for Mattias at [mattias.rocks](https://mattias.rocks). Built with [Eleventy (11ty)](https://www.11ty.dev/) and [Vite](https://vite.dev/), deployed to Netlify.

### Tech stack

| Layer | Technology |
|-------|-----------|
| Static site generator | Eleventy (11ty) v3 |
| Templates | Nunjucks (`.njk`) |
| Bundler | Vite v7 (via `@11ty/eleventy-plugin-vite`) |
| Language | TypeScript (type-check only, no emit) |
| Markdown | markdown-it + markdown-it-anchor |
| Date handling | dayjs, luxon |
| Syntax highlighting | @11ty/eleventy-plugin-syntaxhighlight (Prism) |
| RSS | @11ty/eleventy-plugin-rss |
| Formatting | Prettier |
| Node version | 22 (see `.nvmrc`) |
| Hosting | Netlify |

---

## Repository structure

```
mattias.rocks/
├── .eleventy.js          # 11ty configuration (plugins, filters, markdown, pass-through)
├── .prettierrc.js        # Prettier config (150 char width, single quotes, ES5 trailing commas)
├── .nvmrc                # Node version pin (22)
├── tsconfig.json         # TypeScript (strict, ES2020, no emit)
├── package.json          # Scripts and dependencies
│
├── _data/
│   └── site.json         # Site metadata (title, author, feed settings)
│
├── _includes/
│   ├── layout.njk        # Root HTML layout (doctype, head, nav, canvas, footer)
│   └── post.njk          # Blog post layout (wraps layout.njk)
│
├── posts/                # Blog post markdown files
│   ├── *.test.md         # Published posts – visible in dev/preview, hidden in production
│   └── *.draft.md        # Draft posts – always ignored by 11ty
│
├── css/
│   ├── styles.css        # Main stylesheet (CSS variables, light/dark, layout, typography)
│   └── prism.css         # Code syntax highlighting theme
│
├── js/
│   └── mt-fuji.ts        # Interactive Mt. Fuji canvas visualization (TypeScript)
│
├── img/
│   └── favicon/          # Favicon assets (multiple sizes)
│
├── index.njk             # Homepage – lists all posts in reverse-chronological order
├── 404.md                # Custom 404 page
└── skills-lock.json      # Claude agent skills manifest
```

---

## Development workflows

### Commands

```bash
npm run dev      # Start Eleventy dev server with hot reload (eleventy --serve)
npm run build    # Production build: clean _site/, then eleventy
npm run clean    # Remove _site/ directory
npm run debug    # Verbose 11ty debug output (DEBUG=*)
```

The build output goes to `_site/` (gitignored). Never commit `_site/`.

### Adding a blog post

1. Create `posts/my-post-title.test.md` (use `.test.md` while developing; rename to just `.md` when ready to publish to production)
2. Add front matter:

```yaml
---
title: Post Title
date: YYYY-MM-DD HH:MM:SS
tags: post
layout: post
---

Content here...
```

3. Drafts use `.draft.md` suffix and are ignored by `.eleventyignore`.

### Post visibility rules

- `posts/*.draft.md` — Always hidden (listed in `.eleventyignore`)
- `posts/*.test.md` — Hidden in **production** (`NODE_ENV=production`), visible in dev and Netlify previews
- `posts/*.md` (no special suffix) — Always visible in all environments

This logic lives in `.eleventy.js` via `eleventyConfig.ignores`.

---

## Key conventions

### Templates (Nunjucks)

- Use `layout.njk` for all pages. Posts use `post.njk` which extends `layout.njk`.
- Access site metadata via `site` (from `_data/site.json`).
- Available filters:
  - `formatDate` — Human-readable date (e.g. `"March 10, 2026"`) using dayjs
  - `isoDate` — ISO 8601 date string for `<time>` elements and feeds
  - `addHash` — Appends a content hash to asset URLs for cache busting

### CSS

- `css/styles.css` uses **CSS custom properties** (`--var-name`) for all theming.
- **Light/dark mode** is handled via the CSS `light-dark()` function — no JS class toggling.
- Avoid adding inline styles; always use or extend variables in `styles.css`.
- Typography scale and layout use `--size-*` and `--space-*` tokens.

### TypeScript

- TypeScript is **type-check only** — Vite handles transpilation.
- Target is `ES2020` with `DOM` lib; strict mode is on.
- Source lives in `js/` and is passed through directly by 11ty for Vite to process.
- `mt-fuji.ts` is a standalone canvas script — keep it self-contained, do not import external libs.

### Formatting

Prettier is the sole formatter. Config (`.prettierrc.js`):
- Print width: **150**
- Quotes: **single**
- Arrow parens: **always**
- Trailing commas: **ES5**
- Indent: **2 spaces**

Run `npx prettier --write .` to format everything.

---

## Deployment

- **Host:** Netlify, auto-deployed from the `master` branch.
- **Build command:** `npm run build`
- **Publish directory:** `_site`
- **Preview deploys:** Netlify creates preview URLs for every PR/push to non-master branches.
- After any `git push`, run the status-check script at the top of this file to retrieve the Netlify preview URL.

---

## Important notes for AI assistants

- **Do not commit `_site/`** — it is the build output and is gitignored.
- **Do not modify `package-lock.json`** manually; run `npm install` instead.
- **Post files live in `posts/`** — use `.test.md` suffix for anything not ready for production.
- **The Mt. Fuji canvas** (`js/mt-fuji.ts`) is an intentionally self-contained interactive element. Keep it framework-free and dependency-free.
- **No component framework** — this site uses Nunjucks templates, not React/Vue/Svelte. Don't introduce one.
- **CSS-only theming** — light/dark mode uses `light-dark()` and `color-scheme`; do not add JS for theme switching.
- **Cache busting** is handled automatically by the `addHash` filter; don't add manual version query strings.
- Feature branches follow the pattern `claude/<description>-<sessionId>`.
