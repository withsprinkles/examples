import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";

const AT_PATTERN = /^@+/;

/** List every contact, ordered by creation time. Filtering happens on the client. */
export let list = query({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("contacts").order("desc").collect();
    },
});

/** Fetch a single contact by id. Returns `null` if the document doesn't exist. */
export let get = query({
    args: { id: v.id("contacts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/** Create an empty contact and return its new id. */
export let create = mutation({
    args: {},
    handler: async ctx => {
        return await ctx.db.insert("contacts", {
            first: "",
            last: "",
            bsky: "",
            notes: "",
            favorite: false,
        });
    },
});

/** Update mutable contact fields. */
export let update = mutation({
    args: {
        id: v.id("contacts"),
        first: v.optional(v.string()),
        last: v.optional(v.string()),
        avatar: v.optional(v.string()),
        bsky: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let { id, ...patch } = args;
        // Trim leading "@" off Bluesky handles for consistent storage
        if (typeof patch.bsky === "string") {
            patch.bsky = patch.bsky.replace(AT_PATTERN, "");
        }
        await ctx.db.patch(id, patch);
    },
});

/** Toggle the favorite flag on a contact. */
export let setFavorite = mutation({
    args: { id: v.id("contacts"), favorite: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { favorite: args.favorite });
    },
});

/** Delete a contact by id. */
export let remove = mutation({
    args: { id: v.id("contacts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
