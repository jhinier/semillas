import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileAudio,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { obtenerPasosAdmin, obtenerTemasAdmin } from "../../admin.api";
import {
  extraerMomentosReutilizables,
  type CrecerDraft,
  type StepRecord,
} from "../../hooks/use-theme-crecer-page";

type FuenteTab = "mismo" | "otros";

export interface CrecerReuseDialogProps {
  open: boolean;
  themeId: string;
  themeTitle: string;
  ageGroups: Array<{ id: string; nombre: string }>;
  targetAgeGroup: { id: string; nombre: string } | null;
  targetStepCode: string;
  targetStepName: string;
  currentStepsData: StepRecord[] | undefined;
  isCopyingAgeGroup: boolean;
  hasExistingContentInTarget: boolean;
  onClose: () => void;
  onLoadMoment: (draft: CrecerDraft, sourceLabel: string) => void;
  onCopyFullAgeGroup: (params: {
    sourceSteps: StepRecord[] | undefined;
    sourceAgeGroupId: string;
    overwriteExisting: boolean;
    sourceLabel: string;
  }) => Promise<void>;
}

/** Modal para reutilizar momentos CRECER individuales o copiar franjas completas desde el mismo tema u otros temas. */
export function CrecerReuseDialog({
  open,
  themeId,
  themeTitle,
  ageGroups,
  targetAgeGroup,
  targetStepCode,
  targetStepName,
  currentStepsData,
  isCopyingAgeGroup,
  hasExistingContentInTarget,
  onClose,
  onLoadMoment,
  onCopyFullAgeGroup,
}: CrecerReuseDialogProps) {
  const [sourceTab, setSourceTab] = useState<FuenteTab>("mismo");
  const [selectedOtherThemeId, setSelectedOtherThemeId] = useState("");
  const [themeSearch, setThemeSearch] = useState("");
  const [sourceAgeFilter, setSourceAgeFilter] = useState("");
  const [sourceStepFilter, setSourceStepFilter] = useState(targetStepCode);
  const [momentSearch, setMomentSearch] = useState("");
  const [bulkSourceAgeId, setBulkSourceAgeId] = useState("");
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSourceTab("mismo");
    setSourceAgeFilter("");
    setSourceStepFilter("");
    setMomentSearch("");
    setThemeSearch("");
    setOverwriteExisting(false);
  }, [open, targetAgeGroup?.id]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCopyingAgeGroup) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, isCopyingAgeGroup, onClose]);

  const temasQuery = useQuery({
    queryKey: ["admin", "themes", "crecer-reuse"],
    queryFn: () => obtenerTemasAdmin(),
    enabled: open && sourceTab === "otros",
    staleTime: 60_000,
  });

  const otrosTemasFiltrados = useMemo(() => {
    const q = themeSearch.trim().toLocaleLowerCase("es");
    return (temasQuery.data ?? [])
      .filter((t) => t.id !== themeId)
      .filter((t) => !q || t.titulo.toLocaleLowerCase("es").includes(q));
  }, [temasQuery.data, themeId, themeSearch]);

  useEffect(() => {
    if (sourceTab !== "otros" || selectedOtherThemeId) return;
    if (otrosTemasFiltrados.length > 0) {
      setSelectedOtherThemeId(otrosTemasFiltrados[0]!.id);
    }
  }, [sourceTab, selectedOtherThemeId, otrosTemasFiltrados]);

  const otherThemeStepsQuery = useQuery({
    queryKey: ["admin", "theme", selectedOtherThemeId, "steps"],
    queryFn: () => obtenerPasosAdmin(selectedOtherThemeId),
    enabled: open && sourceTab === "otros" && Boolean(selectedOtherThemeId),
    staleTime: 30_000,
  });

  const activeSourceSteps = useMemo(() => {
    if (sourceTab === "mismo") return currentStepsData;
    return otherThemeStepsQuery.data as StepRecord[] | undefined;
  }, [sourceTab, currentStepsData, otherThemeStepsQuery.data]);

  const allSourceMoments = useMemo(
    () => extraerMomentosReutilizables(activeSourceSteps, ageGroups),
    [activeSourceSteps, ageGroups],
  );

  const availableBulkFranjas = useMemo(() => {
    return ageGroups
      .filter((ag) => sourceTab === "otros" || ag.id !== targetAgeGroup?.id)
      .map((ag) => ({
        id: ag.id,
        nombre: ag.nombre,
        count: allSourceMoments.filter((m) => m.ageGroupId === ag.id).length,
      }))
      .filter((ag) => ag.count > 0);
  }, [ageGroups, allSourceMoments, sourceTab, targetAgeGroup?.id]);

  useEffect(() => {
    if (!availableBulkFranjas.length) {
      setBulkSourceAgeId("");
      return;
    }
    if (!availableBulkFranjas.some((f) => f.id === bulkSourceAgeId)) {
      setBulkSourceAgeId(availableBulkFranjas[0]!.id);
    }
  }, [availableBulkFranjas, bulkSourceAgeId]);

  const filteredMoments = useMemo(() => {
    const q = momentSearch.trim().toLocaleLowerCase("es");
    return allSourceMoments.filter((m) => {
      if (sourceTab === "mismo" && m.ageGroupId === targetAgeGroup?.id && m.stepCode === targetStepCode) {
        return false;
      }
      if (sourceAgeFilter && m.ageGroupId !== sourceAgeFilter) return false;
      if (sourceStepFilter && m.stepCode !== sourceStepFilter) return false;
      if (!q) return true;
      return (
        m.draft.title.toLocaleLowerCase("es").includes(q) ||
        m.draft.body.toLocaleLowerCase("es").includes(q) ||
        m.stepName.toLocaleLowerCase("es").includes(q) ||
        m.ageGroupName.toLocaleLowerCase("es").includes(q)
      );
    });
  }, [allSourceMoments, momentSearch, sourceAgeFilter, sourceStepFilter, sourceTab, targetAgeGroup?.id, targetStepCode]);

  const uniqueStepOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const m of allSourceMoments) {
      if (!seen.has(m.stepCode)) seen.set(m.stepCode, m.stepName);
    }
    return Array.from(seen.entries());
  }, [allSourceMoments]);

  if (!open) return null;

  const selectedBulkFranja = availableBulkFranjas.find((f) => f.id === bulkSourceAgeId) ?? null;
  const selectedOtherThemeTitle =
    (temasQuery.data ?? []).find((t) => t.id === selectedOtherThemeId)?.titulo ?? "otro tema";
  const sourceContextLabel = sourceTab === "mismo" ? themeTitle : selectedOtherThemeTitle;

  const handleBulkCopy = async () => {
    if (!selectedBulkFranja) return;
    await onCopyFullAgeGroup({
      sourceSteps: activeSourceSteps,
      sourceAgeGroupId: selectedBulkFranja.id,
      overwriteExisting,
      sourceLabel: `${selectedBulkFranja.nombre} (${sourceContextLabel})`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[215] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !isCopyingAgeGroup) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="crecer-reuse-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="min-w-0">
            <span className="admin-eyebrow">Reutilizar enseñanza CRECER</span>
            <h2
              id="crecer-reuse-title"
              className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100"
            >
              Traer contenido para {targetAgeGroup?.nombre ?? "esta franja"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Copia una franja completa de golpe o carga un momento guardado en{" "}
              <strong className="text-slate-700 dark:text-slate-200">{targetStepName}</strong> para adaptarlo sin empezar de cero.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCopyingAgeGroup}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </header>

        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" role="tablist" aria-label="Origen del contenido">
            <button
              type="button"
              role="tab"
              aria-selected={sourceTab === "mismo"}
              onClick={() => setSourceTab("mismo")}
              className={`rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                sourceTab === "mismo"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              Este mismo tema
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sourceTab === "otros"}
              onClick={() => setSourceTab("otros")}
              className={`rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                sourceTab === "otros"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              Otros temas
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {sourceTab === "otros" ? (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="reuse-theme-select" className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  1. Elige el tema de origen
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {otrosTemasFiltrados.length} tema(s) disponibles
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <label className="relative flex items-center">
                  <Search size={15} className="pointer-events-none absolute left-3 text-slate-400" />
                  <input
                    type="search"
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.target.value)}
                    placeholder="Buscar tema…"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
                <select
                  id="reuse-theme-select"
                  value={selectedOtherThemeId}
                  onChange={(e) => setSelectedOtherThemeId(e.target.value)}
                  disabled={temasQuery.isLoading || otrosTemasFiltrados.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {temasQuery.isLoading ? (
                    <option value="">Cargando temas…</option>
                  ) : otrosTemasFiltrados.length === 0 ? (
                    <option value="">No hay otros temas coincidentes</option>
                  ) : (
                    otrosTemasFiltrados.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.titulo} ({t.estado})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </section>
          ) : null}

          {(sourceTab === "otros" && otherThemeStepsQuery.isLoading) ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs font-bold text-slate-500">
              <Loader2 size={17} className="animate-spin text-violet-600" />
              Cargando momentos CRECER del tema…
            </div>
          ) : (
            <>
              {/* Opción A: Copiar toda la franja */}
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Layers3 size={16} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        Copiar franja completa hacia {targetAgeGroup?.nombre ?? "edad actual"}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      Copia de una sola vez los momentos ya redactados (títulos, textos, imágenes, audios y preguntas) y luego ajústalos si quieres.
                    </p>
                  </div>
                </div>

                {availableBulkFranjas.length > 0 ? (
                  <div className="mt-3.5 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        aria-label="Franja de origen"
                        value={bulkSourceAgeId}
                        onChange={(e) => setBulkSourceAgeId(e.target.value)}
                        className="min-w-[200px] flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {availableBulkFranjas.map((franja) => (
                          <option key={franja.id} value={franja.id}>
                            {franja.nombre} · {franja.count}/6 momentos listos
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={isCopyingAgeGroup || !selectedBulkFranja || !targetAgeGroup}
                        onClick={() => void handleBulkCopy()}
                        className="admin-primary-button !min-h-[2.45rem] !px-4 !py-2 text-xs"
                      >
                        {isCopyingAgeGroup ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Copy size={15} />
                        )}
                        {isCopyingAgeGroup
                          ? "Copiando momentos…"
                          : `Copiar ${selectedBulkFranja?.count ?? 0} momento(s)`}
                      </button>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={!overwriteExisting}
                        onChange={(e) => setOverwriteExisting(!e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-600"
                      />
                      Conservar lo que ya escribí en {targetAgeGroup?.nombre ?? "esta franja"} (solo rellenar momentos vacíos)
                    </label>
                  </div>
                ) : (
                  <p className="mt-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {sourceTab === "mismo"
                      ? "Todavía no hay otras franjas con momentos guardados en este tema. Prueba la pestaña «Otros temas» arriba."
                      : "El tema elegido aún no tiene momentos CRECER guardados."}
                  </p>
                )}
              </section>

              {/* Opción B: Elegir 1 momento individual */}
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-violet-600" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      O cargar un momento individual en «{targetStepName}»
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {filteredMoments.length} disponible(s)
                  </span>
                </div>

                {hasExistingContentInTarget ? (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/35 dark:text-amber-200">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>
                      «{targetStepName}» ya tiene texto en el editor; al elegir uno de abajo se cargará como borrador para revisar antes de guardar.
                    </span>
                  </div>
                ) : null}

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <label className="relative flex items-center sm:col-span-1">
                    <Search size={15} className="pointer-events-none absolute left-3 text-slate-400" />
                    <input
                      type="search"
                      value={momentSearch}
                      onChange={(e) => setMomentSearch(e.target.value)}
                      placeholder="Buscar título o texto…"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <select
                    aria-label="Filtrar por franja"
                    value={sourceAgeFilter}
                    onChange={(e) => setSourceAgeFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Todas las franjas</option>
                    {ageGroups.map((ag) => (
                      <option key={ag.id} value={ag.id}>{ag.nombre}</option>
                    ))}
                  </select>

                  <select
                    aria-label="Filtrar por momento"
                    value={sourceStepFilter}
                    onChange={(e) => setSourceStepFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Todos los momentos</option>
                    {uniqueStepOptions.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                {filteredMoments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center text-xs font-semibold text-slate-500 dark:border-slate-800">
                    No encontramos momentos guardados con estos filtros.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredMoments.map((item) => {
                      const snippet = item.draft.body.replace(/[#*_>`]/g, "").trim();
                      return (
                        <article
                          key={item.key}
                          className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-violet-300 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950/30"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-extrabold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                                {item.stepName}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {item.ageGroupName}
                              </span>
                              {item.draft.resourceId ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                  <ImageIcon size={11} /> Visual
                                </span>
                              ) : null}
                              {item.draft.audioResourceId ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                                  <FileAudio size={11} /> Audio
                                </span>
                              ) : null}
                              {item.draft.questions.length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                  <CheckCircle2 size={11} /> {item.draft.questions.length} preg.
                                </span>
                              ) : null}
                            </div>
                            <h4 className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
                              {item.draft.title}
                            </h4>
                            <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                              {snippet}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isCopyingAgeGroup}
                            onClick={() => {
                              onLoadMoment(item.draft, `${item.stepName} (${item.ageGroupName})`);
                              onClose();
                            }}
                            className="admin-secondary-button shrink-0 !min-h-[2.3rem] !px-3.5 !py-1.5 text-xs"
                          >
                            Usar en «{targetStepName}»
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
