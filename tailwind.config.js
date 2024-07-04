const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      textColor: {
        primary: '#000',
        secondary: '#C3C6D1',
        danger: '#FF675B',
        label: '#C7C7C7',
        dark: '#858997',
        light: {
          100: '#809FB8',
          200: '#87C6E8',
        },
        success: {
          100: '#1AD598',
        },
      },
      backgroundColor: {
        primary: '#87C6E8',
        secondary: '#F5F5F5',
        danger: '#FF675B',
        bg: '#F8F8F8',
        bbb: '#9a354e',
        light: {
          100: '#C3C6D129',
        },
        success: {
          100: '#1AD5984D',
          200: '#28B1A5',
        },
      },
      borderColor: {
        primary: '#87C6E8',
        secondary: '#F5F5F5',
        danger: '#FF675B',
        light: {
          100: '##D9E1E7CC',
        },
        success: {
          100: '#28B1A5',
        },
      },
      fontSize: {
        lg: '36px',
        md: '20px',
        sm: '14px',
      },
      lineHeight: {
        lg: '50px',
        md: '27px',
        sm: '21px',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
