import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#030f23",
        "navy-2": "#071a3e",
        blue: {
          DEFAULT: "#1354a8",
          bright: "#1e6fd4",
          glow: "#3b8cff",
        },
        accent: "#f04e2b",
        "off-white": "#f5f8ff",
        "brand-gray": "#8fa3c0",
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow-condensed)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(59, 140, 255, 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
