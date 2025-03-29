
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'cartoon': ['"Comic Neue"', 'cursive'],
			},
			colors: {
				border: '#000000',
				input: '#f0f0f0',
				ring: '#000000',
				background: '#ffffff',
				foreground: '#000000',
				primary: {
					DEFAULT: '#000000',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#888888',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: '#000000',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f0f0f0',
					foreground: '#555555'
				},
				accent: {
					DEFAULT: '#cccccc',
					foreground: '#000000'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#000000'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#000000'
				},
				sidebar: {
					DEFAULT: '#ffffff',
					foreground: '#000000',
					primary: '#000000',
					'primary-foreground': '#ffffff',
					accent: '#cccccc',
					'accent-foreground': '#000000',
					border: '#000000',
					ring: '#000000'
				},
				canvas: {
					background: '#ffffff',
					border: '#000000',
					hover: '#f8f8f8'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-light': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'sketch': {
					'0%': { transform: 'translate(1px, 1px) rotate(0deg)' },
					'10%': { transform: 'translate(-1px, -1px) rotate(-0.5deg)' },
					'20%': { transform: 'translate(-2px, 0px) rotate(0.5deg)' },
					'30%': { transform: 'translate(2px, 1px) rotate(0deg)' },
					'40%': { transform: 'translate(1px, -1px) rotate(0.5deg)' },
					'50%': { transform: 'translate(-1px, 1px) rotate(-0.5deg)' },
					'60%': { transform: 'translate(-2px, 1px) rotate(0deg)' },
					'70%': { transform: 'translate(2px, 1px) rotate(-0.5deg)' },
					'80%': { transform: 'translate(-1px, -1px) rotate(0.5deg)' },
					'90%': { transform: 'translate(1px, 1px) rotate(0deg)' },
					'100%': { transform: 'translate(1px, -1px) rotate(-0.5deg)' },
				},
				'pop-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'70%': { transform: 'scale(1.1)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'draw-line': {
					'0%': { strokeDashoffset: '1000' },
					'100%': { strokeDashoffset: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-light': 'pulse-light 2s ease-in-out infinite',
				'sketch': 'sketch 0.5s ease-in-out',
				'pop-in': 'pop-in 0.4s forwards',
				'draw-line': 'draw-line 1s forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
