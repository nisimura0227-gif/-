import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2f7d4f",
          dark: "#235f3c",
          light: "#eaf6ee",
        },
        accent: {
          DEFAULT: "#e67e22",
          dark: "#b85e18",
          light: "#fdf0e3",
        },
      },
      fontSize: {
        base: ["17px", "1.6"],
      },
    },
  },
  plugins: [],
};
export default config;
