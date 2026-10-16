import { useEffect, useState } from "react";

export function CSSConfetti() {
  const [pieces, setPieces] = useState<number[]>([]);
  useEffect(() => {
    setPieces(Array.from({ length: 100 }).map((_, i) => i));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0.8; }
        }
      `}</style>
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const animationDuration = 2 + Math.random() * 3;
        const animationDelay = Math.random() * 1.5;
        const colors = ["#f59e0b", "#fbbf24", "#fcd34d", "#ffffff", "#43a047", "#60a5fa", "#f43f5e", "#ec4899", "#8b5cf6"];
        const bg = colors[Math.floor(Math.random() * colors.length)];
        const size = 0.5 + Math.random() * 1;
        const isCircle = Math.random() > 0.5;
        return (
          <div
            key={i}
            className="absolute shadow-sm"
            style={{
              left: `${left}vw`,
              top: `-10vh`,
              width: `${size}rem`,
              height: isCircle ? `${size}rem` : `${size * 1.5}rem`,
              backgroundColor: bg,
              borderRadius: isCircle ? '50%' : '2px',
              animation: `fall ${animationDuration}s ${animationDelay}s linear forwards`
            }}
          />
        );
      })}
    </div>
  );
}
