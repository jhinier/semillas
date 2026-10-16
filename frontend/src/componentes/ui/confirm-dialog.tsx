import { useRef } from "react";
import { Boton } from "./boton";
import { useDialogAccessibility } from "@/shared/accessibility/dialog";

interface ConfirmDialogProps {
  mensaje: string;
  onConfirm: () => void;
  onCancel?: () => void;
  open: boolean;
  titulo?: string;
}

export function ConfirmDialog({ mensaje, onConfirm, onCancel, open, titulo }: ConfirmDialogProps) {
  const hoja = useRef<HTMLElement>(null);
  useDialogAccessibility(hoja, onCancel ?? (() => undefined), open);
  if (!open) return null;

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    onCancel?.();
  }

  return (
    <div
      className="club-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleCancel();
      }}
    >
      <section ref={hoja} className="club-modal__sheet">
        <header>
          <div>
            <h2 id="confirm-dialog-title">{titulo ?? "Confirmar"}</h2>
          </div>
        </header>
        <p style={{ margin: "1rem 0", color: "var(--color-texto)" }}>{mensaje}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <Boton variante="secundario" onClick={handleCancel}>Cancelar</Boton>
          <Boton variante="peligro" onClick={handleConfirm}>Confirmar</Boton>
        </div>
      </section>
    </div>
  );
}
