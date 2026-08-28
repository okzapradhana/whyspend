import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replaceAll(" ", "-");
  const describedBy = [hint ? `${inputId}-hint` : "", error ? `${inputId}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <label className={`field${error ? " field-invalid" : ""}${props.disabled ? " field-disabled" : ""}`} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} className={`soft-input${className ? ` ${className}` : ""}`} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {hint ? (
        <small id={`${inputId}-hint`} className="field-hint">
          {hint}
        </small>
      ) : null}
      {error ? (
        <small id={`${inputId}-error`} className="field-error">
          {error}
        </small>
      ) : null}
    </label>
  );
}
