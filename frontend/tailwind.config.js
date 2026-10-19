/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Bangers', 'system-ui', 'sans-serif'],
                body: ['"Space Mono"', 'monospace'],
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                cream: '#FFF9E6',
                ink: '#0A0A0A',
                acid: '#FFFF00',
                cyan: '#00FFFF',
                tomato: '#FF3B30',
                lime: '#39FF14',
            },
            keyframes: {
                'shake': {
                    '0%, 100%': { transform: 'translate(0,0) rotate(0deg)' },
                    '10%': { transform: 'translate(-6px,4px) rotate(-1deg)' },
                    '20%': { transform: 'translate(6px,-4px) rotate(1deg)' },
                    '30%': { transform: 'translate(-8px,-3px) rotate(-2deg)' },
                    '40%': { transform: 'translate(8px,3px) rotate(2deg)' },
                    '50%': { transform: 'translate(-4px,5px) rotate(-1deg)' },
                    '60%': { transform: 'translate(4px,-5px) rotate(1deg)' },
                    '70%': { transform: 'translate(-7px,2px) rotate(-1deg)' },
                    '80%': { transform: 'translate(7px,-2px) rotate(1deg)' },
                    '90%': { transform: 'translate(-3px,3px) rotate(0deg)' },
                },
                'wobble': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'pop-in': {
                    '0%': { transform: 'scale(0) rotate(-20deg)', opacity: 0 },
                    '70%': { transform: 'scale(1.3) rotate(8deg)', opacity: 1 },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                },
                'fly-up': {
                    '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
                    '100%': { transform: 'translateY(-120px) scale(1.6)', opacity: 0 },
                },
                'spin-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'flash': {
                    '0%, 100%': { opacity: 0 },
                    '50%': { opacity: 1 },
                },
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
            },
            animation: {
                'shake': 'shake 0.4s ease-in-out',
                'wobble': 'wobble 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'pop-in': 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'fly-up': 'fly-up 0.8s ease-out forwards',
                'spin-slow': 'spin-slow 12s linear infinite',
                'flash': 'flash 0.15s ease-in-out',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
