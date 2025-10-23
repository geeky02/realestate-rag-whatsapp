/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          light: '#DCF8C6',
          dark: '#128C7E',
          gray: '#ECE5DD',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

