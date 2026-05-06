import { DeleteButton } from "#/components/delete-button.tsx";
import { FavoriteButton } from "#/components/favorite-button.tsx";
import { getContact } from "#/data/contacts.ts";
import { IdSchema } from "#/data/schemas.ts";
import { Form } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/show.tsx";

export async function ServerComponent({ params }: Route.ComponentProps) {
    let { contactId } = s.parse(IdSchema, params);
    let contact = await getContact(contactId);

    if (!contact) {
        throw new Response(`Contact ${contactId} not found`, { status: 404 });
    }

    let hasAvatar = !!contact.avatar;

    return (
        <div id="contact">
            <title>{`${contact.first} ${contact.last} | React Router Contacts`}</title>
            <div>
                <img
                    alt=""
                    key={contact.avatar}
                    src={
                        hasAvatar
                            ? contact.avatar
                            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                />
            </div>

            <div>
                <h1>
                    {contact.first || contact.last ? (
                        <>
                            {contact.first} {contact.last}
                        </>
                    ) : (
                        <i>No Name</i>
                    )}{" "}
                    <FavoriteButton favorite={contact.favorite ?? false} />
                </h1>

                {contact.bsky && (
                    <p>
                        <a
                            href={`https://bsky.app/profile/${contact.bsky}`}
                            rel="noreferrer"
                            target="_blank"
                        >
                            @{contact.bsky}
                        </a>
                    </p>
                )}

                {contact.notes && <p>{contact.notes}</p>}

                <div>
                    <Form action="edit">
                        <button type="submit">Edit</button>
                    </Form>
                    <DeleteButton />
                </div>
            </div>
        </div>
    );
}
