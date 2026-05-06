import { IdSchema } from "#/data/schemas.ts";
import { getConvexHttpClient } from "#/tanstack-query-integration/middleware.ts";
import { redirect } from "react-router";
import * as s from "remix/data-schema";

import type { Id } from "../../convex/_generated/dataModel.js";
import type { Route } from "./+types/destroy.tsx";

import { api } from "../../convex/_generated/api.js";

export async function action({ context, params }: Route.ActionArgs) {
    let { contactId } = s.parse(IdSchema, params);
    let convex = getConvexHttpClient(context);
    await convex.mutation(api.contacts.remove, { id: contactId as Id<"contacts"> });
    return redirect("/");
}

export function ErrorBoundary() {
    return <div>Oops! There was an error.</div>;
}
