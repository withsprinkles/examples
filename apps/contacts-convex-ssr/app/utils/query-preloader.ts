import type { FunctionReference, FunctionReturnType } from "convex/server";
import type { LoaderFunctionArgs } from "react-router";

import { convexQuery } from "@convex-dev/react-query";
import { dehydrate, type DehydratedState } from "@tanstack/react-query";
import { useMatches } from "react-router";

import { getQueryClient } from "./middleware.ts";

const DEHYDRATED_STATE_KEY = "@tanstack/react-query:dehydrated-state";

type MaybePromise<T> = Promise<T> | T;

type ConvexQueryRef = FunctionReference<"query", "public">;

function mergeDehydratedStates(states: DehydratedState[]): DehydratedState {
    let allMutations = states.flatMap(state => state.mutations ?? []);
    let allQueries = states.flatMap(state => state.queries ?? []);

    // Last-write-wins de-dupe by queryHash
    let byHash = new Map<string, (typeof allQueries)[number]>();
    for (let q of allQueries) {
        if (!q) continue;
        byHash.set(q.queryHash, q);
    }

    return {
        mutations: allMutations,
        queries: Array.from(byHash.values()),
    };
}

/**
 * Read merged dehydrated TanStack Query state from every matched route loader,
 * so a single `<HydrationBoundary>` can rehydrate the cache for the whole tree.
 */
export function useDehydratedState() {
    let matches = useMatches();
    let states = matches
        .map(m => {
            let data = m.loaderData;
            if (!data || typeof data !== "object") return undefined;
            let entry = (data as Record<string, unknown>)[DEHYDRATED_STATE_KEY];
            return entry as DehydratedState | undefined;
        })
        .filter((state): state is DehydratedState => Boolean(state));

    return states.length ? mergeDehydratedStates(states) : undefined;
}

export type ConvexPreloader = <Q extends ConvexQueryRef>(
    query: Q,
    args: Q["_args"],
) => Promise<FunctionReturnType<Q>>;

export type QueryLoaderArgs<Args extends LoaderFunctionArgs = LoaderFunctionArgs> = Args & {
    /**
     * Prefetch a Convex query into the per-request TanStack QueryClient. The
     * QueryClient's default `queryFn` (from `ConvexQueryClient`) handles HTTP on
     * the server and websocket subscriptions on the client.
     */
    preload: ConvexPreloader;
};

type WithDehydratedState<TData extends object | void> = (TData extends void ? {} : TData) & {
    [DEHYDRATED_STATE_KEY]: DehydratedState;
};

export type QueryLoaderReturn<TData extends object | void> = Promise<
    Response | WithDehydratedState<TData>
>;

export type QueryLoader<LoaderArgs, TData extends object | void> = (
    ctx: LoaderArgs,
) => QueryLoaderReturn<TData>;

/**
 * Wrap a React Router loader so it can `preload(api.contacts.list, args)` Convex
 * queries on the server. Prefetched data is dehydrated under a well-known key so
 * `useDehydratedState()` can pick it up in the root and feed `<HydrationBoundary>`.
 */
export function createPreloader<
    TLoaderArgs extends LoaderFunctionArgs,
    TData extends Record<string, unknown> | void,
>(
    fn: (args: QueryLoaderArgs<TLoaderArgs>) => MaybePromise<Response | TData>,
): QueryLoader<TLoaderArgs, TData> {
    let loader = async (args: TLoaderArgs): Promise<Response | WithDehydratedState<TData>> => {
        let prefetches: Promise<unknown>[] = [];
        let queryClient = getQueryClient(args.context);

        // If the navigation is aborted, cancel any in-flight queries
        if (args.request.signal) {
            if (args.request.signal.aborted) {
                queryClient.cancelQueries();
            } else {
                args.request.signal.addEventListener("abort", () => queryClient.cancelQueries(), {
                    once: true,
                });
            }
        }

        let preload: ConvexPreloader = (query, queryArgs) => {
            let result = queryClient.ensureQueryData(convexQuery(query, queryArgs));
            prefetches.push(result);
            return result;
        };

        let result = await fn({ ...args, preload });

        if (result instanceof Response) {
            return result;
        }

        if (args.request.signal.aborted) {
            throw args.request.signal.reason ?? new DOMException("Aborted", "AbortError");
        }

        await Promise.all(prefetches);

        if (args.request.signal.aborted) {
            throw args.request.signal.reason ?? new DOMException("Aborted", "AbortError");
        }

        let withState = {
            ...result,
            [DEHYDRATED_STATE_KEY]: dehydrate(queryClient),
        };
        return withState as WithDehydratedState<TData>;
    };

    return loader as QueryLoader<TLoaderArgs, TData>;
}
