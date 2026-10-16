interface SopaLetrasInstruccionesProps {
  instruction: string;
}

export function SopaLetrasInstrucciones({ instruction }: SopaLetrasInstruccionesProps) {
  return (
    <div className="bg-orange-50 border-2 border-orange-200 text-orange-800 rounded-2xl p-4 flex flex-col text-center shadow-sm">
      <p className="text-sm leading-tight">
        <strong>{instruction}</strong>
      </p>
    </div>
  );
}
