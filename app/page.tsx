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
      <main>
        <HeroSection />
        <div style={{ position: "relative", zIndex: 1, background: "var(--bg)" }}>
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
