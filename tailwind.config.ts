import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glass:
          '0 8px 25px rgba(0,0,0,0.25), 0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
        'glass-hover':
          '0 12px 40px rgba(0,0,0,0.25), 0 6px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
      },
      backgroundImage: {
        'header-pattern': "url('/images/header-bg.png')",
        glass:
          'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 100%)',
        'glass-hover':
          'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 100%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      textShadow: {
        glow: '0 0 10px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.7)',
      },
      width: {
        'sidebar-expanded': '18rem',
        'sidebar-collapsed': '4rem',
        'sidebar-mobile': '18rem',
      },
      spacing: {
        'sidebar-expanded': '18rem',
        'sidebar-collapsed': '4rem',
        'sidebar-mobile': '18rem',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        eudoxus: ['EudoxusSans', 'sans-serif'],
        canela: ['var(--font-canela)'],
        inter: ['var(--font-inter)'],
        sans: [
          '-apple-system',
          'Roboto',
          'ui-sans-serif',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans',
          'Helvetica Neue',
          'Arial',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
      },

      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-border': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      },
      backgroundSize: {
        'gradient-border': '200% 200%',
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'gradient-border': 'gradient-border 2s linear infinite',
      },
      colors: {
        sapphire: '#0F52BA',
        'custom-accent': '#16A34A',
        'custom-accent2': '#2563EB',
        silk: '#F7E7CE',
        backgroundDark: '#004960',
        accentDark: '#004960',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
