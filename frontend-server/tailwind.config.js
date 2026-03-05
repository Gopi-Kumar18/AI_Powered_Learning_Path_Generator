/** @type {import('tailwindcss').Config} */
//export default {
//  content: [],
//  theme: {
//    extend: {},
//  },
//  plugins: [],
//}


export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom colors here later if needed

      keyframes: {
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2s linear infinite',
      },
      
    },
  },
  plugins: [],
}

