import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        synth: {
          bg: "#F8F9FB",
          surface: "#FFFFFF",
          "surface-2": "#F1F3F6",
          "text-1": "#0A0A0F",
          "text-2": "#4A5568",
          "text-3": "#8896AB",
          accent: "#2563EB",
          "accent-light": "#EFF6FF",
          "accent-mid": "#3B82F6",
          border: "rgba(10,10,15,0.08)",
          "border-med": "rgba(10,10,15,0.14)",
          green: "#1A9E75",
          "green-light": "#E0F5EE",
          red: "#C0392B",
          "red-light": "#FDECEA",
          blue: "#2563EB",
          "blue-light": "#EFF6FF",
          amber: "#D97706",
          "amber-light": "#FFFBEB",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["SF Pro Display", "Inter", "system-ui", "sans-serif"],
        sans: ["SF Pro Text", "Inter", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
