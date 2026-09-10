import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ConsultationForm from "@/components/ConsultationForm";

export const metadata: Metadata = {
  title: "Book a Free Consultation | Glymee Health",
  description:
    "Book a free consultation with the Glymee team and get personalized, doctor-led guidance for your diabetes management. We'll get back to you within 24 hours.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function BookConsultationPage() {
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

      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-md text-[13px] mb-4">
            Book a Free Consultation
          </span>
          <h1 className="font-display-lg text-[28px] sm:text-[36px] md:text-[40px] leading-[1.15] tracking-[-0.02em] font-extrabold text-on-background mb-3">
            Talk to Our <span className="text-primary">Glymee Team</span>
          </h1>
          <p className="font-body-lg text-[15px] md:text-[17px] leading-[24px] md:leading-[28px] text-on-surface-variant max-w-lg mx-auto">
            Tell us about yourself and we&apos;ll get back to you within 24
            hours to discuss how personalized, doctor-led diabetes care can
            work for you.
          </p>
        </div>

        <ConsultationForm />
      </main>
    </div>
  );
}