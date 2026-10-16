import { Plus, Target } from "lucide-react";
import type { RetoCooperativo } from "@/features/clubes/clubes.api";
import { Boton } from "@/componentes/ui/boton";
import { EmptyInline } from "./EmptyInline";
import { ChallengeCard } from "./ChallengeCard";
import { ClubesContentSkeleton } from "./ClubesContentSkeleton";

interface RetosClubProps {
  retos: RetoCooperativo[];
  loading: boolean;
  isLeader: boolean;
  onCreate: () => void;
  onClaim?: (retoId: string) => void;
  claiming?: boolean;
}

export function RetosClub({ retos, loading, isLeader, onCreate, onClaim = () => undefined, claiming = false }: RetosClubProps) {
  return (
    <section className="club-section-card">
      <header>
        <div>
          <span className="clubes-eyebrow">Metas compartidas</span>
          <h2>Retos cooperativos</h2>
          <p>Cada aporte cuenta. Al completar la meta, cada miembro puede reclamar una vez su recompensa.</p>
        </div>
        {isLeader ? (
          <Boton variante="violeta" onClick={onCreate} iconoIzquierdo={<Plus size={17} />}>
            Crear reto
          </Boton>
        ) : (
          <Target size={31} />
        )}
      </header>
      {loading ? (
        <ClubesContentSkeleton />
      ) : (
        <div className="club-challenges-grid">
          {retos.map((reto) => (
            <ChallengeCard key={reto.id} reto={reto} onClaim={onClaim} claiming={claiming} />
          ))}
          {retos.length === 0 ? (
            <EmptyInline
              icon={Target}
              title="Todavía no hay retos"
              text={isLeader ? "Crea una meta sencilla para comenzar a colaborar." : "El líder del club podrá publicar el primer reto."}
              action={isLeader ? { label: "Crear reto", onClick: onCreate } : undefined}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
