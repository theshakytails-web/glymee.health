"use client";

import { useState } from "react";
import { faqs } from "@/lib/faqs";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 max-w-3xl mx-auto" id="faq">
      <h2 className="font-headline-lg text-[22px] sm:text-[26px] md:text-[28px] leading-[30px] sm:leading-[34px] md:leading-[36px] font-bold text-center mb-8 md:mb-12">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2 md:space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm"
          >
            <button
              className="flex justify-between items-center w-full p-4 sm:p-5 cursor-pointer font-headline-md text-[16px] sm:text-[18px] leading-[24px] sm:leading-[26px] font-semibold text-left"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              {faq.question}
              <span
                className={`material-symbols-outlined transition-transform shrink-0 ml-2 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {openIndex === index && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-on-surface-variant text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px]">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
