import { useMemo } from "react";
import type { GrupoEdad, Perfil, Usuario } from "../../../shared/api/api";
import { resolverAvatar } from "../../../shared/constants/avatares";
import type { GamificacionMiRespuesta, ProgresoMiRespuesta } from "../profile.api";

export type { PerfilDashboardProps } from "../profile-dashboard";

export type UseProfileDashboardOptions = {
  usuario: Usuario | undefined;
  perfil: Perfil | null | undefined;
  gamificacion: GamificacionMiRespuesta | undefined;
  progreso: ProgresoMiRespuesta | undefined;
  gruposEdad: GrupoEdad[];
};

function formatearProveedor(proveedor: string) {
  if (proveedor === "invitado") return "Invitado";
  if (proveedor === "google") return "Google";
  if (proveedor === "email" || proveedor === "correo") return "Correo";
  return "Cuenta vinculada";
}

function contarCompletados(progreso: ProgresoMiRespuesta | undefined) {
  return {
    temas:
      progreso?.progresos_tema.filter(
        (tema: { estado: string }) =>
          tema.estado === "completado" || tema.estado === "completado_total",
      ).length ?? 0,
    actividades:
      progreso?.progresos_actividad.filter(
        (actividad: { completado: boolean }) => actividad.completado,
      ).length ?? 0,
  };
}

function humanizarTamanoTexto(valor?: string | null) {
  if (valor === "pequeno" || valor === "pequeño") return "Pequeño";
  if (valor === "grande") return "Grande";
  return "Mediano";
}

export function useProfileDashboard({
  usuario,
  perfil,
  gamificacion,
  progreso,
  gruposEdad,
}: UseProfileDashboardOptions) {
  const nivel = gamificacion?.nivel;
  const logros = gamificacion?.logros ?? [];

  const completados = useMemo(() => contarCompletados(progreso), [progreso]);
  const esInvitado = usuario?.proveedor === "invitado";
  const proveedorLabel = useMemo(
    () => formatearProveedor(usuario?.proveedor ?? "invitado"),
    [usuario?.proveedor],
  );
  const avatarGuardado = perfil?.clave_avatar ?? perfil?.url_avatar ?? "1";
  const avatarUrl = resolverAvatar(avatarGuardado);
  const avatarClave = /^\d+$/.test(avatarGuardado) ? avatarGuardado : "1";
  const nombreVisible = perfil?.apodo ?? usuario?.nombre_visible ?? "Semillero";
  const grupoEdad = gruposEdad.find((grupo) => grupo.id === perfil?.grupo_edad_id) ?? null;
  const grupoEdadLabel = grupoEdad
    ? `${grupoEdad.nombre} · ${grupoEdad.edad_minima}–${grupoEdad.edad_maxima} años`
    : "Franja de edad sin definir";

  return {
    nivel,
    logros,
    completados,
    esInvitado,
    proveedorLabel,
    avatarUrl,
    avatarClave,
    nombreVisible,
    grupoEdad,
    grupoEdadLabel,
    tamanoTextoLabel: humanizarTamanoTexto(perfil?.tamano_texto_preferido),
  };
}
