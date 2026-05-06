import type { Id } from "#convex/_generated/dataModel.js";

import { contactQuery } from "#/data/queries.ts";
import { IdSchema, UpdateSchema } from "#/data/schemas.ts";
import { getConvexHttpClient } from "#/utils/middleware.ts";
import { createPreloader, type QueryLoaderArgs } from "#/utils/query-preloader.ts";
import { api } from "#convex/_generated/api.js";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { Form, redirect, useNavigate } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/edit.tsx";

export const loader = createPreloader(
    async ({ params, preload }: QueryLoaderArgs<Route.LoaderArgs>) => {
        let { contactId } = s.parse(IdSchema, params);
        await preload(api.contacts.get, { id: contactId as Id<"contacts"> });
    },
);

export async function action({ request, context, params }: Route.ActionArgs) {
    let formData = await request.formData();
    let updates = s.parse(UpdateSchema, formData);
    let { contactId } = s.parse(IdSchema, params);
    let convex = getConvexHttpClient(context);
    await convex.mutation(api.contacts.update, {
        id: contactId as Id<"contacts">,
        ...updates,
    });
    return redirect(`/contact/${params.contactId}`);
}

export default function Component({ params }: Route.ComponentProps) {
    let { promise } = useQuery(contactQuery(params.contactId as Id<"contacts">));
    let contact = use(promise);
    let navigate = useNavigate();

    if (!contact) {
        return (
            <div id="contact">
                <i>Contact not found.</i>
            </div>
        );
    }

    return (
        <Form id="contact-form" method="post">
            <title>{`Editing ${contact.first} ${contact.last} | React Router Contacts`}</title>
            <p>
                <span>Name</span>
                <input
                    aria-label="First name"
                    defaultValue={contact.first}
                    name="first"
                    placeholder="First"
                    type="text"
                />
                <input
                    aria-label="Last name"
                    defaultValue={contact.last}
                    name="last"
                    placeholder="Last"
                    type="text"
                />
            </p>
            <label>
                <span>Bluesky</span>
                <input
                    defaultValue={contact.bsky}
                    name="bsky"
                    placeholder="jay.bsky.team"
                    type="text"
                />
            </label>
            <label>
                <span>Avatar URL</span>
                <input
                    aria-label="Avatar URL"
                    defaultValue={contact.avatar ?? undefined}
                    name="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    type="text"
                />
            </label>
            <label>
                <span>Notes</span>
                <textarea defaultValue={contact.notes} name="notes" rows={6} />
            </label>
            <p>
                <button type="submit">Save</button>
                <button onClick={() => navigate(-1)} type="button">
                    Cancel
                </button>
            </p>
        </Form>
    );
}
