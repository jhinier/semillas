import { cva, type VariantProps } from "class-variance-authority";

export type VarianteBoton =
  | "primario"
  | "exito"
  | "secundario"
  | "contorno"
  | "texto"
  | "peligro"
  | "peligroContorno"
  | "violeta"
  | "violetaContorno";

export type TamanoBoton =
  | "grande"
  | "mediano"
  | "pequeno"
  | "adaptativo"
  | "icono"
  | "iconoPequeno"
  | "iconoAdaptativo"
  | "icon-lg"
  | "icon-responsive"
  | "icon-sm";

export type FormaBoton = "normal" | "pildora" | "cuadrado";

export type EstadoVisualBoton = "normal" | "encima" | "presionado";

const variantesBoton = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-bold leading-none select-none whitespace-nowrap",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variante: {
        primario: [
          "bg-[#6C3AED] text-white",
          "shadow-[0_2px_8px_rgba(108,58,237,0.20)]",
          "hover:bg-[#5B30C8]",
          "active:bg-[#3B1FA3]",
          "focus-visible:ring-violet-500",
          "disabled:bg-violet-200 disabled:text-violet-300 disabled:shadow-none",
        ],
        exito: [
          "bg-primario-oscuro-max text-white",
          "shadow-[0_2px_8px_rgba(27,94,32,0.25)]",
          "hover:bg-primario-oscuro",
          "active:bg-verde-profundo",
          "focus-visible:ring-green-500",
          "disabled:bg-green-200 disabled:text-green-600 disabled:shadow-none",
        ],
        secundario: [
          "bg-violet-50 text-violet-700",
          "hover:bg-violet-100",
          "active:bg-violet-200",
          "focus-visible:ring-violet-400",
          "disabled:bg-slate-50 disabled:text-slate-300",
        ],
        contorno: [
          "border border-violet-500 bg-white text-violet-700",
          "hover:bg-violet-50",
          "active:bg-violet-100",
          "focus-visible:ring-violet-500",
          "disabled:border-slate-300 disabled:bg-white disabled:text-slate-300",
        ],
        texto: [
          "bg-transparent text-violet-700 shadow-none",
          "hover:bg-violet-50 hover:text-violet-900",
          "active:bg-violet-100",
          "focus-visible:ring-violet-400",
          "disabled:bg-transparent disabled:text-slate-300",
        ],
        peligro: [
          "bg-gradient-to-br from-red-500 to-red-600 text-white",
          "shadow-[0_4px_10px_rgba(239,68,68,0.16)]",
          "hover:from-red-600 hover:to-red-700",
          "active:from-red-700 active:to-red-900",
          "focus-visible:ring-red-500",
          "disabled:bg-none disabled:bg-red-100 disabled:text-red-500 disabled:shadow-none",
        ],
        peligroContorno: [
          "border border-red-400 bg-white text-red-500",
          "hover:bg-red-50",
          "active:bg-red-100",
          "focus-visible:ring-red-500",
          "disabled:border-red-100 disabled:bg-red-50 disabled:text-red-300",
        ],
        violeta: [
          "bg-[#7E57C2] text-white",
          "shadow-[0_2px_8px_rgba(126,87,194,0.25)]",
          "hover:bg-[#6A4BBF]",
          "active:bg-[#5A3CAF]",
          "focus-visible:ring-violet-400",
          "disabled:bg-violet-200 disabled:text-violet-300 disabled:shadow-none",
        ],
        violetaContorno: [
          "border border-[#7E57C2] bg-white text-[#7E57C2]",
          "hover:bg-violet-50",
          "active:bg-violet-100",
          "focus-visible:ring-violet-400",
          "disabled:border-slate-300 disabled:bg-white disabled:text-slate-300",
        ],
      },
      tamano: {
        grande: "h-14 px-7 text-base rounded-2xl",
        mediano: "h-11 px-5 text-sm rounded-xl",
        pequeno: "h-9 px-4 text-xs rounded-lg",
        adaptativo: "h-10 px-4 text-sm rounded-xl sm:h-11 sm:px-5 sm:text-sm",
        icono: "h-11 w-11 p-0 rounded-xl",
        iconoPequeno: "h-9 w-9 p-0 rounded-lg",
        iconoAdaptativo: "h-10 w-10 p-0 rounded-xl sm:h-11 sm:w-11",
        "icon-lg": "h-10 w-10 p-0 rounded-md",
        "icon-responsive": "h-8 w-8 p-0 rounded-md sm:h-9 sm:w-9",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
      },
      forma: {
        normal: "",
        pildora: "rounded-full",
        cuadrado: "rounded-xl",
      },
      anchoCompleto: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variante: "primario",
      tamano: "mediano",
      forma: "normal",
      anchoCompleto: false,
    },
  },
);

const clasesEstadoVisual: Record<
  VarianteBoton,
  Partial<Record<EstadoVisualBoton, string>>
> = {
  primario: {
    encima: "!bg-[#5B30C8]",
    presionado: "!bg-[#3B1FA3] scale-[0.98]",
  },
  exito: {
    encima: "!bg-primario-oscuro",
    presionado: "!bg-verde-profundo scale-[0.98]",
  },
  secundario: {
    encima: "!bg-violet-100",
    presionado: "!bg-violet-200 scale-[0.98]",
  },
  contorno: {
    encima: "!bg-violet-50",
    presionado: "!bg-violet-100 scale-[0.98]",
  },
  texto: {
    encima: "!bg-violet-50 !text-violet-900",
    presionado: "!bg-violet-100 scale-[0.98]",
  },
  peligro: {
    encima: "!from-red-600 !to-red-700",
    presionado: "!from-red-700 !to-red-900 scale-[0.98]",
  },
  peligroContorno: {
    encima: "!bg-red-50",
    presionado: "!bg-red-100 scale-[0.98]",
  },
  violeta: {
    encima: "!bg-[#6A4BBF]",
    presionado: "!bg-[#5A3CAF] scale-[0.98]",
  },
  violetaContorno: {
    encima: "!bg-violet-50",
    presionado: "!bg-violet-100 scale-[0.98]",
  },
};

export { variantesBoton, clasesEstadoVisual };
export type VariantPropsBoton = VariantProps<typeof variantesBoton>;
