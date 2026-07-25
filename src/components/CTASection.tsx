import BookButton from "./BookButton";
import { useLanguage } from "@/context/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-6 max-w-[1280px] mx-auto">
      <div className="bg-primary rounded-3xl p-10 md:p-12 text-center text-on-primary relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="font-headline-lg text-[32px] md:text-[40px] leading-[48px] tracking-[-0.01em] font-bold">
            {t("cta.title")}
          </h2>
          <p className="font-body-md text-[16px] leading-[24px] opacity-90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <BookButton variant="white" />
            <button className="bg-primary-container text-white px-10 py-4 rounded-lg font-headline-md text-[20px] leading-[28px] font-semibold hover:bg-opacity-90 transition-all border border-white/20">
              {t("cta.pricing")}
            </button>
          </div>
          <p className="font-label-sm text-[12px] leading-[16px] tracking-[0.05em] font-semibold opacity-70">
            {t("cta.note")}
          </p>
        </div>
      </div>
    </section>
  );
}
