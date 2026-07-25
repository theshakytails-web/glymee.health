"use client";

import { useState } from "react";
import BookButton from "./BookButton";
import { useLanguage } from "@/context/LanguageContext";

const navLinks = [
  { key: "nav.whyGlymee", href: "#why-glymee" },
  { key: "nav.services", href: "#services" },
  { key: "nav.process", href: "#process" },
  { key: "nav.faq", href: "#faq" },
];

const languages = [
  { code: "en" as const, label: "English", flag: "EN" },
  { code: "hi" as const, label: "हिन्दी", flag: "HI" },
  { code: "mr" as const, label: "मराठी", flag: "MR" },
];

export default function TopNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-6 bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-8">
        <span className="text-[24px] font-headline-md font-bold text-primary leading-[32px]">
          Glymee
        </span>
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity"
            >
              {t(link.key)}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-on-surface p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      <div className="hidden md:flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 hover:border-primary transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span className="font-label-sm text-[12px] font-semibold">
              {languages.find((l) => l.code === language)?.flag}
            </span>
            <span className="material-symbols-outlined text-[16px] transition-transform" style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0)" }}>
              expand_more
            </span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-outline-variant/30 overflow-hidden min-w-[120px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left font-label-md text-[14px] hover:bg-surface-container transition-colors flex items-center gap-2 ${
                    language === lang.code ? "bg-primary/10 text-primary" : "text-on-surface"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <BookButton variant="primary" />
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-surface shadow-lg md:hidden">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity py-2"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key)}
              </a>
            ))}
            {/* Mobile language selector */}
            <div className="flex gap-2 py-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                    language === lang.code
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
            <BookButton variant="primary" className="mt-2 w-full py-3" />
          </div>
        </div>
      )}
    </nav>
  );
}
