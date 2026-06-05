import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        brand: {
          /* Theme-aware primary surface colors */
          dark:    "var(--brand-dark)",      // page background
          surface: "var(--brand-surface)",   // secondary background / sidebar tint
          muted:   "var(--brand-muted)",     // dividers, muted chip backgrounds

          /* Accent palette */
          teal:    "var(--brand-teal)",      // primary blue (replaces teal)
          cyan:    "var(--accent-cyan)",      // soft cyan highlight
          lavender:"var(--accent-violet)",   // purple accent glow
          amber:   "var(--accent-amber)",
          red:     "var(--accent-red)",
          green:   "var(--accent-green)",
        },
      },
      fontFamily: {
        sans:    ["var(--font-jakarta)", "sans-serif"],
        display: ["var(--font-clash)", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-primary":  "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)",
        "gradient-surface":  "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
        "gradient-card":     "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)",
      },
      boxShadow: {
        "l1":         "0 1px 4px rgba(0,0,0,0.5), 0 0 0 1px #1C2335",
        "l2":         "0 4px 20px rgba(0,0,0,0.7), 0 0 0 1px #1C2335",
        "l3":         "0 8px 48px rgba(0,0,0,0.9)",
        "accent-glow":"0 0 24px rgba(0,196,255,0.12)",
        "card":       "0 1px 4px rgba(0,0,0,0.5), 0 0 0 1px #1C2335",
        "card-hover": "0 1px 4px rgba(0,0,0,0.5), 0 0 0 1px #2A3554",
        "blue-glow":  "0 0 24px rgba(0,196,255,0.12)",
        "purple-glow":"0 0 24px rgba(139,111,255,0.12)",
        "btn":        "0 1px 4px rgba(0,0,0,0.5)",
        "btn-hover":  "0 2px 8px rgba(0,196,255,0.2)",
      },
      animation: {
        "pulse-slow":      "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer":         "shimmer 2s infinite linear",
        "fade-in-up":      "fadeInUp 0.5s ease-out forwards",
        "slide-in-right":  "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "blob":            "blob-float 8s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "blob-float": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%":      { transform: "translate(20px, -15px) scale(1.04)" },
          "66%":      { transform: "translate(-10px, 10px) scale(0.97)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
