"use client";

import { useState, FormEvent } from "react";

interface LeadFormData {
  fullName: string;
  age: string;
  phone: string;
  email: string;
  diabetesStatus: string;
  diabetesType: string;
  duration: string;
  currentMedications: string;
  mainConcern: string;
  city: string;
  contactMethod: string;
  consent: boolean;
}

const initialLeadFormData: LeadFormData = {
  fullName: "",
  age: "",
  phone: "",
  email: "",
  diabetesStatus: "",
  diabetesType: "",
  duration: "",
  currentMedications: "",
  mainConcern: "",
  city: "",
  contactMethod: "WhatsApp",
  consent: false,
};

const diabetesStatusOptions = [
  "I have diabetes",
  "I have prediabetes",
  "I'm at risk / not sure",
  "Supporting a family member",
];

const diabetesTypeOptions = [
  "Type 2 Diabetes",
  "Type 1 Diabetes",
  "Prediabetes",
  "PCOS / PCOD",
  "Not sure",
];

const contactMethodOptions = ["WhatsApp", "Phone Call", "Email"];

export default function LeadQualificationForm() {
  const [formData, setFormData] = useState<LeadFormData>(initialLeadFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "rateLimited">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof LeadFormData, string>> = {};
    if (!formData.fullName.trim()) next.fullName = "Please enter your name";
    const ageNum = Number(formData.age);
    if (!formData.age || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120)
      next.age = "Please enter a valid age";
    if (!formData.phone || !/^[0-9+()\-\s]{7,20}$/.test(formData.phone))
      next.phone = "Please enter a valid phone number";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = "Please enter a valid email address";
    if (!formData.city.trim()) next.city = "Please enter your city";
    if (!formData.consent) next.consent = "Please consent to being contacted";
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
        setStatus("success");
        setFormData(initialLeadFormData);
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

  if (status === "success") {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-secondary/30 text-center">
        <span className="material-symbols-outlined text-[40px] text-secondary">check_circle</span>
        <h3 className="font-headline-md text-[20px] font-semibold text-on-background mt-3 mb-1">
          Thank you!
        </h3>
        <p className="text-on-surface-variant text-[15px] leading-[22px]">
          Your details have been received. Our team will reach out to you
          shortly to explain the Glymee program and how it can help you.
        </p>
        <p className="text-on-surface-variant text-[13px] leading-[20px] mt-3">
          Or talk to us directly on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="lead-fullName">Full Name *</label>
          <input id="lead-fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="Enter your name" />
          {errors.fullName && <p className="text-error text-[12px] mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="lead-age">Age *</label>
          <input id="lead-age" name="age" type="number" min="1" max="120" value={formData.age} onChange={handleChange} className={inputClass} placeholder="Enter your age" />
          {errors.age && <p className="text-error text-[12px] mt-1">{errors.age}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div>
        <label className={labelClass} htmlFor="lead-city">City *</label>
        <input id="lead-city" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Enter your city" />
        {errors.city && <p className="text-error text-[12px] mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className={labelClass}>Your Diabetes Status *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {diabetesStatusOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, diabetesStatus: opt }))
              }
              className={`px-4 py-3 rounded-lg border text-left font-body-md text-[15px] transition-all ${
                formData.diabetesStatus === opt
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="lead-diabetesType">Diabetes Type</label>
          <select id="lead-diabetesType" name="diabetesType" value={formData.diabetesType} onChange={handleChange} className={inputClass}>
            <option value="">Select type</option>
            {diabetesTypeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="lead-duration">Time Since Diagnosis</label>
          <input id="lead-duration" name="duration" value={formData.duration} onChange={handleChange} className={inputClass} placeholder="e.g., 2 years, recently diagnosed" />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="lead-meds">Current Medications / Treatment</label>
        <input id="lead-meds" name="currentMedications" value={formData.currentMedications} onChange={handleChange} className={inputClass} placeholder="e.g., Metformin 500mg" />
      </div>

      <div>
        <label className={labelClass} htmlFor="lead-concern">Main Concern</label>
        <textarea id="lead-concern" name="mainConcern" value={formData.mainConcern} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="What would you like help with?" />
      </div>

      <div>
        <label className={labelClass}>Preferred Contact Method</label>
        <div className="flex flex-wrap gap-2">
          {contactMethodOptions.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, contactMethod: m }))}
              className={`px-4 py-2 rounded-lg border font-body-md text-[14px] transition-all ${
                formData.contactMethod === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant text-on-surface-variant"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="lead-consent"
          name="consent"
          type="checkbox"
          checked={formData.consent}
          onChange={handleChange}
          className="mt-1 h-4 w-4 accent-primary"
        />
        <label htmlFor="lead-consent" className="text-[13px] leading-[20px] text-on-surface-variant">
          I consent to Glymee contacting me about the diabetes-management
          program. I understand my information will be handled securely and
          according to the{" "}
          <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
          {errors.consent && (
            <span className="block text-error mt-1">{errors.consent}</span>
          )}
        </label>
      </div>

      {status === "rateLimited" && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800">
          <span className="material-symbols-outlined">hourglass_top</span>
          <p className="font-label-md">Too many requests. Please try again in a little while.</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
          <span className="material-symbols-outlined">error</span>
          <p className="font-label-md">Something went wrong. Please try again or contact us on WhatsApp.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-on-primary px-6 py-4 rounded-lg font-label-lg text-[16px] font-medium hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Submitting...
          </>
        ) : (
          <>Start My Free Health Assessment</>
        )}
      </button>
    </form>
  );
}
