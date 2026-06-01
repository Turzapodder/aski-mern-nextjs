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
					'var(--font-poppins)',
					'sans-serif'
				],
				display: [
					'var(--font-space-grotesk)',
					'sans-serif'
				],
			},
			colors: {
				background: 'hsl(var(--background))',
				black: '#121212',
				grey: '#636363',
				white: '#ffffff',

				primary: {
					'100': '#dec8fe',
					'200': '#9d84ee',
					'300': '#343238FF',
					'500': '#7c5cff',
					'600': '#6b4eff',
					'700': '#5a40ff',
					'800': '#4932ff',
					'900': '#3824ff',
				},

				secondary: {
					'100': '#ffdb25d',
					'200': '#ffbe17',
					'300': '#ffb802',
					'500': '#ffbe17',
				},

				accent: {
					'500': '#7c5cff',
				},

				status: {
					progress: '#3b82f6',
					completed: '#10b981',
					pending: '#f59e0b',
					cancelled: '#ef4444'
				},

				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [],
}
