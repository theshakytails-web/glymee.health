import type { Metadata } from "next";
import TopNavBar from "@/components/TopNavBar";
import HeroSection from "@/components/HeroSection";
import WhyRootCauseMatters from "@/components/WhyRootCauseMatters";
import WhyGlymeeSection from "@/components/WhyGlymeeSection";
import ProcessSection from "@/components/ProcessSection";
import ProgramSection from "@/components/ProgramSection";
import IncludedSection from "@/components/IncludedSection";
import ConditionsSection from "@/components/ConditionsSection";
import CGMSection from "@/components/CGMSection";
import DoctorLedSection from "@/components/DoctorLedSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Glymee Health | Personalized Diabetes Management Program",
  description:
    "Glymee is a 3-month personalized diabetes-management program combining doctor-led guidance, nutrition, lifestyle support and glucose insights to help you understand and manage your diabetes.",
  alternates: {
    canonical: "https://glymee.com",
  },
  openGraph: {
    title: "Glymee Health | Personalized Diabetes Management Program",
    description:
      "Glymee is a 3-month personalized diabetes-management program combining doctor-led guidance, nutrition, lifestyle support and glucose insights to help you understand and manage your diabetes.",
    url: "https://glymee.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Glymee Health - Personalized Diabetes Management Program",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <TopNavBar />
      <main className="pt-16">
        <div className="reveal">
          <HeroSection />
        </div>
        <div className="reveal">
          <WhyRootCauseMatters />
        </div>
        <div className="reveal">
          <WhyGlymeeSection />
        </div>
        <div className="reveal">
          <ProcessSection />
        </div>
        <div className="reveal">
          <ProgramSection />
        </div>
        <div className="reveal">
          <IncludedSection />
        </div>
        <div className="reveal">
          <CGMSection />
        </div>
        <div className="reveal">
          <ConditionsSection />
        </div>
        <div className="reveal">
          <DoctorLedSection />
        </div>
        <div className="reveal">
          <TrustSection />
        </div>
        <div className="reveal">
          <AboutSection />
        </div>
        <div className="reveal">
          <FAQSection />
        </div>
        <div className="reveal">
          <CTASection />
        </div>
      </main>
      <Footer />
    </>
  );
}
