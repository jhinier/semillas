import { Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { esIOS, estaInstaladaComoPWA } from "../lib/plataforma";

export interface AvisoInstalarIOSProps {
  className?: string;
}

export function AvisoInstalarIOS({ className }: AvisoInstalarIOSProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!esIOS()) return;
    if (estaInstaladaComoPWA()) return;
    if (localStorage.getItem("semillas_ios_pwa_cerrado") === "true") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cómo instalar Semillas en iPhone"
      className={
        "aviso-instalar-ios fixed bottom-20 md:bottom-4 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-amber-200 bg-white p-4 shadow-xl shadow-amber-900/10 " +
        (className ?? "")
      }
    >
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          if (typeof window !== "undefined") {
            localStorage.setItem("semillas_ios_pwa_cerrado", "true");
          }
        }}
        aria-label="Cerrar aviso"
        className="aviso-instalar-ios__cerrar absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={16} aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3">
        <span
          className="aviso-instalar-ios__icono mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
          aria-hidden="true"
        >
          <Share size={20} />
        </span>

        <div className="flex-1 pr-5">
          <p className="aviso-instalar-ios__titulo text-sm font-semibold text-slate-900">
            Instala Semillas en tu iPhone
          </p>

          <ol className="aviso-instalar-ios__pasos mt-2 space-y-1 text-xs leading-relaxed text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-semibold text-amber-600">1.</span>
              Toca el botón{" "}
              <Share
                size={13}
                className="-mt-0.5 inline text-amber-600"
                aria-hidden="true"
              />{" "}
              <strong>Compartir</strong> abajo en Safari.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-semibold text-amber-600">2.</span>
              Elige <strong>“Agregar a pantalla de inicio”</strong>.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-semibold text-amber-600">3.</span>
              Toca <strong>Agregar</strong> y listo.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}