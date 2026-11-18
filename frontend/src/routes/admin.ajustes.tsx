import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, Monitor, Moon, RotateCcw, Save, ShieldCheck, Sun, Type } from "lucide-react";
import { toast } from "sonner";

import {
  actualizarGrupoEdadAdmin,
  guardarAjustesAdmin,
  obtenerAjustesAdmin,
  type AjustesAdmin,
} from "@/features/admin/admin.api";
import { obtenerGruposEdad } from "@/features/catalog/catalog.api";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import {
  aplicarContraste,
  aplicarTamanoTexto,
  aplicarTemaVisual,
  guardarPreferenciaPerfil,
  leerPreferenciaPerfil,
  normalizarTamanoTexto,
  type TamanoTexto,
  type TemaVisual,
} from "@/shared/accessibility/preferences";

export const Route = createFileRoute("/admin/ajustes")({ component: AdminAjustesPage });

const STORAGE_KEY = "semillas.admin.settings.v1";

type Ajustes = {
  nombrePlataforma: string;
  correoSoporte: string;
  zonaHoraria: string;
  notasObligatoriasCambios: boolean;
  notasObligatoriasRechazo: boolean;
};

const defaults: Ajustes = {
  nombrePlataforma: "Semillas",
  correoSoporte: "",
  zonaHoraria: "America/Guayaquil",
  notasObligatoriasCambios: true,
  notasObligatoriasRechazo: true,
};

function normalizarAjustes(ajustes: AjustesAdmin | { ajustes?: Partial<AjustesAdmin> }): Ajustes {
  const fuente =
    ajustes && typeof ajustes === "object" && "ajustes" in ajustes && ajustes.ajustes
      ? ajustes.ajustes
      : (ajustes as Partial<AjustesAdmin>);
  return {
    nombrePlataforma: fuente?.nombre_plataforma || defaults.nombrePlataforma,
    correoSoporte: fuente?.correo_soporte ?? defaults.correoSoporte,
    zonaHoraria: fuente?.zona_horaria || defaults.zonaHoraria,
    notasObligatoriasCambios: fuente?.notas_obligatorias_cambios ?? defaults.notasObligatoriasCambios,
    notasObligatoriasRechazo: fuente?.notas_obligatorias_rechazo ?? defaults.notasObligatoriasRechazo,
  };
}

