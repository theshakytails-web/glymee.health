import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsultationProvider } from "@/context/ConsultationContext";
import ConsultationModal from "@/components/ConsultationModal";
import { faqs } from "@/lib/faqs";
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
        url: "https://glymee.com/icon-512.png",
        width: 512,
        height: 512,
      },
      description:
        "Glymee is a 3-month personalized diabetes-management program combining doctor-led guidance, personalized nutrition, lifestyle support and glucose insights.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "help@glymee.com",
        telephone: "+91 8452823804",
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
      "@type": "FAQPage",
      "@id": "https://glymee.com/#faq",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@type": "MedicalOrganization",
      "@id": "https://glymee.com/#medicalorg",
      name: "Glymee Health",
      url: "https://glymee.com",
      description:
        "Personalized diabetes-management program providing doctor-led guidance, nutrition, lifestyle support and glucose insights.",
      availableService: [
        {
          "@type": "MedicalProcedure",
          name: "3-Month Personalized Diabetes Management Program",
          description: "A doctor-led 3-month program combining health assessment, personalized nutrition, lifestyle management and glucose insights.",
        },
        {
          "@type": "MedicalProcedure",
          name: "Glucose Monitoring",
          description: "CGM-based glucose pattern analysis used within the program when appropriate",
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://glymee.com"),
  title: {
    default: "Glymee Health | Personalized Diabetes Management Program",
    template: "%s | Glymee",
  },
  description:
    "Glymee is a 3-month personalized diabetes-management program combining doctor-led guidance, personalized nutrition, lifestyle support and glucose insights to help you understand and manage your diabetes.",
  keywords: [
    "diabetes management program",
    "personalized diabetes care",
    "diabetes management India",
    "CGM diabetes management",
    "Type 2 diabetes management",
    "prediabetes management",
    "personalized nutrition for diabetes",
    "glucose monitoring",
    "lifestyle management for diabetes",
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
    title: "Glymee Health | Personalized Diabetes Management Program",
    description:
      "Glymee is a 3-month personalized diabetes-management program combining doctor-led guidance, personalized nutrition, lifestyle support and glucose insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Glymee Health - Personalized Diabetes Management Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glymee Health | Personalized Diabetes Management Program",
    description:
      "Glymee is a 3-month personalized diabetes-management program combining doctor-led guidance, personalized nutrition, lifestyle support and glucose insights.",
    images: ["/og-image.png"],
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
