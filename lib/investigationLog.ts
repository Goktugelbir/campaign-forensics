import fs from "node:fs";
import path from "node:path";
import type { CreativeFile, InvestigationLog } from "./types";

/**
 * Rebuilds what the engine did from the files it left in data/cases/<slug>/raw:
 * the run table in raw/README.md (Apify actors, run IDs, limits) and one fal.ai request
 * log per generated file (raw/fal-*.json). Nothing is invented — a case without raw/ has no log.
 */
export function readInvestigationLog(caseDir: string, creative: CreativeFile | null): InvestigationLog | null {
  const raw = path.join(caseDir, "raw");
  if (!fs.existsSync(raw)) return null;

  const readme = path.join(raw, "README.md");
  const text = fs.existsSync(readme) ? fs.readFileSync(readme, "utf8") : "";
  const collection = parseRunTable(text);
  const spend = /Approximate spend:\s*([^\n.]+(?:\.\d+)?)/i.exec(text)?.[1]?.trim() ?? null;

  const used = new Set((creative?.assets ?? []).map((a) => a.path));
  const production = fs
    .readdirSync(raw)
    .filter((f) => /^fal-.+\.json$/.test(f))
    .map((f) => {
      const j = JSON.parse(fs.readFileSync(path.join(raw, f), "utf8")) as {
        model?: string;
        created_at?: string;
        seconds?: number;
        saved?: string[];
      };
      const output = j.saved?.[0] ?? "";
      return {
        name: f.replace(/^fal-|\.json$/g, ""),
        model: j.model ?? "",
        created_at: j.created_at ?? "",
        seconds: j.seconds ?? 0,
        output,
        // Clips, voice-over and music are cut into the final video, so "used" means
        // the file itself is in the report.
        used: used.has(output),
      };
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  if (collection.length === 0 && production.length === 0) return null;
  return { collection, production, spend };
}

/** Rows of the markdown table `| File | Actor | Run | Input (limits) |`. */
export function parseRunTable(md: string): InvestigationLog["collection"] {
  const rows: InvestigationLog["collection"] = [];
  for (const line of md.split(/\r?\n/)) {
    if (!/^\|/.test(line) || /^\|\s*-/.test(line) || /^\|\s*File\s*\|/i.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    const code = (s: string) => [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    rows.push({
      file: code(cells[0])[0] ?? "—",
      actor: code(cells[1])[0] ?? cells[1],
      runs: code(cells[2]).length ? code(cells[2]) : cells[2].split(",").map((s) => s.trim()).filter(Boolean),
      input: cells[3].replace(/`/g, "").replace(/\*\*/g, ""),
      empty: /\b0 results\b/i.test(cells[3]),
    });
  }
  return rows;
}
