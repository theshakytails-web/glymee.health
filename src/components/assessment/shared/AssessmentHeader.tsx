"use client";

import Image from "next/image";
import Link from "next/link";

interface AssessmentHeaderProps {
  backHref?: string;
  title?: string;
}

export default function AssessmentHeader({
  backHref = "/assess",
  title,
}: AssessmentHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              arrow_back
            </span>
          </Link>
          {title && (
            <span className="font-label-md text-[14px] font-medium text-on-surface-variant hidden sm:block">
              {title}
            </span>
          )}
        </div>
        <Link href="/" className="flex items-center">
          <Image
            src="/Glymee_name.png"
            alt="Glymee"
            width={100}
            height={100}
            className="h-7 w-auto"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
