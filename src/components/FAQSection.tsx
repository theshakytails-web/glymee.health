"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const faqKeys = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <section className="py-20 px-6 max-w-3xl mx-auto" id="faq">
      <h2 className="font-headline-lg text-[28px] leading-[36px] font-bold text-center mb-12">
        {t("faq.title")}
      </h2>
      <div className="space-y-3">
        {faqKeys.map((faq, index) => (
          <div
            key={faq.q}
            className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm"
          >
            <button
              className="flex justify-between items-center w-full p-5 cursor-pointer font-headline-md text-[18px] leading-[26px] font-semibold text-left"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              {t(faq.q)}
              <span
                className={`material-symbols-outlined transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 text-on-surface-variant text-[15px] leading-[24px]">
                {t(faq.a)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
