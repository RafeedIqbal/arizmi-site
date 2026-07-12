import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProofSection from "@/components/ProofSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <Nav />
      {/* legacy-dark-page: temporary compat canvas for the superseded
          dark theme; remove as sections migrate (TASK-005+) */}
      <main className="legacy-dark-page">
        <HeroSection />
        <div
          data-testid="page-content-shell"
          style={{
            position: "relative",
            zIndex: 1,
            background: "var(--bg)",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.6)",
            marginTop: "calc(-1 * clamp(6rem, 12vw, 12rem))",
          }}
        >
          <ServicesSection />
          <ProofSection />
          <HowItWorksSection />
          <WhyChooseUsSection />
          <ContactSection />
        </div>
      </main>
    </>
  );
}
