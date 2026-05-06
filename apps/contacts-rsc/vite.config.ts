import { unstable_reactRouterRSC as reactRouter } from "@react-router/dev/vite";
import babel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
    plugins: [reactRouter(), rsc(), babel({ presets: [reactCompilerPreset()] }), devtoolsJson()],
});
