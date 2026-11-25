import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#0F3D33", dark: "#0A2B24", light: "#1C5A4B" },
        gold: { DEFAULT: "#B8924A", light: "#D8B876" },
        cream: { DEFAULT: "#FAF6EF", dark: "#F0E8DA" },
        ink: "#1C1917",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
