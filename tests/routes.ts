import fs from "node:fs";
import path from "node:path";
import { isLegalSlug } from "@/lib/legal";
import { listCaseSlugs } from "@/lib/data";

const APP = path.join(process.cwd(), "app");

/** True when an internal href resolves to a page in app/ (static, legal or case route). */
export function routeExists(href: string): boolean {
  const clean = href.split("#")[0].split("?")[0] || "/";
  if (clean === "/") return fs.existsSync(path.join(APP, "page.tsx"));
  const parts = clean.replace(/^\/|\/$/g, "").split("/");
  if (parts[0] === "legal" && parts.length === 2) return isLegalSlug(parts[1]);
  if (parts[0] === "cases" && parts.length >= 2) {
    if (!listCaseSlugs().includes(parts[1])) return false;
    return parts.length === 2 || (parts.length === 3 && (parts[2] === "print" || parts[2] === "deliver"));
  }
  return fs.existsSync(path.join(APP, ...parts, "page.tsx"));
}
