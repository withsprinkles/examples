import { QuerySchema } from "#/data/schemas.ts";
import { createConvexQueryClient } from "#/lib/client.ts";
import { contactsQuery } from "#/lib/queries.ts";
import {
    getConvexHttpClient,
    setConvexHttpClient,
    setQueryClient,
} from "#/tanstack-query-integration/middleware.ts";
import {
    createPreloader,
    type QueryLoaderArgs,
    useDehydratedState,
} from "#/tanstack-query-integration/query-preloader.ts";
import { HydrationBoundary, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ConvexHttpClient } from "convex/browser";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { sortBy } from "es-toolkit/array";
import { matchSorter } from "match-sorter";
import { type PropsWithChildren, use, useEffect, useState } from "react";
import {
    Form,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigate,
    useNavigation,
    useSubmit,
} from "react-router";
import { assert } from "remix/assert";
import * as s from "remix/data-schema";

import type { Route } from "./+types/root";

import { api } from "../convex/_generated/api.js";
import styles from "./index.css?url";

// Vite makes `VITE_CONVEX_URL` available on the server build as well, so we can
// share one environment variable between server and client setup.
assert(import.meta.env.VITE_CONVEX_URL, "VITE_CONVEX_URL must be set (see .env.local)");

export const middleware = [
    setQueryClient(() => createConvexQueryClient(import.meta.env.VITE_CONVEX_URL).queryClient),
    setConvexHttpClient(() => new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)),
];

export const loader = createPreloader(
    async ({ request, preload }: QueryLoaderArgs<Route.LoaderArgs>) => {
        let url = new URL(request.url);
        let { q } = s.parse(QuerySchema, url.searchParams);
        await preload(api.contacts.list, {});
        return { q };
    },
);

export async function action({ context }: Route.ActionArgs) {
    let convex = getConvexHttpClient(context);
    let id = await convex.mutation(api.contacts.create, {});
    return { id };
}

export function Layout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <link href={styles} rel="stylesheet" />
                <link
                    href="/favicon-light.png"
                    media="(prefers-color-scheme: light)"
                    rel="icon"
                    type="image/png"
                />
                <link
                    href="/favicon-dark.png"
                    media="(prefers-color-scheme: dark)"
                    rel="icon"
                    type="image/png"
                />
                <title>React Router Contacts</title>
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function Component({ loaderData }: Route.ComponentProps) {
    // One-time per-tab Convex client + QueryClient. The QueryClient must be
    // built with the convex `queryFn`/`hashFn` defaults to keep keys aligned
    // with whatever the server dehydrated.
    let [{ convex, queryClient }] = useState(() => {
        let convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
        let { queryClient, convexQueryClient } = createConvexQueryClient(convex);
        convexQueryClient.connect(queryClient);
        return { convex, queryClient };
    });
    let dehydratedState = useDehydratedState();

    return (
        <ConvexProvider client={convex}>
            <QueryClientProvider client={queryClient}>
                <HydrationBoundary state={dehydratedState}>
                    <Sidebar q={loaderData.q} />
                </HydrationBoundary>
            </QueryClientProvider>
        </ConvexProvider>
    );
}

function Sidebar({ q }: { q: string | undefined }) {
    let navigation = useNavigation();
    let { promise } = useQuery(contactsQuery());
    let contacts = use(promise) ?? [];

    let list = q ? matchSorter(contacts, q, { keys: ["first", "last"] }) : contacts;
    let filtered = sortBy(list, ["last", "_creationTime"]);

    let searching = Boolean(
        navigation.location && new URLSearchParams(navigation.location.search).has("q"),
    );

    let submit = useSubmit();
    let navigate = useNavigate();

    useEffect(() => {
        let input = document.querySelector<HTMLInputElement>("#q");
        if (input) input.value = q ?? "";
    }, [q]);

    return (
        <div id="root">
            <div id="sidebar">
                <h1>React Router Contacts</h1>
                <div>
                    <Form id="search-form">
                        <input
                            aria-label="Search contacts"
                            className={searching ? "loading" : ""}
                            defaultValue={q}
                            id="q"
                            name="q"
                            onInput={event => {
                                // Remove empty query params when value is empty
                                if (!event.currentTarget.value) {
                                    navigate("/");
                                    return;
                                }
                                let isFirstSearch = q === undefined;
                                submit(event.currentTarget.form, {
                                    replace: !isFirstSearch,
                                });
                            }}
                            placeholder="Search"
                            type="search"
                        />
                        <div aria-hidden hidden={!searching} id="search-spinner" />
                        <div aria-live="polite" className="sr-only" />
                    </Form>
                    <Form method="post">
                        <button type="submit">New</button>
                    </Form>
                </div>
                <nav>
                    {filtered.length ? (
                        <ul>
                            {filtered.map(contact => (
                                <li key={contact._id}>
                                    <NavLink
                                        className={({ isActive, isPending }) =>
                                            isActive ? "active" : isPending ? "pending" : ""
                                        }
                                        to={`contact/${contact._id}`}
                                    >
                                        {contact.first || contact.last ? (
                                            <>
                                                {contact.first} {contact.last}
                                            </>
                                        ) : (
                                            <i>No Name</i>
                                        )}
                                        {contact.favorite && <span>★</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            <i>No contacts</i>
                        </p>
                    )}
                </nav>
            </div>
            <div className={navigation.state === "loading" ? "loading" : ""} id="detail">
                <Outlet />
            </div>
        </div>
    );
}
