import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        barcaBlue: "#004D98",
        barcaRed: "#A50044",
        barcaGold: "#EDBB00",
        night: "#050814"
      },
      boxShadow: {
        glow: "0 0 40px rgba(237,187,0,.12)",
        danger: "0 0 35px rgba(165,0,68,.25)"
      }
    }
  },
  plugins: []
};

export default config;
