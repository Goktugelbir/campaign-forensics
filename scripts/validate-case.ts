// npm run validate:case [slug ...]   — no slug = every case
// Checks the data contracts and runs the deterministic creative preflight, then writes
// data/cases/<slug>/preflight.json (shown on the Relaunch tab). Exits 1 on any error.
import fs from "node:fs";
import path from "node:path";
import { formatReport, validateCase } from "../lib/validateCase.ts";

const dir = path.join(process.cwd(), "data", "cases");
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, "case.json")));

let failed = false;
for (const slug of slugs) {
  const r = await validateCase(slug);
  console.log(formatReport(r));
  if (r.preflight) {
    fs.writeFileSync(path.join(dir, slug, "preflight.json"), JSON.stringify(r.preflight, null, 2) + "\n");
    console.log(`  wrote data/cases/${slug}/preflight.json\n`);
  }
  if (r.findings.some((f) => f.level === "error")) failed = true;
}
process.exit(failed ? 1 : 0);
