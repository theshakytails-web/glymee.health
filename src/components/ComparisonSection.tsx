const traditionalItems = [
  "Short, hurried doctor appointments",
  'Focus on "lowering numbers" only',
  "One-size-fits-all dietary advice",
  "Disconnected tracking devices",
];

const glymeeItems = [
  "24/7 access to your dedicated care team",
  "Holistic root-cause identification",
  "Personalized nutrition based on CGM data",
  "Unified ecosystem for all health metrics",
];

export default function ComparisonSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low px-4 sm:px-6" id="why-glymee">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[32px] leading-[32px] sm:leading-[36px] md:leading-[40px] font-bold text-center mb-10 md:mb-16">
          Traditional Care vs. Glymee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Traditional */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm opacity-80">
            <h3 className="font-headline-md text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold text-on-surface-variant mb-5 md:mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">
                cancel
              </span>
              Traditional Management
            </h3>
            <ul className="space-y-3 md:space-y-4 text-on-surface-variant">
              {traditionalItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-1 text-sm">
                    circle
                  </span>
                  <span className="text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Glymee */}
          <div className="bg-primary p-6 md:p-8 rounded-2xl shadow-xl text-on-primary">
            <h3 className="font-headline-md text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold mb-5 md:mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">
                check_circle
              </span>
              The Glymee Way
            </h3>
            <ul className="space-y-3 md:space-y-4">
              {glymeeItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-1 text-sm">
                    done_all
                  </span>
                  <span className="text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
