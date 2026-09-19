import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import * as path from "path";
import { browserToTerminal } from "./vite/browser-to-terminal.ts";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// Dev-only: pipes browser console errors to the terminal. See the file
		// for why (runtime-only failures are invisible to lint and tsc).
		browserToTerminal(),
		TanStackRouterVite(),
		VitePWA({
			registerType: 'prompt',
			// These live in public/ so Vite copies them into the build. They
			// were previously at the project root, where nothing picked them
			// up and the manifest pointed at icons that were never shipped.
			includeAssets: [
				'favicon.ico',
				'apple-touch-icon-180x180.png',
				'logo.jpg',
			],
			manifest: {
				name: 'Service Nova',
				short_name: 'Service Nova',
				description: 'Vehicle Service Management App',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				// A cold launch with no network gets the app shell instead of
				// the browser's error page.
				navigateFallback: 'index.html',
				runtimeCaching: [
					{
						// Vehicle images are arbitrary remote URLs typed into
						// the vehicle form, so match by destination rather than
						// by host. Without this an offline fleet loads its data
						// and renders a grid of broken images.
						urlPattern: ({ request }) => request.destination === 'image',
						handler: 'CacheFirst',
						options: {
							cacheName: 'vehicle-images',
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
							// 0 keeps opaque cross-origin responses, which is
							// what a plain <img> to another domain returns.
							cacheableResponse: { statuses: [0, 200] },
						},
					},
					{
						// Google account avatar in the sidebar user row.
						urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-avatars',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
				],
			}
		})
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "src"), // '@' points to the 'src' directory
		},
	},
});
