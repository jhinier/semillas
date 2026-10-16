import { Compass } from "lucide-react";
import { hasSession } from "@/shared/api/auth-guard";
import { PantallaEstado } from "./pantalla-estado";

export function PantallaNoEncontrado() {
  const autenticado = hasSession();
  const destinoPrimario = autenticado ? "/app" : "/";
  const etiquetaPrimaria = autenticado ? "Volver a mi inicio" : "Ir al inicio";

  return (
    <PantallaEstado
      icono={<Compass size={32} aria-hidden="true" />}
      titulo="Pagina no encontrada"
      descripcion="No pudimos encontrar la ruta que buscas. Revisa el enlace o vuelve a un lugar conocido."
      acciones={
        <>
          <a
            href={destinoPrimario}
            className="flex items-center justify-center rounded-xl bg-verde-brote px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            {etiquetaPrimaria}
          </a>
          <a
            href="/"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Explorar Semillas
          </a>
        </>
      }
    />
  );
}
