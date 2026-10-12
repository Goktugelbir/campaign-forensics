// Case validator + deterministic creative preflight. Used by `npm run validate:case <slug>`
// (scripts/validate-case.ts, run directly by Node) and by tests/validateCase.test.ts.
// Only relative imports with explicit extensions, so Node can run it without a bundler.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { EVIDENCE_ID, privacyIssues } from "./evidence.ts";
import { MOCK_SLUGS } from "./site.ts";
import type {
  ApprovalFile,
  CreativeAsset,
  CreativeFile,
  DiagnosisFile,
  EvidenceFile,
  ForensicsFile,
  PreflightCheck,
  PreflightFile,
} from "./types";

export interface Finding {
  level: "error" | "warn";
  file: string;
  message: string;
}

export interface ValidationResult {
  slug: string;
  findings: Finding[];
  preflight: PreflightFile | null;
}

/** Performance vocabulary a public-only case must never use: there is no account data behind it. */
export const PERFORMANCE_TERMS = /\b(winner|ROAS|CPA|CTR|conversions?|conversion rate|lift)\b/i;

const VIDEO_SECONDS = { min: 10, max: 20 };

interface Options {
  root?: string;
  /** Skip the image/video probes (sharp, ffmpeg) — contract checks only. */
  skipMedia?: boolean;
  now?: Date;
}

