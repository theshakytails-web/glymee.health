import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-label-md"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </Link>

        <h1 className="font-headline-lg text-[32px] leading-[40px] font-bold text-on-background mb-8">
          Terms of Service
        </h1>

        <div className="space-y-6 text-on-surface-variant font-body-md text-[16px] leading-[24px]">
          <p>
            <strong>Last updated:</strong> January 2025
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By using Glymee&apos;s services, you agree to these Terms of
            Service. If you do not agree, please do not use our services.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            2. Services Description
          </h2>
          <p>
            Glymee provides digital health management services for diabetes
            care, including CGM integration, nutrition coaching, and clinical
            support. Our services are not a substitute for emergency medical
            care.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            3. User Responsibilities
          </h2>
          <p>
            You are responsible for providing accurate information in
            consultation forms and following your healthcare provider&apos;s
            recommendations. You must not share your account credentials with
            others.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            4. Limitation of Liability
          </h2>
          <p>
            Glymee is not liable for any decisions made based on the
            information provided through our platform. Always consult your
            healthcare provider for medical decisions.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            5. Modifications
          </h2>
          <p>
            We reserve the right to modify these terms at any time. Continued
            use of our services constitutes acceptance of any changes.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            6. Contact
          </h2>
          <p>
            For questions about these Terms, contact us at help@glymee.com.
          </p>
        </div>
      </div>
    </div>
  );
}
