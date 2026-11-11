import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { ink: '#242326', blush: '#f4e7e5', rose: '#d4a19b', champagne: '#f8f3ee', line: '#e7e1de' },
    fontFamily: { sans: ['var(--font-inter)', 'Arial', 'sans-serif'], display: ['var(--font-cormorant)', 'Georgia', 'serif'] },
    boxShadow: { drawer: '-12px 0 45px rgba(36,35,38,.1)' },
    keyframes: { float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } } },
    animation: { float: 'float 4s ease-in-out infinite' }
  } },
  plugins: []
};
export default config;
