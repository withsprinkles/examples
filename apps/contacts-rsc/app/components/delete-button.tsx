"use client";

import { destroyContact } from "#/actions/contacts.ts";

export function DeleteButton() {
    return (
        <form
            action={destroyContact}
            onSubmit={event => {
                if (!confirm("Please confirm you want to delete this record.")) {
                    event.preventDefault();
                }
            }}
        >
            <button type="submit">Delete</button>
        </form>
    );
}
