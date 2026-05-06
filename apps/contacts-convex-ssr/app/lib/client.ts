import type { ConvexReactClient } from "convex/react";

import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";

/**
 * Build a TanStack QueryClient + ConvexQueryClient pair from a `ConvexReactClient`
 * (client) or a deployment URL (server). On the server the underlying
 * `ConvexQueryClient` resolves Convex queries via HTTP; on the client it
 * subscribes via websocket once `.connect(queryClient)` is called.
 */
export function createConvexQueryClient(client: ConvexReactClient | string) {
    let convexQueryClient = new ConvexQueryClient(client);
    let queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                queryKeyHashFn: convexQueryClient.hashFn(),
                queryFn: convexQueryClient.queryFn(),
                // With SSR, set a default staleTime above 0 so the client doesn't
                // immediately re-fetch hydrated data on first render
                staleTime: 60 * 1000,
                // Allows `const { promise } = useQuery(...)` + `React.use(promise)`
                experimental_prefetchInRender: true,
            },
        },
    });
    return { convexQueryClient, queryClient };
}
