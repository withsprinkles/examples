import { fakeNetwork, updateContact } from "#/data/contacts.ts";
import { Form, useFetcher } from "react-router";

import type { Route } from "./+types/show.tsx";

export async function loader({ params }: Route.LoaderArgs) {
    // Since we're being smart and using `matches` in the component instead of,
    // `getContact()` here we don't see the loading states, so we have to fake
    // the network latency dirctly in this loader.
    await fakeNetwork(`contact:${params.contactId}`);
    return null;
}

export async function action({ request, params }: Route.ActionArgs) {
    let formData = await request.formData();
    return await updateContact(Number.parseInt(params.contactId), {
        favorite: formData.get("favorite") === "true",
    });
}

export default function Component({ matches, params }: Route.ComponentProps) {
    let contact = matches[0].loaderData.contacts.find(
        c => c.id === Number.parseInt(params.contactId),
    )!;
    let hasAvatar = !!contact.avatar;

    return (
        <div id="contact">
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
                    <Favorite favorite={contact.favorite!} />
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
