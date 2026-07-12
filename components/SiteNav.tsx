import SiteMenu from "@/components/SiteMenu";
import { getBookingDestination } from "@/lib/server/config";

/**
 * Server wrapper for the global menu: resolves the environment-backed
 * booking destination (D-01) so the client menu never reads env vars.
 */
export default function SiteNav() {
  const booking = getBookingDestination();
  return (
    <SiteMenu
      bookingUrl={booking.status === "configured" ? booking.url : null}
    />
  );
}
