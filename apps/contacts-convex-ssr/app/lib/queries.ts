import { convexQuery } from "@convex-dev/react-query";

import type { Doc, Id } from "../../convex/_generated/dataModel.js";

import { api } from "../../convex/_generated/api.js";

/** Live list of every contact, ordered by `_creationTime` descending. */
export function contactsQuery() {
    return convexQuery(api.contacts.list, {});
}

/** Live single-contact subscription by id. Returns `null` when not found. */
export function contactQuery(id: Id<"contacts">) {
    return convexQuery(api.contacts.get, { id });
}

export type Contact = Doc<"contacts">;
