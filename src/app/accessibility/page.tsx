import Link from "next/link";

export default function Accessibility() {
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
          Accessibility Statement
        </h1>

        <div className="space-y-6 text-on-surface-variant font-body-md text-[16px] leading-[24px]">
          <p>
            <strong>Last updated:</strong> January 2025
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            Our Commitment
          </h2>
          <p>
            Glymee is committed to ensuring digital accessibility for people
            with disabilities. We continually improve the user experience for
            everyone and apply the relevant accessibility standards.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            Conformance Status
          </h2>
          <p>
            We aim to conform to the Web Content Accessibility Guidelines
            (WCAG) 2.1 Level AA. These guidelines explain how to make web
            content more accessible for people with disabilities.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            Accessibility Features
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Atkinson Hyperlegible Next</strong> font for body text,
              designed for enhanced character recognition
            </li>
            <li>High color contrast ratios throughout the interface</li>
            <li>Keyboard navigable interface with visible focus states</li>
            <li>Screen reader compatible with semantic HTML structure</li>
            <li>Responsive design that works across all device sizes</li>
            <li>Clear visual hierarchy with consistent typography</li>
          </ul>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            Known Limitations
          </h2>
          <p>
            We are actively working to address any accessibility barriers.
            Currently, some interactive elements may require additional keyboard
            navigation support.
          </p>

          <h2 className="font-headline-md text-[24px] leading-[32px] font-semibold text-on-background pt-4">
            Feedback
          </h2>
          <p>
            We welcome your feedback on the accessibility of Glymee. Please let
            us know if you encounter accessibility barriers by contacting us at{" "}
            <a
              href="mailto:hello@glymee.com"
              className="text-primary hover:underline"
            >
              hello@glymee.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
