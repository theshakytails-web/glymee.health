"use client";

import { useState, useRef } from "react";
import { useAssessment } from "@/context/AssessmentContext";
import { FILE_TYPES, MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } from "@/lib/assessment/constants";

interface ReportUploaderProps {
  submissionId: string;
}

export default function ReportUploader({ submissionId }: ReportUploaderProps) {
  const { addUpload, state } = useAssessment();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!selectedType) {
      setError("Please select a report type first");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Please upload JPEG, PNG, WebP, or PDF files only");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("submissionId", submissionId);
      formData.append("fileType", selectedType);

      const response = await fetch("/api/assessment/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      addUpload({
        id: data.id,
        fileName: data.fileName,
        fileType: data.fileType,
      });

      setSelectedType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-label-md text-[14px] font-medium text-on-surface-variant mb-2">
          Report type
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] bg-white"
        >
          <option value="">Select report type</option>
          {FILE_TYPES.map((ft) => (
            <option key={ft.value} value={ft.value}>
              {ft.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="hidden"
          id="report-upload"
        />
        <label
          htmlFor="report-upload"
          className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            uploading
              ? "border-outline-variant/40 bg-surface-container-low cursor-not-allowed"
              : "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-primary text-[20px]">
                progress_activity
              </span>
              <span className="font-label-md text-[14px] text-on-surface-variant">
                Uploading...
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-primary text-[20px]">
                upload_file
              </span>
              <span className="font-label-md text-[14px] text-primary">
                Choose file to upload
              </span>
            </>
          )}
        </label>
        <p className="font-label-sm text-[11px] text-on-surface-variant/50 mt-2">
          JPEG, PNG, WebP, or PDF — max {MAX_FILE_SIZE_MB}MB
        </p>
      </div>

      {error && (
        <p className="font-label-sm text-[12px] text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}

      {state.uploads.length > 0 && (
        <div className="space-y-2">
          <p className="font-label-md text-[13px] font-medium text-on-surface-variant">
            Uploaded files:
          </p>
          {state.uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">
                description
              </span>
              <span className="font-body-md text-[13px] text-on-surface-variant truncate flex-1">
                {upload.fileName}
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant/50">
                {upload.fileType}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
