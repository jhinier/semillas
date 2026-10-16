import * as React from "react";
import { Share2 } from "lucide-react";

export interface CompartirInsigniaWidgetProps {
  nombreInsignia: string;
  imagenInsignia: string;
  onCompartir: () => void;
  compartido: boolean;
}

export const CompartirInsigniaWidget: React.FC<CompartirInsigniaWidgetProps> = ({
  nombreInsignia,
  imagenInsignia,
  onCompartir,
  compartido,
}) => {
  return (
    <section className="logros-share-card" aria-labelledby="logros-share-title">
      <div className="logros-share-card__preview">
        <img src={imagenInsignia} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </div>
      <div className="logros-share-card__content">
        <p className="logros-share-card__eyebrow">Insignia obtenida</p>
        <h2 id="logros-share-title">{nombreInsignia}</h2>
        <p>Comparte este logro con tu familia o tu club.</p>
        <button type="button" className="logros-share-card__button" onClick={onCompartir} disabled={compartido}>
          <Share2 size={16} aria-hidden="true" />
          {compartido ? "Compartida" : "Compartir logro"}
        </button>
      </div>
    </section>
  );
};
