"use client";

interface OptionChipsProps {
  options: string[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
}

export default function OptionChips({
  options,
  selected,
  onChange,
  multi = false,
}: OptionChipsProps) {
  const handleClick = (option: string) => {
    if (multi) {
      const current = Array.isArray(selected) ? selected : [];
      if (current.includes(option)) {
        onChange(current.filter((v) => v !== option));
      } else {
        onChange([...current, option]);
      }
    } else {
      onChange(option);
    }
  };

  const isSelected = (option: string) => {
    if (multi) {
      return Array.isArray(selected) && selected.includes(option);
    }
    return selected === option;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleClick(option)}
          className={`px-4 py-2.5 rounded-xl font-label-md text-[13px] sm:text-[14px] transition-all border ${
            isSelected(option)
              ? "bg-primary text-on-primary border-primary shadow-sm"
              : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
