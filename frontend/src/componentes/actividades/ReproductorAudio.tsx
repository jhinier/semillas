import { useState, useRef, useCallback } from "react";
import { Play, Pause, Music } from "lucide-react";

interface ReproductorAudioProps {
  src: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTimeMs: number) => void;
}

export function ReproductorAudio({ src, onEnded, onTimeUpdate }: ReproductorAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercentage = clickX / rect.width;
    const newTime = newPercentage * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newPercentage * 100);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    if (dur > 0) {
      setProgress((current / dur) * 100);
      onTimeUpdate?.(current * 1000);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(100);
    onEnded?.();
  }, [onEnded]);

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-sm bg-[#FDF9EA] rounded-3xl overflow-hidden shadow-sm border border-amber-100 flex flex-col relative">
      <div className="w-full relative overflow-hidden bg-amber-50 group flex-1">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9EA] via-transparent to-transparent opacity-90" />
        <button
          onClick={togglePlay}
          className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-amber-600 z-10"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-amber-600" />
          ) : (
            <Play className="w-8 h-8 fill-amber-600 ml-1" />
          )}
        </button>
      </div>

      <div className="px-5 pb-5 pt-6 flex flex-col relative z-20 shrink-0">
        <div className="text-amber-700 font-bold tracking-[0.2em] text-xs uppercase mb-3 flex justify-between items-center">
          <span>Actividad Audio</span>
          <Music className={`w-4 h-4 ${isPlaying ? "animate-bounce" : ""}`} />
        </div>

        <div
          className="w-full mt-6 bg-amber-200/50 h-3 rounded-full overflow-hidden cursor-pointer group/progress relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-amber-500 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
}
