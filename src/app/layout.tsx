import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { ConsultationProvider } from "@/context/ConsultationContext";
import ConsultationModal from "@/components/ConsultationModal";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://glymee.com/#organization",
      name: "Glymee Health",
      url: "https://glymee.com",
      logo: {
        "@type": "ImageObject",
        url: "https://glymee.com/Glymee_logo_1.png",
        width: 512,
        height: 512,
      },
      description:
        "Glymee is a diabetes health management platform offering personalized consultations, CGM insights, and data-driven health plans.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "help@glymee.com",
        contactType: "customer service",
      },
      sameAs: [
        "https://instagram.com/glymee.health",
        "https://linkedin.com/company/glymee-health/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://glymee.com/#website",
      url: "https://glymee.com",
      name: "Glymee",
      description:
        "Diabetes Health Management Platform - Manage Today. Healthy Tomorrow.",
      publisher: { "@id": "https://glymee.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://glymee.com/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "MedicalOrganization",
      "@id": "https://glymee.com/#medicalorg",
      name: "Glymee Health",
      url: "https://glymee.com",
      description:
        "Personalized diabetes care platform providing root-cause analysis, continuous glucose monitoring insights, and metabolic health management.",
      medicalSpecialty: "Endocrinology",
      availableService: [
        {
          "@type": "MedicalProcedure",
          name: "Diabetes Consultation",
          description: "Personalized diabetes consultation with root-cause analysis",
        },
        {
          "@type": "MedicalProcedure",
          name: "CGM Monitoring",
          description: "Continuous glucose monitoring setup and analysis",
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://glymee.com"),
  title: {
    default: "Glymee | Diabetes Health Management Platform",
    template: "%s | Glymee",
  },
  description:
    "Glymee helps you understand the root cause of your diabetes. Personalized consultations, continuous glucose monitoring insights, and data-driven health plans for a sustainable, healthy future.",
  keywords: [
    "diabetes management",
    "diabetes consultation",
    "blood sugar monitoring",
    "CGM",
    "continuous glucose monitoring",
    "diabetes health platform",
    "diabetes care India",
    "type 2 diabetes",
    "type 1 diabetes",
    "glycemic control",
    "diabetes doctor Pune",
    "diabetes reversal",
    "metabolic health",
    "HbA1c tracking",
    "Glymee",
  ],
  authors: [{ name: "Glymee Health" }],
  creator: "Glymee Health",
  publisher: "Glymee Health",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://glymee.com",
    siteName: "Glymee",
    title: "Glymee | Manage Today. Healthy Tomorrow.",
    description:
      "Stop guessing, start understanding your diabetes. Personalized consultations and data-driven insights for a sustainable, healthy future.",
    images: [
      {
        url: "/Glymee_logo_1.png",
        width: 1200,
        height: 630,
        alt: "Glymee - Diabetes Health Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glymee | Manage Today. Healthy Tomorrow.",
    description:
      "Stop guessing, start understanding your diabetes. Personalized consultations and data-driven insights.",
    images: ["/Glymee_logo_1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://glymee.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/Glymee_logo_1.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Glymee_logo_1.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-on-background font-body-md antialiased">
        <ConsultationProvider>
          {children}
          <ConsultationModal />
        </ConsultationProvider>
      </body>
    </html>
  );
}
