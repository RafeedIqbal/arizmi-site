"use client";

import { useState } from "react";
import ContactModal from "@/components/ContactModal";

/**
 * Button that opens the existing contact dialog (D-15 safe default: preserve
 * the current form plumbing; TASK-017 owns the final contact integration).
 */
export default function ContactTrigger({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open ? <ContactModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
