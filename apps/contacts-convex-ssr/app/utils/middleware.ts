import type { QueryClient } from "@tanstack/react-query";
import type { ConvexHttpClient } from "convex/browser";

import { createContext, type MiddlewareFunction, type RouterContextProvider } from "react-router";
import { assert } from "remix/assert";

const QUERY_CLIENT = createContext<QueryClient | null>(null);
const CONVEX_HTTP_CLIENT = createContext<ConvexHttpClient | null>(null);

/** Inject a per-request TanStack QueryClient into the router context. */
export function setQueryClient(createClient: () => QueryClient): MiddlewareFunction {
    return ({ context }) => context.set(QUERY_CLIENT, createClient());
}

/**
 * Inject a per-request `ConvexHttpClient` into the router context. Use this for
 * route actions that need to call Convex mutations from the server.
 */
export function setConvexHttpClient(createClient: () => ConvexHttpClient): MiddlewareFunction {
    return ({ context }) => context.set(CONVEX_HTTP_CLIENT, createClient());
}

export function getQueryClient(context: Readonly<RouterContextProvider>): QueryClient {
    let client = context.get(QUERY_CLIENT);
    assert(client, "must use `setQueryClient` to set the query client for this application");
    return client;
}

export function getConvexHttpClient(context: Readonly<RouterContextProvider>): ConvexHttpClient {
    let client = context.get(CONVEX_HTTP_CLIENT);
    assert(
        client,
        "must use `setConvexHttpClient` to set the Convex HTTP client for this application",
    );
    return client;
}
