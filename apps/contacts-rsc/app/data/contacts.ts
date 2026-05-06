import "server-only";
import { sortBy } from "es-toolkit/array";
import { matchSorter } from "match-sorter";
import { DatabaseSync } from "node:sqlite";
import { setTimeout as sleep } from "node:timers/promises";
import { column as c, ColumnBuilder, table, type TableRow } from "remix/data-table";
import { Database } from "remix/data-table";
import { SqliteDatabaseAdapter } from "remix/data-table-sqlite";

import { parseEnv } from "../utils/parse-env.ts";
import { EnvSchema } from "./schemas.ts";

export let Contacts = table({
    name: "contacts",
    columns: {
        id: c.integer().primaryKey(),
        first: c.text().notNull(),
        last: c.text().notNull(),
        avatar: c.text(),
        bsky: c.text().notNull(),
        notes: c.text().notNull(),
        favorite: c.boolean().default(false),
        createdAt: c.timestamp().defaultNow() as ColumnBuilder<string>,
    },
});

export type Contact = TableRow<typeof Contacts>;

const { DATABASE_URL } = parseEnv(EnvSchema);

let sqlite = new DatabaseSync(DATABASE_URL);
let adapter = new SqliteDatabaseAdapter(sqlite);
let db = new Database(adapter);

export async function getContacts(query?: string): Promise<Contact[]> {
    await fakeNetwork(`getContacts:${query}`);

    let contacts = (await db.findMany(Contacts)).map(normalize);

    if (query) {
        contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
    }

    return sortBy(contacts, ["last", "createdAt"]);
}

export async function createContact(): Promise<number> {
    let contact = await db.create(
        Contacts,
        {
            first: "",
            last: "",
            bsky: "",
            notes: "",
        },
        { returnRow: true },
    );

    return contact.id;
}

export async function getContact(id?: number): Promise<Contact | null> {
    if (!id) return null;
    await fakeNetwork(`contact:${id}`);
    let contact = await db.find(Contacts, id);
    return contact ? normalize(contact) : null;
}

const AT_PATTERN = /^@+/;

export async function updateContact(id: number, updates: Partial<Contact>) {
    await fakeNetwork();

    let contact = await db.find(Contacts, id);
    if (!contact) throw new Error(`Contact with id ${id} not found`);

    // Never allow id/createdAt to be updated via patch
    let { id: _id, createdAt: _createdAt, ...patch } = updates;
    if (Object.keys(patch).length === 0) return normalize(contact);

    // Trim any leading @'s off of bsky handle
    if (typeof patch.bsky === "string") {
        patch.bsky = patch.bsky.replace(AT_PATTERN, "");
    }

    return normalize(await db.update(Contacts, id, patch));
}

function normalize(contact: Contact): Contact {
    return { ...contact, favorite: Boolean(contact.favorite) };
}

export async function deleteContact(id: number): Promise<boolean> {
    try {
        await db.delete(Contacts, id);
        return true;
    } catch {
        return false;
    }
}

// fake a cache so we don't slow down stuff we've already seen
const CACHE = new Map<string, boolean>();

export async function fakeNetwork(key?: string) {
    if (process.env.NODE_ENV === "test") {
        return;
    }

    if (!key || !CACHE.get(key)) {
        if (key) CACHE.set(key, true);
        // Fake network slowdown between 1-3 seconds
        return await sleep(1000 + Math.random() * 2_000);
    }
}
