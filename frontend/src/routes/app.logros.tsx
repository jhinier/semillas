import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Award, CheckCircle2, LockKeyhole, RefreshCw } from "lucide-react";

import { LogrosTabsFilter } from "../features/gamification/componentes/logros-tabs-filter";
import { InsigniaCardItem } from "../features/gamification/componentes/insignia-card-item";
import { ProgresoXpWidget } from "../features/gamification/componentes/progreso-xp-widget";
import { CompartirInsigniaWidget } from "../features/gamification/componentes/compartir-insignia-widget";
import { ProximaInsigniaWidget } from "../features/gamification/componentes/proxima-insignia-widget";
import { ModalCelebracion } from "../features/gamification/componentes/modal-celebracion";
import { useLogrosPage } from "../features/logros/hooks/use-logros-page";

import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";
import "./app-logros.css";

export const Route = createFileRoute("/app/logros")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const {
    query,
    xpInfo,
    insignias,
    resumen,
    primerLogroObtenido,
    proximaInsignia,
    activeTab,
    setActiveTab,
    sharedBadge,
    handleShare,
    handleReclamar,
    reclamandoId,
    modalCelebracion,
    cerrarModalCelebracion,
  } = useLogrosPage();

  return (
    <>
    <div className="logros-page">
      <section className="logros-mobile-overview" aria-label="Resumen de insignias">
        <div className="logros-mobile-overview__level">
          <span>Nivel {xpInfo.numNivel}</span>
          <strong>{xpInfo.nombreNivel}</strong>
        </div>
        <ResumenItem icono={<Award size={19} />} valor={resumen.total} etiqueta="Total" />
        <ResumenItem icono={<CheckCircle2 size={19} />} valor={resumen.obtenidas} etiqueta="Obtenidas" />
        <ResumenItem icono={<LockKeyhole size={18} />} valor={resumen.pendientes} etiqueta="Pendientes" />
        <div className="logros-mobile-overview__bar" aria-hidden="true">
          <span style={{ width: `${xpInfo.porcentaje}%` }} />
        </div>
      </section>

      <div className="logros-layout">
        <section className="logros-main" aria-label="Catálogo de insignias">
          <LogrosTabsFilter activo={activeTab} onChange={setActiveTab} totales={resumen} />

          {query.isLoading ? (
            <div className="logros-grid" aria-label="Cargando insignias" aria-busy="true">
              {[1, 2, 3].map((item) => <div key={item} className="logro-card-skeleton" />)}
            </div>
          ) : null}

          {query.isError ? (
            <div role="alert" className="logros-state-card logros-state-card--error">
              <RefreshCw size={24} aria-hidden="true" />
              <div>
                <h2>No pudimos cargar tus insignias</h2>
                <p>Revisa tu conexión e inténtalo nuevamente.</p>
              </div>
              <button type="button" onClick={() => void query.refetch()}>
                Reintentar
              </button>
            </div>
          ) : null}

          {!query.isLoading && !query.isError && insignias.length > 0 ? (
            <div className="logros-grid">
              {insignias.map((insignia) => (
                <InsigniaCardItem
                  key={insignia.codigo}
                  id={insignia.id}
                  codigo={insignia.codigo}
                  nombre={insignia.nombre}
                  descripcion={insignia.descripcion ?? "Sigue aprendiendo para descubrir este logro."}
                  criterio={insignia.criterio}
                  bono_xp={insignia.bono_xp}
                  imagen={obtenerImagenInsignia(insignia.codigo, insignia.url_icono)}
                  obtenido={insignia.obtenido}
                  pendienteReclamar={insignia.pendienteReclamar}
                  ganadoEn={insignia.ganadoEn}
                  reclamadoEn={insignia.reclamadoEn}
                  reclamando={reclamandoId === insignia.id}
                  onReclamar={handleReclamar}
                  onCompartir={() => handleShare(insignia.nombre, obtenerImagenInsignia(insignia.codigo, insignia.url_icono))}
                />
              ))}
            </div>
          ) : null}

          {!query.isLoading && !query.isError && insignias.length === 0 ? (
            <div className="logros-state-card">
              <Award size={26} aria-hidden="true" />
              <div>
                <h2>No hay insignias en este filtro</h2>
                <p>Prueba otra categoría para ver el catálogo completo.</p>
              </div>
              <button type="button" onClick={() => setActiveTab("todas")}>Ver todas</button>
            </div>
          ) : null}
        </section>

        <aside className="logros-aside" aria-label="Progreso y siguiente objetivo">
          <ProgresoXpWidget
            xpTotal={xpInfo.xpTotal}
            numNivel={xpInfo.numNivel}
            nombreNivel={xpInfo.nombreNivel}
            xpRestantes={xpInfo.xpRestantes}
            porcentaje={xpInfo.porcentaje}
            nombreSiguienteNivel={xpInfo.nombreSiguienteNivel}
            esNivelMaximo={xpInfo.esNivelMaximo}
          />

          {primerLogroObtenido ? (
            <CompartirInsigniaWidget
              nombreInsignia={primerLogroObtenido.nombre}
              imagenInsignia={obtenerImagenInsignia(primerLogroObtenido.codigo, primerLogroObtenido.url_icono)}
              onCompartir={() =>
                void handleShare(
                  primerLogroObtenido.nombre,
                  obtenerImagenInsignia(primerLogroObtenido.codigo, primerLogroObtenido.url_icono),
                )
              }
              compartido={sharedBadge !== null}
            />
          ) : proximaInsignia ? (
            <ProximaInsigniaWidget
              nombre={proximaInsignia.nombre}
              criterio={proximaInsignia.criterio}
              bonoXp={proximaInsignia.bono_xp}
            />
          ) : null}
        </aside>
      </div>
    </div>

    {/* Modal de celebración al reclamar un logro */}
    {modalCelebracion ? (
      <ModalCelebracion
        nombre={modalCelebracion.nombre}
        bonoXp={modalCelebracion.bonoXp}
        imagen={modalCelebracion.imagen || in2Img}
        onCerrar={cerrarModalCelebracion}
      />
    ) : null}
    </>
  );
}

function ResumenItem({ icono, valor, etiqueta }: { icono: ReactNode; valor: number; etiqueta: string }) {
  return (
    <div className="logros-mobile-overview__item">
      <span aria-hidden="true">{icono}</span>
      <strong>{valor}</strong>
      <small>{etiqueta}</small>
    </div>
  );
}

function obtenerImagenInsignia(codigo: string, urlIcono: string | null): string {
  if (urlIcono) return urlIcono;
  return codigo === "primera_leccion" ? in1Img : in2Img;
}
