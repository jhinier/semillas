import { getSendaColorClasses, getActivityTypeInfo, getAgeGroupLabel } from "../componentes/temas/actividades.helpers";
import type { ActivityTableRow } from "../componentes/temas/admin-activities-table";
import type { ActividadAdmin } from "../admin.api";
import type { Tema, Senda } from "@/shared/api/api";
import type { GrupoEdad } from "@/shared/api/api";

export function mapearActividadParaTabla(
  act: ActividadAdmin,
  ageGroupsBase: GrupoEdad[],
): ActivityTableRow {
  const typeInfo = getActivityTypeInfo(act.tipo_actividad?.codigo ?? "quiz");
  const franja = getAgeGroupLabel(act.grupo_edad_id, ageGroupsBase);
  const tema = act.tema;
  const temaNombre = tema?.titulo ?? "Sin tema";
  const temaSlug = tema?.slug ?? "";
  const temaEstado = tema?.estado ?? "borrador";
  const sendaColor = getSendaColorClasses(tema?.senda?.nombre ?? "");
  const dateObj = act.creado_en ? new Date(act.creado_en) : new Date();
  const dateStr = dateObj.toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" });

  return {
    id: act.id,
    titulo: act.titulo ?? "Actividad sin título",
    consigna: act.consigna ?? "Sin consigna",
    tipoIcon: typeInfo.icon,
    tipoIconColor: typeInfo.color,
    tipoBadgeBg: typeInfo.bg,
    tipoNombre: act.tipo_actividad?.nombre ?? "Quiz",
    tipoCodigo: act.tipo_actividad?.codigo ?? "quiz",
    temaId: act.tema_id,
    temaNombre,
    pasoId: act.paso_id,
    franjaEdad: franja,
    xpText: `+${act.xp_recompensa || 10} XP`,
    xp: act.xp_recompensa || 10,
    estado: act.obligatorio ? "publicada" : "borrador",
    fechaCreacion: dateStr,
    dificultad: act.dificultad,
    consignaRaw: act.consigna,
    opciones: [],
    temaSlug,
    temaEstado,
    sendaColor,
    grupoEdadId: act.grupo_edad_id,
  };
}

export function filtrarActividades(
  actividades: ActivityTableRow[],
  filtros: {
    activeTab: string;
    searchValue: string;
    selectedSendaId: string;
    selectedTemaId: string;
    selectedAgeGroupId: string;
    sendasBase: Senda[];
    temasBase: Tema[];
    ageGroupsBase: GrupoEdad[];
  },
): ActivityTableRow[] {
  const { activeTab, searchValue, selectedSendaId, selectedTemaId, selectedAgeGroupId, sendasBase, temasBase, ageGroupsBase } = filtros;

  return actividades.filter((act) => {
    if (activeTab === "borrador" && act.estado !== "borrador") return false;
    if (activeTab === "revision" && act.estado !== "revision") return false;
    if (activeTab === "publicada" && act.estado !== "publicada") return false;
    if (activeTab === "quiz" && act.tipoCodigo !== "quiz") return false;
    if (activeTab === "flashcard" && act.tipoCodigo !== "flashcard") return false;
    if (activeTab === "completar" && act.tipoCodigo !== "completar_verso") return false;
    if (activeTab === "verdadero-falso" && act.tipoCodigo !== "verdadero_falso") return false;
    if (activeTab === "sopa" && act.tipoCodigo !== "sopa_letras") return false;
    if (searchValue && !act.titulo.toLowerCase().includes(searchValue.toLowerCase()) && !act.consigna.toLowerCase().includes(searchValue.toLowerCase())) return false;
    if (selectedSendaId) {
      const matchingSenda = sendasBase.find((s) => s.id === selectedSendaId);
      if (matchingSenda && act.sendaColor.nombre !== matchingSenda.nombre) return false;
    }
    if (selectedTemaId) {
      const matchingTema = temasBase.find((t) => t.id === selectedTemaId);
      if (matchingTema && act.temaNombre !== matchingTema.titulo) return false;
    }
    if (selectedAgeGroupId) {
      const matchingAgeGroup = ageGroupsBase.find((g) => g.id === selectedAgeGroupId);
      if (matchingAgeGroup) {
        const cleanName = matchingAgeGroup.nombre.toLowerCase();
        if (cleanName.includes("semilla") && !act.franjaEdad.includes("Pequeños")) return false;
        if (cleanName.includes("explora") && !act.franjaEdad.includes("Medianos")) return false;
        if (cleanName.includes("embaja") && !act.franjaEdad.includes("Grandes")) return false;
      }
    }
    return true;
  });
}

export function contarPorTipo(actividades: ActivityTableRow[]) {
  const stats = { todos: actividades.length, quiz: 0, flashcards: 0, completar: 0, verdaderoFalso: 0, sopa: 0 };
  actividades.forEach((a) => {
    if (a.tipoCodigo === "quiz") stats.quiz++;
    else if (a.tipoCodigo === "flashcard") stats.flashcards++;
    else if (a.tipoCodigo === "completar_verso") stats.completar++;
    else if (a.tipoCodigo === "verdadero_falso") stats.verdaderoFalso++;
    else if (a.tipoCodigo === "sopa_letras") stats.sopa++;
  });
  return stats;
}

export function contarPorEstado(actividades: ActivityTableRow[]) {
  let publicadas = 0, revision = 0, borradores = 0, archivadas = 0;
  actividades.forEach((a) => {
    if (a.estado === "publicada") publicadas++;
    else if (a.estado === "revision") revision++;
    else if (a.estado === "borrador") borradores++;
    else if (a.estado === "archivada") archivadas++;
  });
  const total = actividades.length || 1;
  return {
    total: actividades.length,
    publicadas,
    revision,
    borradores,
    archivadas,
    pubPct: Math.round((publicadas / total) * 100),
    revPct: Math.round((revision / total) * 100),
    borPct: Math.round((borradores / total) * 100),
    arcPct: Math.round((archivadas / total) * 100),
  };
}
