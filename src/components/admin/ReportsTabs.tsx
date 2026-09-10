"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Clinical Assessment",
    href: "/g9x2k7m3q8w-admin/reports",
    icon: "monitor_heart",
  },
  {
    label: "14-Day CGMS",
    href: "/g9x2k7m3q8w-admin/reports/cgms",
    icon: "show_chart",
  },
  {
    label: "Diet Plan",
    href: "/g9x2k7m3q8w-admin/reports/diet",
    icon: "restaurant_menu",
  },
  {
    label: "Report History",
    href: "/g9x2k7m3q8w-admin/reports/history",
    icon: "history",
  },
  {
    label: "Diet Plan History",
    href: "/g9x2k7m3q8w-admin/reports/diet-history",
    icon: "history",
  },
];

export default function ReportsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1 bg-surface rounded-xl p-1 border border-outline-variant/10 w-fit max-w-full overflow-x-auto">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              active
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}