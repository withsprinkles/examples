import { createNewContact } from "#/actions/contacts.ts";
import { ContactList } from "#/components/contact-list.tsx";
import { DetailPane } from "#/components/detail-pane.tsx";
import { SearchInput } from "#/components/search-input.tsx";
import { getContacts } from "#/data/contacts.ts";
import { asyncContext, getContext } from "#/utils/context.ts";
import { type PropsWithChildren } from "react";
import { Form, Outlet } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/root";

import { QuerySchema } from "./data/schemas.ts";
import styles from "./index.css?url";

export let middleware: Route.MiddlewareFunction[] = [asyncContext()];

export function ServerLayout({ children }: PropsWithChildren) {
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
            <body>{children}</body>
        </html>
    );
}

export async function ServerComponent() {
    let { searchParams } = getContext();
    let { q } = s.parse(QuerySchema, searchParams);
    let contacts = await getContacts(q);

    return (
        <div id="root">
            <div id="sidebar">
                <h1>React Router Contacts</h1>
                <div>
                    <Form id="search-form" role="search">
                        <SearchInput defaultValue={q} />
                    </Form>
                    <form action={createNewContact}>
                        <button type="submit">New</button>
                    </form>
                </div>
                <nav>
                    <ContactList contacts={contacts} />
                </nav>
            </div>
            <DetailPane>
                <Outlet />
            </DetailPane>
        </div>
    );
}
