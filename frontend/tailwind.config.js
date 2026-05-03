/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#060910",
          light: "#f8fafc"
        },
        foreground: {
          DEFAULT: "#ffffff",
          light: "#0f172a"
        },
        'text-secondary': {
          DEFAULT: "#94a3b8",
          light: "#475569"
        },
        accent: {
          primary: "#f66f14",
          secondary: "#ffad75",
          hover: "#ff8542",
        },
        surface: {
          primary: {
            DEFAULT: "rgba(0, 0, 0, 0.2)",
            light: "rgba(255, 255, 255, 0.8)"
          },
          secondary: {
            DEFAULT: "rgba(0, 0, 0, 0.3)",
            light: "rgba(255, 255, 255, 0.9)"
          },
          border: {
            DEFAULT: "rgba(255, 255, 255, 0.1)",
            light: "rgba(0, 0, 0, 0.1)"
          },
        },
        glow: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          orange: "#f66f14",
        }
      },
      fontFamily: {
        sans: ['Mulish', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '16px',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(246, 111, 20, 0.3)',
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.2)',
        'inner-glow': 'inset 0 -9px 24px rgba(246, 112, 20, 0.18)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
