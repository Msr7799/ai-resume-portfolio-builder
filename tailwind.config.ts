import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind v4 defaults to `media`. We need class-based dark mode because the app
  // toggles the `.dark` class on `<html>`.
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

