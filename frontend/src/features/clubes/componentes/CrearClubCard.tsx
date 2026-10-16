import { Plus } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";

interface CrearClubCardProps {
  isGuest: boolean;
  onCreate: () => void;
}

export function CrearClubCard({ isGuest, onCreate }: CrearClubCardProps) {
  return (
    <Card className="club-create-card" hoverEffect="none">
      <span><Plus size={25} /></span>
      <div>
        <p className="clubes-eyebrow">Organiza tu grupo</p>
        <h3>Crear un club</h3>
        <p>{isGuest ? "Vincula tu cuenta para crear y administrar un club." : "Ideal para una iglesia, curso o grupo familiar."}</p>
      </div>
      <Boton variante="violetaContorno" onClick={onCreate}>
        {isGuest ? "Vincular cuenta" : "Crear club"}
      </Boton>
    </Card>
  );
}
