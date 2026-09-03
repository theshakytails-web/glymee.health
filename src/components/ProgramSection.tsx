import Link from "next/link";

const months = [
  {
    month: "Month 1",
    label: "UNDERSTAND",
    title: "Build Your Baseline",
    icon: "search",
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "hover:border-primary/40",
    points: [
      "Health assessment",
      "Diabetes history",
      "Current routine & food habits",
      "Lifestyle, activity, sleep & stress",
      "Existing health reports",
      "Current treatment information",
    ],
    highlight: {
      title: "14-Day CGM Insight Period",
      text: "A CGM may be used for a defined period, such as 14 days, to provide continuous glucose information — to help understand patterns around meals, activity, sleep, stress, meal timing and your daily routine.",
    },
  },
  {
    month: "Month 2",
    label: "PERSONALIZE",
    title: "Turn Insights Into Action",
    icon: "tune",
    color: "text-secondary",
    bg: "bg-secondary/10",
    ring: "hover:border-secondary/40",
    points: [
      "Personalized nutrition",
      "Meal choices & meal timing",
      "Activity & exercise habits",
      "Sleep routine",
      "Stress management",
      "Diabetes education",
    ],
    highlight: {
      title: "Your Individual Pattern",
      text: "Your recommendations are based on your individual patterns and goals.",
    },
  },
  {
    month: "Month 3",
    label: "BUILD & SUSTAIN",
    title: "Make Better Habits Sustainable",
    icon: "trending_up",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
    ring: "hover:border-tertiary/40",
    points: [
      "Reviewing progress",
      "Reinforcing healthy routines",
      "Understanding what works for you",
      "Identifying challenges",
      "Making practical adjustments",
      "Long-term diabetes education",
    ],
    highlight: {
      title: "A Routine You Can Continue",
      text: "The goal isn't a temporary change. It's building a routine you can continue.",
    },
  },
];

export default function ProgramSection() {
  return (
    <section
      className="py-16 md:py-24 px-4 sm:px-6 max-w-[1280px] mx-auto"
      id="program"
    >
      <div className="text-center mb-4 max-w-3xl mx-auto">
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-label-md text-[13px] mb-4">
          Your 3-Month Journey
        </span>
        <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold mb-3">
          Your 3-Month Journey With Glymee
        </h2>
        <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
          Glymee is a 3-month personalized program. CGM monitoring is one part
          of the journey — not the entire program.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 md:mt-12">
        {months.map((m) => (
          <div
            key={m.month}
            className={`bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 md:p-7 transition-all ${m.ring}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <span
                className={`w-11 h-11 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}
              >
                <span className="material-symbols-outlined">{m.icon}</span>
              </span>
              <div>
                <p className="font-label-sm text-[12px] tracking-[0.05em] text-on-surface-variant font-semibold">
                  {m.month}
                </p>
                <p className={`font-headline-md text-[15px] font-bold ${m.color}`}>
                  {m.label}
                </p>
              </div>
            </div>

            <h3 className="font-headline-md text-[20px] md:text-[22px] leading-[28px] font-semibold text-on-background mb-4">
              {m.title}
            </h3>

            <ul className="space-y-2.5 mb-6">
              {m.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <span className={`material-symbols-outlined text-[18px] mt-0.5 ${m.color}`}>
                    check
                  </span>
                  <span className="text-[14px] md:text-[15px] leading-[22px] text-on-surface-variant">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <div className={`rounded-xl p-4 ${m.bg} border border-outline-variant/20`}>
              <p className={`font-label-sm text-[12px] font-bold ${m.color} mb-1`}>
                {m.highlight.title}
              </p>
              <p className="text-[13px] leading-[20px] text-on-surface-variant">
                {m.highlight.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="max-w-xl mx-auto text-[15px] leading-[22px] text-on-surface-variant mb-5">
          CGM is a part of the Glymee program — not the entire program. Every
          journey is personalized around you.
        </p>
        <Link
          href="/free-health-assessment"
          className="inline-block bg-primary text-on-primary px-8 py-4 rounded-lg font-label-lg font-semibold hover:opacity-90 transition-colors"
        >
          Start Your Free Health Assessment
        </Link>
      </div>
    </section>
  );
}
