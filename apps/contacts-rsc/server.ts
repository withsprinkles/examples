import { parseArgs } from "node:util";
import { serve } from "remix/node-serve";

// @ts-expect-error: this is the output of `vite build`
import app from "./build/server/index.js";

let { values: options } = parseArgs({
    args: process.argv.slice(2),
    options: {
        port: { type: "string", short: "p", default: "3000" },
        host: { type: "string", short: "h", default: "0.0.0.0" },
    },
    strict: true,
    allowPositionals: false,
});

const PORT = parseInt(process.env.PORT || options.port);
const HOST = process.env.HOST || options.host;

async function handler(request: Request): Promise<Response> {
    return app.fetch(request);
}

let server = serve(request => handler(request), {
    port: PORT,
    host: HOST,
});
await server.ready;

console.log(`React Router Contacts listening on http://${HOST}:${server.port}`);

function shutdown() {
    console.log("\nShutting down...");
    server.close();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
