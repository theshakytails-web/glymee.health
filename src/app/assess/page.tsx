import Image from "next/image";
import Link from "next/link";

const specificAssessments = [
  {
    slug: "blood_sugar",
    name: "Blood Sugar & Diabetes",
    description: "Focus on blood sugar levels and diabetes risk factors.",
    icon: "bloodtype",
    color: "bg-red-50 text-red-600 border-red-200",
    time: "2-4 min",
  },
  {
    slug: "heart",
    name: "Heart Health",
    description: "Assess your cardiovascular health risk factors.",
    icon: "favorite",
    color: "bg-pink-50 text-pink-600 border-pink-200",
    time: "2-4 min",
  },
  {
    slug: "mental",
    name: "Mental Wellbeing",
    description: "A general wellbeing check — not a psychiatric diagnosis.",
    icon: "psychology",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    time: "2-3 min",
  },
  {
    slug: "liver",
    name: "Liver Health",
    description: "Assess risk factors and lifestyle that may affect liver health.",
    icon: "medical_information",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    time: "2-3 min",
  },
  {
    slug: "weight",
    name: "Weight & Metabolic Health",
    description: "Understand factors affecting your weight and metabolism.",
    icon: "monitor_weight",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    time: "2-4 min",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle & Nutrition",
    description: "Evaluate your daily habits and dietary patterns.",
    icon: "restaurant",
    color: "bg-green-50 text-green-600 border-green-200",
    time: "2-3 min",
  },
];

export default function AssessmentLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Glymee_name.png"
              alt="Glymee"
              width={100}
              height={100}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="font-label-md text-[14px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[640px] mx-auto px-4 sm:px-6 py-10 md:py-16">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="font-display-lg text-[28px] sm:text-[32px] md:text-[40px] leading-[1.15] tracking-[-0.02em] font-extrabold text-on-background mb-4">
            Understand Your Health{" "}
            <span className="text-primary">Better.</span>
          </h1>
          <p className="font-body-lg text-[15px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant max-w-md mx-auto">
            Take a simple health assessment to understand the areas of your
            health that may need more attention.
          </p>
        </div>

        {/* Choose your assessment */}
        <div className="mb-6">
          <p className="font-label-md text-[14px] text-on-surface-variant text-center mb-6">
            Choose your assessment
          </p>

          {/* Full Assessment Card */}
          <Link href="/assess/full" className="block mb-8">
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    health_and_safety
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-headline-md text-[18px] md:text-[20px] font-semibold text-on-background mb-1">
                    Full Health Assessment
                  </h2>
                  <p className="font-body-md text-[14px] md:text-[15px] text-on-surface-variant mb-3">
                    Get a broader view of your health, lifestyle and key risk areas.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      5-8 minutes
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[12px] font-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">category</span>
                      9 categories
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors text-[24px]">
                  arrow_forward
                </span>
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-outline-variant/40" />
            <span className="font-label-sm text-[12px] text-on-surface-variant/60 uppercase tracking-wider">
              or focus on a specific area
            </span>
            <div className="flex-1 h-px bg-outline-variant/40" />
          </div>

          {/* Specific Assessment Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {specificAssessments.map((assessment) => (
              <Link
                key={assessment.slug}
                href={`/assess/specific/${assessment.slug}`}
                className="block"
              >
                <div className="bg-white rounded-xl border border-outline-variant/30 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full">
                  <div className="flex flex-col h-full">
                    <div
                      className={`w-10 h-10 rounded-lg ${assessment.color} flex items-center justify-center mb-3`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {assessment.icon}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-[14px] sm:text-[15px] font-semibold text-on-background mb-1 leading-tight">
                      {assessment.name}
                    </h3>
                    <p className="font-body-md text-[12px] sm:text-[13px] text-on-surface-variant mb-3 leading-relaxed flex-1">
                      {assessment.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-label-sm text-on-surface-variant/60">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {assessment.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px] flex-shrink-0 mt-0.5">
              info
            </span>
            <p className="font-body-md text-[13px] leading-[20px] text-on-surface-variant/70">
              This assessment provides health insights based on the information
              you provide. It is not a medical diagnosis. Please consult a
              qualified healthcare professional for diagnosis, treatment or
              medication decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
