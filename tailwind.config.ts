export default {
  content: [
    "./components/**/*.{vue,js}",
    "./app/features/**/*.{vue,js,ts}",
    "./pages/**/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        accent: "#F8EDEB",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
      },
    },
  },
};
