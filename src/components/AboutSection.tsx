import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-surface px-6 overflow-hidden" id="about">
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 relative">
          <Image
            src="/glymee_team.jpg"
            alt="Glymee Clinical Team collaborating"
            width={600}
            height={450}
            className="rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
          />
          <div className="absolute -bottom-6 -right-6 p-6 glass-card rounded-lg shadow-lg max-w-[280px]">
            <p className="font-label-md text-[14px] leading-[20px] tracking-[0.01em] text-primary italic">
              {t("about.quote")}
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <h2 className="font-headline-lg text-[32px] leading-[40px] font-bold text-on-background">
            {t("about.title")}
          </h2>
          <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant">
            {t("about.p1")}
          </p>
          <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">
            {t("about.p2")}
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <p className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
              {t("about.location")}
            </p>
            <p className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">
                mail
              </span>
              {t("about.email")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
