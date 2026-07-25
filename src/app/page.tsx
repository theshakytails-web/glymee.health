import TopNavBar from "@/components/TopNavBar";
import HeroSection from "@/components/HeroSection";
import WhyRootCauseMatters from "@/components/WhyRootCauseMatters";
import ComparisonSection from "@/components/ComparisonSection";
import ConditionsSection from "@/components/ConditionsSection";
import ProcessSection from "@/components/ProcessSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="pt-16">
        <HeroSection />
        <WhyRootCauseMatters />
        <ComparisonSection />
        <ConditionsSection />
        <ProcessSection />
        <ServicesSection />
        <AboutSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
