---
title: "Hello World"
description: "First post on pamuk: what a post file looks like."
date: 2026-04-13
tags: ["svelte"]
category: "tech"
---

Some **Markdown**, and a [link to the archive](/archive/).

A post is one Markdown file. The file name is the address: this one is
`hello-world.md`, so it lives at `/posts/hello-world/`.

:::note
Directives render as styled callouts.
:::

## Frontmatter

Only three fields are required:

```yaml
title: "Hello World"
description: "First post on pamuk"
date: 2026-04-13
```

The author comes from `defaultAuthor` in the site config unless the post
names one.
