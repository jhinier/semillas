import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { unirClases } from "@/lib/utilidades";

const variantesCard = cva(
  "rounded-2xl border border-slate-100 bg-white text-slate-900 transition-all duration-200 ease-in-out",
  {
    variants: {
      sombra: {
        sm: "shadow-[0_2px_8px_rgba(15,23,42,0.06)]",
        md: "shadow-[0_8px_24px_rgba(15,23,42,0.10)]",
        lg: "shadow-[0_16px_40px_rgba(15,23,42,0.14)]",
      },
      hoverEffect: {
        none: "",
        elevate: "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.14)]",
      },
    },
    defaultVariants: {
      sombra: "sm",
      hoverEffect: "elevate",
    },
  }
);

export interface PropiedadesCard
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variantesCard> {
  clase?: string;
}

export const Card = React.forwardRef<HTMLDivElement, PropiedadesCard>(
  ({ sombra, hoverEffect, clase, className, children, ...propiedades }, referencia) => {
    return (
      <div
        ref={referencia}
        className={unirClases(variantesCard({ sombra, hoverEffect }), className, clase)}
        {...propiedades}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={unirClases("flex flex-col space-y-1.5 p-4 sm:p-5", className)} {...props}>
    {children}
  </div>
);
CardHeader.displayName = "CardHeader";

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={unirClases("text-sm font-extrabold text-slate-800 leading-none sm:text-base", className)} {...props}>
    {children}
  </h3>
);
CardTitle.displayName = "CardTitle";

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={unirClases("text-[11px] text-slate-400 font-semibold sm:text-xs", className)} {...props}>
    {children}
  </p>
);
CardDescription.displayName = "CardDescription";

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={unirClases("p-4 pt-0 text-xs sm:p-5", className)} {...props}>
    {children}
  </div>
);
CardContent.displayName = "CardContent";

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={unirClases("flex items-center p-4 pt-0 sm:p-5", className)} {...props}>
    {children}
  </div>
);
CardFooter.displayName = "CardFooter";
