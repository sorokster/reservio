/** @type {import("tailwindcss").Config} */
module.exports = {
  mode: "jit",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "550px",
        md: "1200px",
        lg: "1440px",
      },
    },
  },
  plugins: [],
}