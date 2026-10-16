import logoImg from "@/assets/images/logos/Logotipo.webp";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__brand">
        <div className="landing-footer__brand-row">
          <img src={logoImg} alt="Logo de Semillas" />
          <span className="brand">Semillas</span>
        </div>
        <p className="tagline">Crecer en la Palabra, vivir Su verdad</p>
        <p className="copyright">© 2026 Semillas. Todos los derechos reservados.</p>
      </div>

      <div className="landing-footer__middle">
        <div className="landing-footer__love">
          <Heart size={18} aria-hidden="true" />
          <span>Hecho con amor para la próxima generación.</span>
        </div>
      </div>

      <div className="landing-footer__verse">
        <p className="verse-text">“Id por todo el mundo y predicad el evangelio a toda criatura.”</p>
        <span className="verse-ref">Marcos 16:15</span>
      </div>
    </footer>
  );
}
