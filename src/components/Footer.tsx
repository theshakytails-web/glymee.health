import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const footerLinks = {
  product: [
    { key: "footer.features", href: "#" },
    { key: "footer.integrations", href: "#" },
    { key: "footer.pricing", href: "#" },
  ],
  company: [
    { key: "footer.aboutUs", href: "#about" },
    { key: "footer.careers", href: "#" },
    { key: "footer.contact", href: "#" },
  ],
};

const legalLinks = [
  { key: "footer.privacy", href: "/privacy" },
  { key: "footer.terms", href: "/terms" },
  { key: "footer.accessibility", href: "/accessibility" },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-16 px-6 bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <span className="text-[24px] font-headline-md font-bold text-primary mb-4 block leading-[32px]">
              Glymee
            </span>
            <p className="text-on-surface-variant text-sm">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              {t("footer.product")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              {t("footer.company")}
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-headline-md text-sm mb-6 uppercase tracking-wider">
              {t("footer.contactUs")}
            </h4>
            <p className="text-on-surface-variant text-sm">
              hello@glymee.com
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/10 gap-4">
          <p className="font-label-sm text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="font-label-sm text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary underline"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
