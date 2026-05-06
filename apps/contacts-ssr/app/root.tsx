import { createContact, getContacts } from "#/data/contacts.ts";
import { useEffect, type PropsWithChildren } from "react";
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
import * as s from "remix/data-schema";

import type { Route } from "./+types/root";

import { QuerySchema } from "./data/schemas";
import styles from "./index.css?url";

export async function loader({ request }: Route.LoaderArgs) {
    let url = new URL(request.url);
    let { q } = s.parse(QuerySchema, url.searchParams);
    let contacts = await getContacts(q);
    return { contacts, q };
}

export async function action() {
    let contact = await createContact();
    return { contact };
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
    let navigation = useNavigation();
    let { contacts, q } = loaderData;

    let searching = Boolean(
        navigation.location && new URLSearchParams(navigation.location.search).has("q"),
    );

    let submit = useSubmit();
    let navigate = useNavigate();

    useEffect(() => {
        if (document) {
            document.querySelector<HTMLInputElement>("#q")!.value = q ?? "";
        }
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
                    {contacts.length ? (
                        <ul>
                            {contacts.map(contact => (
                                <li key={contact.id}>
                                    <NavLink
                                        className={({ isActive, isPending }) =>
                                            isActive ? "active" : isPending ? "pending" : ""
                                        }
                                        to={`contact/${contact.id}`}
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
