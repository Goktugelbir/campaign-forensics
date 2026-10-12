// Regenerates the README screenshots in docs/screenshots/ from a running server.
//
//   npm run build && npm start            # in one terminal
//   npm run screenshots [base-url]        # in another (default http://localhost:3000)
//
// Uses a locally installed Chrome/Edge in headless mode — set CHROME_PATH if it isn't found.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const out = path.join(process.cwd(), "docs", "screenshots");

// [file name, route, window height]. Report tabs get a taller window so the content below the header shows.
const SHOTS = [
  ["landing", "/", 900],
  ["cases", "/cases", 900],
  ["report-case", "/cases/lays-rebrand", 1300],
  ["report-evidence", "/cases/lays-rebrand?tab=evidence", 1300],
  ["report-diagnosis", "/cases/lays-rebrand?tab=diagnosis", 1500],
  ["report-relaunch", "/cases/instagram-wordmark-2026?tab=relaunch", 1500],
  ["new-case", "/new", 900],
];

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CANDIDATES.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error("No Chrome/Edge found. Set CHROME_PATH to a Chromium-based browser.");
  process.exit(1);
}

fs.mkdirSync(out, { recursive: true });
for (const [name, route, height] of SHOTS) {
  const file = path.join(out, `${name}.png`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--force-prefers-reduced-motion", // skip the tab fade-in so nothing is captured mid-animation
    `--window-size=1440,${height}`,
    "--virtual-time-budget=5000",
    `--screenshot=${file}`,
    base + route,
  ], { stdio: "ignore" });
  console.log(`${name.padEnd(18)} ${route}`);
}
console.log(`\nSaved ${SHOTS.length} screenshots to ${path.relative(process.cwd(), out)}/`);
