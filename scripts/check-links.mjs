// Crawls a running instance (default http://localhost:3000) from "/" and reports any
// internal link that doesn't return 200. Usage: npm run start & npm run check:links [baseUrl]
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const seen = new Set();
const queue = ["/"];
const broken = [];

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  let res;
  try {
    res = await fetch(base + path, { redirect: "manual" });
  } catch (err) {
    broken.push(`${path} — ${err.message}`);
    continue;
  }
  if (res.status !== 200) {
    broken.push(`${path} — HTTP ${res.status}`);
    continue;
  }
  if (!(res.headers.get("content-type") ?? "").includes("text/html")) continue;
  const html = await res.text();
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next")) continue;
    const clean = href.split("#")[0] || "/";
    if (!seen.has(clean)) queue.push(clean);
  }
}

console.log(`Checked ${seen.size} internal URLs on ${base}`);
if (broken.length) {
  console.error(`Broken (${broken.length}):\n  ${broken.join("\n  ")}`);
  process.exit(1);
}
console.log("No broken links.");
