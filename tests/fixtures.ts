import fs from "node:fs";
import path from "node:path";
import type { CaseBundle, CreativeFile, DiagnosisFile, EvidenceFile, Case, Evidence } from "@/lib/types";

const DIR = path.join(process.cwd(), "data", "cases", "demo-mock");
const read = <T,>(f: string) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as T;

export function mockBundle(overrides: Partial<CaseBundle> = {}): CaseBundle {
  return {
    case: read<Case>("case.json"),
    evidence: read<EvidenceFile>("evidence.json"),
    diagnosis: read<DiagnosisFile>("diagnosis.json"),
    creative: read<CreativeFile>("creative.json"),
    isMock: true,
    ...overrides,
  };
}

export function ev(partial: Partial<Evidence> & { id: string }): Evidence {
  return {
    source: "reddit",
    type: "comment",
    url: "https://example.com/x",
    date: "2026-08-14",
    lang: "en",
    text: "text",
    ...partial,
  };
}
