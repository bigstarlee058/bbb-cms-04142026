/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors:{bbb: '#9a354e'},
      textColor: {
        primary: '#000',
        secondary: '#C3C6D1',
        bbb: '#9a354e',
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
        roboto: ['Roboto', 'sans-serif'],
        circular: ['Circular Std Black', 'sans-serif']
      },
      margin: {
        '25px': '25px',
      },
      height: {
        '200px' : '200px',
        '80px' : '80px',
      }
    },
  },
  plugins: []
};
