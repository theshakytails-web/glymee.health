import type { Metadata } from "next";
import { AssessmentProvider } from "@/context/AssessmentContext";

export const metadata: Metadata = {
  title: "Health Assessment | Glymee",
  description:
    "Take a simple health assessment to understand the areas of your health that may need more attention.",
  robots: { index: true, follow: true },
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AssessmentProvider>{children}</AssessmentProvider>;
}
