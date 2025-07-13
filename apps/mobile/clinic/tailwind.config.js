/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
          800: '#14532D',
          900: '#052E16',
        },
        // Secondary Colors
        purple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#9333EA',
          600: '#7C3AED',
          700: '#6B21A8',
          800: '#581C87',
          900: '#3B0764',
        },
        charcoal: '#374151',
        // Semantic Colors
        success: '#10B981',
        warning: '#FB923C',
        error: '#F43F5E',
        info: '#0EA5E9',
        // Neutral Colors
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        display: ['56px', { lineHeight: '64px' }],
        h1: ['40px', { lineHeight: '48px' }],
        h2: ['32px', { lineHeight: '40px' }],
        h3: ['24px', { lineHeight: '32px' }],
        h4: ['20px', { lineHeight: '28px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        body: ['16px', { lineHeight: '24px' }],
        small: ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px' }],
      },
      spacing: {
        '2xs': '2px',
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        button: '10px',
        card: '16px',
        input: '10px',
      },
      // Box shadows are not supported in React Native
      // Use elevation for Android and shadowColor/shadowOffset/shadowOpacity/shadowRadius for iOS
      // boxShadow: {
      //   'button': '0 4px 6px rgba(22, 163, 74, 0.1)',
      //   'card': '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.03)',
      //   'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      // },
      animation: {
        fadeIn: 'fadeIn 350ms ease-in-out',
        slideIn: 'slideIn 350ms ease-in-out',
        scaleIn: 'scaleIn 200ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};