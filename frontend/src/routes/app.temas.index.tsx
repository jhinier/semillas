import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { z } from "zod";
import { CardLeccion } from "@/componentes/ui/card-leccion";
import { ContinuarAprendiendoCard } from "@/features/themes/componentes/continuar-aprendiendo-card";
import { ResumenTemasCard } from "@/features/themes/componentes/resumen-temas-card";
import { SendaFilterRow } from "@/features/themes/componentes/senda-filter-row";
import { TemasEmptyState, TemasErrorState, TemasLoadingState } from "@/features/themes/componentes/temas-page-states";
import { TemasSearchBar } from "@/features/themes/componentes/temas-search-bar";
import { TemasTabsFilter } from "@/features/themes/componentes/temas-tabs-filter";
import { useTemasPage } from "@/features/themes/hooks/use-temas-page";
import "./app-temas.css";

const BusquedaSchema = z.object({
  sendas: z.enum(["padre", "hijo", "espiritu"]).optional(),
});

export const Route = createFileRoute("/app/temas/")({
  component: PaginaTemas,
  validateSearch: (search) => BusquedaSchema.parse(search),
});

function PaginaTemas() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const {
    temasApi,
    temasFiltrados,
    stats,
    temaParaContinuar,
    temaRecomendado,
    grupoEdadActivo,
    gruposEdadDisponibles,
    cambiarGrupoEdad,
    isLoading,
    isError,
    filtroTab,
    setFiltroTab,
    busqueda,
    setBusqueda,
    toggleFavorito,
    cambiarSenda,
  } = useTemasPage({ searchSenda: search.sendas });

  const limpiarFiltros = () => {
    setFiltroTab("todos");
    setBusqueda("");
    cambiarSenda("todas");
  };

  if (isLoading) return <TemasLoadingState />;
  if (isError) return <TemasErrorState />;

  return (
    <div className="temas-page">
      <section className="temas-page__main" aria-label="Catálogo de temas">
        <div className="temas-page__mobile-summary">
          <ResumenTemasCard
            totales={stats.totales}
            completados={stats.completados}
            enProgreso={stats.enProgreso}
            variante="inline"
          />
        </div>

        <div className="temas-page__filters" aria-label="Filtros de temas">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-extrabold">
                <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Franja activa: {grupoEdadActivo.nombre} ({grupoEdadActivo.rango})
              </span>
              <span className="font-semibold text-emerald-800/90 dark:text-emerald-300">
                · {grupoEdadActivo.enfoque}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Cambiar franja de edad">
              {gruposEdadDisponibles.map((grupo) => {
                const activa = grupo.id === grupoEdadActivo.id || grupo.codigo === grupoEdadActivo.codigo;
                return (
                  <button
                    key={grupo.id}
                    type="button"
                    onClick={() => cambiarGrupoEdad(grupo.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition ${
                      activa
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "border border-emerald-300/80 bg-white/80 text-emerald-900 hover:bg-white dark:border-emerald-700 dark:bg-slate-900/70 dark:text-emerald-200"
                    }`}
                  >
                    {grupo.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <SendaFilterRow
            searchSenda={search.sendas}
            grupoEdadCodigo={grupoEdadActivo.codigo}
            onSendaChange={cambiarSenda}
          />

          <TemasTabsFilter
            activo={filtroTab}
            onChange={setFiltroTab}
            counts={{
              todos: stats.totales,
              completados: stats.completados,
              progreso: stats.enProgreso,
              favoritos: stats.favoritos,
            }}
          />

          <TemasSearchBar valor={busqueda} onChange={setBusqueda} />
        </div>

        {temasFiltrados.length === 0 ? (
          <TemasEmptyState onReset={limpiarFiltros} />
        ) : (
          <div className="temas-page__grid">
            {temasFiltrados.map((tema) => (
              <CardLeccion
                key={tema.id}
                titulo={tema.titulo}
                descripcion={tema.descripcion}
                duracion={tema.duracion}
                xp={tema.xp}
                progreso={tema.progreso}
                favorito={tema.favorito}
                imagenUrl={tema.imagenUrl ?? undefined}
                estado={tema.estado}
                mostrarSendaBadge={false}
                layoutMovil="lista"
                clase="temas-topic-card"
                onFavorito={() => {
                  const slug = temasApi?.find((t) => t.id === tema.id)?.slug ?? tema.id;
                  toggleFavorito(slug);
                }}
                onAccion={() => {
                  const pasoActual = tema.progresoTema?.estado === "en_progreso"
                    ? tema.progresoTema.ultimoPasoId
                    : null;

                  navigate(
                    pasoActual
                      ? {
                          to: "/app/temas/$themeId",
                          params: { themeId: tema.id },
                          search: { paso: pasoActual },
                        }
                      : { to: "/app/temas/$themeId", params: { themeId: tema.id } },
                  );
                }}
                senda={tema.senda}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="temas-page__aside" aria-label="Resumen de aprendizaje">
        <ResumenTemasCard
          totales={stats.totales}
          completados={stats.completados}
          enProgreso={stats.enProgreso}
        />

        <ContinuarAprendiendoCard
          tema={temaParaContinuar ?? temaRecomendado ?? null}
          modo={temaParaContinuar ? "continuar" : "recomendado"}
          onContinuar={() => {
            const temaDestino = temaParaContinuar ?? temaRecomendado;
            if (temaDestino) {
              navigate({ to: "/app/temas/$themeId", params: { themeId: temaDestino.id } });
            }
          }}
        />
      </aside>
    </div>
  );
}
