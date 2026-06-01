import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFF9F0",
        foreground: "#2D2D2D",
        muted: "#F5EBDD",
        "muted-foreground": "#6B7280",
        primary: "#FFB703",
        secondary: "#8ECAE6",
        success: "#90BE6D",
        pink: "#FFAFCC",
        purple: "#BDB2FF",
        expense: "#F28482",
        income: "#84A59D",
        border: "#2D2D2D",
        card: "#FFFFFF"
      },
      fontFamily: {
        heading: ["Baloo 2", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        number: ["Nunito Sans", "Inter", "sans-serif"]
      },
      boxShadow: {
        doodle: "4px 5px 0 rgba(45, 45, 45, 0.18)",
        soft: "0 14px 40px rgba(45, 45, 45, 0.08)"
      },
      borderRadius: {
        doodle: "1.15rem"
      }
    }
  },
  plugins: []
} satisfies Config;