function cargarAjustesLocales(): Ajustes | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Ajustes>;
    return {
      ...defaults,
      ...parsed,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function AdminAjustesPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Ajustes>(() => cargarAjustesLocales() ?? defaults);
  const [dirty, setDirty] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
    staleTime: 1000 * 60 * 5,
  });
  const scopeId = meQuery.data?.perfil?.id || meQuery.data?.usuario?.id;
  const ageGroupsQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
  });
  const [franjasDraft, setFranjasDraft] = useState<
    Record<string, { nombre: string; edad_minima: number; edad_maxima: number; descripcion: string }>
  >({});

  useEffect(() => {
    if (!ageGroupsQuery.data?.length) return;
    setFranjasDraft((prev) => {
      const next = { ...prev };
      for (const g of ageGroupsQuery.data!) {
        if (!next[g.id]) {
          next[g.id] = {
            nombre: g.nombre,
            edad_minima: g.edad_minima,
            edad_maxima: g.edad_maxima,
            descripcion: g.descripcion ?? "",
          };
        }
      }
      return next;
    });
  }, [ageGroupsQuery.data]);

  const saveFranjaMutation = useMutation({
    mutationFn: async (grupoId: string) => {
      const item = franjasDraft[grupoId];
      if (!item || item.nombre.trim().length < 2) {
        throw new Error("Escribe un nombre válido para la franja.");
      }
      if (item.edad_minima > item.edad_maxima) {
        throw new Error("La edad mínima no puede ser mayor que la edad máxima.");
      }
      return actualizarGrupoEdadAdmin(grupoId, {
        nombre: item.nombre.trim(),
        edad_minima: Number(item.edad_minima),
        edad_maxima: Number(item.edad_maxima),
        descripcion: item.descripcion.trim() || null,
      });
    },
    onSuccess: async (updated) => {
      setFranjasDraft((prev) => ({
        ...prev,
        [updated.id]: {
          nombre: updated.nombre,
          edad_minima: updated.edad_minima,
          edad_maxima: updated.edad_maxima,
          descripcion: updated.descripcion ?? "",
        },
      }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["catalog", "age-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["me"] }),
      ]);
      toast.success(`Franja “${updated.nombre}” actualizada`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "No se pudo actualizar la franja"),
  });

  const [temaVisual, setTemaVisual] = useState<TemaVisual>(() => {
    const raw = leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro");
    return raw === "oscuro" || raw === "claro" || raw === "sistema" ? raw : "claro";
  });
  const [tamanoTexto, setTamanoTexto] = useState<TamanoTexto>(() => {
    return normalizarTamanoTexto(leerPreferenciaPerfil("semillas-pref-text-size", scopeId, "mediano"));
  });
  const [altoContraste, setAltoContraste] = useState<boolean>(() => {
    return leerPreferenciaPerfil("semillas-pref-contraste", scopeId) === "alto";
  });

  useEffect(() => {
    const sincronizarPreferencias = () => {
      const temaRaw = leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro");
      setTemaVisual(temaRaw === "oscuro" || temaRaw === "claro" || temaRaw === "sistema" ? temaRaw : "claro");
      setTamanoTexto(normalizarTamanoTexto(leerPreferenciaPerfil("semillas-pref-text-size", scopeId, "mediano")));
      setAltoContraste(leerPreferenciaPerfil("semillas-pref-contraste", scopeId) === "alto");
    };

    sincronizarPreferencias();
    window.addEventListener("semillas:preferences-changed", sincronizarPreferencias);
    window.addEventListener("storage", sincronizarPreferencias);
    return () => {
      window.removeEventListener("semillas:preferences-changed", sincronizarPreferencias);
      window.removeEventListener("storage", sincronizarPreferencias);
    };
  }, [scopeId]);

  const handleSeleccionarTema = (nuevoTema: TemaVisual) => {
    setTemaVisual(nuevoTema);
    guardarPreferenciaPerfil("semillas-pref-tema", nuevoTema, scopeId);
    aplicarTemaVisual(nuevoTema);
    toast.success(`Tema visual cambiado a ${nuevoTema}.`);
  };

  const handleSeleccionarTexto = (nuevoTamano: TamanoTexto) => {
    setTamanoTexto(nuevoTamano);
    guardarPreferenciaPerfil("semillas-pref-text-size", nuevoTamano, scopeId);
    aplicarTamanoTexto(nuevoTamano);
  };

  const handleToggleContraste = () => {
    const siguiente = !altoContraste;
    setAltoContraste(siguiente);
    guardarPreferenciaPerfil("semillas-pref-contraste", siguiente ? "alto" : "normal", scopeId);
    aplicarContraste(siguiente);
  };

  const ajustesQuery = useQuery({
    queryKey: ["admin", "ajustes"],
    queryFn: obtenerAjustesAdmin,
  });

  useEffect(() => {
    if (ajustesQuery.data) {
      const siguientes = normalizarAjustes(ajustesQuery.data);
      setSettings(siguientes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siguientes));
      setDirty(false);
    }
  }, [ajustesQuery.data]);

  useEffect(() => {
    if (ajustesQuery.isError) {
      const locales = cargarAjustesLocales();
      if (locales) setSettings(locales);
    }
  }, [ajustesQuery.isError]);

  const validation = useMemo(() => {
    const errores: string[] = [];
    if (settings.nombrePlataforma.trim().length < 2) errores.push("nombre");
    if (settings.correoSoporte && !settings.correoSoporte.includes("@")) errores.push("correo");
    if (!settings.zonaHoraria.trim()) errores.push("zona horaria");
    return errores;
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => guardarAjustesAdmin({
      nombre_plataforma: settings.nombrePlataforma.trim(),
      correo_soporte: settings.correoSoporte.trim() ? settings.correoSoporte.trim() : null,
      zona_horaria: settings.zonaHoraria.trim(),
      notas_obligatorias_cambios: settings.notasObligatoriasCambios,
      notas_obligatorias_rechazo: settings.notasObligatoriasRechazo,
    }),
    onSuccess: async (respuesta) => {
      const siguientes = normalizarAjustes(respuesta);
      setSettings(siguientes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siguientes));
      setDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "ajustes"] });
      toast.success("Ajustes guardados");
    },
    onError: () => toast.error("No se pudieron guardar los ajustes"),
  });

  function update<K extends keyof Ajustes>(key: K, value: Ajustes[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  return (
    <div className="admin-theme-studio">
      <section className="admin-theme-library__hero">
        <div>
          <span className="admin-eyebrow">Configuración</span>
          <h2>Ajustes</h2>
          <p>Define reglas editoriales y preferencias globales de la plataforma.</p>
        </div>
        <div className="admin-theme-library__hero-actions">
          <button type="button" className="admin-secondary-button" onClick={() => setSettings(defaults)}>
            <RotateCcw size={17} /> Restaurar
          </button>
          <button
            type="button"
            className="admin-primary-button"
            disabled={!dirty || validation.length > 0 || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Guardar cambios
          </button>
        </div>
      </section>

      <div className="admin-editor-shell">
        <main className="admin-editor-main">
          <section className="admin-editor-section">
            <div className="admin-editor-section__header">
              <div>
                <h2>Configuración general</h2>
                <p>Estos valores se guardan para sincronizar el comportamiento del panel.</p>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field--wide">
                <span>Nombre administrativo</span>
                <input value={settings.nombrePlataforma} onChange={(event) => update("nombrePlataforma", event.target.value)} />
              </label>

              <label className="admin-field">
                <span>Correo de soporte</span>
                <input value={settings.correoSoporte} onChange={(event) => update("correoSoporte", event.target.value)} placeholder="soporte@semillas.org" />
              </label>

              <label className="admin-field">
                <span>Zona horaria</span>
                <input value={settings.zonaHoraria} onChange={(event) => update("zonaHoraria", event.target.value)} />
              </label>

              <label className="admin-field">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.notasObligatoriasCambios} onChange={(event) => update("notasObligatoriasCambios", event.target.checked)} />
                  Exigir nota al solicitar cambios
                </span>
              </label>

              <label className="admin-field">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.notasObligatoriasRechazo} onChange={(event) => update("notasObligatoriasRechazo", event.target.checked)} />
                  Exigir motivo al rechazar
                </span>
              </label>
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-editor-section__header">
              <div>
                <h2>Apariencia y Accesibilidad del Panel</h2>
                <p>Personaliza el modo claro u oscuro, el tamaño de letra y el contraste en todo Semillas.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tema visual
                </span>
                <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Tema visual">
                  {(
                    [
                      { id: "claro", label: "Claro", Icon: Sun },
                      { id: "oscuro", label: "Oscuro", Icon: Moon },
                      { id: "sistema", label: "Sistema", Icon: Monitor },
                    ] as const
                  ).map(({ id, label, Icon }) => {
                    const activo = temaVisual === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => handleSeleccionarTema(id)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                          activo
                            ? "border-violet-600 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/60 dark:text-violet-300"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Type size={14} aria-hidden="true" /> Tamaño de texto
                </span>
                <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Tamaño de texto">
                  {(
                    [
                      { id: "pequeno", label: "Pequeño" },
                      { id: "mediano", label: "Mediano" },
                      { id: "grande", label: "Grande" },
                    ] as const
                  ).map(({ id, label }) => {
                    const activo = tamanoTexto === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => handleSeleccionarTexto(id)}
                        className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                          activo
                            ? "border-violet-600 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/60 dark:text-violet-300"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="shrink-0 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                  <div>
                    <strong className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                      Alto contraste
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Refuerza bordes y legibilidad de textos en pantalla.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={altoContraste}
                  onClick={handleToggleContraste}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                    altoContraste
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {altoContraste ? "Activado" : "Desactivado"}
                </button>
              </div>
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-editor-section__header">
              <div>
                <h2>Franjas de edad (rangos y descripciones)</h2>
                <p>Edita nombres, rangos de edades y enfoque de cada grupo sin entrar a la base de datos.</p>
              </div>
            </div>

            {ageGroupsQuery.isLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={16} /> Cargando franjas de edad...
              </div>
            ) : (
              <div className="grid gap-4">
                {(ageGroupsQuery.data ?? []).map((grupo) => {
                  const draftItem = franjasDraft[grupo.id] ?? {
                    nombre: grupo.nombre,
                    edad_minima: grupo.edad_minima,
                    edad_maxima: grupo.edad_maxima,
                    descripcion: grupo.descripcion ?? "",
                  };
                  const savingThis = saveFranjaMutation.isPending && saveFranjaMutation.variables === grupo.id;

                  return (
                    <div
                      key={grupo.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <strong className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                            {draftItem.nombre || grupo.nombre}
                          </strong>
                          <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                            Código: {grupo.codigo}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={savingThis}
                          onClick={() => saveFranjaMutation.mutate(grupo.id)}
                          className="admin-primary-button !py-1.5 !px-3 text-xs"
                        >
                          {savingThis ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar franja
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="admin-field">
                          <span>Nombre visible</span>
                          <input
                            value={draftItem.nombre}
                            onChange={(e) =>
                              setFranjasDraft((prev) => ({
                                ...prev,
                                [grupo.id]: { ...draftItem, nombre: e.target.value },
                              }))
                            }
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="admin-field">
                            <span>Edad mínima</span>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={draftItem.edad_minima}
                              onChange={(e) =>
                                setFranjasDraft((prev) => ({
                                  ...prev,
                                  [grupo.id]: { ...draftItem, edad_minima: Number(e.target.value) },
                                }))
                              }
                            />
                          </label>
                          <label className="admin-field">
                            <span>Edad máxima</span>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={draftItem.edad_maxima}
                              onChange={(e) =>
                                setFranjasDraft((prev) => ({
                                  ...prev,
                                  [grupo.id]: { ...draftItem, edad_maxima: Number(e.target.value) },
                                }))
                              }
                            />
                          </label>
                        </div>
                        <label className="admin-field admin-field--wide">
                          <span>Descripción / Enfoque</span>
                          <input
                            value={draftItem.descripcion}
                            placeholder="Ej: Descubre a Dios con historias y actividades sencillas."
                            onChange={(e) =>
                              setFranjasDraft((prev) => ({
                                ...prev,
                                [grupo.id]: { ...draftItem, descripcion: e.target.value },
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="admin-editor-aside">
          <section className="admin-editor-section">
            <span className="admin-eyebrow">Estado</span>
            <div className="admin-completeness-list mt-4">
              <div className={`admin-completeness-item ${validation.length === 0 ? "admin-completeness-item--complete" : ""}`}>
                <span>Validación</span>
                {validation.length === 0 ? <ShieldCheck size={16} /> : <span>{validation.length} pendientes</span>}
              </div>
              <div className={`admin-completeness-item ${dirty ? "" : "admin-completeness-item--complete"}`}>
                <span>Cambios</span>
                {dirty ? <span>Sin guardar</span> : <ShieldCheck size={16} />}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Los cambios se guardan en el backend y se cachean localmente para recuperación rápida.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
