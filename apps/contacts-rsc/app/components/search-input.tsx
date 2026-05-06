"use client";

import { useEffect } from "react";
import { useNavigate, useNavigation, useSubmit } from "react-router";

export function SearchInput({ defaultValue }: { defaultValue: string | undefined }) {
    let submit = useSubmit();
    let navigate = useNavigate();
    let navigation = useNavigation();

    let searching = Boolean(
        navigation.location && new URLSearchParams(navigation.location.search).has("q"),
    );

    // Sync the input value with the URL when navigation completes
    useEffect(() => {
        let input = document.querySelector<HTMLInputElement>("#q");
        if (input) input.value = defaultValue ?? "";
    }, [defaultValue]);

    return (
        <>
            <input
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                defaultValue={defaultValue}
                id="q"
                name="q"
                onInput={event => {
                    if (!event.currentTarget.value) {
                        navigate("/");
                        return;
                    }
                    let isFirstSearch = defaultValue === undefined;
                    submit(event.currentTarget.form, {
                        replace: !isFirstSearch,
                    });
                }}
                placeholder="Search"
                type="search"
            />
            <div aria-hidden hidden={!searching} id="search-spinner" />
            <div aria-live="polite" className="sr-only" />
        </>
    );
}
