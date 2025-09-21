/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#f0f4ff",
					100: "#e6efff",
					200: "#d1e0ff",
					300: "#abc4ff",
					400: "#7fa3ff",
					500: "#667eea",
					600: "#5a67d8",
					700: "#4c51bf",
					800: "#434190",
					900: "#3c366b",
				},
				secondary: {
					50: "#faf5ff",
					100: "#f3e8ff",
					200: "#e9d5ff",
					300: "#d8b4fe",
					400: "#c084fc",
					500: "#764ba2",
					600: "#9333ea",
					700: "#7c3aed",
					800: "#6b21a8",
					900: "#581c87",
				},
			},
			backgroundImage: {
				"gradient-primary":
					"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			},
			gridTemplateColumns: {
				led: "repeat(40, minmax(0, 1fr))",
			},
			gridTemplateRows: {
				led: "repeat(5, minmax(0, 1fr))",
			},
		},
	},
	plugins: [],
}
