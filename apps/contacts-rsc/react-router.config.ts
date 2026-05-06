import type { Config } from "@react-router/dev/config";

export default {
    ssr: true,
    buildDirectory: "build",
    future: {
        v8_middleware: true,
        v8_viteEnvironmentApi: true,
    },
} satisfies Config;
