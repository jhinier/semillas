import { CheckCircle2, XCircle } from "lucide-react";

type FeedbackBannerProps = {
  tipo: "correcto" | "incorrecto";
  mensaje: string;
};

export function FeedbackBanner({ tipo, mensaje }: FeedbackBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex items-center gap-3 rounded-3xl px-4 py-3",
        tipo === "correcto" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]",
      ].join(" ")}
    >
      {tipo === "correcto" ? (
        <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="size-6 shrink-0" aria-hidden="true" />
      )}
      <p className="text-sm font-black">{mensaje}</p>
    </div>
  );
}
