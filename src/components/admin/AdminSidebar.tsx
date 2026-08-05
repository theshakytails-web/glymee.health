"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/g9x2k7m3q8w-admin/dashboard", icon: "dashboard" },
  { label: "Inquiries", href: "/g9x2k7m3q8w-admin/consultations", icon: "mail" },
  { label: "Patients", href: "/g9x2k7m3q8w-admin/patients", icon: "people" },
  { label: "Reports", href: "/g9x2k7m3q8w-admin/reports", icon: "assignment" },
  { label: "Invoices", href: "/g9x2k7m3q8w-admin/invoices", icon: "receipt_long" },
  { label: "Inventory", href: "/g9x2k7m3q8w-admin/inventory", icon: "inventory_2" },
  { label: "Calendar", href: "/g9x2k7m3q8w-admin/calendar", icon: "calendar_month" },
  { label: "Settings", href: "/g9x2k7m3q8w-admin/settings", icon: "settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/me", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          router.replace("/g9x2k7m3q8w-admin");
        }
      })
      .catch(() => {
        router.replace("/g9x2k7m3q8w-admin");
      });
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = `/g9x2k7m3q8w-admin`;
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-white p-2 rounded-lg"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? "close" : "menu"}
        </span>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-surface z-40 border-r border-outline-variant/10 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 border-b border-outline-variant/10">
          <Link href="/g9x2k7m3q8w-admin/dashboard" className="block">
            <h1 className="font-headline-md text-xl font-bold text-primary">
              Glymee
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Admin Panel
            </p>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors w-full"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
