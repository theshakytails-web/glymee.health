"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How does Glymee differ from my regular doctor?",
    answer:
      "While your doctor provides clinical diagnosis and prescriptions, Glymee provides the daily support, real-time data analysis, and behavioral coaching required to manage your condition between visits.",
  },
  {
    question: "Do I need my own CGM to start?",
    answer:
      "If you don't have one, we can help facilitate getting a Continuous Glucose Monitor through our network of providers, or work with the device you already use.",
  },
  {
    question: "Is Glymee covered by insurance?",
    answer:
      "Many components of Glymee are HSA/FSA eligible. We also partner with select employers and insurance providers. Contact us for a benefit check.",
  },
  {
    question: "What results can I expect?",
    answer:
      "Most users see a reduction in A1c, improved time-in-range, and increased confidence in their food choices within the first 3 months.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 max-w-3xl mx-auto" id="faq">
      <h2 className="font-headline-lg text-[28px] leading-[36px] font-bold text-center mb-12">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm"
          >
            <button
              className="flex justify-between items-center w-full p-5 cursor-pointer font-headline-md text-[18px] leading-[26px] font-semibold text-left"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              {faq.question}
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
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
