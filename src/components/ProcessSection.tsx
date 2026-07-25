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
    <section className="py-24 bg-surface-container-high px-6" id="process">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-headline-lg text-[32px] leading-[40px] font-bold">
            Our 5-Step Transformation
          </h2>
          <p className="text-on-surface-variant">
            A proven path from confusion to complete control.
          </p>
        </div>
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-primary/20 z-0" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-2xl mx-auto shadow-lg ring-8 ring-white/50">
                  {step.number}
                </div>
                <h4 className="font-headline-md text-[24px] leading-[32px] font-semibold text-lg">
                  {step.title}
                </h4>
                <p className="text-sm text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
