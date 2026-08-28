import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const backdrop = backdropRef.current;
    const bodyOverflow = document.body.style.overflow;
    const backgroundState = [...document.body.children]
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== backdrop)
      .map((element) => ({
        element,
        inert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden")
      }));

    document.body.style.overflow = "hidden";
    for (const state of backgroundState) {
      state.element.setAttribute("inert", "");
      state.element.setAttribute("aria-hidden", "true");
    }

    const getFocusable = () => [...(dialog?.querySelectorAll<HTMLElement>(
      "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
    ) ?? [])].filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
    const focusTarget = getFocusable()[0] ?? dialog;
    if (dialog && !dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) {
          event.preventDefault();
          dialog?.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = bodyOverflow;
      for (const state of backgroundState) {
        if (state.inert) state.element.setAttribute("inert", "");
        else state.element.removeAttribute("inert");
        if (state.ariaHidden === null) state.element.removeAttribute("aria-hidden");
        else state.element.setAttribute("aria-hidden", state.ariaHidden);
      }
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div ref={backdropRef} className={`dialog-backdrop${className ? ` ${className}` : ""}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
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
    </div>,
    document.body
  );
}
