import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { use, useActionState, useOptimistic, useRef, useState } from "react";

import { api } from "../convex/_generated/api.js";
import { queryClient } from "./root.tsx";

const messagesList = (channel: string) => convexQuery(api.messages.list, { channel });

export async function clientLoader() {
    await queryClient.ensureQueryData(messagesList("general"));
    return null;
}

export default function Messages() {
    let [channel, setChannel] = useState("general");

    return (
        <div>
            <select onChange={event => setChannel(event.target.value)}>
                <option value="general">General</option>
                <option value="random">Random</option>
            </select>

            <MessageList channel={channel} />
        </div>
    );
}

function MessageList({ channel }: { channel: string }) {
    let { promise } = useQuery(messagesList(channel));
    let messages = use(promise).map(m => m.text);

    let [draft, setDraft] = useOptimistic("");
    let allMessages = draft ? [draft, ...messages] : messages;

    let form = useRef<HTMLFormElement>(null!);
    let sendMessage = useAction(api.actions.sendMessage);
    let [, action, isPending] = useActionState<undefined, FormData>(async (_, data) => {
        let message = data.get("message");
        if (!message || typeof message !== "string") return;

        form.current.reset();
        setDraft(message);
        await sendMessage({ text: message, channel });
    }, undefined);

    return (
        <>
            {allMessages.map((message, index) => (
                <div key={index}>{message}</div>
            ))}

            <form action={action} ref={form}>
                <input name="message" />
                <button disabled={isPending} type="submit">
                    {isPending ? "Sending..." : "Send"}
                </button>
            </form>
        </>
    );
}
