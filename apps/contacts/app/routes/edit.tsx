import { fakeNetwork, updateContact } from "#/data/contacts.ts";
import { IdSchema, UpdateSchema } from "#/data/schemas.ts";
import { Form, redirect, useNavigate } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/edit.tsx";

export async function loader({ params }: Route.LoaderArgs) {
    // Since we're being smart and using `matches` in the component instead of,
    // `getContact()` here we don't see the loading states, so we have to fake
    // the network latency dirctly in this loader.
    await fakeNetwork(`contact:${params.contactId}`);
    return null;
}

export async function action({ request, params }: Route.ActionArgs) {
    let formData = await request.formData();
    let updates = s.parse(UpdateSchema, formData);
    let { contactId } = s.parse(IdSchema, params);
    await updateContact(contactId, updates);
    return redirect(`/contact/${params.contactId}`);
}

export default function Component({ matches, params }: Route.ComponentProps) {
    let contact = matches[0].loaderData.contacts.find(
        c => c.id === Number.parseInt(params.contactId),
    )!;
    let navigate = useNavigate();

    return (
        <Form id="contact-form" method="post">
            <title>{`Editing ${contact.first} ${contact.last} | React Router Contacts`}</title>
            <p>
                <span>Name</span>
                <input
                    aria-label="First name"
                    defaultValue={contact.first ?? undefined}
                    name="first"
                    placeholder="First"
                    type="text"
                />
                <input
                    aria-label="Last name"
                    defaultValue={contact.last ?? undefined}
                    name="last"
                    placeholder="Last"
                    type="text"
                />
            </p>
            <label>
                <span>Bluesky</span>
                <input
                    defaultValue={contact.bsky ?? undefined}
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
                <textarea defaultValue={contact.notes ?? undefined} name="notes" rows={6} />
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
