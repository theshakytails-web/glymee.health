"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";
import { useConsultation } from "@/context/ConsultationContext";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How Glymee Works", href: "#how-glymee-works" },
  { label: "Programs", href: "#program" },
  { label: "Who We Help", href: "#who-we-help" },
  { label: "About Us", href: "#about" },
  { label: "FAQs", href: "#faq" },
];

export default function TopNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useConsultation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-6 bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-8">
        <a href="/" aria-label="Glymee Home">
          <Image
            src="/Glymee_name.png"
            alt="Glymee"
            width={100}
            height={100}
            className="h-full scale-110 translate-y-1 w-auto object-cover"
            priority
          />
        </a>
        <div className="hidden lg:flex gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden text-on-surface p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      <div className="hidden lg:flex items-center gap-3">
        <button
          type="button"
          onClick={open}
          className="bg-white border border-primary/30 text-primary px-5 py-2.5 rounded-lg font-label-md text-[14px] leading-[20px] tracking-[0.01em] hover:bg-primary/5 transition-all active:scale-95 whitespace-nowrap"
        >
          Book Free Consultation
        </button>
        <Link
          href="/free-health-assessment"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-[14px] leading-[20px] tracking-[0.01em] hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
        >
          Start Free Health Assessment
        </Link>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-surface shadow-lg lg:hidden">
          <div className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                open();
              }}
              className="mt-1 w-full bg-white border border-primary/30 text-primary px-5 py-3 rounded-lg font-label-md text-[14px] text-center hover:bg-primary/5 transition-all"
            >
              Book Free Consultation
            </button>
            <Link
              href="/free-health-assessment"
              className="mt-1 w-full bg-primary text-on-primary px-5 py-3 rounded-lg font-label-md text-[14px] text-center hover:opacity-90 transition-all"
            >
              Start Free Health Assessment
            </Link>
            <WhatsAppButton className="w-full justify-center border border-primary/30 text-primary py-3 rounded-lg" />
          </div>
        </div>
      )}
    </nav>
  );
}
