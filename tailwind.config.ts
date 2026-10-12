import type { Config } from "tailwindcss";

// Design tokens — CAMPAIGN_FORENSICS.md §7.6 ("digital forensic case file").
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#000000", // page background
          surface: "#0e0e0e", // cards
          raised: "#141414",
          line: "#222222", // 1px borders
          strong: "#333333",
        },
        fg: {
          DEFAULT: "#ffffff", // headings
          body: "#9a9a9a", // body copy
          muted: "#6b6b6b",
        },
        amber: {
          DEFAULT: "#f5a623", // the single accent
          soft: "#f5a62326",
          line: "#f5a62366",
        },
        status: {
          confirmed: "#3ecf8e",
          uncertain: "#9a9a9a",
          rejected: "#ef5b5b",
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
          "0%": { boxShadow: "0 0 0 0 rgba(245,166,35,0)", borderColor: "#222222" },
          "15%": { boxShadow: "0 0 0 3px rgba(245,166,35,0.55)", borderColor: "#f5a623" },
          "85%": { boxShadow: "0 0 0 3px rgba(245,166,35,0.35)", borderColor: "#f5a623" },
          "100%": { boxShadow: "0 0 0 0 rgba(245,166,35,0)", borderColor: "#222222" },
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
