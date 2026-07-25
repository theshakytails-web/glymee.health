import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { label: "Features", href: "#" },
  { label: "Integrations", href: "#" },
  { label: "Pricing", href: "#" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
];

export default function Footer() {
  return (
    <footer className="w-full py-10 md:py-16 px-4 sm:px-6 bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
          <div className="col-span-1 md:col-span-1">
            <Image
              src="/Glymee_name.png"
              alt="Glymee"
              width={180}
              height={48}
              className="h-11 w-auto mb-4"
            />
            <p className="text-on-surface-variant text-sm">
              Empowering smarter metabolic health management through data and
              human connection.
            </p>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              Product
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
              Company
            </h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
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
              Contact
            </h4>
            <p className="text-on-surface-variant text-sm">help@glymee.com</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 md:pt-8 border-t border-outline-variant/10 gap-4">
          <p className="font-label-sm text-[11px] md:text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">
            &copy; 2024 Glymee Health. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-label-sm text-[11px] md:text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
