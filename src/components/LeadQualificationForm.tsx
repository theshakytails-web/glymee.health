"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LeadFormData {
  fullName: string;
  phone: string;
  email: string;
}

const initialLeadFormData: LeadFormData = {
  fullName: "",
  phone: "",
  email: "",
};

export default function LeadQualificationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LeadFormData>(initialLeadFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "rateLimited">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof LeadFormData, string>> = {};
    if (!formData.fullName.trim()) next.fullName = "Please enter your name";
    if (!formData.phone || !/^[0-9+()\-\s]{7,20}$/.test(formData.phone))
      next.phone = "Please enter a valid phone number";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = "Please enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/assessment/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/assess");
        return;
      } else if (response.status === 429) {
        setStatus("rateLimited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] bg-white";
  const labelClass =
    "block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="lead-fullName">Full Name *</label>
        <input id="lead-fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="Enter your name" />
        {errors.fullName && <p className="text-error text-[12px] mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="lead-phone">Phone Number *</label>
        <input id="lead-phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+91 98765 43210" />
        {errors.phone && <p className="text-error text-[12px] mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="lead-email">Email Address *</label>
        <input id="lead-email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
        {errors.email && <p className="text-error text-[12px] mt-1">{errors.email}</p>}
      </div>

      {status === "rateLimited" && (
        <p className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 font-label-md">
          Too many requests. Please try again in a little while.
        </p>
      )}

      {status === "error" && (
        <p className="p-4 bg-error/10 border border-error/30 rounded-lg text-error font-label-md">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-on-primary px-6 py-4 rounded-lg font-label-lg text-[16px] font-medium hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Starting...
          </>
        ) : (
          <>Start Free Health Assessment</>
        )}
      </button>
    </form>
  );
}
