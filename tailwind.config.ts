import type { Config } from "tailwindcss";

// Every colour and font resolves to a token in src/app/tokens.css.
const token = (name: string) => `var(--color-${name})`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: token("paper"), 2: token("paper-2"), 3: token("paper-3") },
        card: token("card"),
        ink: { DEFAULT: token("ink"), 2: token("ink-2"), muted: token("muted") },
        rule: { DEFAULT: token("rule"), 2: token("rule-2") },
        sun: {
          DEFAULT: token("accent"),
          soft: token("accent-soft"),
          strong: token("accent-strong"),
          ink: token("accent-ink"),
        },
        sea: { DEFAULT: token("sea"), soft: token("sea-soft"), ink: token("sea-ink") },
        focus: token("focus"),
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        ticket: "var(--radius-ticket)",
        control: "var(--radius-control)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
    },
  },
  plugins: [],
};

export default config;
