import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rosegold: "#B76E79",
        ivory: "#FAF6F1",
        champagne: "#F3E5D0",
      },
      boxShadow: {
        card: "0 12px 30px rgba(35, 22, 22, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
