// Engine step 3 helper (CAMPAIGN_FORENSICS.md §4.2): run one fal.ai request and save
// the result locally, because fal.ai output URLs are temporary.
//
//   node scripts/fal-generate.mjs <slug> <name> <model-id> <input.json>
//
// FAL_KEY is read from the environment only — never from a file in this repo.
// Outputs: public/cases/<slug>/<name>.<ext> and data/cases/<slug>/raw/fal-<name>.json.
import fs from "node:fs";
import path from "node:path";
import { fal } from "@fal-ai/client";

const [slug, name, model, inputFile] = process.argv.slice(2);
if (!slug || !name || !model || !inputFile) {
  console.error("Usage: node scripts/fal-generate.mjs <slug> <name> <model-id> <input.json>");
  process.exit(2);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error("slug and name must be lowercase kebab-case");
  process.exit(2);
}
if (!process.env.FAL_KEY) {
  console.error("FAL_KEY is not set in the environment.");
  process.exit(2);
}

const root = process.cwd();
const input = JSON.parse(fs.readFileSync(inputFile, "utf8"));

// Local files ("/cases/..." or a path on disk) are uploaded to fal storage first.
for (const key of ["start_image_url", "end_image_url", "image_url"]) {
  const v = input[key];
  if (typeof v === "string" && !/^https?:\/\//.test(v)) {
    const file = v.startsWith("/cases/") ? path.join(root, "public", v) : path.resolve(v);
    const blob = new Blob([fs.readFileSync(file)], { type: file.endsWith(".png") ? "image/png" : "image/jpeg" });
    input[key] = await fal.storage.upload(blob);
    console.log(`uploaded ${v}`);
  }
}

console.log(`calling ${model} …`);
const started = Date.now();
const result = await fal.subscribe(model, { input, logs: true });

const data = result.data ?? {};
const files = [...(data.images ?? []), ...(data.video ? [data.video] : []), ...(data.audio ? [data.audio] : [])];
if (files.length === 0) {
  console.error("No images, video or audio in the response:", JSON.stringify(data).slice(0, 500));
  process.exit(1);
}

const outDir = path.join(root, "public", "cases", slug);
fs.mkdirSync(outDir, { recursive: true });
const saved = [];
for (const [i, f] of files.entries()) {
  const res = await fetch(f.url);
  if (!res.ok) throw new Error(`download failed ${res.status} for ${f.url}`);
  const type = res.headers.get("content-type") ?? f.content_type ?? "";
  const fromUrl = (f.url.match(/\.(mp4|mp3|wav|webp|jpe?g|png)(\?|$)/i) ?? [])[1]?.toLowerCase();
  const ext =
    fromUrl ??
    (type.includes("mp4") ? "mp4" : type.includes("mpeg") ? "mp3" : type.includes("wav") ? "wav" : type.includes("webp") ? "webp" : type.includes("jpeg") ? "jpg" : "png");
  const file = `${name}${files.length > 1 ? `-${i + 1}` : ""}.${ext}`;
  fs.writeFileSync(path.join(outDir, file), Buffer.from(await res.arrayBuffer()));
  saved.push(`/cases/${slug}/${file}`);
}

const log = {
  model,
  requestId: result.requestId,
  created_at: new Date().toISOString(),
  seconds: Math.round((Date.now() - started) / 1000),
  input,
  output: { seed: data.seed ?? null, urls: files.map((f) => f.url) },
  saved,
};
const rawDir = path.join(root, "data", "cases", slug, "raw");
fs.mkdirSync(rawDir, { recursive: true });
fs.writeFileSync(path.join(rawDir, `fal-${name}.json`), JSON.stringify(log, null, 2) + "\n");
console.log(JSON.stringify({ requestId: result.requestId, saved }, null, 2));
