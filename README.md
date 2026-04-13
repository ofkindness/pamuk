# pamuk

A modern static blog starter built with **Next.js**, **Contentlayer2**,
and **MDX**, featuring structured content models (posts, authors, tags,
categories) and SEO-ready metadata using **schema-dts**.

------------------------------------------------------------------------

## 🚀 Tech Stack

-   **Next.js (App Router / Static Export)**
-   **Contentlayer2 (next-contentlayer2 integration)**
-   **MDX for content authoring**
-   **Type-safe content schema (Contentlayer)**
-   **schema-dts for structured data (SEO / JSON-LD)**
-   **TypeScript**
-   **Tailwind CSS (optional but recommended)**

------------------------------------------------------------------------

## 📦 Features

### Content System

-   Blog posts written in MDX
-   Authors collection
-   Tags & Categories system
-   Reusable content components in MDX

### Pages

-   `/` --- homepage with latest posts
-   `/posts/[slug]` --- blog post page
-   `/authors/[slug]` --- author pages
-   `/tags/[tag]` --- tag listing pages
-   `/categories/[category]` --- category listing pages
-   `/about`
-   `/terms`
-   `/privacy-policy`

### SEO & Metadata

-   JSON-LD structured data via `schema-dts`
-   OpenGraph + Twitter metadata
-   Automatic slugs & canonical URLs

### Static Export

-   Fully static build (`next export` compatible)
-   CDN-ready output

------------------------------------------------------------------------

## 🧱 Project Structure

    .
    ├── content/
    │   ├── posts/
    │   ├── authors/
    │   ├── tags/
    │   └── categories/
    │
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx
    │   │   ├── posts/[slug]/page.tsx
    │   │   ├── authors/[slug]/page.tsx
    │   │   ├── tags/[tag]/page.tsx
    │   │   ├── categories/[category]/page.tsx
    │   │   ├── about/page.tsx
    │   │   ├── terms/page.tsx
    │   │   └── privacy-policy/page.tsx
    │   │
    │   ├── components/
    │   ├── lib/
    │   │   ├── contentlayer.ts
    │   │   ├── seo.ts
    │   │   └── utils.ts
    │   │
    │   └── styles/
    │
    ├── contentlayer.config.ts
    ├── next.config.js
    ├── tsconfig.json
    ├── package.json
    └── README.md

------------------------------------------------------------------------

## ⚙️ Content Models (Contentlayer2)

### Post

``` ts
export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "date", required: true },
    author: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" } },
    category: { type: "string", required: true },
    image: { type: "string" },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("posts/", ""),
    },
  },
}))
```

### Author

``` ts
export const Author = defineDocumentType(() => ({
  name: "Author",
  filePathPattern: `authors/**/*.mdx`,
  contentType: "mdx",
  fields: {
    name: { type: "string", required: true },
    avatar: { type: "string" },
    bio: { type: "string" },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("authors/", ""),
    },
  },
}))
```

------------------------------------------------------------------------

## 🔎 Schema.org (schema-dts)

Example usage in a blog post page:

``` ts
import { Article } from "schema-dts"

const jsonLd: Article = {
  "@type": "Article",
  headline: post.title,
  datePublished: post.date,
  author: {
    "@type": "Person",
    name: post.author,
  },
  description: post.description,
}
```

Inject via:

``` tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

------------------------------------------------------------------------

## 🧪 Development

### Install dependencies

``` bash
npm install
```

### Run dev server

``` bash
npm run dev
```

### Build static site

``` bash
npm run build
```

### Export static output

``` bash
npm run export
```

------------------------------------------------------------------------

## 📜 Example MDX Post

``` mdx
---
title: "Hello World"
description: "First blog post"
date: "2026-04-13"
author: "andrei"
tags: ["nextjs", "mdx"]
category: "tech"
---

# Hello World

This is a **MDX-powered** blog post.

<Callout>This is a custom component inside MDX.</Callout>
```

------------------------------------------------------------------------

## 📌 Goals

-   Fully static blog system
-   Strong typing for all content
-   SEO-first architecture
-   Simple deployment (Vercel / Netlify / CDN)
-   Extensible content graph (posts ↔ authors ↔ tags)

------------------------------------------------------------------------

## 🧭 Future Improvements

-   Search (Algolia / Fuse.js)
-   RSS feed generation
-   Multi-language support (i18n)
-   Theme system (dark/light)
-   CMS integration (optional)

------------------------------------------------------------------------

## 📄 License

MIT

