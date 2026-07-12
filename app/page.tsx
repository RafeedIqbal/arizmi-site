import HomeHero from "@/components/HomeHero";
import ProcessSection from "@/components/home/ProcessSection";
import BlueprintPromo from "@/components/home/BlueprintPromo";
import BuildCategories from "@/components/home/BuildCategories";
import ClosingCta from "@/components/home/ClosingCta";
import { getBookingDestination } from "@/lib/server/config";

/**
 * Homepage assembly (docs/redesign/specs/homepage.md section order):
 * hero → process → BluePrint promo → build categories → closing CTA. The
 * global nav and footer are rendered by app/layout.tsx. Each section owns a
 * labelled landmark so the page is navigable by heading and region.
 */
export default function Home() {
  const booking = getBookingDestination();
  return (
    <main id="main">
      <HomeHero
        bookingUrl={booking.status === "configured" ? booking.url : null}
      />
      <ProcessSection />
      <BlueprintPromo />
      <BuildCategories />
      <ClosingCta />
    </main>
  );
}
