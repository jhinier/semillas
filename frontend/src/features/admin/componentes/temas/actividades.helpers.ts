export const getSendaColorClasses = (sendaName: string) => {
  const name = sendaName.toLowerCase();
  if (name.includes("padre") || name.includes("amor") || name.includes("confío")) {
    return { bg: "bg-blue-50", text: "text-blue-500", icon: "fa-heart", nombre: "Padre" };
  }
  if (name.includes("hijo") || name.includes("jesús") || name.includes("salvador")) {
    return { bg: "bg-amber-50", text: "text-amber-500", icon: "fa-cross", nombre: "Hijo" };
  }
  if (name.includes("espíritu") || name.includes("sanas") || name.includes("prójimo")) {
    return { bg: "bg-teal-50", text: "text-teal-600", icon: "fa-leaf", nombre: "Espíritu" };
  }
  return { bg: "bg-slate-100", text: "text-slate-500", icon: "fa-star", nombre: "General" };
};

export const getActivityTypeInfo = (codigo: string) => {
  switch (codigo.toLowerCase()) {
    case "quiz":
    case "cuestionario":
      return { icon: "fa-circle-question", color: "text-purple-600", bg: "bg-purple-100" };
    case "flashcard":
    case "flashcards":
    case "tarjetas":
      return { icon: "fa-book-open", color: "text-amber-500", bg: "bg-amber-100" };
    case "completar_verso":
    case "completar-versiculo":
    case "completar":
      return { icon: "fa-pen-clip", color: "text-blue-500", bg: "bg-blue-100" };
    case "verdadero_falso":
    case "verdadero-falso":
      return { icon: "fa-circle-check", color: "text-emerald-500", bg: "bg-emerald-100" };
    case "sopa_letras":
    case "sopa-letras":
    case "sopa":
      return { icon: "fa-border-all", color: "text-violet-600", bg: "bg-violet-100" };
    case "ordenar_verso":
    case "ordenar-versiculo":
    case "ordenar":
      return { icon: "fa-puzzle-piece", color: "text-orange-500", bg: "bg-orange-100" };
    case "memoria":
      return { icon: "fa-image", color: "text-sky-500", bg: "bg-sky-100" };
    default:
      return { icon: "fa-circle-question", color: "text-purple-600", bg: "bg-purple-100" };
  }
};

export const getAgeGroupLabel = (ageGroupUuid: string, ageGroupsBase: { id: string; nombre: string; edad_minima?: number; edad_maxima?: number }[]) => {
  const ageGroup = ageGroupsBase.find(g => g.id === ageGroupUuid);
  if (!ageGroup) return "Sin franja";
  if (ageGroup.edad_minima != null && ageGroup.edad_maxima != null) {
    return `${ageGroup.nombre} (${ageGroup.edad_minima}-${ageGroup.edad_maxima})`;
  }
  return ageGroup.nombre;
};
