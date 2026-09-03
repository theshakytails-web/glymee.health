import Link from "next/link";

const trustPoints = [
  {
    icon: "lock",
    title: "Handled Securely",
    description: "Patient information is handled securely.",
  },
  {
    icon: "gpp_good",
    title: "Used for the Service",
    description: "Health information is used to provide the Glymee service.",
  },
  {
    icon: "privacy_tip",
    title: "Not Casually Shared",
    description: "Patient data is not casually shared.",
  },
  {
    icon: "verified_user",
    title: "Appropriate Consent",
    description: "Appropriate consent is obtained for health information.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24 bg-surface px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
          <h2 className="font-headline-lg text-[24px] sm:text-[28px] md:text-[34px] leading-[32px] sm:leading-[36px] md:leading-[42px] font-bold mb-3">
            Your Health. Your Data. Your Privacy.
          </h2>
          <p className="font-body-lg text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] text-on-surface-variant">
            We take your privacy seriously. Here&apos;s how we handle your
            information.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-4 bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm"
            >
              <span className="material-symbols-outlined text-primary text-[26px] shrink-0">
                {point.icon}
              </span>
              <div>
                <h3 className="font-headline-md text-[16px] font-semibold text-on-background mb-1">
                  {point.title}
                </h3>
                <p className="text-[14px] leading-[21px] text-on-surface-variant">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/privacy"
            className="text-primary font-label-md underline hover:text-primary/80"
          >
            Read our full Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  );
}
