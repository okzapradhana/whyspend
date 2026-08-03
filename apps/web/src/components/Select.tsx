import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: Array<{ label: string; value: string }>;
}

export function Select({ label, error, hint, options, id, className, ...props }: SelectProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");
  const describedBy = [hint ? `${selectId}-hint` : "", error ? `${selectId}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <label className={`field${error ? " field-invalid" : ""}${props.disabled ? " field-disabled" : ""}`} htmlFor={selectId}>
      <span>{label}</span>
      <select id={selectId} className={`soft-input${className ? ` ${className}` : ""}`} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <small id={`${selectId}-hint`} className="field-hint">
          {hint}
        </small>
      ) : null}
      {error ? (
        <small id={`${selectId}-error`} className="field-error">
          {error}
        </small>
      ) : null}
    </label>
  );
}
