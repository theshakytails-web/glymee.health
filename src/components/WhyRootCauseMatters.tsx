const features = [
  {
    icon: "biotech",
    iconColor: "text-primary",
    title: "Precision Analysis",
    description:
      "We dive deep into your metabolic profile to find what specifically triggers your spikes.",
  },
  {
    icon: "psychology_alt",
    iconColor: "text-secondary",
    title: "Behavioral Science",
    description:
      "Understand the psychological factors influencing your daily health choices and habits.",
  },
  {
    icon: "settings_accessibility",
    iconColor: "text-primary",
    title: "Sustainable Shift",
    description:
      "Replace guesswork with data-backed lifestyle adjustments that stick for life.",
  },
];

export default function WhyRootCauseMatters() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-[1280px] mx-auto">
      <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto space-y-3 md:space-y-4">
        <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[32px] leading-[32px] sm:leading-[36px] md:leading-[40px] font-bold text-on-background">
          Why Root Cause Matters
        </h2>
        <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
          Treating symptoms only gets you so far. By identifying the root causes
          of glucose fluctuations—from stress to sleep to gut health—we create
          lasting change.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-all"
          >
            <span
              className={`material-symbols-outlined ${feature.iconColor} text-3xl md:text-4xl mb-4 md:mb-6`}
            >
              {feature.icon}
            </span>
            <h3 className="font-headline-md text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold text-on-background mb-3 md:mb-4">
              {feature.title}
            </h3>
            <p className="text-on-surface-variant">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
