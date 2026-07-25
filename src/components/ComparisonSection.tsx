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
    <section className="py-24 bg-surface-container-low px-6" id="why-glymee">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="font-headline-lg text-[32px] leading-[40px] font-bold text-center mb-16">
          Traditional Care vs. Glymee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional */}
          <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm opacity-80">
            <h3 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">
                cancel
              </span>
              Traditional Management
            </h3>
            <ul className="space-y-4 text-on-surface-variant">
              {traditionalItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-1 text-sm">
                    circle
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Glymee */}
          <div className="bg-primary p-8 rounded-2xl shadow-xl text-on-primary">
            <h3 className="font-headline-md text-[24px] leading-[32px] font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">
                check_circle
              </span>
              The Glymee Way
            </h3>
            <ul className="space-y-4">
              {glymeeItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-1 text-sm">
                    done_all
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
