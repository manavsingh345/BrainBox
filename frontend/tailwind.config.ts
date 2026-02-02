import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./index.html",

    // ALL React source files live here
    "./src/**/*.{js,ts,jsx,tsx}",

    // If you ever use MDX later (safe to keep)
    "./src/**/*.{mdx}",
  ],
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
