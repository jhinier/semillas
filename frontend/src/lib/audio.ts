import iniciarSoundUrl from '../assets/Sonidos/iniciar_actividad.mp3';
import siguienteSoundUrl from '../assets/Sonidos/siguiente_fase.mp3';
import acertadoSoundUrl from '../assets/Sonidos/acertado_quiz.mp3';
import errorSoundUrl from '../assets/Sonidos/error_quiz.mp3';
import insigniaSoundUrl from '../assets/Sonidos/insignia.mp3';

type TipoSonido = 'iniciar' | 'siguiente' | 'acertado' | 'error' | 'insignia';

function crearAudio(url: string): HTMLAudioElement | null {
  return typeof Audio === 'undefined' ? null : new Audio(url);
}

// Pre-cargar los sonidos para evitar delay al hacer clic en navegadores compatibles.
const audioCache = {
  iniciar: crearAudio(iniciarSoundUrl),
  siguiente: crearAudio(siguienteSoundUrl),
  acertado: crearAudio(acertadoSoundUrl),
  error: crearAudio(errorSoundUrl),
  insignia: crearAudio(insigniaSoundUrl),
};

// Ajustar el volumen por defecto de todos los sonidos (0.0 a 1.0)
const VOLUMEN_POR_DEFECTO = 0.4;
Object.values(audioCache).forEach((audio) => {
  if (audio) audio.volume = VOLUMEN_POR_DEFECTO;
});

export const playSound = async (type: TipoSonido): Promise<void> => {
  try {
    const audioEnabled = typeof window === 'undefined' || window.localStorage.getItem('semillas-prefiere-audio') !== 'false';
    if (!audioEnabled) return;
    const audio = audioCache[type];
    if (audio) {
      audio.currentTime = 0;
      try {
        await audio.play();
      } catch (e) {
        console.error("Error playing audio", e);
      }
    }
  } catch (e) {
    console.error("Audio playback error", e);
  }
};
