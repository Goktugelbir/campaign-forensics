import "server-only";
import fs from "node:fs";
import path from "node:path";
import { MOCK_SLUGS, SHOW_MOCK_CASES } from "./site";
import { readInvestigationLog } from "./investigationLog";
import type { ApprovalFile, Case, CaseBundle, CreativeFile, DiagnosisFile, EvidenceFile, ForensicsFile, PreflightFile } from "./types";

export const CASES_DIR = path.join(process.cwd(), "data", "cases");

const SLUG = /^[a-z0-9][a-z0-9-]*$/;

/** Reads a JSON file; returns null when it doesn't exist yet (a step still running). */
function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    // A corrupt file is a real error — surface it to error.tsx instead of hiding it.
    throw new Error(`Invalid JSON in ${path.relative(process.cwd(), file)}: ${(err as Error).message}`);
  }
}

export function isMockSlug(slug: string): boolean {
  return MOCK_SLUGS.has(slug);
}

export function listCaseSlugs(dir = CASES_DIR): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && SLUG.test(d.name) && fs.existsSync(path.join(dir, d.name, "case.json")))
    .map((d) => d.name)
    .sort();
}

/**
 * The site is English-only: translated items carry their English text in `text` too, so the
 * original-language wording never reaches a page, the page source or a JSON download.
 * The original stays in data/cases/<slug>/evidence.json for the record (and for validate:case).
 */
function englishOnly(file: EvidenceFile | null): EvidenceFile | null {
  if (!file) return file;
  return { ...file, evidence: file.evidence.map((e) => (e.text_en ? { ...e, text: e.text_en } : e)) };
}

export function getCaseBundle(slug: string, dir = CASES_DIR): CaseBundle | null {
  if (!SLUG.test(slug)) return null; // also blocks path traversal
  const base = path.join(dir, slug);
  const c = readJson<Case>(path.join(base, "case.json"));
  if (!c) return null;
  const creative = readJson<CreativeFile>(path.join(base, "creative.json"));
  return {
    case: c,
    evidence: englishOnly(readJson<EvidenceFile>(path.join(base, "evidence.json"))),
    diagnosis: readJson<DiagnosisFile>(path.join(base, "diagnosis.json")),
    creative,
    // Optional sidecars — null when absent.
    forensics: readJson<ForensicsFile>(path.join(base, "forensics.json")),
    preflight: readJson<PreflightFile>(path.join(base, "preflight.json")),
    approval: readJson<ApprovalFile>(path.join(base, "approval.json")),
    log: readInvestigationLog(base, creative),
    isMock: isMockSlug(slug),
  };
}

/** Bundles for the /cases list; newest launch first. Mock cases hidden after Phase 5. */
export function listCases(opts: { includeMock?: boolean; dir?: string } = {}): CaseBundle[] {
  const includeMock = opts.includeMock ?? SHOW_MOCK_CASES;
  return listCaseSlugs(opts.dir)
    .filter((s) => includeMock || !isMockSlug(s))
    .map((s) => getCaseBundle(s, opts.dir))
    .filter((b): b is CaseBundle => b !== null)
    .sort((a, b) => b.case.launch_date.localeCompare(a.case.launch_date));
}
