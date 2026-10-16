import { createFileRoute } from "@tanstack/react-router";
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
          <SendaFilterRow searchSenda={search.sendas} onSendaChange={cambiarSenda} />

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
