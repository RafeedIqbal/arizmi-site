"use client";

import { type ReactElement } from "react";

/**
 * Hidden honeypot fields that bots will fill in but humans won't see.
 * Include this inside any public-facing <form>.
 */
export function FormGuardFields(): ReactElement {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}>
      <label>
        Do not fill this in
        <input type="text" name="_guard_x7q" tabIndex={-1} autoComplete="new-password" />
      </label>
      <label>
        Leave empty
        <input type="text" name="_guard_r3k" tabIndex={-1} autoComplete="new-password" />
      </label>
    </div>
  );
}
