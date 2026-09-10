"use client";

import { useState, FormEvent } from "react";

interface FormData {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  diabetesType: string;
  diagnosisDuration: string;
  currentMedications: string;
  mainConcern: string;
  referralSource: string;
  additionalNotes: string;
}

const initialFormData: FormData = {
  fullName: "",
  age: "",
  gender: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  diabetesType: "",
  diagnosisDuration: "",
  currentMedications: "",
  mainConcern: "",
  referralSource: "",
  additionalNotes: "",
};

const diabetesTypes = [
  "Type 1 Diabetes",
  "Type 2 Diabetes",
  "Prediabetes",
  "Gestational Diabetes",
  "Not sure / undiagnosed",
];

const referralSources = [
  "Google Search",
  "Social Media",
  "Friend / Family Referral",
  "Doctor / Healthcare Provider",
  "Online Advertisement",
  "YouTube",
  "Other",
];

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]";
const labelClass =
  "block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5";

export default function ConsultationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "rateLimited">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(
        apiUrl ? `${apiUrl}/v1/sendemail` : "/api/v1/sendemail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        setFormData(initialFormData);
      } else if (response.status === 429) {
        setSubmitStatus("rateLimited");
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-4 sm:p-8 space-y-6"
    >
      {/* Personal Info */}
      <fieldset className="space-y-4">
        <legend className="font-headline-md text-[20px] leading-[28px] font-semibold text-on-background flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Personal Information
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="age" className={labelClass}>
              Age *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              className={inputClass}
              placeholder="Enter your age"
            />
          </div>
        </div>

        <div>
          <label htmlFor="gender" className={labelClass}>
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className={`${inputClass} bg-white`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </fieldset>

      {/* Contact Info */}
      <fieldset className="space-y-4">
        <legend className="font-headline-md text-[20px] leading-[28px] font-semibold text-on-background flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">contact_mail</span>
          Contact Information
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className={labelClass}>
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter your city"
            />
          </div>

          <div>
            <label htmlFor="state" className={labelClass}>
              State / Province *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter your state"
            />
          </div>
        </div>
      </fieldset>

      {/* Health Info */}
      <fieldset className="space-y-4">
        <legend className="font-headline-md text-[20px] leading-[28px] font-semibold text-on-background flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">medical_information</span>
          Health Information
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diabetesType" className={labelClass}>
              Diabetes Type
            </label>
            <select
              id="diabetesType"
              name="diabetesType"
              value={formData.diabetesType}
              onChange={handleChange}
              className={`${inputClass} bg-white`}
            >
              <option value="">Select type</option>
              {diabetesTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="diagnosisDuration" className={labelClass}>
              Time Since Diagnosis
            </label>
            <input
              type="text"
              id="diagnosisDuration"
              name="diagnosisDuration"
              value={formData.diagnosisDuration}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., 2 years, recently diagnosed"
            />
          </div>
        </div>

        <div>
          <label htmlFor="currentMedications" className={labelClass}>
            Current Medications / Treatments
          </label>
          <input
            type="text"
            id="currentMedications"
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Metformin 500mg, Insulin"
          />
        </div>

        <div>
          <label htmlFor="mainConcern" className={labelClass}>
            Main Health Concern
          </label>
          <textarea
            id="mainConcern"
            name="mainConcern"
            value={formData.mainConcern}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Tell us about your main health concern or what you'd like help with..."
          />
        </div>
      </fieldset>

      {/* How did you find us */}
      <fieldset className="space-y-4">
        <legend className="font-headline-md text-[20px] leading-[28px] font-semibold text-on-background flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">campaign</span>
          How Did You Find Us?
        </legend>

        <div>
          <label htmlFor="referralSource" className={labelClass}>
            Referral Source
          </label>
          <select
            id="referralSource"
            name="referralSource"
            value={formData.referralSource}
            onChange={handleChange}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select an option</option>
            {referralSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="additionalNotes" className={labelClass}>
            Anything Else You&apos;d Like Us to Know?
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Optional: any additional information..."
          />
        </div>
      </fieldset>

      {/* Status messages */}
      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-glucose-optimal/10 border border-glucose-optimal/30 rounded-lg text-glucose-optimal">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-label-md">Thank you! We&apos;ll contact you within 24 hours.</p>
        </div>
      )}

      {submitStatus === "rateLimited" && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800">
          <span className="material-symbols-outlined">hourglass_top</span>
          <p className="font-label-md">Too many requests. Please try again in a little while.</p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
          <span className="material-symbols-outlined">error</span>
          <p className="font-label-md">Something went wrong. Please try again or contact us directly.</p>
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Submitting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">send</span>
              Submit Request
            </>
          )}
        </button>
      </div>
    </form>
  );
}