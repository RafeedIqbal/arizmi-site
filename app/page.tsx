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
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: "var(--bg)",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.6)",
            marginTop: "-4rem",
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