export async function validateCase(slug: string, opts: Options = {}): Promise<ValidationResult> {
  const root = opts.root ?? process.cwd();
  const dir = path.join(root, "data", "cases", slug);
  const findings: Finding[] = [];
  const err = (file: string, message: string) => findings.push({ level: "error", file, message });
  const warn = (file: string, message: string) => findings.push({ level: "warn", file, message });

  const read = <T>(name: string): T | null => {
    const f = path.join(dir, name);
    if (!fs.existsSync(f)) return null;
    try {
      return JSON.parse(fs.readFileSync(f, "utf8")) as T;
    } catch (e) {
      err(name, `invalid JSON: ${(e as Error).message}`);
      return null;
    }
  };

  if (!fs.existsSync(path.join(dir, "case.json"))) {
    err("case.json", `no case folder at data/cases/${slug}`);
    return { slug, findings, preflight: null };
  }

  const evidenceFile = read<EvidenceFile>("evidence.json");
  const diagnosis = read<DiagnosisFile>("diagnosis.json");
  const creative = read<CreativeFile>("creative.json");
  const forensics = read<ForensicsFile>("forensics.json");
  const approval = read<ApprovalFile>("approval.json");
  const evidence = evidenceFile?.evidence ?? [];
  const ids = new Set(evidence.map((e) => e.id));
  const unknown = (list: string[]) => list.filter((id) => !ids.has(id));

  // ── evidence.json ──
  if (ids.size !== evidence.length) err("evidence.json", "evidence ids are not unique");
  for (const e of evidence) {
    if (!EVIDENCE_ID.test(e.id)) err("evidence.json", `${e.id}: malformed id`);
    if (!/^https?:\/\//.test(e.url)) err("evidence.json", `${e.id}: missing or non-http URL`);
    for (const issue of privacyIssues(e)) err("evidence.json", `${e.id}: ${issue}`);
    if (e.lang !== "en" && !e.text_en) warn("evidence.json", `${e.id}: ${e.lang} text has no English translation (text_en)`);
  }

  // ── diagnosis.json ──
  if (diagnosis) {
    if (diagnosis.hypotheses.length !== 6) err("diagnosis.json", `expected 6 hypotheses, found ${diagnosis.hypotheses.length}`);
    for (const h of diagnosis.hypotheses) {
      const bad = unknown(h.evidence_ids);
      if (bad.length) err("diagnosis.json", `${h.id} cites unknown evidence ${bad.join(", ")}`);
    }
    const cited = [
      ...diagnosis.diagnosis.evidence_ids,
      ...(diagnosis.diagnosis.surprising_evidence_ids ?? []),
      ...diagnosis.prescription.flatMap((p) => p.evidence_ids),
    ];
    const bad = unknown(cited);
    if (bad.length) err("diagnosis.json", `cites unknown evidence ${[...new Set(bad)].join(", ")}`);
    if (!diagnosis.diagnosis.evidence_ids.length) err("diagnosis.json", "main cause is not linked to any evidence");
    for (const [i, p] of diagnosis.prescription.entries()) {
      if (!p.evidence_ids.length) err("diagnosis.json", `prescription ${i + 1} has no evidence`);
    }
    if (!diagnosis.generic_check.passed) err("diagnosis.json", "generic check has not passed");
  }

  // ── public-only: no performance vocabulary ──
  const prose = JSON.stringify([diagnosis ?? {}, (creative?.assets ?? []).map((a) => a.label)]);
  const term = PERFORMANCE_TERMS.exec(prose);
  if (term) err("diagnosis.json", `public-only case uses performance term "${term[1]}" without account data`);

  // ── forensics.json (optional) ──
  if (forensics && diagnosis) checkForensics(forensics, diagnosis, ids, slug, dir, err);

  // ── creative.json + preflight ──
  let preflight: PreflightFile | null = null;
  if (creative) {
    const checks: PreflightCheck[] = [];
    for (const a of creative.assets) {
      checks.push(...(await preflightAsset(a, { root, slug, diagnosis, skipMedia: !!opts.skipMedia, mock: MOCK_SLUGS.has(slug) })));
    }
    checks.push({
      id: "performance-terms",
      label: "No performance claims",
      status: term ? "fail" : "pass",
      detail: term ? `uses "${term[1]}" without account data` : "No winner, ROAS, CPA, CTR, conversion or lift claims (public-only case).",
    });
    for (const c of checks) if (c.status === "fail") err("creative.json", `${c.asset ?? "case"}: ${c.label} — ${c.detail}`);
    preflight = {
      schema_version: "1.0",
      case_slug: slug,
      checked_at: (opts.now ?? new Date()).toISOString(),
      status: checks.some((c) => c.status === "fail") ? "failed" : "passed",
      checks,
    };
  }

  // ── approval.json (optional, written by a person) ──
  if (approval) {
    if (approval.case_slug !== slug) err("approval.json", "case_slug does not match the folder");
    if (approval.decision === "approved" && preflight?.status === "failed") {
      err("approval.json", "approved although preflight failed");
    }
  }

  return { slug, findings, preflight };
}

function checkForensics(
  f: ForensicsFile,
  d: DiagnosisFile,
  ids: Set<string>,
  slug: string,
  dir: string,
  err: (file: string, message: string) => void,
) {
  const F = "forensics.json";
  if (f.case_slug !== slug) err(F, "case_slug does not match the folder");
  if (f.confidence_basis !== "not_calibrated") err(F, 'confidence_basis must be "not_calibrated"');
  for (const s of f.source_of_truth ?? []) if (!fs.existsSync(path.join(dir, s))) err(F, `source_of_truth ${s} is missing`);

  const byId = new Map(f.hypotheses.map((h) => [h.id, h]));
  for (const h of d.hypotheses) if (!byId.has(h.id)) err(F, `${h.id} has no entry`);

  for (const h of f.hypotheses) {
    const dh = d.hypotheses.find((x) => x.id === h.id);
    if (!dh) {
      err(F, `${h.id} is not a hypothesis in diagnosis.json`);
      continue;
    }
    const groups = { support: h.support_evidence_ids, counter: h.counter_evidence_ids, context: h.context_evidence_ids };
    for (const [g, list] of Object.entries(groups)) {
      const bad = list.filter((id) => !ids.has(id));
      if (bad.length) err(F, `${h.id} ${g} cites unknown evidence ${bad.join(", ")}`);
    }
    const overlap = (a: string[], b: string[]) => a.filter((id) => b.includes(id));
    const both = [
      ...overlap(h.support_evidence_ids, h.counter_evidence_ids),
      ...overlap(h.support_evidence_ids, h.context_evidence_ids),
      ...overlap(h.counter_evidence_ids, h.context_evidence_ids),
    ];
    if (both.length) err(F, `${h.id}: ${[...new Set(both)].join(", ")} is classified twice`);
    const classified = new Set([...h.support_evidence_ids, ...h.counter_evidence_ids, ...h.context_evidence_ids]);
    const loose = dh.evidence_ids.filter((id) => !classified.has(id));
    if (loose.length) err(F, `${h.id}: ${loose.join(", ")} from diagnosis.json is not classified`);

    if (dh.status === "confirmed" && !h.support_evidence_ids.length) err(F, `${h.id} is confirmed without supporting evidence`);
    if (dh.status === "rejected") {
      // Absence of evidence is not evidence of absence.
      if (!h.counter_evidence_ids.length) err(F, `${h.id} is rejected without counter-evidence`);
      if (!h.rejection_reason) err(F, `${h.id} is rejected without a rejection_reason`);
    }
    if (dh.status === "uncertain" && !h.uncertainty) err(F, `${h.id} is uncertain without saying why (uncertainty)`);
  }

  const main = f.claims.find((c) => c.id === "main_cause");
  if (!main) err(F, "no main_cause claim");
  else {
    const bad = [...main.support_evidence_ids, ...main.counter_evidence_ids].filter((id) => !ids.has(id));
    if (bad.length) err(F, `main_cause cites unknown evidence ${bad.join(", ")}`);
    const missing = d.diagnosis.evidence_ids.filter((id) => !main.support_evidence_ids.includes(id));
    if (missing.length) err(F, `main_cause support is missing diagnosis evidence ${missing.join(", ")}`);
  }
}

// ── Deterministic preflight for one creative asset ──

const MAGIC: { type: string; test: (b: Buffer) => boolean }[] = [
  { type: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { type: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { type: "webp", test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { type: "mp4", test: (b) => b.toString("ascii", 4, 8) === "ftyp" },
  { type: "svg", test: (b) => /<svg[\s>]/i.test(b.toString("utf8", 0, 512)) },
];

async function preflightAsset(
  a: CreativeAsset,
  ctx: { root: string; slug: string; diagnosis: DiagnosisFile | null; skipMedia: boolean; mock: boolean },
): Promise<PreflightCheck[]> {
  const out: PreflightCheck[] = [];
  const add = (id: string, label: string, status: PreflightCheck["status"], detail: string) =>
    out.push({ id, label, asset: a.path || a.label, status, detail });

  if (!a.path) {
    add("exists", "File present", "warn", "Still in production — no file yet.");
    return out;
  }
  if (!a.path.startsWith("/")) {
    add("exists", "File present", "warn", "Remote URL — not checked locally.");
    return out;
  }
  const file = path.join(ctx.root, "public", a.path);
  if (!fs.existsSync(file)) {
    add("exists", "File present", "fail", `missing public${a.path}`);
    return out;
  }
  add("exists", "File present", "pass", `public${a.path} · ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);

  // File type from the bytes, not the name.
  const head = Buffer.alloc(512);
  const fd = fs.openSync(file, "r");
  fs.readSync(fd, head, 0, 512, 0);
  fs.closeSync(fd);
  const detected = MAGIC.find((m) => m.test(head))?.type ?? "unknown";
  const ext = path.extname(a.path).slice(1).toLowerCase().replace("jpeg", "jpg");
  const kindOk = a.kind === "video" ? detected === "mp4" : ["png", "jpg", "webp", "svg"].includes(detected);
  add(
    "type",
    "File type",
    kindOk && detected === ext ? "pass" : "fail",
    kindOk && detected === ext ? `${detected.toUpperCase()} ${a.kind}` : `content is ${detected}, name says .${ext}, kind is ${a.kind}`,
  );

  if (!ctx.skipMedia && kindOk) {
    if (a.kind === "image" && detected !== "svg") {
      try {
        const { default: sharp } = await import("sharp");
        const m = await sharp(file).metadata();
        const ratio = (m.width ?? 0) / (m.height ?? 1);
        const wide = Math.abs(ratio - 16 / 9) < 0.03;
        add("frame", "Frame", wide ? "pass" : "warn", `${m.width}×${m.height}${wide ? " · 16:9" : ` · ${ratio.toFixed(2)}:1, the report crops to 16:9`}`);
      } catch (e) {
        add("frame", "Frame", "warn", `could not read image: ${(e as Error).message}`);
      }
    }
    if (a.kind === "video") {
      const seconds = videoSeconds(file);
      if (seconds == null) add("duration", "Duration", "warn", "ffmpeg not available — duration not checked");
      else {
        const ok = seconds >= VIDEO_SECONDS.min && seconds <= VIDEO_SECONDS.max;
        add("duration", "Duration", ok ? "pass" : "fail", `${seconds.toFixed(1)} s (spec: ${VIDEO_SECONDS.min}–${VIDEO_SECONDS.max} s)`);
      }
    }
  }

  // Lineage: a fal.ai request log for generated images, the edit recipe for composed video.
  const prompts = [...a.prompt_used.matchAll(/prompts\/[\w./-]+\.json/g)].map((m) => m[0]);
  const rawDir = path.join(ctx.root, "data", "cases", ctx.slug, "raw");
  const falLog = fs.existsSync(rawDir)
    ? fs.readdirSync(rawDir).find((f) => {
        if (!/^fal-.+\.json$/.test(f)) return false;
        const j = JSON.parse(fs.readFileSync(path.join(rawDir, f), "utf8")) as { saved?: string[] };
        return (j.saved ?? []).includes(a.path);
      })
    : undefined;
  const missingPrompts = prompts.filter((p) => !fs.existsSync(path.join(ctx.root, p)));
  if (ctx.mock && !a.model) add("lineage", "Lineage", "warn", "mock placeholder — not generated, no lineage");
  else if (!a.prompt_used.trim() || !a.model) add("lineage", "Lineage", "fail", "prompt_used or model is missing");
  else if (missingPrompts.length) add("lineage", "Lineage", "fail", `referenced ${missingPrompts.join(", ")} does not exist`);
  else if (falLog) add("lineage", "Lineage", "pass", `fal.ai request log raw/${falLog}`);
  else if (prompts.length) add("lineage", "Lineage", "pass", `composed from ${prompts.join(", ")}`);
  else add("lineage", "Lineage", "warn", "prompt and model recorded, but no request log or edit recipe found");

  // AI disclosure: the report labels every generated asset; the data must say what made it.
  if (ctx.mock && !a.model) add("ai-label", "AI disclosure", "warn", "mock placeholder — labelled MOCK DATA");
  else add("ai-label", "AI disclosure", a.tool && a.model ? "pass" : "fail", a.tool && a.model ? `Labelled as a concept · ${a.tool}` : "tool/model not recorded");

  // Traceability: which prescription the asset answers.
  const n = ctx.diagnosis?.prescription.length ?? 0;
  const rx = a.prescription_indexes ?? [];
  const badRx = rx.filter((i) => !Number.isInteger(i) || i < 0 || i >= n);
  if (badRx.length) add("trace", "Answers the diagnosis", "fail", `prescription index ${badRx.join(", ")} does not exist`);
  else if (rx.length) add("trace", "Answers the diagnosis", "pass", `prescription ${rx.map((i) => String(i + 1).padStart(2, "0")).join(", ")}`);
  else add("trace", "Answers the diagnosis", "warn", "not linked to a prescription item");

  return out;
}

/** Duration from `ffmpeg -i` (ffmpeg-static); null when ffmpeg is unavailable. */
function videoSeconds(file: string): number | null {
  let bin: string | null = null;
  try {
    // ffmpeg-static exports the binary path; resolved at runtime so a missing devDependency is not fatal.
    const p = path.join(process.cwd(), "node_modules", "ffmpeg-static");
    if (fs.existsSync(p)) {
      const exe = fs.readdirSync(p).find((f) => /^ffmpeg(\.exe)?$/.test(f));
      bin = exe ? path.join(p, exe) : null;
    }
  } catch {
    bin = null;
  }
  if (!bin) return null;
  let text = "";
  try {
    execFileSync(bin, ["-hide_banner", "-i", file], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (e) {
    // ffmpeg exits non-zero without an output file; the info is on stderr.
    text = String((e as { stderr?: Buffer }).stderr ?? "");
  }
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(text);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

/** Short human-readable report for the CLI. */
export function formatReport(r: ValidationResult): string {
  const lines = [`validate:case ${r.slug}`];
  const errors = r.findings.filter((f) => f.level === "error");
  const warnings = r.findings.filter((f) => f.level === "warn");
  for (const f of errors) lines.push(`  ✗ ${f.file}: ${f.message}`);
  for (const f of warnings) lines.push(`  ! ${f.file}: ${f.message}`);
  if (r.preflight) {
    const p = r.preflight;
    const n = (s: PreflightCheck["status"]) => p.checks.filter((c) => c.status === s).length;
    lines.push(`  preflight ${p.status}: ${n("pass")} pass · ${n("warn")} warn · ${n("fail")} fail`);
  }
  lines.push(errors.length ? `  → ${errors.length} error(s)` : "  → OK");
  return lines.join("\n");
}
