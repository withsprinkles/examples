import "server-only";
import type { FormMethod, MiddlewareFunction } from "react-router";

import { AsyncLocalStorage } from "node:async_hooks";
import { assert } from "remix/assert";

export interface RequestContext<
    Params extends Record<string, string | undefined> = Record<string, string | undefined>,
> {
    /** The original request that was dispatched to the router. */
    request: Request;

    /** Params that were parsed from the URL. */
    params: Params;

    searchParams: URLSearchParams;

    /** The request method. */
    method: FormMethod;

    /** The headers of the request. */
    headers: Headers;

    /** The URL that was matched by the route. */
    url: URL;
}

const CTX = new AsyncLocalStorage<RequestContext>();

export function asyncContext(): MiddlewareFunction<Response> {
    return async ({ request, params }, next) => {
        let method = request.method.toUpperCase();
        let url = new URL(request.url);

        return await CTX.run(
            {
                request,
                method: method as FormMethod,
                headers: new Headers(request.headers),
                url,
                searchParams: url.searchParams,
                params,
            },
            next,
        );
    };
}

export function getContext<
    Params extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): RequestContext<Params> {
    let ctx = CTX.getStore();
    assert(ctx, "Must use `getContext()` within the `asyncContext()` middleware");
    return ctx as RequestContext<Params>;
}
