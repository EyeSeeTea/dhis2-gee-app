/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { UserConfig, defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";

const redirectPaths = ["/dhis-web-pivot", "/dhis-web-data-visualizer"];

export default ({ mode }): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const proxy = getProxy(env);

    return defineConfig({
        base: "",
        plugins: [
            nodePolyfills(),
            // Solo JSX: evita error "can't detect preamble" en .ts que importan React (p. ej. app-context.ts)
            react({ include: "**/*.{jsx,tsx}" }),
            checker({
                overlay: false,
                typescript: true,
            }),
        ],
        test: {
            environment: "jsdom",
            include: ["src/**/*.spec.{ts,tsx}"],
            setupFiles: "./src/tests/setup.js",
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT || "8082", 10),
            strictPort: true,
            proxy,
        },
    });
};

function getProxy(env: Record<string, string>) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar];
    const isBuild = env.NODE_ENV === "production";

    if (isBuild) {
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
