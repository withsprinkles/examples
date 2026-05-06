"use client";

import type { Contact } from "#/data/contacts.ts";

import { NavLink } from "react-router";

export function ContactList({ contacts }: { contacts: Contact[] }) {
    if (contacts.length === 0) {
        return (
            <p>
                <i>No contacts</i>
            </p>
        );
    }

    return (
        <ul>
            {contacts.map(contact => (
                <li key={contact.id}>
                    <NavLink
                        className={({ isActive, isPending }) =>
                            isActive ? "active" : isPending ? "pending" : ""
                        }
                        to={`contact/${contact.id}`}
                    >
                        {contact.first || contact.last ? (
                            <>
                                {contact.first} {contact.last}
                            </>
                        ) : (
                            <i>No Name</i>
                        )}
                        {contact.favorite && <span>★</span>}
                    </NavLink>
                </li>
            ))}
        </ul>
    );
}
