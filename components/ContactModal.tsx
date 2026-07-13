"use client";

import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { submitContactForm } from "@/app/actions/contact";
import SuccessMessage from "@/components/SuccessMessage";
import { Button } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { FormGuardFields } from "@/lib/formGuard";

interface Props {
  onClose: () => void;
}

const FIELD_CLASS_NAME =
  "mt-2 min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--ui-border-strong)] bg-transparent px-4 py-3 text-[var(--ui-ink)] placeholder:text-[var(--ui-ink-muted)] focus:border-[var(--ui-accent)] disabled:cursor-not-allowed disabled:opacity-60";

export default function ContactModal({ onClose }: Props) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setError(null);

    try {
      const result = await submitContactForm(new FormData(event.currentTarget));
      if (result.success) {
        setSent(true);
        return;
      }

      setError(result.error);
      toast.error(result.error);
      requestAnimationFrame(() => errorRef.current?.focus());
    } catch {
      const message = "Messaging is temporarily unavailable. Please try again later.";
      setError(message);
      toast.error(message);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={sent ? "Thank you" : "Get in touch"}
      description={
        sent
          ? undefined
          : "Tell us what you are building, and we will get back to you soon."
      }
    >
      {sent ? (
        <SuccessMessage onClose={onClose} />
      ) : (
        <form onSubmit={handleSubmit} aria-busy={sending}>
          <FormGuardFields />

          {error ? (
            <div
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              className="mb-5 rounded-[var(--radius-md)] border border-[var(--ui-accent)] px-4 py-3 text-sm leading-relaxed text-[var(--ui-ink)]"
            >
              <span className="font-semibold text-[var(--ui-accent)]">Message not sent. </span>
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="contact-name" className="text-sm font-semibold text-[var(--ui-ink)]">
              Name
            </label>
            <input
              autoFocus
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              disabled={sending}
              className={FIELD_CLASS_NAME}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="contact-email" className="text-sm font-semibold text-[var(--ui-ink)]">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              disabled={sending}
              className={FIELD_CLASS_NAME}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="contact-message" className="text-sm font-semibold text-[var(--ui-ink)]">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              placeholder="Tell us about your idea..."
              rows={5}
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              disabled={sending}
              className={`${FIELD_CLASS_NAME} resize-y`}
            />
          </div>

          <Button
            type="submit"
            disabled={sending}
            className="mt-7 w-full disabled:cursor-wait disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send message"}
          </Button>
        </form>
      )}
    </Dialog>
  );
}
