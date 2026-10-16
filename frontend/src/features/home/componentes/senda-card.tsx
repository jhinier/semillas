import { Link } from "@tanstack/react-router";
import { Card } from "@/componentes/ui/card-base";
import { unirClases } from "@/lib/utilidades";

export interface SendaCardProps {
  variante: "padre" | "hijo" | "espiritu";
  imagenUrl: string;
  label: string;
  titulo: string;
  descripcion: string;
  hash: string;
}

const VARIANTE_TAILWIND: Record<SendaCardProps["variante"], { bg: string; labelColor: string; titleColor: string }> = {
  padre: { bg: "bg-[#FEF6E1]", labelColor: "text-[#b58e20]", titleColor: "text-[#b58e20]" },
  hijo: { bg: "bg-[#EBF4FC]", labelColor: "text-[#1565C0]", titleColor: "text-[#1565C0]" },
  espiritu: { bg: "bg-[#F4EBFA]", labelColor: "text-[#8e44ad]", titleColor: "text-[#8e44ad]" },
};

export function SendaCard({ variante, imagenUrl, label, titulo, descripcion, hash }: SendaCardProps) {
  const { bg, labelColor, titleColor } = VARIANTE_TAILWIND[variante];

  return (
    <Link
      to="/app/temas"
      search={{sendas: hash as "padre" | "hijo" | "espiritu" }}
      className="home-path-card"
      aria-label={`Abrir temas de ${titulo}`}
    >
      <Card
        sombra="md"
        hoverEffect="elevate"
        className={unirClases("home-path-card__card h-full overflow-hidden border border-white/60", bg)}
      >
        <div className="home-path-card__body">
          <div className="home-path-card__media">
            <img
              src={imagenUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="home-path-card__image"
            />
            <div className="home-path-card__overlay" />
          </div>

          <div className="home-path-card__content">
            <span className={unirClases("home-path-card__label", labelColor)}>
              {label}
            </span>
            <h3 className={unirClases("home-path-card__title", titleColor)}>
              {titulo}
            </h3>
            <p className="home-path-card__desc">
              {descripcion}
            </p>

            <div className="home-path-card__cta">
              <span className="home-path-card__cta-badge">Explorar</span>
              <span className="home-path-card__cta-arrow" aria-hidden="true">
                <i className="fa-solid fa-arrow-right text-[16px]" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
