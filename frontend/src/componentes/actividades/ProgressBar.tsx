interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex justify-between w-full mb-8 bg-blue-50 text-blue-800 font-bold px-5 py-3 rounded-xl text-sm">
      <span>Afirmación {current} de {total}</span>
    </div>
  );
}
