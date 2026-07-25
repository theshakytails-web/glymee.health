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
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <TopNavBar />
      <main className="pt-16">
        <HeroSection />
        <div className="reveal">
          <WhyRootCauseMatters />
        </div>
        <div className="reveal">
          <ComparisonSection />
        </div>
        <div className="reveal">
          <ConditionsSection />
        </div>
        <div className="reveal">
          <ProcessSection />
        </div>
        <div className="reveal">
          <ServicesSection />
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
