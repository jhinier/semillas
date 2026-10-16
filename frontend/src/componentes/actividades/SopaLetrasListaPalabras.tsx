interface SopaLetrasListaPalabrasProps {
  palabras: string[];
  foundWords: string[];
}

export function SopaLetrasListaPalabras({ palabras, foundWords }: SopaLetrasListaPalabrasProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {palabras.map((word) => (
        <div 
          key={word}
          className={`px-3 py-2 rounded-lg font-medium text-center border-2 transition-all ${
            foundWords.includes(word) 
              ? "bg-green-100 border-green-200 text-green-700 line-through decoration-2" 
              : "bg-white border-slate-200 text-slate-600"
          }`}
        >
          {word}
        </div>
      ))}
    </div>
  );
}
