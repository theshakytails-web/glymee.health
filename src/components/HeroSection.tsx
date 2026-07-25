"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import BookButton from "./BookButton";

export default function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden px-6 py-20 bg-surface-container-low">
      {/* Parallax background gradient */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent will-change-transform"
      />

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left content */}
        <div className="space-y-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-md text-[14px] leading-[20px] tracking-[0.01em]">
            Manage Today. Healthy Tomorrow.
          </span>
          <h1 className="font-display-lg text-[48px] md:text-[56px] leading-[56px] tracking-[-0.02em] font-extrabold text-on-background">
            Stop Guessing. <br />
            <span className="text-primary">
              Start Understanding
            </span>{" "}
            Your Diabetes.
          </h1>
          <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant max-w-lg">
            We don&apos;t just treat blood sugar—we help you understand the
            &ldquo;why&rdquo; behind your numbers for a sustainable, healthy
            future.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <BookButton variant="primary" className="px-8 py-4 shadow-md" />
            <BookButton variant="outline" className="px-8 py-4" />
          </div>
        </div>

        {/* Right - Dashboard preview */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-secondary-container/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl" />
          <div className="relative glass-card p-4 rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
            <Image
              src="/glymee_dashboard.png"
              alt="Glymee Diabetes Management Dashboard showing personalized insights and trend analysis"
              width={600}
              height={450}
              className="w-full rounded-lg aspect-[4/3] object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
