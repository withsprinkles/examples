import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

import { reactCompiler } from "./react-compiler.plugin.ts";

export default defineConfig({
    plugins: [reactRouter(), reactCompiler(), devtoolsJson()],
    resolve: {
        tsconfigPaths: true,
    },
    css: {
        transformer: "lightningcss",
    },
    server: {
        port: 1613,
    },
});
