"use client";

import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";
import { useConsultation } from "@/context/ConsultationContext";

export default function CTASection() {
  const { open } = useConsultation();
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 max-w-[1280px] mx-auto">
      <div className="bg-primary rounded-3xl p-8 md:p-10 lg:p-12 text-center text-on-primary relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-5 md:space-y-6">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[36px] leading-[32px] sm:leading-[36px] md:leading-[44px] tracking-[-0.01em] font-bold">
            Understand Your Numbers. Change What Matters.
          </h2>
          <p className="font-body-md text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] opacity-90">
            Your diabetes is personal. Your care should be personal too. Start
            your Glymee journey with a free health assessment — or book a free
            consultation and talk to our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/free-health-assessment"
              className="bg-white text-primary px-6 sm:px-10 py-3 md:py-4 rounded-lg font-headline-md text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] font-semibold hover:opacity-90 transition-all w-full sm:w-auto"
            >
              Start Your Free Health Assessment
            </Link>
            <button
              type="button"
              onClick={open}
              className="bg-white text-primary px-6 sm:px-10 py-3 md:py-4 rounded-lg font-headline-md text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] font-semibold hover:opacity-90 transition-all w-full sm:w-auto"
            >
              Book Free Consultation
            </button>
            <WhatsAppButton
              label="Talk to Glymee"
              className="border border-white/40 text-white px-6 sm:px-10 py-3 md:py-4 rounded-lg font-headline-md text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] font-semibold w-full sm:w-auto"
            />
          </div>
          <p className="font-label-sm text-[12px] leading-[16px] tracking-[0.05em] font-semibold opacity-80">
            3-Month Personalized Diabetes Management Program
          </p>
        </div>
      </div>
    </section>
  );
}
