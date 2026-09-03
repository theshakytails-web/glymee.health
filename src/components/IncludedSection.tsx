const includedItems = [
  {
    icon: "stethoscope",
    title: "Doctor-Led Guidance",
    description: "Get guidance from a qualified doctor throughout your program.",
  },
  {
    icon: "fact_check",
    title: "Health Assessment",
    description: "Understand your health history, diabetes journey and lifestyle.",
  },
  {
    icon: "monitor_heart",
    title: "CGM Insights",
    description: "Use CGM monitoring when appropriate to understand glucose patterns.",
  },
  {
    icon: "restaurant",
    title: "Personalized Nutrition",
    description: "Receive practical nutrition guidance based on your individual needs.",
  },
  {
    icon: "self_improvement",
    title: "Lifestyle Management",
    description: "Work on activity, sleep, stress and daily routines.",
  },
  {
    icon: "trending_up",
    title: "Regular Monitoring",
    description: "Track progress throughout the program.",
  },
  {
    icon: "school",
    title: "Patient Education",
    description: "Understand diabetes and the factors that influence your glucose.",
  },
  {
    icon: "event_note",
    title: "Progress Review",
    description: "Review your journey and identify areas for continued improvement.",
  },
  {
    icon: "description",
    title: "Personalized Report",
    description: "Receive a structured summary of your progress and key insights.",
  },
];

export default function IncludedSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold mb-3">
            What&apos;s Included in Glymee?
          </h2>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
            Everything you need to understand your patterns and build better
            diabetes-management habits — in one structured program.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {includedItems.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-primary text-[26px] mb-3 block">
                {item.icon}
              </span>
              <h3 className="font-headline-md text-[17px] md:text-[18px] leading-[24px] font-semibold text-on-background mb-2">
                {item.title}
              </h3>
              <p className="text-[14px] leading-[21px] text-on-surface-variant">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
