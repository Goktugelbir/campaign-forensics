import type { Config } from "tailwindcss";

// Design tokens — CAMPAIGN_FORENSICS.md §7.6 ("digital forensic case file").
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Every colour is an RGB triplet in a CSS variable (app/globals.css), so the dark and light
      // themes swap them in one place and opacity modifiers like bg-ink/80 keep working.
      colors: {
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)", // page background
          surface: "rgb(var(--c-ink-surface) / <alpha-value>)", // cards
          raised: "rgb(var(--c-ink-raised) / <alpha-value>)",
          line: "rgb(var(--c-ink-line) / <alpha-value>)", // 1px borders
          strong: "rgb(var(--c-ink-strong) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--c-fg) / <alpha-value>)", // headings
          body: "rgb(var(--c-fg-body) / <alpha-value>)", // body copy
          muted: "rgb(var(--c-fg-muted) / <alpha-value>)",
        },
        amber: {
          // The single accent. In the light theme text and lines use a darker amber for contrast;
          // solid fills (buttons, badges) stay bright — see .bg-amber in globals.css.
          DEFAULT: "rgb(var(--c-amber) / <alpha-value>)",
          soft: "rgb(var(--c-amber) / 0.15)",
          line: "rgb(var(--c-amber) / 0.4)",
        },
        "on-amber": "rgb(0 0 0 / <alpha-value>)", // text on a bright amber fill, both themes
        status: {
          confirmed: "rgb(var(--c-confirmed) / <alpha-value>)",
          uncertain: "rgb(var(--c-uncertain) / <alpha-value>)",
          rejected: "rgb(var(--c-rejected) / <alpha-value>)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "0.14em",
      },
      borderRadius: {
        card: "14px",
      },
      keyframes: {
        flash: {
          "0%": { boxShadow: "0 0 0 0 rgba(245,166,35,0)", borderColor: "rgb(var(--c-ink-line))" },
          "15%": { boxShadow: "0 0 0 3px rgba(245,166,35,0.55)", borderColor: "rgb(var(--c-amber))" },
          "85%": { boxShadow: "0 0 0 3px rgba(245,166,35,0.35)", borderColor: "rgb(var(--c-amber))" },
          "100%": { boxShadow: "0 0 0 0 rgba(245,166,35,0)", borderColor: "rgb(var(--c-ink-line))" },
        },
        fadein: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        flash: "flash 2s ease-in-out",
        fadein: "fadein 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
