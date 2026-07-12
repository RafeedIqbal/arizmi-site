import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlueprintFlow from "@/components/blueprint/BlueprintFlow";
import { HERO } from "@/lib/blueprint/content";
import { getBookingDestination, getPrivacyPolicy } from "@/lib/server/config";
import { ROUTES } from "@/lib/site";

export const metadata: Metadata = {
  title: "BluePrint AI — Arizmi Labs",
  description: HERO.supporting,
  alternates: { canonical: ROUTES.blueprintAi },
  openGraph: {
    title: "BluePrint AI — Arizmi Labs",
    description: HERO.supporting,
    url: ROUTES.blueprintAi,
  },
};

export default function BlueprintAiPage() {
  // Resolve environment-backed destinations on the server (D-01, D-02) so no
  // credentials or env reads reach the client bundle.
  const booking = getBookingDestination();
  const privacy = getPrivacyPolicy();

  return (
    <PageShell>
      <BlueprintFlow
        bookingHref={booking.status === "configured" ? booking.url : null}
        privacyHref={privacy.status === "configured" ? privacy.url : null}
      />
    </PageShell>
  );
}
