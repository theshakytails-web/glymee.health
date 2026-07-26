"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function CalendarPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-6">
            Consultation Calendar
          </h1>

          <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
            <p className="text-on-surface-variant text-sm mb-4">
              Manage your consultation schedule via Cal.com. Embed your Cal.com
              booking link below.
            </p>

            <div
              style={{ width: "100%", height: "700px" }}
              className="rounded-lg overflow-hidden border border-outline-variant/10"
            >
              {!loaded && (
                <div className="flex items-center justify-center h-full text-on-surface-variant">
                  Loading calendar...
                </div>
              )}
              <iframe
                src="https://cal.com/glymee/30min?theme=light&layout=month_view"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="payment"
                className={loaded ? "" : "hidden"}
              />
            </div>

            <p className="text-on-surface-variant/60 text-xs mt-3">
              Update the Cal.com link above to your actual Cal.com username and
              event type.{" "}
              <a
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                cal.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
