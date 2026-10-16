import { getSendaIcon } from "../componentes/dashboard/admin.helpers";
import type { Tema } from "@/shared/api/api";
import type { TemaTableRow } from "../componentes/temas/admin-themes-table.types";

export function getFranjaEdadText(gruposEdad: Tema["grupos_edad"]) {
  if (!gruposEdad || gruposEdad.length === 0) return "";
  return gruposEdad.map((g) => {
    if (g.codigo === "semillas") return "5–8 años";
    if (g.codigo === "exploradores") return "9–12 años";
    if (g.codigo === "embajadores") return "13–17 años";
    return g.nombre;
  }).join(", ");
}

export function getSendaInfo(theme: Tema, sendasList?: { id: string; nombre: string; color_hex: string; codigo: string }[]) {
  if (theme.senda) {
    return { nombre: theme.senda.nombre, colorHex: theme.senda.color_hex, codigo: theme.senda.codigo };
  }
  const sendaFromList = sendasList?.find((s) => s.id === theme.senda_id);
  if (sendaFromList) {
    return { nombre: sendaFromList.nombre, colorHex: sendaFromList.color_hex, codigo: sendaFromList.codigo };
  }
  return { nombre: "Sin senda", colorHex: "#94a3b8", codigo: "" };
}

export function mapearTemaParaTabla(
  t: Tema,
  sendasData: Array<{ id: string; nombre: string; color_hex: string; codigo: string }> | undefined,
  portadaUrl: string | null,
): TemaTableRow {
  const sendaInfo = getSendaInfo(t, sendasData);
  const franja = getFranjaEdadText(t.grupos_edad);
  const portada = portadaUrl || t.portada_recurso?.url_publica || undefined;
  const autorNombre = t.creado_por?.nombre_visible ?? "Usuario Semilla";
  const avatarSeed = t.creado_por?.id ?? t.id;
  const dateObj = t.publicado_en ? new Date(t.publicado_en) : (t.actualizado_en ? new Date(t.actualizado_en) : new Date());
  const fecha = dateObj.toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" });
  const hora = dateObj.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

  return {
    id: t.id,
    titulo: t.titulo ?? "Sin título",
    resumen: t.resumen ?? "",
    portadaUrl: portada,
    sendaNombre: sendaInfo.nombre,
    sendaColorHex: sendaInfo.colorHex,
    sendaIcono: getSendaIcon(sendaInfo.codigo).icon,
    franjaEdad: franja,
    estado: t.estado,
    fechaEdicion: fecha,
    horaEdicion: hora,
    autorNombre,
    autorAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`,
  };
}

export function filtrarTemas(
  temas: TemaTableRow[],
  filtros: {
    activeTab: string;
    searchValue: string;
    selectedSendaId: string;
    selectedAgeGroupId: string;
    sendasData: Array<{ id: string; nombre: string }> | undefined;
    ageGroupsData: Array<{ id: string; nombre: string }> | undefined;
  },
): TemaTableRow[] {
  const { activeTab, searchValue, selectedSendaId, selectedAgeGroupId, sendasData, ageGroupsData } = filtros;

  return temas.filter((t) => {
    if (activeTab !== "todos" && t.estado.toLowerCase() !== activeTab.toLowerCase()) return false;
    if (searchValue && !t.titulo.toLowerCase().includes(searchValue.toLowerCase()) && !t.resumen.toLowerCase().includes(searchValue.toLowerCase())) return false;
    if (selectedSendaId) {
      const matchingSenda = sendasData?.find((s) => s.id === selectedSendaId);
      if (matchingSenda && t.sendaNombre !== matchingSenda.nombre) return false;
    }
    if (selectedAgeGroupId) {
      const matchingAgeGroup = ageGroupsData?.find((g) => g.id === selectedAgeGroupId);
      if (matchingAgeGroup) {
        const cleanName = matchingAgeGroup.nombre.toLowerCase();
        if (cleanName.includes("semilla") && !t.franjaEdad.includes("5–8")) return false;
        if (cleanName.includes("explora") && !t.franjaEdad.includes("9–12")) return false;
        if (cleanName.includes("embaja") && !t.franjaEdad.includes("13–17")) return false;
      }
    }
    return true;
  });
}

export function contarTemasPorEstado(temas: TemaTableRow[]) {
  const stats = { todos: temas.length, borradores: 0, revision: 0, publicados: 0, archivados: 0 };
  temas.forEach((t) => {
    const state = t.estado.toLowerCase();
    if (state === "borrador") stats.borradores++;
    else if (state === "revision" || state === "en revisión") stats.revision++;
    else if (state === "publicado") stats.publicados++;
    else if (state === "archivado") stats.archivados++;
  });
  return stats;
}
