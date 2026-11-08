# pamuk

*Pamuk* (Turkish for "cotton"): soft to read, carefully made.

A fully static blog starter built with **SvelteKit 3** and typed Markdown content,
with structured data for search engines. Readers get plain HTML and CSS with no
client-side JavaScript, apart from optional analytics and the search page.

> **Status:** proposal. The design below is planned, not implemented.

pamuk is two things in one repository:

- **A starter** (MIT): clone it, edit `sites/demo`, deploy the `build/` folder anywhere.
- **A real blog built on it**: [blog.sapere-aude.ru](https://blog.sapere-aude.ru),
  a technical blog with occasional book posts, built from exactly the same code.

The code is never duplicated: each site is just content plus a config file.

---

## Stack

| Area            | Choice                                                         |
|-----------------|----------------------------------------------------------------|
| Framework       | SvelteKit 3, Svelte 5, `@sveltejs/adapter-static`              |
| Runtime         | Node 24 LTS (SvelteKit 3 needs ≥ 22.17), Vite 8, TypeScript 6  |
| Content         | content-collections + Zod schemas → typed `allPosts`, `allAuthors`, `allPages` |
| Markdown        | unified: remark-gfm, remark-directive, rehype-slug, rehype-autolink-headings |
| Code blocks     | Shiki (build time, light and dark themes, no runtime JS)       |
| Styling         | Tailwind CSS 4 with `@tailwindcss/typography`, dark mode from the start |
| Structured data | `schema-dts` types for JSON-LD                                 |
| Search          | Pagefind (indexes the build output, no server)                 |
| OG images       | satori + resvg, prerendered at build time                      |
| Analytics       | optional: GoatCounter (self-hosted, cookieless)                |

## Features (MVP)

- Posts, authors and pages in Markdown with typed, validated frontmatter
- Tags and categories declared in each site's config; **the build fails on unknown
  tags, categories or authors, and on duplicate slugs**
- Book posts: optional `book` frontmatter renders a book card and adds `Book` JSON-LD
- Discussion links: optional `discussion` frontmatter links a post to a forum thread
  (also published as schema.org `discussionUrl`)
- Drafts (`draft: true`): visible in dev, excluded from production builds
- Pagination for the home page and tag/category listings
- RSS (`/rss.xml`), `sitemap.xml`, `robots.txt`, a 404 page
- Canonical URLs, OpenGraph and Twitter metadata, per-post OG images
- JSON-LD: `BlogPosting`, `Person`, `WebSite`, `BreadcrumbList`, `Book`, escaped safely
- Search page (Pagefind)
- No JavaScript on content pages (`csr = false`); a small script adds copy buttons
  to code blocks

## Repository layout

    .
    ├── src/
    │   ├── routes/            # pages, RSS, sitemap, OG images
    │   └── lib/               # components, SEO, Markdown pipeline (#lib)
    ├── sites/
    │   ├── demo/              # what you get when you clone the starter (MIT)
    │   │   ├── site.config.ts # URL, title, language, tags, categories, nav, analytics
    │   │   ├── content/
    │   │   │   ├── posts/     # one flat folder, file name = slug
    │   │   │   ├── authors/
    │   │   │   └── pages/     # about, privacy (template)
    │   │   └── static/        # favicon, default OG image, post images
    │   └── blog.sapere-aude.ru/   # the author's blog, same shape
    │       └── LICENSE            # all rights reserved (not MIT)
    ├── deploy/
    │   ├── xenia.conf.js      # example web server config (Nginx and Caddy alternatives too)
    │   └── goatcounter.service
    ├── scripts/
    │   ├── prepare-site.ts    # copies sites/$SITE/static → static/ (git-ignored)
    │   └── deploy.sh          # rsync to releases/<commit>/, switch the `current` symlink
    ├── content-collections.ts
    ├── vite.config.ts         # SvelteKit config; SITE selects the site
    ├── LICENSE                # MIT, covers the code and sites/demo
    └── package.json

### How the site switch works

`SITE` (default `demo`) is read in `vite.config.ts` and `content-collections.ts`:

- `#site` resolves to `sites/$SITE` (Vite `resolve.alias`; tsconfig maps it to
  `sites/demo` for types, since all sites share one shape)
- content collections read from `sites/$SITE/content/**`
- `scripts/prepare-site.ts` copies `sites/$SITE/static` into `static/` before dev and build

## Content model

### Post (`content/posts/<slug>.md`)

```ts
const Post = z.object({
  title:        z.string(),
  description:  z.string().max(200),
  date:         z.string().date(),               // YYYY-MM-DD, shown without timezone shifts
  updated:      z.string().date().optional(),
  author:       z.string(),                      // author slug, checked against authors/
  category:     z.string(),                      // checked against site.config categories
  tags:         z.array(z.string()).default([]), // checked against site.config tags
  image:        z.string().optional(),           // path under the site's static/
  draft:        z.boolean().default(false),
  canonical:    z.string().url().optional(),     // for cross-posted articles
  discussion:   z.string().url().optional(),     // forum thread for this post
  book: z.object({
    title:  z.string(),
    author: z.string(),
    year:   z.number().int().optional(),
    isbn:   z.string().optional(),
    cover:  z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
  }).optional(),
})
// computed: slug (file name), url, readingTime, html (unified + Shiki), headings (for the TOC)
```

### Author (`content/authors/<slug>.md`)

Frontmatter: `name`, `avatar?`, `links?` (url list). The Markdown body is the bio.

### Page (`content/pages/<slug>.md`)

Frontmatter: `title`, `description`. Used for `/about` and `/privacy`.

### Tags and categories

Declared in `site.config.ts` with a slug, a display name and an optional
description. URL slugs are lowercase ASCII, so every tag has exactly one URL.

### Example post

```md
---
title: "Hello World"
description: "First post on pamuk"
date: "2026-04-13"
author: "jane"
category: "tech"
tags: ["svelte"]
discussion: "https://forum.example.com/…"
---

Some **Markdown**.

:::note
Directives render as styled callouts.
:::
```

## Site configuration

```ts
// sites/demo/site.config.ts
export default defineSite({
  url: "https://example.com",
  title: "pamuk demo",
  language: "en",
  categories: [{ slug: "tech", name: "Tech" }, { slug: "books", name: "Books" }],
  tags: [{ slug: "svelte", name: "Svelte" }],
  analytics: { provider: "none" },  // or { provider: "goatcounter", endpoint: "https://stats.example.com/count" }
})
```

## Routes

| Route                                    | Content                       |
|------------------------------------------|-------------------------------|
| `/`, `/page/[n]/`                        | latest posts                  |
| `/posts/[slug]/`                         | post                          |
| `/tags/[tag]/`, `…/page/[n]/`            | posts by tag                  |
| `/categories/[category]/`, `…/page/[n]/` | posts by category             |
| `/authors/[slug]/`                       | author and their posts        |
| `/about/`, `/privacy/`                   | pages from `content/pages`    |
| `/search/`                               | Pagefind                      |
| `/rss.xml`, `/sitemap.xml`, `/robots.txt`| feeds and indexing            |
| `/og/[slug].png`                         | generated OG images           |

Every route is prerendered (`trailingSlash: 'always'`, so each page becomes
`…/index.html` and works on any static host).

## Development

```bash
npm install
npm run dev                            # demo site
SITE=blog.sapere-aude.ru npm run dev   # another site
npm run check                          # svelte-check + content validation
npm run build                          # → build/ (then Pagefind indexes it)
npm run preview
```

## Use it as a starter

1. Clone the repository and **delete `sites/blog.sapere-aude.ru`**: its content
   is not MIT-licensed (see License).
2. Edit `sites/demo/site.config.ts` and replace the content in `sites/demo/content`
   (or copy `sites/demo` to `sites/<your-site>` and set `SITE`).
3. Rewrite `sites/demo/content/pages/privacy.md` to match your analytics setup,
   or delete it if you use none.
4. `npm run build` and upload `build/` to any static host.

## Deployment

The build runs in CI (or locally), never on the server.

- **Demo site** → GitHub Pages, built with `paths.base = "/pamuk"`.
- **Any VPS** → upload `build/` and serve it with a static web server. The
  example config `deploy/xenia.conf.js` sets up the web root, `trailingSlash`
  handling, long-lived cache headers for `/_app/immutable/*`, short ones for
  HTML, and redirects. It's validated with `xenia check` and needs xenia
  ≥ <version>. Nginx and Caddy configs are provided as alternatives.
- **Netlify / Cloudflare Pages / Vercel** → build command `npm run build`,
  output folder `build`.
- **Analytics** (optional) → GoatCounter is a single binary with SQLite storage;
  `deploy/goatcounter.service` runs it behind the same web server.

blog.sapere-aude.ru is served by xenia on a small VPS, with GoatCounter at
`stats.sapere-aude.ru`. `scripts/deploy.sh` uploads each build to
`releases/<commit>/` and switches a `current` symlink, so rollback is instant.

## Examples

- Demo: https://ofkindness.github.io/pamuk/
- blog.sapere-aude.ru: https://blog.sapere-aude.ru/ (source: `sites/blog.sapere-aude.ru`)

## Roadmap

- i18n (decide the URL shape before the first post: `/<lang>/…`)
- Series (multi-part posts)
- Optional KaTeX math

## About the name

*Pamuk* is Turkish for "cotton", a material that stands for both softness and
hard labor: what feels effortless in the hand is the result of patient work.
The name is also a tribute to the craftsmanship of the Turkish writer
Orhan Pamuk and his novel *My Name Is Red*, a story of the miniaturists of
sixteenth-century Istanbul and the art they devoted their lives to.

## License

The code and the demo content in `sites/demo/` are MIT-licensed (see `LICENSE`).

Content in `sites/blog.sapere-aude.ru/` is © Andrei Tretyakov, all rights
reserved (see `sites/blog.sapere-aude.ru/LICENSE`); it is not covered by MIT.
