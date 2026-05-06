import type { Id } from "#convex/_generated/dataModel.js";

import { IdSchema } from "#/data/schemas.ts";
import { getConvexHttpClient } from "#/utils/middleware.ts";
import { api } from "#convex/_generated/api.js";
import { redirect } from "react-router";
import * as s from "remix/data-schema";

import type { Route } from "./+types/destroy.tsx";

export async function action({ context, params }: Route.ActionArgs) {
    let { contactId } = s.parse(IdSchema, params);
    let convex = getConvexHttpClient(context);
    await convex.mutation(api.contacts.remove, { id: contactId as Id<"contacts"> });
    return redirect("/");
}

export function ErrorBoundary() {
    return <div>Oops! There was an error.</div>;
}
