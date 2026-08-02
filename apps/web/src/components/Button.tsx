import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading, icon, iconOnly, children, disabled, className, ...props },
  ref
) {
  const odVariant = variant === "ghost" ? "btn-secondary" : variant === "danger" ? "btn-danger" : `btn-${variant}`;
  const classes = ["btn", odVariant, "button", `button-${variant}`, iconOnly ? "icon-button button-icon" : "", loading ? "is-loading" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <span className="button-spinner" aria-hidden="true" /> : icon}
      <span>{loading ? "Working..." : children}</span>
    </button>
  );
});
