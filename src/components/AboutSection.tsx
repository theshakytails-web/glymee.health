import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-surface px-4 sm:px-6 overflow-hidden" id="about">
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-10 md:gap-16 items-center">
        <div className="flex-1 relative w-full">
          <Image
            src="/glymee_team.jpg"
            alt="Glymee Clinical Team collaborating"
            width={600}
            height={450}
            className="rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
          />
          <div className="absolute -bottom-4 md:-bottom-6 -right-4 md:-right-6 p-4 md:p-6 glass-card rounded-lg shadow-lg max-w-[240px] md:max-w-[280px]">
            <p className="font-label-md text-[12px] md:text-[14px] leading-[16px] md:leading-[20px] tracking-[0.01em] text-primary italic">
              &ldquo;Founded on clinical excellence and a deep passion for
              human-centric metabolic health.&rdquo;
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-5 md:space-y-6">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[32px] leading-[32px] sm:leading-[36px] md:leading-[40px] font-bold text-on-background">
            Our Story
          </h2>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
            Glymee was born from a simple observation: modern healthcare manages
            diabetes, but it doesn&apos;t always empower the patient. Our team of
            doctors, dietitians, and engineers came together to build a bridge
            between data and daily living.
          </p>
          <p className="font-body-md text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] text-on-surface-variant">
            Based in Pune, India, we serve patients with one mission: to make
            metabolic health intuitive, accessible, and life-changing.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <p className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
              Pune, Maharashtra, India
            </p>
            <p className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">
                mail
              </span>
              help@glymee.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
