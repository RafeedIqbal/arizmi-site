interface Props {
  onClose: () => void;
}

export default function SuccessMessage({ onClose }: Props) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(89, 176, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: "0.75rem",
        }}
      >
        Message sent!
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.9375rem",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        Thanks for reaching out. We&apos;ll get back to you soon.
      </p>

      <button
        onClick={onClose}
        className="btn-primary"
        style={{
          background: "var(--accent)",
          color: "#000",
          border: "none",
          borderRadius: "9999px",
          padding: "0.75rem 2rem",
          fontSize: "0.9375rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Done
      </button>
    </div>
  );
}
