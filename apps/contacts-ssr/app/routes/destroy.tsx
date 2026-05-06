import { deleteContact } from "#/data/contacts.ts";
import { IdSchema } from "#/data/schemas.ts";
import { redirect } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/destroy.tsx";

export async function action({ params }: Route.ActionArgs) {
    let { contactId } = s.parse(IdSchema, params);
    await deleteContact(contactId);
    return redirect("/");
}

export function ErrorBoundary() {
    return <div>Oops! There was an error.</div>;
}
