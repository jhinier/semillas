import * as React from "react";
import { unirClases } from "@/lib/utilidades";

type AvatarEmojiProps = {
  emoji: string;
  className?: string;
};

export function AvatarEmoji({ emoji, className }: AvatarEmojiProps) {
  return (
    <div
      className={unirClases(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 ring-2 ring-white",
        className,
      )}
    >
      <span>{emoji}</span>
    </div>
  );
}
