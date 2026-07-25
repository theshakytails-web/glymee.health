const conditions = [
  { icon: "bloodtype", label: "Type 2 Diabetes" },
  { icon: "warning", label: "Prediabetes" },
  { icon: "pregnant_woman", label: "Gestational" },
  { icon: "speed", label: "Type 1 Support" },
];

export default function ConditionsSection() {
  return (
    <section className="py-24 px-6 max-w-[1280px] mx-auto">
      <h2 className="font-headline-lg text-[32px] leading-[40px] font-bold text-center mb-16">
        Conditions We Help Manage
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {conditions.map((condition) => (
          <div
            key={condition.label}
            className="p-6 bg-white rounded-xl text-center border border-outline-variant/30 hover:border-primary transition-colors cursor-default"
          >
            <span className="material-symbols-outlined text-primary text-3xl mb-3">
              {condition.icon}
            </span>
            <p className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background text-lg">
              {condition.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
