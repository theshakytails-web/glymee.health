import BookButton from "./BookButton";

export default function CTASection() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 max-w-[1280px] mx-auto">
      <div className="bg-primary rounded-3xl p-8 md:p-10 lg:p-12 text-center text-on-primary relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-5 md:space-y-6">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[36px] leading-[32px] sm:leading-[36px] md:leading-[44px] tracking-[-0.01em] font-bold">
            Start Your Journey Today
          </h2>
          <p className="font-body-md text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] opacity-90">
            Ready to uncover the &ldquo;why&rdquo; behind your blood sugar?
            Book your initial discovery session with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <BookButton variant="white" className="w-full sm:w-auto" />
            <button className="bg-primary-container text-white px-6 sm:px-10 py-3 md:py-4 rounded-lg font-headline-md text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] font-semibold hover:bg-opacity-90 transition-all border border-white/20 w-full sm:w-auto">
              View Pricing
            </button>
          </div>
          <p className="font-label-sm text-[12px] leading-[16px] tracking-[0.05em] font-semibold opacity-70">
            No long-term contracts. Scientific approach. Real human support.
          </p>
        </div>
      </div>
    </section>
  );
}
