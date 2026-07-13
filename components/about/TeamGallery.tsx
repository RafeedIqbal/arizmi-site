"use client";

import { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import MetaLabel from "@/components/ui/MetaLabel";
import VisuallyHidden from "@/components/ui/VisuallyHidden";
import { TEAM, type TeamMember } from "@/lib/content/team";

/**
 * Two-letter monogram used as a typographic stand-in until approved team
 * portraits are supplied (D-11). Deliberately not a photo — a restrained brand
 * placeholder, never an unrelated stock person.
 */
function monogram(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * "The team in the lab" (TASK-016). Compact cards keep each name and lead line
 * visible; the full bio and focus areas open in the shared Dialog primitive.
 * Dialog is a native <dialog>, so focus containment, Escape handling, and focus
 * restoration to the triggering "Read more" button come from the platform.
 *
 * Team content is typed in lib/content/team.ts, kept separate from this
 * presentation. D-11: portraits are absent from the asset set, so each card
 * shows a brand monogram; swap in approved images (with alt text) later.
 */
export default function TeamGallery() {
  const [active, setActive] = useState<TeamMember | null>(null);

  return (
    <>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <li key={member.id}>
            <article className="flex h-full flex-col gap-4 rounded-[var(--radius-lg)] border border-border-soft bg-[var(--surface-raised)] p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] motion-reduce:transform-none motion-reduce:transition-none">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] text-lg font-semibold text-white"
                style={{ backgroundImage: "var(--gradient-teal)" }}
              >
                {monogram(member.name)}
              </span>
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-ink-muted">{member.cardLead}</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(member)}
                aria-haspopup="dialog"
                className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-teal-ink underline-offset-4 hover:underline"
              >
                Read more
                <VisuallyHidden>about {member.name}</VisuallyHidden>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </article>
          </li>
        ))}
      </ul>

      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.name ?? ""}
        description={active?.cardLead}
      >
        {active ? (
          <div className="flex flex-col gap-4">
            {active.bio.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-relaxed text-[var(--ui-ink-muted)]"
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <MetaLabel as="h3">Focus</MetaLabel>
              <ul className="flex flex-wrap gap-2">
                {active.focus.map((item) => (
                  <li
                    key={item}
                    className="font-meta rounded-[var(--radius-pill)] border border-[var(--ui-border)] px-3 py-1 text-xs tracking-wide text-[var(--ui-ink-muted)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
