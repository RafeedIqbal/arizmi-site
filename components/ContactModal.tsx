"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "0.75rem 1rem",
  color: "var(--text)",
  fontSize: "0.9375rem",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--text-muted)",
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginBottom: "0.5rem",
  letterSpacing: "0.03em",
};

export default function ContactModal({ onClose }: Props) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    // Save previous focus for restore
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable element in dialog
    const timer = setTimeout(() => {
      const firstInput = dialogRef.current?.querySelector<HTMLElement>("input, textarea, button");
      firstInput?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      trapFocus(e);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [onClose, trapFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up email service
    console.log("Contact form submission:", form);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-dialog-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "1rem",
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-alt)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "clamp(1.5rem, 3vw, 2.5rem)",
          width: "min(480px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2
            id="contact-dialog-title"
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Get in touch
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-outline"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "var(--text-muted)",
              fontSize: "1.125rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="contact-name" style={labelStyle}>
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="contact-email" style={labelStyle}>
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label htmlFor="contact-message" style={labelStyle}>
              Message
            </label>
            <textarea
              id="contact-message"
              required
              placeholder="Tell us about your idea..."
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              background: "var(--accent)",
              color: "#000",
              border: "none",
              borderRadius: "9999px",
              padding: "0.875rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
