import { Download, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInstalarPWA } from "@/shared/hooks/use-instalar-pwa";

export interface InstalarAppBannerProps {
  className?: string;
}

export function InstalarAppBanner({ className }: InstalarAppBannerProps) {
  const { disponible, instalando, instalar } = useInstalarPWA();
  const [cerrado, setCerrado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("semillas_pwa_cerrado") === "true";
    }
    return false;
  });
  const [oculto, setOculto] = useState(false);

  if (!disponible || cerrado) return null;

  const manejarInstalar = async () => {
    const resultado = await instalar();
    if (resultado === "aceptada") {
      toast.success("Instalando Semillas...");
    } else if (resultado === "rechazada") {
      setOculto(true);
    }
  };

  if (oculto) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicación Semillas"
      className={
        "instalar-pwa-banner fixed bottom-20 md:bottom-4 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl shadow-emerald-900/10 " +
        (className ?? "")
      }
    >
      <button
        type="button"
        onClick={() => {
          setCerrado(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("semillas_pwa_cerrado", "true");
          }
        }}
        aria-label="Cerrar aviso de instalación"
        className="instalar-pwa-banner__cerrar absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={16} aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3">
        <span
          className="instalar-pwa-banner__icono mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
          aria-hidden="true"
        >
          <Download size={20} />
        </span>

        <div className="flex-1 pr-5">
          <p className="instalar-pwa-banner__titulo text-sm font-semibold text-slate-900">
            Instala Semillas en tu celular
          </p>
          <p className="instalar-pwa-banner__descripcion mt-1 text-xs leading-relaxed text-slate-600">
            Acceso directo, sin barra del navegador y lista para abrirse sin conexión.
          </p>

          <button
            type="button"
            onClick={manejarInstalar}
            disabled={instalando}
            className="instalar-pwa-banner__boton mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={15} aria-hidden="true" />
            {instalando ? "Instalando..." : "Instalar app"}
          </button>
        </div>
      </div>
    </div>
  );
}