module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F7CFF",
        background: "#F7F9FC",
        success: "#18C964",
        warning: "#F5A524",
        danger: "#FF4D4F",
      }
    },
  },
  plugins: [],
}
