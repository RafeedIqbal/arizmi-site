"use client";

import { useState } from "react";
import ContactModal from "./ContactModal";

export default function ContactSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        id="contact"
        style={{
          padding: "var(--section-py) var(--section-px) clamp(5rem, 10vw, 10rem)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <p
            style={{
              color: "var(--accent)",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Contact
          </p>

          <h2
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}
          >
            Ready to build something?
          </h2>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              marginBottom: "3rem",
            }}
          >
            Let&apos;s turn your idea into a real product. Book a free call or
            send us a message.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={process.env.NEXT_PUBLIC_CALENDLY_LINK ?? "#contact"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                background: "var(--accent)",
                color: "#000",
                padding: "0.875rem 2.25rem",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Book a Free Call
            </a>

            <button
              className="btn-outline"
              onClick={() => setModalOpen(true)}
              style={{
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
                padding: "0.875rem 2.25rem",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Contact
            </button>
          </div>
        </div>
      </section>

      {modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
