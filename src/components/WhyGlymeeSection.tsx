const reasons = [
  {
    icon: "person",
    title: "Personalized",
    description: "Your plan is built around your health, routine and goals.",
  },
  {
    icon: "insights",
    title: "Data-Informed",
    description: "Use real-world glucose and lifestyle information to understand patterns.",
  },
  {
    icon: "stethoscope",
    title: "Doctor-Led",
    description: "Healthcare professionals guide your journey.",
  },
  {
    icon: "monitor_heart",
    title: "Beyond Glucose",
    description: "We look at food, activity, sleep, stress, routine and other relevant factors.",
  },
  {
    icon: "event_available",
    title: "Structured",
    description: "A clear 3-month program instead of disconnected advice.",
  },
  {
    icon: "favorite",
    title: "Human",
    description: "Technology supports the process, but people remain at the center of care.",
  },
];

export default function WhyGlymeeSection() {
  return (
    <section
      className="py-16 md:py-24 bg-surface-container-low px-4 sm:px-6"
      id="why-glymee"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold mb-3">
            Why Glymee?
          </h2>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
            A personalized, doctor-led approach to understanding and managing
            your diabetes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="bg-white p-6 md:p-7 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  {reason.icon}
                </span>
              </div>
              <h3 className="font-headline-md text-[19px] md:text-[21px] leading-[26px] md:leading-[28px] font-semibold text-on-background mb-2">
                {reason.title}
              </h3>
              <p className="text-[15px] md:text-[16px] leading-[23px] text-on-surface-variant">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
