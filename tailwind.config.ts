import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arena: { 50: "#f3f6ff", 100: "#e7edff", 500: "#5667ef", 600: "#4655d9", 900: "#172047" },
      },
    },
  },
  plugins: [],
};

export default config;
