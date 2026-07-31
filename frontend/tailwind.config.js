/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        "primary-soft": "#D2BBFF",
        secondary: "#E8DFEE",
        muted: "#A39BB3",
        background: "#09090B",
        surface: "#15121B",
        surfaceDark: "#100D16",
        surfaceRaised: "#221E28",
        hoverSurface: "#2C2833",
        border: "#3F3A4A",
        success: "#22C55E",
        danger: "#F87171",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ['"Poppins"', "system-ui", "sans-serif"],
        display: ['"Poppins"', "system-ui", "sans-serif"],
        mono: ['"Poppins"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(124, 58, 237, 0.35)",
      },
    },
  },
  plugins: [],
}
