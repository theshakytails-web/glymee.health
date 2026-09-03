"use client";

import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-[60vh] md:min-h-[90vh] flex items-center overflow-hidden px-4 sm:px-6 py-12 md:py-20 bg-surface-container-low"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left content */}
        <div className="space-y-6 md:space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-label-md text-[13px] leading-[20px]">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            3-Month Personalized Diabetes Management Program
          </span>
          <h1 className="font-display-lg text-[32px] sm:text-[40px] md:text-[52px] leading-[1.1] sm:leading-[1.1] md:leading-[56px] tracking-[-0.02em] font-extrabold text-on-background">
            Personalized Diabetes{" "}
            <span className="text-primary">Care That Goes Beyond</span>{" "}
            Blood Sugar.
          </h1>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant max-w-lg">
            Understand how your food, activity, sleep, stress, medication and
            daily routine affect your glucose — and work with a doctor-led care
            team to build a personalized diabetes-management plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 md:pt-4">
            <Link
              href="/free-health-assessment"
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-primary text-on-primary font-semibold text-center hover:opacity-90 transition-colors shadow-md"
            >
              Start Your Free Health Assessment
            </Link>
            <WhatsAppButton
              className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-primary/30 text-primary font-semibold"
              label="Talk to Glymee"
            />
          </div>
        </div>

        {/* Right - Dashboard preview */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-secondary-container/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl" />
          <div className="relative glass-card p-3 sm:p-4 rounded-xl shadow-2xl">
            <Image
              src="/glymee_dashboard.png"
              alt="Glymee personalized diabetes-management insights"
              width={600}
              height={450}
              className="w-full rounded-lg aspect-[4/3] object-cover"
              priority
            />
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-label-sm text-on-surface-variant bg-surface rounded-full px-3 py-1.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">eco</span>
                Diet &amp; Routine
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-label-sm text-on-surface-variant bg-surface rounded-full px-3 py-1.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">monitor_heart</span>
                Glucose Insights
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-label-sm text-on-surface-variant bg-surface rounded-full px-3 py-1.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">support_agent</span>
                Doctor-Led Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
