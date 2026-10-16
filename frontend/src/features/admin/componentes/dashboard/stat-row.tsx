import type { ReactNode } from "react";

type StatRowProps = {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number;
  percentage: number;
};

export function StatRow({ icon, iconBg, label, value, percentage }: StatRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-slate-800">{value}</span>
        <span className="text-slate-400 text-[10px]">{percentage}%</span>
      </div>
    </div>
  );
}
