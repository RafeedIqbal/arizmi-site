"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  onClose: () => void;
}

export default function SuccessMessage({ onClose }: Props) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageRef.current?.focus();
  }, []);

  return (
    <div
      ref={messageRef}
      role="status"
      tabIndex={-1}
      className="py-4 text-center"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--ui-accent)] bg-[var(--ui-border)] text-[var(--ui-accent)]"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-[var(--ui-ink)]">
        Message sent
      </h3>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--ui-ink-muted)]">
        Thanks for reaching out. We&apos;ll get back to you soon.
      </p>

      <Button onClick={onClose} className="mt-7 min-w-32">
        Done
      </Button>
    </div>
  );
}
