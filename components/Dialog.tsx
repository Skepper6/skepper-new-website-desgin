"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Native modal dialog: focus is trapped and restored by the browser, Escape closes, a click on the backdrop closes. */
export function Dialog({ open, onClose, className, label, children }: { open: boolean; onClose: () => void; className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
      d.scrollTop = 0;
      const root = document.documentElement;
      root.classList.add("is-locked");
      return () => root.classList.remove("is-locked");
    }
    if (d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target !== ref.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}
