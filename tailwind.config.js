// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dot-pattern':'radial-gradient(circle, gray 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-pattern': '20px 20px', // ドットの繰り返し間隔を設定
      },
    },
  },
  plugins: [],
}