import * as React from "react";
import candadoIcon from "@/assets/images/icons/candado.webp";
import escudoIcon from "@/assets/images/icons/entorno_seguro.webp";
import progresoIcon from "@/assets/images/icons/progreso.webp";
import ninosImg from "@/assets/images/Ilustraciones/Ninos 2.webp";

export const LoginHeroPanel: React.FC = () => {
  return (
    <section className="login-panel login-panel--visual" aria-label="Ilustración y beneficios">
      <div className="login-illustration-card">
        <div className="login-bubble" aria-hidden="true">
          <span>
            💜 Aprende, crece
            <br />y comparte su amor.
          </span>
        </div>
        <div className="login-illustration">
          <img src={ninosImg} alt="Niños cuidando una pequeña planta" className="login-illustration__img" draggable="false" />
        </div>
      </div>

      <div className="login-benefits">
        <article className="login-benefit">
          <div className="login-benefit__icon-wrap login-benefit__icon-wrap--cloud">
            <img src={progresoIcon} alt="" className="login-benefit__icon" width="24" height="24" />
          </div>
          <div className="login-benefit__content">
            <h2 className="login-benefit__title">Tu progreso se sincroniza</h2>
            <p className="login-benefit__desc">Continúa aprendiendo desde cualquier dispositivo.</p>
          </div>
        </article>

        <article className="login-benefit">
          <div className="login-benefit__icon-wrap login-benefit__icon-wrap--shield">
            <img src={escudoIcon} alt="" className="login-benefit__icon" width="24" height="24" />
          </div>
          <div className="login-benefit__content">
            <h2 className="login-benefit__title">Un entorno seguro</h2>
            <p className="login-benefit__desc">Contenido apropiado y protegido para niños.</p>
          </div>
        </article>
      </div>

      <p className="login-privacy">
        <img src={candadoIcon} alt="" aria-hidden="true" className="login-privacy__icon" width="14" height="14" />
        <span>Privacidad protegida. Nunca compartimos tu información.</span>
      </p>
    </section>
  );
};
