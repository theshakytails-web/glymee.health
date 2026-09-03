const patterns = [
  { icon: "restaurant", label: "Meal", detail: "Glucose response" },
  { icon: "directions_run", label: "Activity", detail: "Glucose response" },
  { icon: "bedtime", label: "Sleep", detail: "Glucose pattern" },
  { icon: "psychology_alt", label: "Stress", detail: "Glucose pattern" },
  { icon: "event_repeat", label: "Routine", detail: "Glucose pattern" },
];

export default function CGMSection() {
  return (
    <section className="py-16 md:py-24 bg-surface px-4 sm:px-6" id="cgm">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="space-y-5">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold">
            See What Happens to Your Glucose Throughout the Day
          </h2>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
            A CGM can provide continuous glucose information that helps reveal
            patterns that occasional glucose checks may not show.
          </p>
          <p className="font-body-md text-[15px] md:text-[16px] leading-[23px] text-on-surface-variant">
            Instead of only asking <em>&quot;What is my glucose?&quot;</em>,
            Glymee helps you ask{" "}
            <strong className="text-on-background">
              &quot;What may be influencing my glucose?&quot;
            </strong>
          </p>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mt-2">
            <p className="text-[13px] leading-[20px] text-on-surface-variant">
              CGM alone doesn&apos;t determine the cause of glucose changes. It
              helps identify patterns and relationships — which are then
              understood together with your lifestyle and your care team.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {patterns.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-4 bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm"
            >
              <span className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">{p.icon}</span>
              </span>
              <div className="flex-1 flex items-center justify-between gap-3">
                <span className="font-headline-md text-[16px] font-semibold text-on-background">
                  {p.label}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">
                  arrow_forward
                </span>
                <span className="text-[14px] text-on-surface-variant">{p.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
