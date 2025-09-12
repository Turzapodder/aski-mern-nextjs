/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-poppins)'
  			],
  			funnel: [
  				'var(--font-funnel-display)'
  			],
  			orbitron: [
  				'var(--font-orbitron)'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			// Base colors
  			black: '#121212',
  			grey: '#636363',
  			white: '#ffffff',
  			
  			// Primary Purple palette
  			primary: {
  				'100': '#dec8fe', // Purple 100
  				'200': '#9d84ee', // Purple 200  
  				'300': '#343238FF', // Purple 300
  				'500': '#7c5cff', // Default primary
  				'600': '#6b4eff',
  				'700': '#5a40ff',
  				'800': '#4932ff',
  				'900': '#3824ff',
  			},
  			
  			// Secondary Yellow palette
  			secondary: {
  				'100': '#ffdb25d', // Yellow 100
  				'200': '#ffbe17', // Yellow 200
  				'300': '#ffb802', // Yellow 300
  				'500': '#ffbe17', // Default secondary
  			},
  			
  			// Accent colors (keeping purple as accent)
  			accent: {
  				'500': '#7c5cff',
  			},
		}
  	}
  },
  plugins: [],
}