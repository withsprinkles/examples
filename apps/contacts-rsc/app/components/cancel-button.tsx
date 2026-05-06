"use client";

import { useNavigate } from "react-router";

export function CancelButton() {
    let navigate = useNavigate();
    return (
        <button onClick={() => navigate(-1)} type="button">
            Cancel
        </button>
    );
}
