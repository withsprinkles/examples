"use server";

import {
    createContact as dbCreateContact,
    deleteContact as dbDeleteContact,
    updateContact as dbUpdateContact,
} from "#/data/contacts.ts";
import { FavoriteSchema, IdSchema, UpdateSchema } from "#/data/schemas.ts";
import { getContext } from "#/utils/context.ts";
import { href, redirect } from "react-router";
import * as s from "remix/data-schema";

export async function createNewContact() {
    let id = await dbCreateContact();
    throw redirect(href("/contact/:contactId/edit", { contactId: String(id) }));
}

export async function updateContactDetails(formData: FormData) {
    let { params } = getContext();
    let { contactId } = s.parse(IdSchema, params);
    let updates = s.parse(UpdateSchema, formData);
    await dbUpdateContact(contactId, updates);
    throw redirect(href("/contact/:contactId", { contactId: String(contactId) }));
}

export async function toggleFavorite(formData: FormData) {
    let { params } = getContext();
    let { contactId } = s.parse(IdSchema, params);
    let { favorite } = s.parse(FavoriteSchema, formData);
    await dbUpdateContact(contactId, { favorite });
}

export async function destroyContact() {
    let { params } = getContext();
    let { contactId } = s.parse(IdSchema, params);
    await dbDeleteContact(contactId);
    throw redirect(href("/"));
}
