import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useNarracionPaso } from "../hooks/use-narracion-paso";

type NarradorPasoProps = {
  recursoAudioId?: string | null;
  textoNarracion?: string | null;
  tituloPaso?: string | null;
  habilitado: boolean;
};

export function NarradorPaso({
  recursoAudioId,
  textoNarracion,
  tituloPaso,
  habilitado,
}: NarradorPasoProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ttsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [pausadoTts, setPausadoTts] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const { src, estado } = useNarracionPaso(recursoAudioId, habilitado);

  const textoLimpio = (textoNarracion ?? "").replace(/\s+/g, " ").trim();
  const usarSintesisVoz = Boolean(
    habilitado && textoLimpio && (!recursoAudioId || estado === "error"),
  );

  const limpiarTts = useCallback(() => {
    if (ttsTimerRef.current) {
      clearInterval(ttsTimerRef.current);
      ttsTimerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    setReproduciendo(false);
    setPausadoTts(false);
    setProgreso(0);
    audioRef.current?.pause();
    limpiarTts();
    return () => {
      limpiarTts();
    };
  }, [src, textoLimpio, habilitado, limpiarTts]);

  if (!habilitado || (!recursoAudioId && !textoLimpio)) return null;

  const iniciarTts = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !textoLimpio) {
      return;
    }
    limpiarTts();

    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = "es-ES";
    utterance.rate = 0.96;
    utterance.pitch = 1.02;

    const voces = window.speechSynthesis.getVoices();
    const vozEspanol =
      voces.find((v) => v.lang.toLowerCase().startsWith("es-la") || v.lang.toLowerCase().startsWith("es-mx") || v.lang.toLowerCase().startsWith("es-ec")) ??
      voces.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (vozEspanol) {
      utterance.voice = vozEspanol;
    }

    const duracionEstimadaMs = Math.max(3000, textoLimpio.length * 62);
    const inicioMs = Date.now();

    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number" && textoLimpio.length > 0) {
        const pct = Math.min(99, Math.round((event.charIndex / textoLimpio.length) * 100));
        setProgreso(pct);
      }
    };

    utterance.onend = () => {
      if (ttsTimerRef.current) {
        clearInterval(ttsTimerRef.current);
        ttsTimerRef.current = null;
      }
      setProgreso(100);
      setReproduciendo(false);
      setPausadoTts(false);
    };

    utterance.onerror = () => {
      if (ttsTimerRef.current) {
        clearInterval(ttsTimerRef.current);
        ttsTimerRef.current = null;
      }
      setReproduciendo(false);
      setPausadoTts(false);
    };

    ttsTimerRef.current = setInterval(() => {
      if (window.speechSynthesis.paused) return;
      const transcurrido = Date.now() - inicioMs;
      const estimado = Math.min(95, Math.round((transcurrido / duracionEstimadaMs) * 100));
      setProgreso((actual) => Math.max(actual, estimado));
    }, 250);

    setProgreso(0);
    setPausadoTts(false);
    setReproduciendo(true);
    window.speechSynthesis.speak(utterance);
  };

  const alternar = async () => {
    if (usarSintesisVoz) {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (reproduciendo) {
        window.speechSynthesis.pause();
        setReproduciendo(false);
        setPausadoTts(true);
      } else if (pausadoTts && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setReproduciendo(true);
        setPausadoTts(false);
      } else {
        iniciarTts();
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio || !src) return;
    if (audio.paused) {
      await audio.play();
      setReproduciendo(true);
    } else {
      audio.pause();
      setReproduciendo(false);
    }
  };

  const reiniciar = () => {
    if (usarSintesisVoz) {
      iniciarTts();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgreso(0);
    void audio.play();
    setReproduciendo(true);
  };

  const puedeReproducir = usarSintesisVoz || Boolean(src && estado === "lista");
  const estadoTexto = usarSintesisVoz
    ? reproduciendo
      ? "Relatando historia en voz alta…"
      : pausadoTts
        ? "Narración en pausa"
        : "Narración en audio lista para escuchar"
    : estado === "cargando"
      ? "Preparando audio…"
      : estado === "error"
        ? "Audio no disponible ahora"
        : "Narración disponible";

  return (
    <section className="crecer-narrador" aria-label="Narración del paso">
      <audio
        ref={audioRef}
        src={src ?? undefined}
        preload="metadata"
        onEnded={() => {
          setReproduciendo(false);
          setProgreso(100);
        }}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setProgreso(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
        }}
      />
      <Volume2 size={20} aria-hidden="true" />
      <div className="crecer-narrador__copy">
        <strong>{tituloPaso || "Escucha este paso"}</strong>
        <span aria-live="polite">{estadoTexto}</span>
        <progress value={progreso} max={100} aria-label="Progreso de la narración" />
      </div>
      <button
        type="button"
        onClick={() => void alternar()}
        disabled={!puedeReproducir}
        aria-label={reproduciendo ? "Pausar narración" : "Reproducir narración"}
        title={reproduciendo ? "Pausar audio" : "Escuchar audio"}
      >
        {reproduciendo ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={reiniciar}
        disabled={!puedeReproducir}
        aria-label="Reiniciar narración"
        title="Reiniciar audio"
      >
        <RotateCcw size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
