// Assembles a relaunch ad from generated clips, a static end card, voiceover lines and
// a music bed. Titles are typeset here (ffmpeg drawtext), never drawn by a model —
// CAMPAIGN_FORENSICS.md §4.2 / fal_from_brief.md.
//
//   node scripts/compose-video.mjs prompts/<slug>/edit.json
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const root = process.cwd();
const edit = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const [W, H] = edit.size;
const fps = edit.fps;
const pub = (p) => path.join(root, "public", p);
const FONT_DIR = process.env.FONT_DIR ?? "C:/Windows/Fonts";
// Working files live inside the project so every path in the filter graph can be
// relative: drawtext treats the ':' of a Windows drive letter as an option separator.
const tmp = path.join(root, ".edit-tmp");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

const rel = (p) => path.relative(root, p).replace(/\\/g, "/");
const q = (s) => `'${rel(s).replace(/'/g, "'\\''")}'`;

const inputs = [];
const addInput = (args) => inputs.push(args) - 1;

const parts = [];
const vLabels = [];
const aLabels = [];
let t = 0;

edit.segments.forEach((seg, i) => {
  const d = seg.duration;
  let base;
  if (seg.kind === "card") {
    base = `color=c=0x0a0a0a:s=${W}x${H}:r=${fps}:d=${d}`;
    parts.push(`${base}[bg${i}]`);
  } else if (seg.kind === "clip") {
    const idx = addInput(["-i", pub(seg.source)]);
    parts.push(
      `[${idx}:v]trim=start=${seg.start}:duration=${d},setpts=PTS-STARTPTS,fps=${fps},` +
        `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,` +
        // shade the lower third so titles stay legible (seg.shade = opacity, default 0.55)
        `drawbox=x=0:y=ih*0.72:w=iw:h=ih*0.28:color=black@${seg.shade ?? 0.55}:t=fill[bg${i}]`,
    );
  } else if (seg.kind === "image") {
    const idx = addInput(["-loop", "1", "-t", String(d), "-i", pub(seg.source)]);
    // Optional crop [x, y, w, h] in source pixels, e.g. to frame only the main wordmark.
    const crop = seg.crop ? `crop=${seg.crop[2]}:${seg.crop[3]}:${seg.crop[0]}:${seg.crop[1]},` : "";
    // Optional place {width, y, bg}: scale the (cropped) image to `width` and pad it onto a
    // flat canvas at `y`, leaving room for titles. Otherwise fill the frame.
    const fit = seg.place
      ? `scale=${seg.place.width}:-2,pad=${W}:${H}:(ow-iw)/2:${seg.place.y}:color=${seg.place.bg}`
      : `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
    parts.push(`[${idx}:v]${crop}fps=${fps},${fit},setsar=1,trim=duration=${d}[bg${i}]`);
  }

  let chain = `[bg${i}]`;
  seg.texts.forEach((tx, j) => {
    const file = path.join(tmp, `t${i}_${j}.txt`);
    fs.writeFileSync(file, tx.text, "utf8");
    chain +=
      `drawtext=fontfile=${q(path.join(FONT_DIR, tx.font))}:textfile=${q(file)}:` +
      `fontsize=${tx.size}:fontcolor=${tx.color}:x=(w-text_w)/2:y=${tx.y}` +
      (tx.shadow ? `:shadowcolor=black@0.6:shadowx=2:shadowy=2` : "") +
      ",";
  });
  chain += `fade=t=in:st=0:d=0.3,fade=t=out:st=${(d - 0.3).toFixed(2)}:d=0.3,format=yuv420p[v${i}]`;
  parts.push(chain);
  vLabels.push(`[v${i}]`);

  if (seg.vo) {
    const idx = addInput(["-i", pub(seg.vo)]);
    const delay = Math.round((t + (seg.voOffset ?? 0.3)) * 1000);
    parts.push(`[${idx}:a]aresample=44100,adelay=${delay}|${delay}[vo${i}]`);
    aLabels.push(`[vo${i}]`);
  }
  t += d;
});

const total = t;
parts.push(`${vLabels.join("")}concat=n=${vLabels.length}:v=1:a=0[vout]`);

const mIdx = addInput(["-i", pub(edit.music.file)]);
parts.push(
  `[${mIdx}:a]aresample=44100,atrim=duration=${total},volume=${edit.music.volume},` +
    `afade=t=in:st=0:d=0.5,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5[music]`,
);
parts.push(`[music]${aLabels.join("")}amix=inputs=${aLabels.length + 1}:normalize=0:duration=first[aout]`);

const graph = path.join(tmp, "graph.txt");
fs.writeFileSync(graph, parts.join(";\n"));

const out = pub(edit.output);
const args = [
  "-y",
  ...inputs.flat(),
  "-filter_complex_script", graph,
  "-map", "[vout]", "-map", "[aout]",
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "160k",
  "-movflags", "+faststart",
  "-t", String(total),
  out,
];
execFileSync(ffmpeg, args, { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
fs.rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify({ output: edit.output, seconds: Number(total.toFixed(2)) }));
