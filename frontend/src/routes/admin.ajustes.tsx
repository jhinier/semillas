import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

import { guardarAjustesAdmin, obtenerAjustesAdmin, type AjustesAdmin } from "@/features/admin/admin.api";

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

function normalizarAjustes(ajustes: AjustesAdmin): Ajustes {
  return {
    nombrePlataforma: ajustes.nombre_plataforma,
    correoSoporte: ajustes.correo_soporte ?? "",
    zonaHoraria: ajustes.zona_horaria,
    notasObligatoriasCambios: ajustes.notas_obligatorias_cambios,
    notasObligatoriasRechazo: ajustes.notas_obligatorias_rechazo,
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
