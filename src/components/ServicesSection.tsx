const services = [
  {
    icon: "monitor_heart",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    hoverBg: "group-hover:bg-primary",
    hoverText: "group-hover:text-white",
    title: "CGM Integration",
    description:
      "Continuous monitoring that speaks to our platform in real-time for instant feedback.",
    linkColor: "text-primary",
  },
  {
    icon: "restaurant",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    hoverBg: "group-hover:bg-secondary",
    hoverText: "group-hover:text-white",
    title: "Nutrition Coaching",
    description:
      "Personalized meal plans designed around your body's specific glycemic response.",
    linkColor: "text-secondary",
  },
  {
    icon: "support_agent",
    iconBg: "bg-tertiary/10",
    iconColor: "text-tertiary",
    hoverBg: "group-hover:bg-tertiary",
    hoverText: "group-hover:text-white",
    title: "Clinical Support",
    description:
      "Expert guidance from licensed endocrinologists whenever you need an adjustment.",
    linkColor: "text-tertiary",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-24 px-6 max-w-[1280px] mx-auto" id="services">
      <h2 className="font-headline-lg text-[32px] leading-[40px] font-bold text-center mb-16">
        Our Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service.title}
            className="p-8 rounded-2xl bg-white border border-outline-variant shadow-sm hover:shadow-lg transition-all group"
          >
            <div
              className={`w-12 h-12 ${service.iconBg} rounded-lg flex items-center justify-center mb-6 ${service.hoverBg} transition-colors`}
            >
              <span
                className={`material-symbols-outlined ${service.iconColor} ${service.hoverText} transition-colors`}
              >
                {service.icon}
              </span>
            </div>
            <h3 className="font-headline-md text-[24px] leading-[32px] font-semibold mb-4">
              {service.title}
            </h3>
            <p className="text-on-surface-variant mb-6">{service.description}</p>
            <button
              className={`${service.linkColor} font-label-md flex items-center gap-2 hover:translate-x-1 transition-transform`}
            >
              Learn More
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
