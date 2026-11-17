import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0b1623",
          900: "#0f1f30",
          800: "#121f30",
          700: "#1a2d42",
        },
        accent: "#f4a261",
        ink: {
          DEFAULT: "#d1e4f0",
          soft: "#c8dce8",
          200: "#9ab8cc",
          300: "#8aa7b9",
          400: "#7ea0b7",
          500: "#6a8ba0",
          600: "#5a7a90",
        },
        success: {
          DEFAULT: "#2ec482",
          bg: "#0f2318",
          dim: "#1a3028",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
