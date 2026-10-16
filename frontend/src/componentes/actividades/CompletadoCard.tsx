import { Check } from "lucide-react";

interface CompletadoCardProps {
  retroalimentacion?: string;
}

export function CompletadoCard({ retroalimentacion }: CompletadoCardProps) {
  return (
    <div className="w-full p-8 bg-green-50 rounded-3xl border-2 border-green-200 text-center animate-in zoom-in-95 mt-8 shadow-sm">
      <div className="flex justify-center mb-6 text-green-500">
        <div className="bg-white p-4 rounded-full shadow-md">
          <Check size={64} strokeWidth={3} />
        </div>
      </div>
      <h4 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">¡Excelente Trabajo!</h4>
      {retroalimentacion ? (
        <p className="text-green-700 text-lg sm:text-xl font-medium max-w-lg mx-auto">{retroalimentacion}</p>
      ) : (
        <p className="text-green-700 text-lg sm:text-xl font-medium">Has respondido todas las afirmaciones.</p>
      )}
    </div>
  );
}
