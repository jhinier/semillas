import { Lock } from "lucide-react";
import { useState } from "react";
import defaultTemaImg from "@/assets/images/temas/default-tema.webp";

type PropsIlustracion = {
  esSendaPadre: boolean;
  esSendaHijo: boolean;
  esSendaEspiritu: boolean;
  esError: boolean;
  esBloqueada: boolean;
  imagenUrl?: string;
  titulo: string;
};

export function IlustracionCard({
  esError,
  esBloqueada,
  esSendaPadre,
  esSendaHijo,
  esSendaEspiritu,
  imagenUrl,
  titulo,
}: PropsIlustracion) {
  const [imagenError, setImagenError] = useState(false);

  if (esError) return <ErrorIllustration />;
  if (esBloqueada) return <BloqueadaIllustration />;
  if (imagenUrl && !imagenError) {
    return (
      <img
        src={imagenUrl}
        alt={titulo}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setImagenError(true)}
      />
    );
  }
  if (imagenUrl && imagenError) {
    return <img src={defaultTemaImg} alt={titulo} className="w-full h-full object-cover" />;
  }
  if (esSendaPadre) return <SendaPadreIllustration />;
  if (esSendaHijo) return <SendaHijoIllustration />;
  return <SendaEspirituIllustration />;
}

function ErrorIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <rect width="200" height="120" fill="#FEE2E2" />
      <path d="M 70 80 Q 60 70 65 55 Q 75 40 95 45 Q 105 35 120 40 Q 135 35 140 50 Q 150 65 135 80 Z" fill="#FCA5A5" />
      <circle cx="95" cy="60" r="2.5" fill="#EF4444" />
      <circle cx="110" cy="60" r="2.5" fill="#EF4444" />
      <path d="M 100 70 Q 102.5 67 105 70" stroke="#EF4444" strokeWidth="2" fill="none" />
    </svg>
  );
}

function BloqueadaIllustration() {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 200 120" className="w-full h-full grayscale opacity-50">
        <rect width="200" height="120" fill="#E2E8F0" />
        <path d="M 40 120 L 40 70 L 60 70 L 60 50 L 80 50 L 80 70 L 120 70 L 120 50 L 140 50 L 140 70 L 160 70 L 160 120 Z" fill="#94A3B8" />
        <rect x="90" y="85" width="20" height="35" rx="4" fill="#64748B" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
        <span className="p-3 bg-white rounded-full shadow-md text-slate-500">
          <Lock className="size-5 stroke-[2.5]" />
        </span>
      </div>
    </div>
  );
}

function SendaPadreIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <rect width="200" height="120" fill="#E0F2FE" />
      <path d="M 0 95 Q 50 65 100 95 Q 150 115 200 100 L 200 120 L 0 120 Z" fill="#86EFAC" />
      <path d="M 0 105 Q 100 85 200 105 L 200 120 L 0 120 Z" fill="#4ADE80" />
      <path d="M 60 85 L 140 85 L 130 105 L 70 105 Z" fill="#B45309" />
      <rect x="80" y="68" width="40" height="18" rx="2" fill="#78350F" />
      <polygon points="100,50 85,68 115,68" fill="#D97706" />
    </svg>
  );
}

function SendaHijoIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <rect width="200" height="120" fill="#FAF5FF" />
      <path d="M 0 90 Q 100 70 200 90 L 200 120 L 0 120 Z" fill="#4ADE80" />
      <circle cx="100" cy="120" r="50" fill="#FEF08A" opacity="0.3" />
      <circle cx="100" cy="65" r="10" fill="#FDBA74" />
      <path d="M 90 75 L 110 75 L 105 100 L 95 100 Z" fill="#3B82F6" />
      <circle cx="75" cy="78" r="7" fill="#FDBA74" />
      <path d="M 68 85 L 82 85 L 80 100 L 70 100 Z" fill="#EF4444" />
      <circle cx="125" cy="78" r="7" fill="#FDBA74" />
      <path d="M 118 85 L 132 85 L 130 100 L 120 100 Z" fill="#10B981" />
    </svg>
  );
}

function SendaEspirituIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <rect width="200" height="120" fill="#FEF3C7" />
      <path d="M 20 40 Q 60 20 100 40 Q 140 60 180 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M 10 70 Q 50 50 90 70 Q 130 90 170 70" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M 85 55 Q 100 25 115 55 Q 130 65 100 80 Q 70 65 85 55 Z" fill="#FFFFFF" />
      <path d="M 100 40 L 95 55 L 105 55 Z" fill="#FFFFFF" />
      <path d="M 97 88 Q 100 80 103 88 Q 105 95 100 95 Q 95 95 97 88 Z" fill="#EF4444" />
    </svg>
  );
}
