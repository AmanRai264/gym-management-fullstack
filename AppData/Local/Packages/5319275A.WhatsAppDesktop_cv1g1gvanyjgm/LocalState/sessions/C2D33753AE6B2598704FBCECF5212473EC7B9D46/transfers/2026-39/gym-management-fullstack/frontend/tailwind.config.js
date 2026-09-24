/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0B1220",
          800: "#131C2E",
          700: "#1B2740",
          600: "#28365650",
        },
        accent: {
          DEFAULT: "#FF5A36",
          50: "#FFF1EC",
          100: "#FFE0D3",
          500: "#FF5A36",
          600: "#E8471F",
          700: "#C23A18",
        },
        mint: {
          DEFAULT: "#16A34A",
          50: "#ECFDF3",
          500: "#16A34A",
        },
        paper: "#F7F7F5",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
