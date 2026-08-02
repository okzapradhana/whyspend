import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface DialogProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
  panelClassName?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
  description?: string;
  showHeader?: boolean;
}

export function Dialog({
  title,
  children,
  open,
  onClose,
  className,
  panelClassName,
  headerClassName,
  closeButtonClassName,
  description,
  showHeader = true
}: DialogProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusTarget = dialog?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className={`dialog-backdrop${className ? ` ${className}` : ""}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`dialog dialog-panel${panelClassName ? ` ${panelClassName}` : " transaction-modal"}`} role="dialog" aria-modal="true" aria-label={title} ref={dialogRef}>
        {showHeader ? (
          <header className={`dialog-header modal-head${headerClassName ? ` ${headerClassName}` : ""}`}>
            <div>
              <h2>{title}</h2>
              {description ? <p>{description}</p> : null}
            </div>
            <Button className={`modal-close${closeButtonClassName ? ` ${closeButtonClassName}` : ""}`} type="button" variant="ghost" icon={<X size={20} />} iconOnly aria-label={`Close ${title}`} onClick={onClose}>
              Close
            </Button>
          </header>
        ) : null}
        {children}
      </section>
    </div>
  );
}
