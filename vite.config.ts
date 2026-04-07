/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { UserConfig, defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";

const redirectPaths = ["/dhis-web-pivot", "/dhis-web-data-visualizer"];

export default ({ mode, command }): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const isVitest = env.VITEST === "true";
    const proxy = getProxy(env, command, isVitest);

    const devPort = parseInt(env.VITE_PORT || "8082", 10);

    return defineConfig({
        base: "",
        plugins: [
            nodePolyfills(),
            // Solo JSX: evita error "can't detect preamble" en .ts que importan React (p. ej. app-context.ts)
            react({ include: "**/*.{jsx,tsx}" }),
            checker({
                overlay: false,
                typescript: true,
                eslint: {
                    lintCommand: 'eslint "src/**/*.{js,jsx,ts,tsx}"',
                    dev: { logLevel: ["warning"] },
                },
            }),
        ],
        test: {
            environment: "jsdom",
            include: ["**/*.spec.{ts,tsx}"],
            setupFiles: "./src/tests/setup.js",
            exclude: ["node_modules", "src/tests/playwright"],
            globals: true,
        },
        server: isVitest
            ? {
                  // Vitest reutiliza esta config: no ocupar VITE_PORT del .env (p. ej. 8081) ni chocar con `yarn start`
                  port: 0,
                  strictPort: false,
                  proxy: {},
              }
            : {
                  port: devPort,
                  strictPort: true,
                  proxy,
              },
    });
};

function getProxy(env: Record<string, string>, command: string, isVitest: boolean) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar];

    if (isVitest) {
        return {};
    }

    // En `vite build` no hace falta proxy. `command` a veces no llega en subcargas de config (p. ej. checker).
    const isViteBuild =
        command === "build" || process.argv.includes("build") || process.env.npm_lifecycle_event === "build";
    if (isViteBuild) {
        return {};
    }
    if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar}`);
        process.exit(1);
    }
    if (!auth) {
        console.error(`Set ${dhis2AuthVar}`);
        process.exit(1);
    }

    return {
        "/dhis2": {
            target: targetUrl,
            changeOrigin: true,
            auth,
            rewrite: (p: string) => p.replace(/^\/dhis2/, ""),
            configure: proxy => {
                proxy.on("proxyReq", (proxyReq, req, res) => {
                    const u = req.url ?? "";
                    const pathWithoutPrefix = u.replace(/^\/dhis2/, "") || "/";
                    const shouldRedirect = redirectPaths.some(rp => pathWithoutPrefix.startsWith(`/${rp}`));
                    if (shouldRedirect) {
                        proxyReq.destroy();
                        const redirectUrl = targetUrl.replace(/\/$/, "") + pathWithoutPrefix;
                        res.writeHead(302, { Location: redirectUrl });
                        res.end();
                    }
                });
            },
        },
    };
}
