import * as React from "react";
import { Award, ShieldCheck, Cpu, Database, Layout, Sparkles } from "lucide-react";

export interface PropiedadesVersionInfo {
  versionApp?: string;
  entorno?: "desarrollo" | "produccion" | "pruebas";
  fechaCompilacion?: string;
}

export const VersionInfo: React.FC<PropiedadesVersionInfo> = ({
  versionApp = "1.3.0",
  entorno = "desarrollo",
  fechaCompilacion = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}) => {
  const dependencias = [
    { nombre: "React", version: "Latest (v19)", icon: <Cpu className="size-4 text-sky-500" /> },
    { nombre: "Tailwind CSS", version: "v4.0 (Latest)", icon: <Sparkles className="size-4 text-teal-500" /> },
    { nombre: "TanStack Router", version: "v1.170.17", icon: <Layout className="size-4 text-emerald-500" /> },
    { nombre: "Dexie IndexedDB", version: "v4.4.4", icon: <Database className="size-4 text-indigo-500" /> },
    { nombre: "Storybook", version: "v10.4.6", icon: <Award className="size-4 text-pink-500" /> }
  ];

  return (
    <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Semillas Frontend</span>
          <h2 className="text-xl font-black text-slate-800 leading-none">Información del Sistema</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100">
            v{versionApp}
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Entorno</span>
          <span className="text-xs font-black text-slate-700 capitalize flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${entorno === 'produccion' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {entorno}
          </span>
        </div>
        <div className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Compilación</span>
          <span className="text-xs font-extrabold text-slate-700 truncate block">
            {fechaCompilacion}
          </span>
        </div>
      </div>

      {/* Tech Stack List */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Dependencias Clave</h3>
        <div className="flex flex-col gap-2">
          {dependencias.map((dep) => (
            <div key={dep.nombre} className="flex items-center justify-between p-2.5 bg-slate-50/30 hover:bg-slate-50/80 transition-colors rounded-xl border border-slate-100/50">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-white rounded-lg border border-slate-100/80 shadow-xs flex items-center justify-center">
                  {dep.icon}
                </span>
                <span className="text-xs font-extrabold text-slate-700">{dep.nombre}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{dep.version}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RLS / Security badge */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100/30">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
        <span>PWA con soporte offline y cifrado IndexedDB integrado.</span>
      </div>
    </div>
  );
};
