"use client";

import type { PropsWithChildren } from "react";

import { useNavigation } from "react-router";

export function DetailPane({ children }: PropsWithChildren) {
    let navigation = useNavigation();
    return (
        <div className={navigation.state === "loading" ? "loading" : ""} id="detail">
            {children}
        </div>
    );
}
