import { deleteContact } from "#/data/contacts.ts";
import { redirect } from "react-router";

import type { Route } from "./+types/destroy.tsx";

export async function action({ params }: Route.ActionArgs) {
    await deleteContact(Number.parseInt(params.contactId));
    return redirect("/");
}

export function ErrorBoundary() {
    return <div>Oops! There was an error.</div>;
}
