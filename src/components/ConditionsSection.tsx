const conditions = [
  { icon: "bloodtype", label: "Type 2 Diabetes" },
  { icon: "warning", label: "Prediabetes" },
  { icon: "pregnant_woman", label: "Gestational" },
  { icon: "speed", label: "Type 1 Support" },
];

export default function ConditionsSection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 max-w-[1280px] mx-auto">
      <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[32px] leading-[32px] sm:leading-[36px] md:leading-[40px] font-bold text-center mb-10 md:mb-16">
        Conditions We Help Manage
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {conditions.map((condition) => (
          <div
            key={condition.label}
            className="p-4 md:p-6 bg-white rounded-xl text-center border border-outline-variant/30 hover:border-primary transition-colors cursor-default"
          >
            <span className="material-symbols-outlined text-primary text-2xl md:text-3xl mb-2 md:mb-3">
              {condition.icon}
            </span>
            <p className="font-headline-md text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] font-semibold text-on-background">
              {condition.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
