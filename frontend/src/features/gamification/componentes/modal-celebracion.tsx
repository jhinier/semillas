import * as React from "react";
import { X, Share2, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { crearTarjetaInsignia, descargarTarjetaInsignia } from "../../logros/utils/crear-tarjeta-insignia";
import { toast } from "sonner";
import { crearPayloadCompartirInsignia } from "../../logros/utils/share-payload";

interface ModalCelebracionProps {
  nombre: string;
  bonoXp: number;
  imagen: string;
  onCerrar: () => void;
}

const FB_APP_ID = ""; // Opcional

function generarTextoCompartir(nombre: string, xp: number) {
  return crearPayloadCompartirInsignia({ nombreInsignia: nombre, xp }).text;
}

function compartirWhatsApp(nombre: string, xp: number) {
  const texto = encodeURIComponent(generarTextoCompartir(nombre, xp));
  const url = `https://wa.me/?text=${texto}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function compartirFacebook(nombre: string, xp: number) {
  const texto = encodeURIComponent(generarTextoCompartir(nombre, xp));
  const url = `https://www.facebook.com/sharer/sharer.php?quote=${texto}`;
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
}

function compartirTwitterX(nombre: string, xp: number) {
  const texto = encodeURIComponent(generarTextoCompartir(nombre, xp));
  const url = `https://twitter.com/intent/tweet?text=${texto}`;
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
}

export async function compartirConImagen(red: 'whatsapp' | 'facebook' | 'twitter' | 'native', nombre: string, xp: number, imagenUrl: string) {
  const texto = generarTextoCompartir(nombre, xp);
  try {
    const archivo = await crearTarjetaInsignia(nombre, imagenUrl);
    const puedeCompartir = typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [archivo] });
    
    if (puedeCompartir) {
      await navigator.share({
        title: `¡Insignia "${nombre}" en Semillas!`,
        text: texto,
        files: [archivo],
      });
      return true;
    } else {
      descargarTarjetaInsignia(archivo);
      if (red === 'whatsapp') compartirWhatsApp(nombre, xp);
      if (red === 'facebook') compartirFacebook(nombre, xp);
      if (red === 'twitter') compartirTwitterX(nombre, xp);
      return true;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return false;
    // Si falla la generación de imagen, intentar solo con texto
    if (red === 'whatsapp') compartirWhatsApp(nombre, xp);
    if (red === 'facebook') compartirFacebook(nombre, xp);
    if (red === 'twitter') compartirTwitterX(nombre, xp);
    if (red === 'native' && typeof navigator.share === "function") {
      navigator.share({ title: `¡Insignia "${nombre}"!`, text: texto }).catch((error) => {
        console.warn("No se pudo compartir la insignia de forma nativa:", error);
        toast.error("No se pudo abrir el compartir nativo.");
      });
    }
  }
  return false;
}

export const ModalCelebracion: React.FC<ModalCelebracionProps> = ({
  nombre,
  bonoXp,
  imagen,
  onCerrar,
}) => {
  const compartido = React.useRef(false);
  const [cargandoRed, setCargandoRed] = React.useState<string | null>(null);

  // Lanzar confetti al montar el modal
  React.useEffect(() => {
    const lanzar = () => {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { x: 0.5, y: 0.55 },
        colors: ["#16a34a", "#22c55e", "#facc15", "#ffffff", "#a3e635"],
        zIndex: 10000,
      });
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors: ["#16a34a", "#facc15"], zIndex: 10000 });
        confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors: ["#22c55e", "#a3e635"], zIndex: 10000 });
      }, 200);
    };
    lanzar();
    const timer = setTimeout(lanzar, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleCompartir = async (red: 'whatsapp' | 'facebook' | 'twitter' | 'native') => {
    if (compartido.current) return;
    setCargandoRed(red);
    const ok = await compartirConImagen(red, nombre, bonoXp, imagen);
    setCargandoRed(null);
    if (ok) compartido.current = true;
  };

  return (
    <div
      className="modal-celebracion__overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`¡Obtuviste la insignia ${nombre}!`}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="modal-celebracion__card">
        {/* Botón cerrar */}
        <button
          type="button"
          className="modal-celebracion__close"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Encabezado festivo */}
        <div className="modal-celebracion__header">
          <span className="modal-celebracion__emoji" aria-hidden="true"></span>
          <h2 className="modal-celebracion__titulo">¡Insignia desbloqueada!</h2>
          <p className="modal-celebracion__subtitulo">¡Felicitaciones! Has ganado una nueva insignia.</p>
        </div>

        {/* Imagen de la insignia */}
        <div className="modal-celebracion__insignia">
          <div className="modal-celebracion__insignia-ring">
            <img src={imagen} alt={nombre} className="modal-celebracion__insignia-img" />
          </div>
          <h3 className="modal-celebracion__nombre">{nombre}</h3>
          <span className="modal-celebracion__xp">✨ +{bonoXp} XP ganados</span>
        </div>

        {/* Compartir */}
        <div className="modal-celebracion__compartir">
          <p className="modal-celebracion__compartir-label">
            <Share2 size={14} aria-hidden="true" />
            Comparte tu logro
          </p>
          <div className="modal-celebracion__redes">
            {/* WhatsApp */}
            <button
              type="button"
              className="modal-celebracion__red modal-celebracion__red--whatsapp"
              onClick={() => void handleCompartir('whatsapp')}
              disabled={cargandoRed !== null}
              aria-label="Compartir en WhatsApp"
            >
              {cargandoRed === 'whatsapp' ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              )}
              WhatsApp
            </button>

            {/* Facebook */}
            <button
              type="button"
              className="modal-celebracion__red modal-celebracion__red--facebook"
              onClick={() => void handleCompartir('facebook')}
              disabled={cargandoRed !== null}
              aria-label="Compartir en Facebook"
            >
              {cargandoRed === 'facebook' ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              )}
              Facebook
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              className="modal-celebracion__red modal-celebracion__red--twitter"
              onClick={() => void handleCompartir('twitter')}
              disabled={cargandoRed !== null}
              aria-label="Compartir en X (Twitter)"
            >
              {cargandoRed === 'twitter' ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              )}
              X (Twitter)
            </button>

            {/* Compartir nativo (móvil) */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                type="button"
                className="modal-celebracion__red modal-celebracion__red--native"
                onClick={() => void handleCompartir('native')}
                disabled={cargandoRed !== null}
                aria-label="Más opciones para compartir"
              >
                {cargandoRed === 'native' ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={18} />}
                Más
              </button>
            )}
          </div>
        </div>

        {/* Botón cerrar principal */}
        <button
          type="button"
          className="modal-celebracion__btn-cerrar"
          onClick={onCerrar}
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
};
