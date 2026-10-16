import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import type { CrearClubInput } from "@/features/clubes/hooks/use-clubes-page";
import { Boton } from "@/componentes/ui/boton";
import { Modal } from "./Modal";
import { UnirseClubForm } from "@/features/clubes/componentes/unirse-club-form";
import { CrearClubInline } from "./CrearClubInline";

interface AgregarClubModalProps {
  isGuest: boolean;
  joinCode: string;
  joining: boolean;
  creating: boolean;
  onCodeChange: (value: string) => void;
  onJoin: (event: FormEvent) => void;
  onCreate: (data: CrearClubInput) => void;
  onLinkAccount: () => void;
  onClose: () => void;
}

export function AgregarClubModal({
  isGuest,
  joinCode,
  joining,
  creating,
  onCodeChange,
  onJoin,
  onCreate,
  onLinkAccount,
  onClose,
}: AgregarClubModalProps) {
  const [mode, setMode] = useState<"join" | "create">("join");
  return (
    <Modal
      title="Agregar un club"
      subtitle="Únete con un código o crea un espacio para tu grupo."
      onClose={onClose}
    >
      <div className="club-modal-tabs" role="tablist" aria-label="Opciones para agregar club">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "join"}
          data-active={mode === "join"}
          onClick={() => setMode("join")}
        >
          Unirme
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "create"}
          data-active={mode === "create"}
          onClick={() => setMode("create")}
        >
          Crear
        </button>
      </div>
      {mode === "join" ? (
        <UnirseClubForm joinCode={joinCode} onCodeChange={onCodeChange} onSubmit={onJoin} isSubmitting={joining} />
      ) : isGuest ? (
        <div className="club-link-account-prompt">
          <LockKeyhole size={30} aria-hidden="true" />
          <h3>Vincula tu cuenta para crear</h3>
          <p>Así podrás administrar miembros, retos y el código de invitación sin perder el club.</p>
          <Boton variante="violeta" onClick={onLinkAccount}>Vincular cuenta</Boton>
        </div>
      ) : (
        <CrearClubInline pending={creating} onSubmit={onCreate} onCancel={onClose} />
      )}
    </Modal>
  );
}
