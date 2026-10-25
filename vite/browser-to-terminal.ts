import type { Plugin } from "vite";

/**
 * Forwards browser console errors, uncaught exceptions and unhandled promise
 * rejections from the page to the `vite dev` terminal.
 *
 * Vite has no equivalent of Next.js's `logging.browserToTerminal`, so the
 * failures that matter most in this app are invisible to anything reading the
 * terminal — a coding agent, or a `pnpm dev` scrollback. Neither `pnpm lint`
 * nor `pnpm typecheck` catches a Firestore write that hangs offline, a service
 * worker that serves a stale shell, or an image rule that returns an opaque
 * response; all three only show up at runtime, in a console nobody is reading.
 *
 * Dev only: `apply: "serve"` keeps the client out of the production bundle.
 */

const VIRTUAL_ID = "virtual:browser-to-terminal";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/** Log levels the page is allowed to forward. Anything else is dropped. */
const LEVELS = ["error", "warn"] as const;
type Level = (typeof LEVELS)[number];

interface BrowserLog {
	level: Level;
	message: string;
	stack?: string;
}

const COLOR: Record<Level, string> = {
	error: "\u001b[31m", // red
	warn: "\u001b[33m", // yellow
};
const RESET = "\u001b[0m";
const DIM = "\u001b[2m";

export function browserToTerminal(): Plugin {
	return {
		name: "service-nova:browser-to-terminal",
		apply: "serve",

		resolveId(id) {
			return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
		},

		load(id) {
			return id === RESOLVED_ID ? CLIENT : undefined;
		},

		// Injected rather than imported from main.tsx so the app source stays
		// free of dev-only wiring.
		transformIndexHtml() {
			return [
				{
					tag: "script",
					attrs: { type: "module", src: `/@id/${VIRTUAL_ID}` },
					injectTo: "head-prepend",
				},
			];
		},

		configureServer(server) {
			server.ws.on("service-nova:browser-log", (data: BrowserLog) => {
				if (!LEVELS.includes(data?.level)) return;

				const color = COLOR[data.level];
				const label = data.level === "error" ? "browser error" : "browser warn";
				server.config.logger.info(
					`${color}[${label}]${RESET} ${data.message}`
				);
				if (data.stack) {
					server.config.logger.info(`${DIM}${data.stack}${RESET}`);
				}
			});
		},
	};
}

/**
 * Runs in the page. Kept as a string so it is never part of the module graph
 * that gets bundled for production.
 */
const CLIENT = /* js */ `
if (import.meta.hot) {
	const send = (level, message, stack) => {
		try {
			import.meta.hot.send("service-nova:browser-log", { level, message, stack });
		} catch {
			// The dev socket is down (server restarting). Nothing useful to do.
		}
	};

	const format = (value) => {
		if (value instanceof Error) return value.message;
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	};

	// Vite already prints its own overlay errors to the terminal; forwarding
	// them again would double every HMR failure.
	const isViteNoise = (text) =>
		text.startsWith("[vite]") || text.startsWith("[hmr]");

	for (const level of ["error", "warn"]) {
		const original = console[level].bind(console);
		console[level] = (...args) => {
			original(...args);
			const text = args.map(format).join(" ");
			if (isViteNoise(text)) return;
			const stack = args.find((a) => a instanceof Error)?.stack;
			send(level, text, stack);
		};
	}

	window.addEventListener("error", (event) => {
		send("error", "Uncaught " + format(event.error ?? event.message), event.error?.stack);
	});

	window.addEventListener("unhandledrejection", (event) => {
		send("error", "Unhandled rejection: " + format(event.reason), event.reason?.stack);
	});
}
`;
