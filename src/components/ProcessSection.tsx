const steps = [
  {
    number: "1",
    title: "Discovery",
    description: "Metabolic health assessment & history review.",
  },
  {
    number: "2",
    title: "Onboarding",
    description: "Device setup & team introduction.",
  },
  {
    number: "3",
    title: "Monitoring",
    description: "14-day intensive data collection phase.",
  },
  {
    number: "4",
    title: "Analysis",
    description: "Identifying root causes & patterns.",
  },
  {
    number: "5",
    title: "Thrive",
    description: "Personalized roadmap for long-term health.",
  },
];

export default function ProcessSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-high px-4 sm:px-6" id="process">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[32px] leading-[32px] sm:leading-[36px] md:leading-[40px] font-bold">
            Our 5-Step Transformation
          </h2>
          <p className="text-on-surface-variant text-[16px] md:text-[18px]">
            A proven path from confusion to complete control.
          </p>
        </div>
        <div className="relative">
          {/* Connection line - hidden on mobile, horizontal on md+ */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-primary/20 z-0" />
          {/* Vertical line on mobile */}
          <div className="md:hidden absolute top-0 left-12 w-0.5 h-full bg-primary/20 z-0" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center gap-4 md:flex-col md:text-center md:space-y-4">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xl md:text-2xl shrink-0 shadow-lg ring-4 md:ring-8 ring-white/50">
                  {step.number}
                </div>
                <div className="md:w-full">
                  <h4 className="font-headline-md text-[18px] md:text-[24px] leading-[24px] md:leading-[32px] font-semibold">
                    {step.title}
                  </h4>
                  <p className="text-[14px] md:text-sm text-on-surface-variant mt-1 md:mt-0">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
