import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./ComposerExpandBackdrop.css";

type Props = {
  open: boolean;
  exiting?: boolean;
  onClose: () => void;
};

/**
 * Dimmed backdrop for the expanded composer dialog.
 * Body scroll lock + scroll-position restore live in DetectorComposer.
 */
function ComposerExpandBackdrop({ open, exiting = false, onClose }: Props) {
  useEffect(() => {
    if (!open || exiting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, exiting, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`composer-expand-backdrop${exiting ? " is-exiting" : ""}`}
      onClick={exiting ? undefined : onClose}
      aria-hidden="true"
    />,
    document.body,
  );
}

export default ComposerExpandBackdrop;
