import { defineConfig } from "@vite-pwa/assets-generator/config";

export default defineConfig({
	preset: {
		transparent: {
			sizes: [64, 192, 512],
			favicons: [[64, "favicon.ico"]],
		},
		maskable: {
			// Android crops maskable icons to a safe zone, so the default 30%
			// padding is what keeps the logo from being cut off. Leave it.
			sizes: [512],
		},
		apple: {
			sizes: [180],
			// iOS never crops the touch icon - it only rounds the corners - so
			// the default 30% padding is pure dead space and leaves the logo
			// filling 70% of the home screen tile. Fill the square instead.
			padding: 0,
		},
	},
	images: ["public/logo.jpg"],
});
