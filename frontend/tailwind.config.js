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
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			primary: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d',
  				'950': '#171719',
  			
  			},
  			secondary: {
  				'500': '#d3f26a',
				'200' : '#edffb0',
  			},
  			accent: {
  				'500': '#ad7bff',
  				
  			},
  			grey: {
  				'500': '#f2f4f0'
  			},
		}
  	}
  },
  plugins: [],
}