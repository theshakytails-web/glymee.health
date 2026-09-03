import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "./WhatsAppButton";

const productLinks = [
  { label: "How Glymee Works", href: "#how-glymee-works" },
  { label: "Programs", href: "#program" },
  { label: "Who We Help", href: "#who-we-help" },
  { label: "FAQs", href: "#faq" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Medical Disclaimer", href: "#medical-disclaimer" },
];

export default function Footer() {
  return (
    <footer className="w-full py-10 md:py-16 px-4 sm:px-6 bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8">
          <div>
            <Image
              src="/Glymee_name.png"
              alt="Glymee"
              width={100}
              height={100}
              className="h-10 w-auto object-contain mb-3"
              priority
            />
            <p className="text-on-surface-variant text-sm font-semibold">
              Personalized Diabetes Care
            </p>
            <p className="text-on-surface-variant text-sm mt-2">
              A 3-month doctor-led personalized diabetes-management program.
            </p>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-3 text-on-surface-variant text-sm">
              <p>
                <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">language</span>
                www.glymee.com
              </p>
              <p>
                <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">mail</span>
                Help@glymee.com
              </p>
              <p>
                <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">call</span>
                +91 8452823804
              </p>
              <WhatsAppButton
                label="Talk to Glymee on WhatsApp"
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[13px] font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="rounded-xl bg-surface border border-outline-variant/20 p-4 mb-6" id="medical-disclaimer">
          <p className="text-[12px] leading-[18px] text-on-surface-variant">
            Glymee provides personalized diabetes-management support and health
            education. It does not replace your treating physician or emergency
            medical care. Treatment and medication decisions should be made
            with a qualified healthcare professional. Individual results may
            vary.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-outline-variant/10 gap-4">
          <p className="font-label-sm text-[11px] md:text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">
            &copy; 2026 Glymee Health. All rights reserved.
          </p>
          <div className="flex gap-3">
            <a
              href="https://instagram.com/glymee.health"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-on-surface/5 hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/glymee-health/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-on-surface/5 hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
