import "server-only";

/**
 * Server-resolved runtime configuration. The "server-only" import makes any
 * client-component import of this module a build error, so environment
 * values cannot leak into the browser bundle.
 *
 * D-15: contact recipient/config centralizes here in TASK-017.
 */

export type BookingDestination =
  | { readonly status: "configured"; readonly url: string }
  | { readonly status: "unconfigured" };

/**
 * D-01: the production booking URL is not yet decided. Until it is, the
 * destination is backed by the BOOKING_URL environment variable and booking
 * CTAs must render meaningful disabled semantics when it is absent — never
 * a "#" link.
 */
export function getBookingDestination(): BookingDestination {
  const url = process.env.BOOKING_URL?.trim();
  if (!url) {
    return { status: "unconfigured" };
  }
  return { status: "configured", url };
}
