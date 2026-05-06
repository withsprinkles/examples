import { updateContactDetails } from "#/actions/contacts.ts";
import { CancelButton } from "#/components/cancel-button.tsx";
import { getContact } from "#/data/contacts.ts";
import { IdSchema } from "#/data/schemas.ts";
import * as s from "remix/data-schema";

import type { Route } from "./+types/edit.tsx";

export async function ServerComponent({ params }: Route.ComponentProps) {
    let { contactId } = s.parse(IdSchema, params);
    let contact = await getContact(contactId);

    if (!contact) {
        throw new Response(`Contact ${contactId} not found`, { status: 404 });
    }

    return (
        <form action={updateContactDetails} id="contact-form">
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
                <CancelButton />
            </p>
        </form>
    );
}
