import {
  buttonClassName,
  disabledCtaClassName,
  type ButtonVariant,
} from "@/components/ui/Button";
import { getBookingDestination } from "@/lib/server/config";

const VARIANT_MAP = {
  primary: "solid",
  secondary: "outline",
} as const satisfies Record<string, ButtonVariant>;

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
  variant?: keyof typeof VARIANT_MAP;
}) {
  const booking = getBookingDestination();

  if (booking.status === "configured") {
    return (
      <a href={booking.url} className={buttonClassName(VARIANT_MAP[variant])}>
        {label}
      </a>
    );
  }

  return (
    <span aria-disabled="true" className={disabledCtaClassName()}>
      {label}
      <span className="font-meta text-xs uppercase tracking-wider">
        Booking opens soon
      </span>
    </span>
  );
}
