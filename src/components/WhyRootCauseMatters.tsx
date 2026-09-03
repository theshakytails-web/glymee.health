const factors = [
  {
    icon: "restaurant",
    color: "text-primary",
    title: "Food",
    description: "What you eat and how much you eat.",
  },
  {
    icon: "directions_run",
    color: "text-secondary",
    title: "Activity",
    description: "Movement and exercise can affect glucose differently for different people.",
  },
  {
    icon: "bedtime",
    color: "text-tertiary",
    title: "Sleep",
    description: "Poor or irregular sleep can affect daily glucose patterns.",
  },
  {
    icon: "psychology_alt",
    color: "text-primary",
    title: "Stress",
    description: "Stress can influence glucose and everyday routines.",
  },
  {
    icon: "medication",
    color: "text-error",
    title: "Medication",
    description: "Medication timing and treatment can influence glucose patterns.",
  },
  {
    icon: "schedule",
    color: "text-secondary",
    title: "Meal Timing",
    description: "When you eat can matter along with what you eat.",
  },
  {
    icon: "event_repeat",
    color: "text-tertiary",
    title: "Daily Routine",
    description: "Small changes in your routine can sometimes create noticeable changes in your glucose.",
  },
];

export default function WhyRootCauseMatters() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-[1280px] mx-auto">
      <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto space-y-3 md:space-y-4">
        <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold text-on-background">
          Diabetes Is More Than a Number
        </h2>
        <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
          Your glucose can change throughout the day — and food isn&apos;t the
          only factor. Your daily glucose patterns can be influenced by:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {factors.map((factor) => (
          <div
            key={factor.title}
            className="bg-white p-5 md:p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all"
          >
            <span
              className={`material-symbols-outlined ${factor.color} text-2xl md:text-3xl mb-3`}
            >
              {factor.icon}
            </span>
            <h3 className="font-headline-md text-[17px] md:text-[19px] leading-[24px] md:leading-[28px] font-semibold text-on-background mb-2">
              {factor.title}
            </h3>
            <p className="text-[14px] md:text-[15px] leading-[22px] text-on-surface-variant">
              {factor.description}
            </p>
          </div>
        ))}

        {/* Closing card */}
        <div className="bg-primary text-on-primary p-5 md:p-6 rounded-xl shadow-md flex flex-col justify-center">
          <span className="material-symbols-outlined text-2xl md:text-3xl mb-3">
            insights
          </span>
          <h3 className="font-headline-md text-[17px] md:text-[19px] leading-[24px] md:leading-[28px] font-semibold mb-2">
            Glymee helps you connect these.
          </h3>
          <p className="text-[14px] md:text-[15px] leading-[22px] opacity-90">
            We help connect these everyday factors with your glucose patterns.
          </p>
        </div>
      </div>
    </section>
  );
}
