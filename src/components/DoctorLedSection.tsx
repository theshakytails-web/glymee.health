import Image from "next/image";

export default function DoctorLedSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low px-4 sm:px-6" id="doctor-led">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="space-y-5">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold">
            Care Guided by a Doctor. Technology That Helps Us Understand Your
            Data.
          </h2>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
            Glymee&apos;s program is guided by a qualified doctor. Technology
            and glucose insights support the process, but people remain at the
            center of care.
          </p>

          {/* Doctor placeholder card - details to be added */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 md:p-7">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[32px]">person</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[18px] md:text-[20px] font-semibold text-on-background">
                  Dr. [Name]
                </h3>
                <p className="text-[14px] text-on-surface-variant font-label-md">
                  MBBS · Clinical Care
                </p>
              </div>
            </div>
            <p className="text-[14px] leading-[22px] text-on-surface-variant mt-4">
              Doctor-led guidance throughout your program — reviewing your
              patterns, progress and providing clinical oversight.
            </p>
          </div>

          {/* Medication note */}
          <div className="rounded-xl border border-outline-variant/30 bg-white p-4">
            <p className="text-[13px] leading-[21px] text-on-surface-variant">
              <strong className="text-on-background">Medication:</strong>{" "}
              Medication decisions are made by qualified healthcare
              professionals. Glymee does not ask patients to independently
              start, stop or change prescribed medication.
            </p>
          </div>
        </div>

        <div className="relative">
          <Image
            src="/glymee_team.jpg"
            alt="Glymee care team"
            width={600}
            height={450}
            className="rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
