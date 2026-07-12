import HomeHero from "@/components/HomeHero";
import ServicesSection from "@/components/ServicesSection";
import ProofSection from "@/components/ProofSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ContactSection from "@/components/ContactSection";
import { getBookingDestination } from "@/lib/server/config";

export default function Home() {
  const booking = getBookingDestination();
  return (
    <main id="main">
      <HomeHero
        bookingUrl={booking.status === "configured" ? booking.url : null}
      />
      {/* legacy-dark-page: the remaining homepage sections still use the
          superseded dark theme; TASK-006/007 rebuild them on the light
          canvas and remove this wrapper. */}
      <div className="legacy-dark-page" style={{ position: "relative", zIndex: 1 }}>
        <ServicesSection />
        <ProofSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <ContactSection />
      </div>
    </main>
  );
}
