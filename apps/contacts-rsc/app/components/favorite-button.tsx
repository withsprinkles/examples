"use client";

import { toggleFavorite } from "#/actions/contacts.ts";
import { useOptimistic } from "react";

export function FavoriteButton({ favorite }: { favorite: boolean }) {
    let [optimisticFavorite, setOptimisticFavorite] = useOptimistic(
        favorite,
        (_state: boolean, next: boolean) => next,
    );

    async function action(formData: FormData) {
        let next = formData.get("favorite") === "true";
        setOptimisticFavorite(next);
        await toggleFavorite(formData);
    }

    return (
        <form action={action}>
            <button
                aria-label={optimisticFavorite ? "Remove from favorites" : "Add to favorites"}
                name="favorite"
                type="submit"
                value={optimisticFavorite ? "false" : "true"}
            >
                {optimisticFavorite ? "★" : "☆"}
            </button>
        </form>
    );
}
