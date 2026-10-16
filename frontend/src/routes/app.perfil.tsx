import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { obtenerGruposEdad } from "@/features/catalog/catalog.api";
import {
  actualizarPerfil,
  obtenerMiGamificacion,
  obtenerMiPerfil,
  obtenerMiProgreso,
  type ActualizarPerfilDatos,
} from "@/features/perfil/profile.api";
import { ProfileDashboard } from "@/features/perfil/profile-dashboard";
import type { ProfileSection } from "@/features/perfil/componentes/profile-section-nav";
import { iniciarSesionGoogle, vincularGoogle } from "@/shared/auth/supabase";
import { useAppLayout } from "@/shared/layout/hooks/use-app-layout";
import "./app-perfil.css";

function normalizarSeccion(value: unknown): ProfileSection {
  return value === "editar" || value === "ajustes" ? value : "resumen";
}

export const Route = createFileRoute("/app/perfil")({
  validateSearch: (search: Record<string, unknown>): {
    seccion?: Exclude<ProfileSection, "resumen">;
  } => {
    if (search.seccion === "editar" || search.seccion === "ajustes") {
      return { seccion: search.seccion };
    }
    return {};
  },
  component: ProfilePage,
});

function ProfilePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { handleLogout } = useAppLayout();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
    staleTime: 1000 * 60 * 5,
  });
  const gamificacionQuery = useQuery({
    queryKey: ["gamification", "me"],
    queryFn: obtenerMiGamificacion,
    staleTime: 1000 * 60 * 3,
  });
  const progresoQuery = useQuery({
    queryKey: ["progress"],
    queryFn: obtenerMiProgreso,
    staleTime: 1000 * 60 * 3,
  });
  const gruposEdadQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
    staleTime: 1000 * 60 * 60,
  });

  const actualizarMutation = useMutation({
    mutationFn: (data: ActualizarPerfilDatos) => actualizarPerfil(data),
    onSuccess: async (perfilActualizado) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof obtenerMiPerfil>>>(
        ["me"],
        (actual) =>
          actual
            ? {
                ...actual,
                perfil: { ...actual.perfil, ...perfilActualizado },
              }
            : actual,
      );
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Perfil actualizado");
      void navigate({ search: { seccion: undefined }, replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfil");
    },
  });

  const usuario = meQuery.data?.usuario;
  const perfil = meQuery.data?.perfil;
  const estaCargando =
    meQuery.isLoading ||
    gamificacionQuery.isLoading ||
    progresoQuery.isLoading ||
    gruposEdadQuery.isLoading;
  const tieneError =
    (meQuery.isError && !meQuery.data) ||
    (gamificacionQuery.isError && !gamificacionQuery.data) ||
    (progresoQuery.isError && !progresoQuery.data) ||
    (gruposEdadQuery.isError && !gruposEdadQuery.data);
  const esInvitado = usuario?.proveedor === "invitado";

  function cambiarSeccion(seccion: ProfileSection) {
    void navigate({
      search: { seccion: seccion === "resumen" ? undefined : seccion },
      replace: true,
    });
  }

  async function linkGoogle() {
    try {
      if (esInvitado) {
        await iniciarSesionGoogle(`${window.location.origin}/app/perfil?seccion=resumen`);
        return;
      }
      await vincularGoogle();
      toast.success("Google se vinculó correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo vincular Google");
    }
  }

  function linkCorreo() {
    window.location.href = `/login?redirect=${encodeURIComponent("/app/perfil")}`;
  }

  function recargar() {
    void Promise.all([
      meQuery.refetch(),
      gamificacionQuery.refetch(),
      progresoQuery.refetch(),
      gruposEdadQuery.refetch(),
    ]);
  }

  if (estaCargando) {
    return (
      <div className="profile-loading-state" aria-live="polite">
        <LoaderCircle className="animate-spin" size={30} aria-hidden="true" />
        <span>Preparando tu perfil...</span>
      </div>
    );
  }

  if (tieneError || !perfil) {
    return (
      <div className="profile-error-state" role="alert">
        <AlertCircle size={32} aria-hidden="true" />
        <h1>No pudimos cargar tu perfil</h1>
        <p>{!navigator.onLine ? "Sin conexión. Conéctate para ver tu perfil completo." : "Revisa tu conexión e inténtalo nuevamente."}</p>
        <button type="button" className="profile-primary-button" onClick={recargar}>
          <RefreshCcw size={18} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ProfileDashboard
      usuario={usuario}
      perfil={perfil}
      gamificacion={gamificacionQuery.data}
      progreso={progresoQuery.data}
      gruposEdad={gruposEdadQuery.data ?? []}
      activeSection={normalizarSeccion(search.seccion)}
      isSaving={actualizarMutation.isPending}
      onSectionChange={cambiarSeccion}
      onSaveProfile={(data) => actualizarMutation.mutate(data)}
      onVincularGoogle={() => void linkGoogle()}
      onVincularCorreo={linkCorreo}
      onVerLogros={() => void navigate({ to: "/app/logros" })}
      onEmpezarTema={() => void navigate({ to: "/app/temas" })}
      onCerrarSesion={() => void handleLogout()}
    />
  );
}
