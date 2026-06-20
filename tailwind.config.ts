import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0B0D",
          soft: "#0E0F12",
        },
        card: {
          DEFAULT: "#131418",
          soft: "#17181D",
          hover: "#1C1E24",
        },
        line: "rgba(255,255,255,0.07)",
        brand: {
          DEFAULT: "#F7931A",
          hover: "#FFA52E",
          soft: "rgba(247,147,26,0.12)",
        },
        pos: "#16C784",
        neg: "#F6465D",
        muted: "#8A8F98",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 30px rgba(0,0,0,0.35)",
        glow: "0 8px 40px rgba(247,147,26,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
