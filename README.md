# pamuk

*Pamuk* (Turkish for "cotton"): soft to read, carefully made.

A fully static blog starter built with **SvelteKit 3** and typed Markdown content,
with structured data for search engines. Readers get plain HTML and CSS; the only
client-side JavaScript is three small optional scripts (copy buttons, search,
analytics).

> **Status:** M0 is implemented, except that the blog has no posts and is not
> deployed yet. M1 and M2 are planned. See [Milestones](#milestones) for the
> order of work and [Open decisions](#open-decisions) for what is still undecided.

pamuk is two things in one repository:

- **A starter** (MIT): clone it, run `npm run init`, deploy the `build/` folder anywhere.
- **A real blog built on it**: [blog.sapere-aude.ru](https://blog.sapere-aude.ru),
  a technical blog with occasional book posts, built from exactly the same code.

The code is never duplicated: each site is content, a config file and a theme file.

---

## Stack

| Area            | Choice                                                         |
|-----------------|----------------------------------------------------------------|
| Framework       | SvelteKit 3, Svelte 5, `@sveltejs/adapter-static`              |
| Runtime         | Node 24 or 26 LTS (SvelteKit 3 needs ≥ 22.17), Vite 8, TypeScript 6 (SvelteKit 3 does not accept 7 yet) |
| Content         | content-collections + Zod 4 schemas → typed `allPosts`, `allAuthors`, `allPages`, behind `#lib/content` so the loader can be replaced |
| Markdown        | unified: remark-gfm, remark-directive, rehype-slug, rehype-autolink-headings |
| Code blocks     | Shiki (build time, light and dark themes, no runtime JS)       |
| Styling         | Tailwind CSS 4 with `@tailwindcss/typography`; per-site theme tokens; dark mode follows the system setting |
| Structured data | `schema-dts` types for JSON-LD                                 |
| Search          | Pagefind (indexes the build output, no server)                 |
| OG images       | a default image or the post's `image`; generated images (satori + resvg) come in M2 |
| Analytics       | optional: GoatCounter (self-hosted, cookieless)                |
| Tests           | Vitest for the Markdown pipeline and the content schemas       |

## Milestones

Each milestone is usable on its own. Nothing from a later milestone is needed
to finish an earlier one.

### M0: a readable blog, live

Three spikes came first, because the rest depends on them. All three worked:

1. A prerendered `404.html` that works with `csr = false` (the adapter's
   `fallback` page is a client-rendered shell, so it cannot be used). It is
   the route `src/routes/404.html` with `trailingSlash = 'never'`.
2. content-collections with the `SITE` switch: types, hot reload in dev.
3. Post folders with co-located images, published next to the post by a
   prerendered endpoint.

Then:

- Posts, authors and pages in Markdown with typed, validated frontmatter
- Home page with the latest posts, and `/archive/` with every post grouped by year
- Post page: Shiki code blocks, callouts, table of contents, images with
  `width`, `height` and lazy loading
- Discussion links: optional `discussion` frontmatter links a post to a forum
  thread (also published as schema.org `discussionUrl`)
- Drafts: visible in dev, excluded from production builds
- RSS with full post content (`/rss.xml`), `sitemap.xml`, `robots.txt`, the 404 page
- Canonical URLs, OpenGraph and Twitter metadata
- JSON-LD: `BlogPosting`, `Person`, `WebSite`, `BreadcrumbList`, escaped safely
- Per-site theme file
- Tests for the Markdown pipeline and the schemas

**Done when:** blog.sapere-aude.ru serves at least one real post built from
`sites/blog.sapere-aude.ru`; `npm run check` and `npm test` pass; content
pages contain no executable `<script>`.

### M1: a starter other people can use

- Tags and categories declared in each site's config, with listing pages
- Author pages
- Book posts: optional `book` frontmatter renders a book card and adds JSON-LD
- Search page (Pagefind)
- Copy buttons on code blocks
- Base-path support, with the demo on GitHub Pages under `/pamuk` as its test
- `npm run init`
- CI: check, tests, a demo build under the base path
- Nginx and Caddy equivalents of the xenia config
- The repository becomes public

**Done when:** the demo at ofkindness.github.io/pamuk builds with no broken
internal links; a fresh clone followed by `npm run init -- my-blog` builds.

### M2: extras

- Generated per-post OG images (satori + resvg)
- GoatCounter analytics and the privacy page template
- Pagination, once a listing is longer than `postsPerPage`
- Responsive image variants (WebP/AVIF, `srcset`)

### Later

- More than one language per site
- Series (multi-part posts)
- Optional KaTeX math
- `aliases` frontmatter for moved posts

## Open decisions

- **Language of blog.sapere-aude.ru.** One language or two? With two, the URL
  shape (`/<lang>/…`) has to be chosen before the first post is published,
  because changing it later breaks every link. Until then pamuk supports one
  language per site, with a per-post `lang` override.
- **Minimum xenia version** for `deploy/xenia.conf.js`. It must not be newer
  than the newest public release.

## JavaScript policy

The root layout sets `csr = false`, so SvelteKit ships no JavaScript at all.
The exceptions are plain scripts in `src/lib/scripts/`, loaded with
`<script defer>` only on the pages that need them:

| Script       | Loaded on                         | Milestone |
|--------------|-----------------------------------|-----------|
| copy buttons | posts that contain a code block   | M1        |
| search       | `/search/` only                   | M1        |
| analytics    | every page, if the site enables it| M2        |

There is no theme toggle: dark mode follows `prefers-color-scheme`. There are
no inline executable scripts, so a server can send a `Content-Security-Policy`
with `script-src 'self'` (plus the analytics host).

## Repository layout

    .
    ├── src/
    │   ├── routes/            # pages, RSS, sitemap, the 404 page
    │   ├── lib/               # components, SEO, Markdown pipeline, content loader (#lib)
    │   │   └── scripts/       # the only client-side JS (M1, see JavaScript policy)
    │   ├── hooks.server.ts    # sets <html lang> per page
    │   └── app.css            # Tailwind entry; imports the site's theme.css
    ├── sites/
    │   ├── demo/              # the starter's example site (MIT)
    │   │   ├── site.config.ts # URL, title, description, language, tags, categories, nav, analytics
    │   │   ├── theme.css      # fonts and colors as Tailwind theme tokens
    │   │   ├── content/
    │   │   │   ├── posts/     # <slug>.md, or <slug>/index.md with its images
    │   │   │   ├── drafts/    # git-ignored, loaded in dev only
    │   │   │   ├── authors/
    │   │   │   └── pages/     # about, privacy (template)
    │   │   └── static/        # favicon, default OG image
    │   └── blog.sapere-aude.ru/   # the author's blog, same shape
    │       └── LICENSE            # all rights reserved (not MIT)
    ├── deploy/                # planned
    │   ├── xenia.conf.js      # example web server config
    │   └── README.md          # Nginx and Caddy equivalents (M1)
    ├── scripts/
    │   ├── site.ts            # which site is selected
    │   ├── prepare-site.ts    # links static/ → sites/$SITE/static (git-ignored)
    │   ├── content-plugin.ts  # runs content-collections in Vite; content errors fail the build
    │   ├── check-content.ts   # validates content without building (part of npm run check)
    │   ├── finish-build.ts    # removes the unused client bundle from build/
    │   └── init.ts            # npm run init (M1)
    ├── tests/                 # Vitest: Markdown pipeline, schemas, validation, SEO helpers
    ├── content-collections.ts
    ├── vite.config.ts         # SvelteKit config; SITE selects the site
    ├── vitest.config.ts
    ├── LICENSE                # MIT, covers the code and sites/demo
    └── package.json

### How the site switch works

`SITE` is read in `vite.config.ts` and `content-collections.ts`. Without it,
the site named in `package.json` (`pamuk.defaultSite`, initially `demo`) is used.

- `#site` resolves to `sites/$SITE` (Vite `resolve.alias`; tsconfig maps it to
  `sites/demo` for types, since all sites share one shape)
- content collections read from `sites/$SITE/content/**`
- `scripts/prepare-site.ts` points `static/` at `sites/$SITE/static` (a
  symlink, so nothing goes stale when you switch sites; a copy on systems
  without symlinks). `vite.config.ts` calls it, so every Vite command does it.

Assets shared by every site (scripts, icons) live in `src/lib` and go through
Vite, not through `static/`.

### Theme

`sites/<site>/theme.css` holds the site's fonts and colors as Tailwind `@theme`
tokens. Changing how one site looks never touches `src/`. The demo uses the
system font stack; a site that wants web fonts self-hosts them from its theme.

## Content model

### Post

A post is either `content/posts/<slug>.md` or, when it has images,
`content/posts/<slug>/index.md` with the images beside it. Co-located images
are published next to the post, so `![](diagram.png)` works on the page and is
made absolute in RSS.

A file name may start with `YYYY-MM-DD-` to keep the folder sorted. The prefix
is not part of the slug and must match `date`.

```ts
const Post = z.object({
  title:        z.string(),
  description:  z.string().max(200),
  date:         dateOnly,                        // YYYY-MM-DD, shown without timezone shifts
  updated:      dateOnly.optional(),
  lang:         z.string().optional(),           // default: the site's language
  author:       z.string().optional(),           // author slug; default: the site's defaultAuthor
  category:     z.string().optional(),           // checked against site.config categories
  tags:         z.array(z.string()).default([]), // checked against site.config tags
  image:        z.string().optional(),           // co-located file or a path under static/
  draft:        z.boolean().default(false),
  canonical:    z.url().optional(),              // for cross-posted articles
  discussion:   z.url().optional(),              // forum thread for this post
  book: z.object({
    title:   z.string(),
    authors: z.array(z.string()).min(1),
    year:    z.number().int().optional(),
    isbn:    z.string().optional(),
    cover:   z.string().optional(),
    rating:  z.number().int().min(1).max(5).optional(),
  }).optional(),
})
// computed: slug, url, readingTime, html (unified + Shiki), headings (for the TOC)
```

`dateOnly` accepts `"2026-04-13"` and an unquoted `2026-04-13` (which YAML
parses as a timestamp) and normalizes both to a `YYYY-MM-DD` string.

Posts are ordered by `date`, newest first; posts of the same day are ordered
by slug. Feed timestamps use midnight UTC.

### Validation

The build fails on:

- unknown tags, categories or authors
- slug collisions: `hello.md` next to `hello/index.md`, or a page whose slug is
  a built-in route (`posts`, `tags`, `search`, `archive`, …)
- a date prefix in the file name that differs from `date`
- broken internal links and missing images (SvelteKit's prerender crawler)

### Drafts

`draft: true` keeps a committed post out of production builds. In a public
repository a committed draft is still public, so unpublished posts can also
live in `content/drafts/`, which is git-ignored and loaded in dev only.

### Book posts

Without a `rating`, the post's JSON-LD gets `about: Book`. With a `rating`, it
becomes a `Review` with `itemReviewed: Book`.

### Author (`content/authors/<slug>.md`)

Frontmatter: `name`, `avatar?`, `links?` (url list). The Markdown body is the bio.

### Page (`content/pages/<slug>.md`)

Frontmatter: `title`, `description`. Used for `/about` and `/privacy`.

### Tags and categories

Declared in `site.config.ts` with a slug, a display name and an optional
description. URL slugs are lowercase ASCII, so every tag has exactly one URL.
Both are optional: a site that declares no categories gets no category pages.

### Example post

```md
---
title: "Hello World"
description: "First post on pamuk"
date: 2026-04-13
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
  url: "https://example.com",       // public URL of the home page
  title: "pamuk demo",
  description: "A static blog starter built with SvelteKit and typed Markdown content.",
  language: "en",
  defaultAuthor: "jane",
  homePosts: 10,                    // posts on the home page
  postsPerPage: 20,                 // listing page size, once pagination exists (M2)
  categories: [{ slug: "tech", name: "Tech" }, { slug: "books", name: "Books" }],
  tags: [{ slug: "svelte", name: "Svelte" }],
  nav: [{ title: "Archive", href: "/archive/" }, { title: "About", href: "/about/" }],
  analytics: { provider: "none" },  // or { provider: "goatcounter", endpoint: "https://stats.example.com/count" }
})
```

A site's `static/favicon.svg` and `static/og-default.png` are picked up when
they exist: the first as the icon, the second as the share image of pages
that have none of their own.

## Routes

| Route                                    | Content                       | Milestone |
|------------------------------------------|-------------------------------|-----------|
| `/`                                      | latest posts                  | M0        |
| `/archive/`                              | every post, by year           | M0        |
| `/posts/[slug]/`                         | post and its images           | M0        |
| `/about/`, `/privacy/`                   | pages from `content/pages`    | M0        |
| `/rss.xml`, `/sitemap.xml`, `/robots.txt`| feeds and indexing            | M0        |
| `/404.html`                              | not-found page                | M0        |
| `/tags/[tag]/`                           | posts by tag                  | M1        |
| `/categories/[category]/`                | posts by category             | M1        |
| `/authors/[slug]/`                       | author and their posts        | M1        |
| `/search/`                               | Pagefind                      | M1        |
| `/og/[slug].png`                         | generated OG images           | M2        |
| `/page/[n]/`, `…/page/[n]/`              | pagination                    | M2        |

Every route is prerendered (`trailingSlash: 'always'`, so each page becomes
`…/index.html` and works on any static host).

### Base path

`BASE_PATH` sets SvelteKit's `paths.base` for sites served from a subfolder,
such as a GitHub Pages project site. Components build URLs with `resolve()`
and `asset()`; the Markdown pipeline adds the base to root-relative links and
image sources inside posts.

## Development

```bash
npm install
npm run dev                            # default site
SITE=blog.sapere-aude.ru npm run dev   # another site
npm run check                          # svelte-check + content validation
npm test                               # Markdown pipeline and schema tests
npm run build                          # → build/ (Pagefind will index it from M1)
npm run preview
```

In dev, pages render on the client too, so edits to components and content
hot-reload; `npm run build` turns client rendering off and removes the unused
client bundle from `build/`.

The search page (M1) needs a built index, so it will work in `npm run preview`,
not in `npm run dev`.

## Use it as a starter

1. Clone the repository.
2. Run `npm run init -- my-blog`. It copies `sites/demo` to `sites/my-blog`,
   makes it the default site, and removes `sites/blog.sapere-aude.ru`, whose
   content is not MIT-licensed (see License).
3. Edit `sites/my-blog/site.config.ts` and `theme.css`, and replace the content.
4. Rewrite `content/pages/privacy.md` to match your analytics setup, or delete
   it if you use none.
5. `npm run build` and upload `build/` to any static host.

Your site lives in its own folder, so later changes to the starter merge
without conflicts.

## Deployment

The build runs in CI (or locally), never on the server.

- **Demo site** → GitHub Pages, built with `BASE_PATH=/pamuk`.
- **Any VPS** → upload `build/` and serve it with a static web server. The
  example config `deploy/xenia.conf.js` sets up the web root, `trailingSlash`
  handling, the 404 page, long-lived cache headers for `/_app/immutable/*`,
  short ones for HTML, a `Content-Security-Policy`, and redirects. It's
  validated with `xenia check` and needs xenia ≥ <version>. `deploy/README.md`
  has the Nginx and Caddy equivalents.
- **Netlify / Cloudflare Pages / Vercel** → build command `npm run build`,
  output folder `build`.
- **Analytics** (optional) → GoatCounter is a single binary with SQLite storage
  that runs behind the same web server; see its documentation for setup.

A simple release pattern for a VPS: upload each build to `releases/<commit>/`
and switch a `current` symlink, so rollback is instant.

blog.sapere-aude.ru is served by xenia on a small VPS, with GoatCounter at
`stats.sapere-aude.ru`. Files specific to that host are not kept in this
repository.

### CI

CI starts when the repository becomes public (M1).

- Every push: `npm run check`, `npm test`, a demo build under `/pamuk`.
- The demo is deployed when `src/` or `sites/demo/` changes.
- The blog is built and deployed when `src/` or `sites/blog.sapere-aude.ru/`
  changes, so a new post never rebuilds the demo.

Dependencies are pinned by the lockfile and updated in grouped batches.

## Examples

- Demo: https://ofkindness.github.io/pamuk/
- blog.sapere-aude.ru: https://blog.sapere-aude.ru/ (source: `sites/blog.sapere-aude.ru`)

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
