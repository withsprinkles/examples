import { v } from "convex/values";

import { internalMutation, query } from "./_generated/server.js";

/** List messages for a given channel, ordered by creation time. */
export const list = query({
    args: { channel: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_channel", q => q.eq("channel", args.channel))
            .order("desc")
            .collect();
    },
});

/** Internal mutation that inserts the message. Called by the send action. */
export const insert = internalMutation({
    args: { text: v.string(), channel: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            text: args.text,
            channel: args.channel,
        });
    },
});
