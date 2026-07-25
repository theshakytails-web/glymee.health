"use client";

import { useState } from "react";
import Image from "next/image";
import BookButton from "./BookButton";

const navLinks = [
  { label: "Why Glymee?", href: "#why-glymee" },
  { label: "Services", href: "#services" },
  { label: "Our Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
];

export default function TopNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-6 bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-8">
          <Image
            src="/Glymee_name.png"
            alt="Glymee"
            width={180}
            height={48}
            className="h-11 w-auto"
            priority
          />
        <div className="hidden md:flex gap-6">
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
        className="md:hidden text-on-surface p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      <div className="hidden md:block">
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
                {link.label}
              </a>
            ))}
            <BookButton variant="primary" className="mt-2 w-full py-3" />
          </div>
        </div>
      )}
    </nav>
  );
}
