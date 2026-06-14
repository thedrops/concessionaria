import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0066CC",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#0066CC",
          600: "#005bb8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
        secondary: {
          DEFAULT: "#636E72",
          50: "#F5F6F7",
          100: "#eceff1",
          200: "#dfe4e7",
          300: "#c7d0d5",
          400: "#99a4aa",
          500: "#636E72",
          600: "#4f5a5f",
          700: "#3f484c",
          800: "#2D3436",
          900: "#1f2527",
        },
        accent: {
          DEFAULT: "#E63946",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#ef6973",
          500: "#E63946",
          600: "#cf2634",
          700: "#ad1f2b",
          800: "#7f1d1d",
          900: "#651e1e",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-scale": "fadeInScale 0.5s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(230, 57, 70, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(230, 57, 70, 0.6)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(at 27% 37%, rgba(0, 102, 204, 0.16) 0px, transparent 50%), radial-gradient(at 52% 99%, rgba(230, 57, 70, 0.1) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
