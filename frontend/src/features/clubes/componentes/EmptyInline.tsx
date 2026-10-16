import type { ComponentType } from "react";
import { Trophy } from "lucide-react";
import { Boton } from "@/componentes/ui/boton";

interface EmptyInlineProps {
  icon?: ComponentType<{ size?: number }>;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyInline({ icon: Icon = Trophy, title, text, action }: EmptyInlineProps) {
  return (
    <div className="club-empty-inline">
      <Icon size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action ? (
        <Boton variante="violetaContorno" onClick={action.onClick}>
          {action.label}
        </Boton>
      ) : null}
    </div>
  );
}
