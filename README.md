# Cyber Machine

Astro-based personal site for projects, blog posts, and short notes.

## Local development

```bash
npm install
ASTRO_TELEMETRY_DISABLED=1 npm run dev
```

The local site runs at `http://127.0.0.1:4321/`.

## Blog workflow

Create a new draft blog post:

```bash
npm run post:new -- my-first-post
```

That creates [`src/content/blog/my-first-post.md`](/Users/vverse/Desktop/Cyber-Machine.github.io/src/content/blog/my-first-post.md) with `draft: true`.

Write the post body in that file. While `draft: true`, the post:

- is excluded from production blog pages, RSS, categories, series, and the built site
- is still previewable locally in development at `/blog/my-first-post/`

Publish a draft:

```bash
npm run post:publish -- my-first-post
```

Move a published post back to draft:

```bash
npm run post:unpublish -- my-first-post
```

Publishing here simply means flipping the frontmatter to `draft: false`. Once that is set, the post is included the next time the site is built and deployed.

## Vibe workflow

Create a new vibe entry:

```bash
npm run vibe:new -- today-note
```
