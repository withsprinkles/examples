import type { Id } from "#convex/_generated/dataModel.js";

import { contactQuery } from "#/data/queries.ts";
import { FavoriteSchema, IdSchema } from "#/data/schemas.ts";
import { getConvexHttpClient } from "#/utils/middleware.ts";
import { createPreloader, type QueryLoaderArgs } from "#/utils/query-preloader.ts";
import { api } from "#convex/_generated/api.js";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { Form, useFetcher } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/show.tsx";

export const loader = createPreloader(
    async ({ params, preload }: QueryLoaderArgs<Route.LoaderArgs>) => {
        let { contactId } = s.parse(IdSchema, params);
        await preload(api.contacts.get, { id: contactId as Id<"contacts"> });
    },
);

export async function action({ request, context, params }: Route.ActionArgs) {
    let formData = await request.formData();
    let { favorite } = s.parse(FavoriteSchema, formData);
    let { contactId } = s.parse(IdSchema, params);
    let convex = getConvexHttpClient(context);
    await convex.mutation(api.contacts.setFavorite, {
        id: contactId as Id<"contacts">,
        favorite,
    });
    return null;
}

export default function Component({ params }: Route.ComponentProps) {
    let { promise } = useQuery(contactQuery(params.contactId as Id<"contacts">));
    let contact = use(promise);

    if (!contact) {
        return (
            <div id="contact">
                <i>Contact not found.</i>
            </div>
        );
    }

    let hasAvatar = Boolean(contact.avatar);

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
                    <Favorite favorite={contact.favorite} />
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
                    <Form
                        action="destroy"
                        method="post"
                        onSubmit={event => {
                            if (!confirm("Please confirm you want to delete this record.")) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <button type="submit">Delete</button>
                    </Form>
                </div>
            </div>
        </div>
    );
}

function Favorite(props: { favorite: boolean }) {
    let { Form, formData } = useFetcher();
    let favorite = formData ? formData.get("favorite") === "true" : props.favorite;

    return (
        <Form method="post">
            <button
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                name="favorite"
                type="submit"
                value={favorite ? "false" : "true"}
            >
                {favorite ? "★" : "☆"}
            </button>
        </Form>
    );
}
