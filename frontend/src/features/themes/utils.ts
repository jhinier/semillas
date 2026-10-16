export function obtenerClasesSenda(senda: string) {
  const esPadre = senda.toLowerCase().includes("padre");
  const esHijo = senda.toLowerCase().includes("hijo");
  const esEspiritu =
    senda.toLowerCase().includes("espíritu") ||
    senda.toLowerCase().includes("espiritu");

  return {
    esPadre,
    esHijo,
    esEspiritu,
    texto:
      esPadre ? "text-amber-600" :
      esHijo ? "text-blue-600" :
      esEspiritu ? "text-violet-600" :
      "text-slate-600",
    relleno:
      esHijo ? "bg-blue-600" :
      esEspiritu ? "bg-violet-600" :
      "bg-emerald-500",
  };
}
