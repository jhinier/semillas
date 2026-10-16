import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useNarracionPaso } from "../hooks/use-narracion-paso";

type NarradorPasoProps = { recursoAudioId?: string | null; habilitado: boolean };

export function NarradorPaso({ recursoAudioId, habilitado }: NarradorPasoProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const { src, estado } = useNarracionPaso(recursoAudioId, habilitado);

  useEffect(() => {
    setReproduciendo(false);
    setProgreso(0);
    audioRef.current?.pause();
  }, [src]);

  if (!recursoAudioId || !habilitado) return null;

  const alternar = async () => {
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
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgreso(0);
    void audio.play();
    setReproduciendo(true);
  };

  return (
    <section className="crecer-narrador" aria-label="Narración del paso">
      <audio ref={audioRef} src={src ?? undefined} preload="metadata" onEnded={() => setReproduciendo(false)} onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        setProgreso(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      }} />
      <Volume2 size={20} aria-hidden="true" />
      <div className="crecer-narrador__copy">
        <strong>Escucha este paso</strong>
        <span aria-live="polite">{estado === "cargando" ? "Preparando audio…" : estado === "error" ? "Audio no disponible ahora" : "Narración disponible"}</span>
        <progress value={progreso} max={100} aria-label="Progreso de la narración" />
      </div>
      <button type="button" onClick={() => void alternar()} disabled={!src || estado !== "lista"} aria-label={reproduciendo ? "Pausar narración" : "Reproducir narración"}>
        {reproduciendo ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <button type="button" onClick={reiniciar} disabled={!src || estado !== "lista"} aria-label="Reiniciar narración">
        <RotateCcw size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
