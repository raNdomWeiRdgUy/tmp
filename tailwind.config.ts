import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // High Contrast Color System
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          navy: '#0f172a',
          dark: '#1e293b',
          medium: '#334155',
          light: '#475569',
        },
        accent: {
          emerald: '#10b981',
          teal: '#14b8a6',
          blue: '#3b82f6',
        },
        text: {
          white: '#ffffff',
          light: '#f8fafc',
          'gray-light': '#e2e8f0',
          'gray-medium': '#94a3b8',
          'gray-dark': '#475569',
          dark: '#1e293b',
        },
        bg: {
          white: '#ffffff',
          light: '#f8fafc',
          'gray-50': '#f1f5f9',
          'gray-100': '#e2e8f0',
          dark: '#0f172a',
          medium: '#1e293b',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #10b981 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'modern': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modern-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'colored': '0 10px 25px -3px rgba(15, 23, 42, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        bounceGentle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
}

export default config
