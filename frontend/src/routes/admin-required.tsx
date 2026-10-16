import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Smartphone, Monitor, LogOut, Home, ArrowLeft } from "lucide-react";
import { cerrarSesionAutenticada } from "@/shared/auth/supabase";
import { sessionStorageApi } from "@/shared/api/session";
import { toast } from "sonner";
import { Boton } from "@/componentes/ui/boton";
import { useState } from "react";

export const Route = createFileRoute("/admin-required")({
  component: AdminRequiredPage,
});

function AdminRequiredPage() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await cerrarSesionAutenticada();
      sessionStorageApi.clearGuestSession();
      toast.success("Sesión cerrada correctamente.");
      void navigate({ to: "/login", search: { redirect: "/onboarding" } });
    } catch (error) {
      toast.error("Ocurrió un error al cerrar la sesión.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1f17] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a3a2a] rounded-3xl shadow-xl p-8 md:p-10 text-center flex flex-col items-center gap-6 border border-[#2a4a3a]">
        {/* Ilustración de Flujo de Dispositivo */}
        <div className="flex items-center gap-4 bg-[#0d1f17] px-6 py-4 rounded-2xl border border-[#2a4a3a]">
          <Smartphone className="size-10 text-rose-400 animate-pulse" />
          <span className="text-xl text-emerald-700 font-black">→</span>
          <Monitor className="size-10 text-emerald-400" />
        </div>

        {/* Mensaje Informativo */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-rose-400 bg-rose-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Solo Escritorio
          </span>
          <h1 className="text-2xl font-black text-emerald-200 mt-2">
            Panel de Administración
          </h1>
          <p className="text-sm text-emerald-100/70 leading-relaxed max-w-xs mx-auto">
            Por razones de espacio y usabilidad, la creación y edición de lecciones, momentos CRECER y actividades no están disponibles en pantallas móviles.
          </p>
          <p className="text-xs text-emerald-400/50 font-bold max-w-xs mx-auto pt-1">
            Por favor, ingresa desde una computadora.
          </p>
        </div>

        {/* Separador */}
        <div className="w-full border-t border-[#2a4a3a] my-1" />

        {/* Acciones */}
        <div className="flex flex-col gap-2 w-full">
          <Boton
            onClick={handleLogout}
            variante="peligro"
            anchoCompleto
            cargando={isPending}
            iconoIzquierdo={<LogOut size={16} />}
            className="h-12 rounded-xl text-xs font-bold"
          >
            Cerrar Sesión Administrativa
          </Boton>

          <Link
            to="/login"
            search={{ redirect: "/onboarding" }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2a4a3a] hover:bg-[#2a4a3a] text-emerald-200 font-bold py-3.5 text-xs transition h-12"
          >
            <ArrowLeft size={16} />
            <span>Volver a Iniciar Sesión</span>
          </Link>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 rounded-xl text-emerald-400/50 hover:text-emerald-300 font-bold py-2 text-xs transition"
          >
            <Home size={14} />
            <span>Ir al inicio de la página</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
