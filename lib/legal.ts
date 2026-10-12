import "server-only";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { headingId } from "./text";

export const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

export const LEGAL_PAGES = [
  "privacy",
  "gdpr",
  "cookies",
  "terms",
  "data-sources",
  "disclaimer",
  "data-request",
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number];

export interface LegalDoc {
  slug: LegalSlug;
  title: string;
  updated: string;
  summary: string;
  toc: { id: string; title: string }[];
  html: string;
}

export function isLegalSlug(s: string): s is LegalSlug {
  return (LEGAL_PAGES as readonly string[]).includes(s);
}

/** Minimal front matter: `key: value` lines between leading `---` fences. */
export function parseFrontMatter(src: string): { meta: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

/** Renders trusted, repo-authored Markdown. Every `##` heading gets an id for the TOC. */
export function renderLegalMarkdown(body: string): { html: string; toc: LegalDoc["toc"] } {
  const toc: LegalDoc["toc"] = [];
  const seen = new Map<string, number>();
  const withAnchors = body.replace(/^##\s+(.+)$/gm, (_line, title: string) => {
    let id = headingId(title);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;
    toc.push({ id, title: title.trim() });
    return `<h2 id="${id}">${title.trim()}</h2>`;
  });
  const html = marked.parse(withAnchors, { async: false, gfm: true }) as string;
  return { html, toc };
}

export function getLegalDoc(slug: string, dir = LEGAL_DIR): LegalDoc | null {
  if (!isLegalSlug(slug)) return null;
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { meta, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
  const { html, toc } = renderLegalMarkdown(body);
  return {
    slug,
    title: meta.title ?? slug,
    updated: meta.updated ?? "",
    summary: meta.summary ?? "",
    toc,
    html,
  };
}
