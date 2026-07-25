import Link from "next/link";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>

        <div className="space-y-6 text-on-surface-variant font-body-md text-[16px] leading-[24px]">
          <p>
            <strong>Last updated:</strong> January 2025
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            1. Information We Collect
          </h2>
          <p>
            When you fill out our consultation form, we collect personal
            information including your name, age, gender, email address, phone
            number, location, and health-related information such as diabetes
            type and current medications.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to schedule consultations, provide
            personalized healthcare recommendations, and improve our services.
            Your health data is treated with the highest level of
            confidentiality.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            3. Data Protection
          </h2>
          <p>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction. Your health data is encrypted and stored securely.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            4. Third-Party Sharing
          </h2>
          <p>
            We do not sell or share your personal information with third parties
            for marketing purposes. We may share data with healthcare providers
            involved in your care, as necessary for treatment.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            5. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. You may also opt out of communications at any time by
            contacting us at help@glymee.com.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            6. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at help@glymee.com.
          </p>
        </div>
      </div>
    </div>
  );
}
