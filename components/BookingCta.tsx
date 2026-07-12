import { getBookingDestination } from "@/lib/server/config";

const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold";

const VARIANT_CLASSES = {
  primary: "bg-card text-ink-on-card",
  secondary: "border border-border-strong text-ink",
} as const;

/**
 * The single booking CTA. Server component: resolves the environment-backed
 * booking destination (D-01) and renders a real link only when it is
 * configured; otherwise a visibly disabled control — never a "#" href.
 */
export default function BookingCta({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: keyof typeof VARIANT_CLASSES;
}) {
  const booking = getBookingDestination();

  if (booking.status === "configured") {
    return (
      <a
        href={booking.url}
        className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`}
      >
        {label}
      </a>
    );
  }

  return (
    <span
      aria-disabled="true"
      className={`${BASE_CLASSES} cursor-not-allowed border border-border-soft text-ink-muted`}
    >
      {label}
      <span className="font-meta text-xs uppercase tracking-wider">
        Booking opens soon
      </span>
    </span>
  );
}
