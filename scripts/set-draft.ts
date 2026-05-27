import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type ContentType = "blog" | "vibe";

const COLLECTION_DIRECTORIES = {
  blog: "src/content/blog",
  vibe: "src/content/vibe",
} satisfies Record<ContentType, string>;

const [contentTypeArg, draftArg, slugArg] = process.argv.slice(2);

if (!isSupportedContentType(contentTypeArg)) {
  printUsage(`Unsupported content type: ${contentTypeArg ?? ""}`);
  process.exit(1);
}

if (!isDraftFlag(draftArg)) {
  printUsage(`Unsupported draft flag: ${draftArg ?? ""}`);
  process.exit(1);
}

if (!slugArg) {
  printUsage("Missing slug or filename.");
  process.exit(1);
}

const slug = normalizeFilename(slugArg);

if (!slug) {
  console.error("Invalid slug.");
  process.exit(1);
}

const targetPath = resolveContentPath(contentTypeArg, slug);

if (!targetPath) {
  console.error(`Could not find a ${contentTypeArg} entry matching "${slug}".`);
  process.exit(1);
}

const source = readFileSync(targetPath, "utf8");

if (!source.startsWith("---\n")) {
  console.error(
    `Missing frontmatter in ${path.relative(process.cwd(), targetPath)}.`,
  );
  process.exit(1);
}

const nextDraft = draftArg === "true";
const draftPattern = /^draft:\s*(true|false)\s*$/m;
const updated = draftPattern.test(source)
  ? source.replace(draftPattern, `draft: ${nextDraft}`)
  : source.replace(/^---\n/, `---\ndraft: ${nextDraft}\n`);

writeFileSync(targetPath, updated, "utf8");

console.log(
  `${nextDraft ? "Marked as draft" : "Published"}: ${path.relative(process.cwd(), targetPath)}`,
);

function isSupportedContentType(
  value: string | undefined,
): value is ContentType {
  return value === "blog" || value === "vibe";
}

function isDraftFlag(value: string | undefined): value is "true" | "false" {
  return value === "true" || value === "false";
}

function normalizeFilename(value: string) {
  return value
    .trim()
    .replace(/\.(mdx?|MDX?)$/, "")
    .replace(/^\/+|\/+$/g, "");
}

function resolveContentPath(contentType: ContentType, slug: string) {
  const directory = COLLECTION_DIRECTORIES[contentType];
  const candidates = [
    path.resolve(directory, `${slug}.md`),
    path.resolve(directory, `${slug}.mdx`),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

function printUsage(message: string) {
  console.error(`${message}

Usage:
npm run post:publish -- <slug>
npm run post:unpublish -- <slug>

Examples:
npm run post:publish -- my-first-post
npm run post:unpublish -- my-first-post`);
}
