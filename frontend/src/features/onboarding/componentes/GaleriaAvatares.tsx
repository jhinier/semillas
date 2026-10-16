const avatarIds = Array.from({ length: 10 }, (_, i) => i + 1);
const avatarBaseUrl = "https://api.dicebear.com/7.x/thumbs/svg?seed=";

interface GaleriaAvataresProps {
  seleccionadoId: string | null;
  onSelect: (id: string) => void;
}

export function GaleriaAvatares({ seleccionadoId, onSelect }: GaleriaAvataresProps) {
  return (
    <div className="grid grid-cols-[repeat(5,1fr)] gap-3 max-w-[400px] mx-auto">
      {avatarIds.map((id) => {
        const avatarKey = `avatar${id}`;
        const estaSeleccionado = seleccionadoId === avatarKey;
        return (
          <button
            key={avatarKey}
            onClick={() => onSelect(avatarKey)}
            className={`w-full aspect-square rounded-full border-2 cursor-pointer flex items-center justify-center p-1 overflow-hidden transition-all duration-200 ${
              estaSeleccionado
                ? "border-[3px] border-[#7E57C2] bg-[#EDE7F6]"
                : "border-2 border-[#e5e7eb] bg-white hover:border-[#7E57C2]/50"
            }`}
          >
            <img
              src={`${avatarBaseUrl}${avatarKey}`}
              alt={`Avatar ${id}`}
              className="w-full h-full object-contain"
            />
          </button>
        );
      })}
    </div>
  );
}
