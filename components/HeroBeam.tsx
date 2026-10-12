"use client";

import { useEffect, useRef } from "react";

// Where the star sits inside the hero, in percent of its width / height.
const ORIGIN_X = 80;
const ORIGIN_Y = 66;
// The beam layer is 3× the hero so the wedge reaches the edges in any direction;
// these are the origin's coordinates inside that layer.
const LAYER_X = (100 + ORIGIN_X) / 3;
const LAYER_Y = (100 + ORIGIN_Y) / 3;

/**
 * The logo's motif — a four-point star with an amber beam — where the beam turns towards the
 * mouse. Without a pointer (touch, keyboard, before the first move) it sweeps gently; with
 * reduced motion it stays still, pointing right.
 */
export function HeroBeam() {
  const beam = useRef<HTMLDivElement>(null);
  const star = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = beam.current;
    const origin = star.current;
    if (!el || !origin) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let target: number | null = null; // degrees, 0 = pointing right
    let current = 0;
    let lastMove = 0;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = origin.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Only follow while the hero is on screen.
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      target = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
      lastMove = performance.now();
    };

    const tick = (now: number) => {
      // Back to the idle sweep a few seconds after the mouse stops or leaves.
      const following = target !== null && now - lastMove < 4000;
      const goal = following ? target! : Math.sin(now / 2200) * 7;
      // Shortest way round, eased.
      const diff = ((goal - current + 540) % 360) - 180;
      current += diff * (following ? 0.12 : 0.04);
      el.style.transform = `rotate(${current.toFixed(2)}deg)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="absolute inset-0 hidden md:block">
      <div
        ref={beam}
        className="hero-beam absolute -inset-[100%] will-change-transform"
        style={
          {
            "--beam-x": `${LAYER_X}%`,
            "--beam-y": `${LAYER_Y}%`,
            transformOrigin: `${LAYER_X}% ${LAYER_Y}%`,
          } as React.CSSProperties
        }
      />
      <div
        className="absolute h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/[0.08] blur-[110px]"
        style={{ left: `${ORIGIN_X}%`, top: `${ORIGIN_Y}%` }}
      />
      <svg
        ref={star}
        viewBox="0 0 24 24"
        className="hero-spark absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-amber"
        style={{ left: `${ORIGIN_X}%`, top: `${ORIGIN_Y}%` }}
      >
        <path fill="currentColor" d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
      </svg>
    </div>
  );
}
