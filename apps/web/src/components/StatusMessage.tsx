interface StatusMessageProps {
  tone?: "info" | "success" | "error";
  className?: string;
  children: string;
}

export function StatusMessage({ tone = "info", className, children }: StatusMessageProps) {
  return (
    <p className={`status status-${tone}${className ? ` ${className}` : ""}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
