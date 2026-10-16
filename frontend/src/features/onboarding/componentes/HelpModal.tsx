interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-[90%] max-w-[450px] p-8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]"
      >
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-xl font-extrabold text-[#512DA8] m-0 leading-tight">
            Preguntas Frecuentes
          </h3>
          <button
            onClick={onClose}
            className="bg-[#F5F5F5] border-none text-2xl leading-none w-8 h-8 rounded-full flex justify-center items-center text-[#5C5C5C] cursor-pointer"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>
        <div>
          <strong className="font-bold text-[#512DA8] block mb-1">¿Qué es el apodo?</strong>
          <p className="text-[15px] text-[#2E2E2E] leading-[1.65] mb-4">
            Es un nombre corto o sobrenombre que usaremos para llamarte dentro de la aplicación de manera amigable. Te sugerimos no usar tu nombre real completo para proteger tu privacidad.
          </p>
          <strong className="font-bold text-[#512DA8] block mb-1">¿Para qué sirve el avatar?</strong>
          <p className="text-[15px] text-[#2E2E2E] leading-[1.65] m-0">
            Tu avatar es el personaje que te representará en las actividades de Semillas. Elige el que más te guste o con el que más te identifiques.
          </p>
        </div>
      </div>
    </div>
  );
}
