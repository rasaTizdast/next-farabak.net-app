import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "fade-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      screens: {
        "2xl": "1400px",
        mobile: "577px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#00bfff",
        secondary: "#318ce7",
        third: "#1e90ff",
        fourth: "#0e6aff",
        "dark-blue": "#003262",
        brand: {
          primary: "#00bfff",
          secondary: "#318ce7",
          accent: "#1e90ff",
          deep: "#0e6aff",
          dark: "#003262",
        },
      },
    },
  },
  plugins: [typography],
};
export default config;
