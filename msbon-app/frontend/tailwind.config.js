/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:              "#F7F3EE",
        "cream-dark":       "#EDE7DC",
        charcoal:           "#1E1E1E",
        "charcoal-muted":   "#6B6560",
        "charcoal-faint":   "#1E1E1E14",
        terracotta:         "#B84A32",
        "terracotta-dark":  "#9F3E2A",
        "terracotta-light": "#B84A321A",
      },
      fontFamily: {
        display: ["'Fraunces Variable'", "Fraunces", "Georgia", "serif"],
        sans:    ["'DM Sans Variable'", "DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(4rem, 10vw, 9rem)",      { lineHeight: "0.95", letterSpacing: "-0.02em"  }],
        "display-xl":  ["clamp(3rem, 6vw, 5.5rem)",     { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-lg":  ["clamp(2rem, 4vw, 3.5rem)",     { lineHeight: "1.1",  letterSpacing: "-0.01em"  }],
        "display-md":  ["clamp(1.5rem, 3vw, 2.25rem)",  { lineHeight: "1.2"  }],
        "body-lg":     ["1.25rem",    { lineHeight: "1.75" }],
        "body-md":     ["1.125rem",   { lineHeight: "1.75" }],
        "body-sm":     ["0.9375rem",  { lineHeight: "1.6"  }],
        "label":       ["0.8125rem",  { lineHeight: "1.5", letterSpacing: "0.08em" }],
      },
      letterSpacing: {
        wider: "0.08em",
      },
      maxWidth: {
        prose: "68ch",
        editorial: "1200px",
        wide: "1400px",
      },
    },
  },
  plugins: [],
}
