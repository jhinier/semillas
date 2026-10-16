interface AfirmacionCardProps {
  texto: string;
}

export function AfirmacionCard({ texto }: AfirmacionCardProps) {
  return (
    <div className="w-full mb-8 text-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-medium text-slate-800">
        "{texto}"
      </h3>
    </div>
  );
}
