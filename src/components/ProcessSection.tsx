const steps = [
  {
    icon: "fact_check",
    title: "Assess",
    description:
      "Understand your health history, diabetes journey, food habits, lifestyle and current routine.",
  },
  {
    icon: "monitoring",
    title: "Monitor",
    description:
      "Track relevant health and lifestyle information throughout the program.",
  },
  {
    icon: "lightbulb",
    title: "Understand",
    description:
      "Use glucose data, including CGM insights when appropriate, to identify meaningful patterns.",
  },
  {
    icon: "tune",
    title: "Personalize",
    description:
      "Build nutrition and lifestyle recommendations around the individual's needs.",
  },
  {
    icon: "trending_up",
    title: "Improve",
    description:
      "Track progress, review changes and build sustainable habits over time.",
  },
];

export default function ProcessSection() {
  return (
    <section
      className="py-16 md:py-24 bg-surface-container-high px-4 sm:px-6"
      id="how-glymee-works"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto space-y-3">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold">
            Stop Guessing. Start Understanding Your Patterns.
          </h2>
          <p className="text-on-surface-variant text-[16px] md:text-[18px] leading-[24px] md:leading-[28px]">
            Glymee brings together health information, glucose data and lifestyle
            factors to help you understand your individual patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-outline-variant/30 p-5 md:p-6 shadow-sm relative"
            >
              <span className="absolute top-4 right-4 font-headline-md text-[14px] font-bold text-primary/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="material-symbols-outlined text-primary text-[28px] mb-4 block">
                {step.icon}
              </span>
              <h3 className="font-headline-md text-[18px] md:text-[20px] leading-[24px] md:leading-[28px] font-semibold text-on-background mb-2">
                {step.title}
              </h3>
              <p className="text-[14px] md:text-[15px] leading-[21px] text-on-surface-variant">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
