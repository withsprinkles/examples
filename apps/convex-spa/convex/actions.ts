import { delay } from "@std/async";
import { v } from "convex/values";

import { internal } from "./_generated/api.js";
import { action } from "./_generated/server.js";

/** Send a message to a channel (with simulated latency). */
export const sendMessage = action({
    args: { text: v.string(), channel: v.string() },
    handler: async (ctx, args) => {
        // Simulated latency (ms) for testing Loading/isPending UI
        await delay(2000);
        await ctx.runMutation(internal.messages.insert, {
            text: args.text,
            channel: args.channel,
        });
    },
});
