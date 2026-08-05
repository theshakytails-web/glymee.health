"use client";

import { useState, FormEvent } from "react";
import { useConsultation } from "@/context/ConsultationContext";

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

export default function ConsultationModal() {
  const { isOpen, close } = useConsultation();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "rateLimited">("idle");

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-outline-variant/30 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl flex justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-headline-md text-[20px] sm:text-[24px] leading-[28px] sm:leading-[32px] font-semibold text-on-background">
              Book a Consultation
            </h2>
            <p className="text-on-surface-variant text-[13px] sm:text-sm mt-1">
              Tell us about yourself and we&apos;ll get back to you within 24 hours.
            </p>
          </div>
          <button
            onClick={close}
            className="text-on-surface-variant hover:text-on-background transition-colors p-2"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Personal Info */}
          <fieldset className="space-y-4">
            <legend className="font-headline-md text-[20px] leading-[28px] font-semibold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Personal Information
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="age" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
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
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                  placeholder="Enter your age"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] bg-white"
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
                <label htmlFor="email" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label htmlFor="state" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  State / Province *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
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
                <label htmlFor="diabetesType" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  Diabetes Type
                </label>
                <select
                  id="diabetesType"
                  name="diabetesType"
                  value={formData.diabetesType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] bg-white"
                >
                  <option value="">Select type</option>
                  {diabetesTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="diagnosisDuration" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                  Time Since Diagnosis
                </label>
                <input
                  type="text"
                  id="diagnosisDuration"
                  name="diagnosisDuration"
                  value={formData.diagnosisDuration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                  placeholder="e.g., 2 years, recently diagnosed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currentMedications" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                Current Medications / Treatments
              </label>
              <input
                type="text"
                id="currentMedications"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px]"
                placeholder="e.g., Metformin 500mg, Insulin"
              />
            </div>

            <div>
              <label htmlFor="mainConcern" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                Main Health Concern
              </label>
              <textarea
                id="mainConcern"
                name="mainConcern"
                value={formData.mainConcern}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] resize-none"
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
              <label htmlFor="referralSource" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                Referral Source
              </label>
              <select
                id="referralSource"
                name="referralSource"
                value={formData.referralSource}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] bg-white"
              >
                <option value="">Select an option</option>
                {referralSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant mb-1.5">
                Anything Else You&apos;d Like Us to Know?
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] resize-none"
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={close}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium text-on-surface-variant hover:bg-surface-container transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-[14px] leading-[20px] tracking-[0.01em] font-medium hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
