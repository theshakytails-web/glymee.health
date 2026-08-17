export default function Disclaimer() {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
      <div className="flex gap-3">
        <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px] flex-shrink-0 mt-0.5">
          info
        </span>
        <p className="font-body-md text-[13px] leading-[20px] text-on-surface-variant/70">
          This assessment provides health insights based on the information you
          provide. It is not a medical diagnosis. Please consult a qualified
          healthcare professional for diagnosis, treatment or medication
          decisions.
        </p>
      </div>
    </div>
  );
}
