import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LeadQualificationForm from "@/components/LeadQualificationForm";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Free Health Assessment | Glymee Health",
  description:
    "Start your free health assessment to understand how personalized, doctor-led diabetes care can help you. Glymee is a 3-month personalized diabetes-management program.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function FreeHealthAssessmentPage() {
  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Glymee_name.png"
              alt="Glymee"
              width={100}
              height={100}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="font-label-md text-[14px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-md text-[13px] mb-4">
            Free Health Assessment
          </span>
          <h1 className="font-display-lg text-[28px] sm:text-[36px] md:text-[40px] leading-[1.15] tracking-[-0.02em] font-extrabold text-on-background mb-3">
            Start Your{" "}
            <span className="text-primary">Free Health Assessment</span>
          </h1>
          <p className="font-body-lg text-[15px] md:text-[17px] leading-[24px] md:leading-[28px] text-on-surface-variant max-w-lg mx-auto">
            Help us understand your health history, lifestyle and goals. Our
            team will review your details and reach out to explain how the
            3-month personalized diabetes-management program can help you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 sm:p-7 shadow-sm">
          <LeadQualificationForm />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-on-surface-variant">
          <span className="text-[14px]">Prefer to talk now?</span>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Talk to Glymee on WhatsApp
          </a>
        </div>

        <p className="mt-6 text-center text-[12px] leading-[18px] text-on-surface-variant/70 max-w-md mx-auto">
          This is an educational health assessment and does not constitute
          medical advice, diagnosis or treatment. Medication decisions are made
          by qualified healthcare professionals.
        </p>
      </main>
    </div>
  );
}
