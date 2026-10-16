import { ShieldOff } from "lucide-react";
import { PantallaEstado } from "./pantalla-estado";

export function cerrarSesionYRedirigirLogin(navigate: () => Promise<unknown> | unknown) {
  void navigate();
  return Promise.resolve();
}

export function PantallaAccesoDenegado() {
  return (
    <PantallaEstado
      icono={<ShieldOff size={32} aria-hidden="true" />}
      titulo="Acceso restringido"
      descripcion="Tu cuenta actual no tiene permisos para esta seccion. Si crees que es un error, contacta a un administrador."
      acciones={
        <>
          <a
            href="/app"
            className="flex items-center justify-center rounded-xl bg-verde-brote px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Volver a mi inicio
          </a>
          <a
            href="/login"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Iniciar sesion con otra cuenta
          </a>
        </>
      }
    />
  );
}
