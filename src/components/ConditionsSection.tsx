const audience = [
  {
    icon: "bloodtype",
    badge: "Primary",
    badgeColor: "bg-primary/10 text-primary",
    title: "Type 2 Diabetes",
    description:
      "Build better daily habits and understand the factors affecting your glucose.",
  },
  {
    icon: "warning",
    badge: "Early Action",
    badgeColor: "bg-secondary/10 text-secondary",
    title: "Prediabetes",
    description:
      "Take action early by understanding lifestyle and metabolic patterns.",
  },
  {
    icon: "speed",
    badge: "Support",
    badgeColor: "bg-tertiary/10 text-tertiary",
    title: "Type 1 Diabetes",
    description:
      "Get structured lifestyle and glucose-management support alongside your treating physician.",
  },
  {
    icon: "female",
    badge: "Support",
    badgeColor: "bg-tertiary/10 text-tertiary",
    title: "PCOS / PCOD",
    description:
      "Support healthier lifestyle and metabolic habits as part of comprehensive care.",
  },
];

export default function ConditionsSection() {
  return (
    <section
      className="py-16 md:py-24 px-4 sm:px-6 max-w-[1280px] mx-auto"
      id="who-we-help"
    >
      <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
        <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold mb-3">
          Who Is Glymee For?
        </h2>
        <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
          Personalized diabetes-management support for your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {audience.map((item) => (
          <div
            key={item.title}
            className="p-5 md:p-6 bg-white rounded-2xl border border-outline-variant/30 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">
                {item.icon}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-label-sm font-semibold ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            </div>
            <h3 className="font-headline-md text-[17px] md:text-[19px] leading-[24px] md:leading-[26px] font-semibold text-on-background mb-2">
              {item.title}
            </h3>
            <p className="text-[14px] leading-[21px] text-on-surface-variant">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[13px] leading-[20px] text-on-surface-variant/80 max-w-2xl mx-auto">
        Glymee provides structured, doctor-led diabetes-management support. It
        does not replace your primary treating physician or emergency medical
        care, and it does not claim to cure diabetes or PCOS/PCOD.
      </p>
    </section>
  );
}
