import {
  DoorOpen,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";
import { ProgresoXpWidget } from "@/features/gamification/componentes/progreso-xp-widget";
import {
  useClubesPage,
  type VistaClub,
} from "@/features/clubes/hooks/use-clubes-page";
import "./clubes-page.css";

import { UnirseClubForm } from "@/features/clubes/componentes/unirse-club-form";
import { ClubSwitcher } from "./ClubSwitcher";
import { ClubHero } from "./ClubHero";
import { ResumenClub } from "./ResumenClub";
import { RankingClub } from "./RankingClub";
import { RetosClub } from "./RetosClub";
import { MiembrosClub } from "./MiembrosClub";
import { AjustesClub } from "./AjustesClub";
import { ClubInviteAside } from "./ClubInviteAside";
import { ClubesSkeleton } from "./ClubesSkeleton";
import { ClubesContentSkeleton } from "./ClubesContentSkeleton";
import { CrearClubCard } from "./CrearClubCard";
import { CrearClubModal } from "./CrearClubModal";
import { CrearRetoModal } from "./CrearRetoModal";
import { AgregarClubModal } from "./AgregarClubModal";
import { ReportarClubDialog } from "./reportar-club-dialog";

const VISTAS: Array<{ id: VistaClub; label: string; icon: typeof Trophy; soloLider?: boolean }> = [
  { id: "resumen", label: "Resumen", icon: Sparkles },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "retos", label: "Retos", icon: Target },
  { id: "miembros", label: "Miembros", icon: Users },
  { id: "ajustes", label: "Ajustes", icon: Settings, soloLider: true },
];

export function ClubesPage() {
  const page = useClubesPage();
  const detalle = page.detalleQuery.data;
  const club = detalle ?? page.club;
  const tabs = VISTAS.filter((item) => !item.soloLider || page.isLeader);

  if (page.clubesQuery.isLoading || page.meQuery.isLoading) {
    return <ClubesSkeleton />;
  }

  if (page.clubesQuery.isError) {
    return (
      <Card className="clubes-error-state" hoverEffect="none">
        <ShieldCheck size={38} aria-hidden="true" />
        <h2>No pudimos cargar tus clubes</h2>
        <p>Revisa tu conexión y vuelve a intentarlo.</p>
        <Boton onClick={() => page.clubesQuery.refetch()}>Reintentar</Boton>
      </Card>
    );
  }

  if (!club) {
    return (
      <div className="clubes-empty-layout">
        <section className="clubes-empty-hero">
          <span className="clubes-empty-hero__icon" aria-hidden="true"><Users size={34} /></span>
          <p className="clubes-eyebrow">Aprender en comunidad</p>
          <h2>Tu club empieza aquí</h2>
          <p>
            Únete con el código de tu iglesia, curso o familia. Los clubes muestran retos y progreso compartido,
            sin chat privado ni datos sensibles de los menores.
          </p>
          <div className="clubes-empty-hero__features" aria-label="Características de los clubes">
            <span><ShieldCheck size={17} /> Espacio protegido</span>
            <span><Target size={17} /> Retos cooperativos</span>
            <span><Trophy size={17} /> Progreso del grupo</span>
          </div>
        </section>

        <div className="clubes-empty-actions">
          <UnirseClubForm
            joinCode={page.joinCode}
            onCodeChange={page.setJoinCode}
            onSubmit={page.handleJoinClub}
            isSubmitting={page.joining}
          />
          <CrearClubCard
            isGuest={page.isGuest}
            onCreate={() => page.isGuest ? page.navigate({ to: "/app/perfil" }) : page.setShowCreate(true)}
          />
        </div>

        <ProgresoXpWidget
          {...page.xpInfo}
          onVerDetalles={() => page.navigate({ to: "/app/perfil" })}
        />

        {page.showCreate ? (
          <CrearClubModal
            pending={page.creating}
            onClose={() => page.setShowCreate(false)}
            onSubmit={page.createClub}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="clubes-page">
      <div className="clubes-page__topline">
        <ClubSwitcher
          clubs={page.clubes}
          activeId={club.id}
          onSelect={page.selectClub}
          onAdd={() => page.setShowCreate(true)}
        />
      </div>

      <ClubHero
        club={club}
        members={detalle?.members.length ?? club.member_count ?? 0}
        role={detalle?.membership.rol_miembro ?? club.rol_miembro ?? "miembro"}
        copied={page.copied}
        onCopy={page.handleCopyCode}
        onShare={page.handleShareCode}
      />

      <nav className="clubes-tabs" aria-label="Secciones del club">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = page.vista === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="clubes-tab"
              data-active={active}
              aria-current={active ? "page" : undefined}
              onClick={() => page.setVista(item.id)}
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="clubes-page__body">
        <main className="clubes-page__main">
          {page.detalleQuery.isLoading ? <ClubesContentSkeleton /> : null}
          {page.detalleQuery.isError ? (
            <Card className="clubes-inline-error" hoverEffect="none">
              <p>No pudimos abrir este club.</p>
              <Boton variante="violetaContorno" onClick={() => page.detalleQuery.refetch()}>Reintentar</Boton>
            </Card>
          ) : null}

          {detalle && page.vista === "resumen" ? (
            <ResumenClub
              retos={page.retosQuery.data ?? []}
              ranking={page.rankingQuery.data ?? []}
              onViewChallenges={() => page.setVista("retos")}
              onViewRanking={() => page.setVista("ranking")}
              onShare={page.handleShareCode}
            />
          ) : null}

          {detalle && page.vista === "ranking" ? (
            <RankingClub
              ranking={page.rankingQuery.data ?? []}
              loading={page.rankingQuery.isLoading}
            />
          ) : null}

          {detalle && page.vista === "retos" ? (
            <RetosClub
              retos={page.retosQuery.data ?? []}
              loading={page.retosQuery.isLoading}
              isLeader={page.isLeader}
              onCreate={() => page.setShowChallenge(true)}
              onClaim={page.claimChallenge}
              claiming={page.claimingChallenge}
            />
          ) : null}

          {detalle && page.vista === "miembros" ? (
            <MiembrosClub
              members={detalle.members}
              isLeader={page.isLeader}
              pending={page.actionPending}
              onRemove={(member) => {
                if (window.confirm(`¿Retirar a ${member.apodo} del club?`)) page.removeMember(member.miembro_token);
              }}
              onTransfer={(member) => {
                if (window.confirm(`¿Transferir el liderazgo a ${member.apodo}? Tú pasarás a ser miembro.`)) {
                  page.transferLeadership(member.miembro_token);
                }
              }}
              onReport={page.setReportingMember}
            />
          ) : null}

          {detalle && page.vista === "ajustes" && page.isLeader ? (
            <AjustesClub
              club={detalle}
              pending={page.actionPending || page.updating}
              onUpdate={page.updateClub}
              onRegenerate={() => {
                if (window.confirm("El código anterior dejará de funcionar. ¿Generar uno nuevo?")) page.regenerateCode();
              }}
              onArchive={() => {
                if (window.confirm("¿Archivar este club? Esta acción lo ocultará para todos.")) page.archiveClub();
              }}
            />
          ) : null}
        </main>

        <aside className="clubes-page__aside">
          <ProgresoXpWidget
            {...page.xpInfo}
            onVerDetalles={() => page.navigate({ to: "/app/perfil" })}
          />
          <ClubInviteAside
            club={club}
            onCopy={page.handleCopyCode}
            onShare={page.handleShareCode}
            copied={page.copied}
          />
          <button
            type="button"
            className="clubes-leave-button"
            disabled={page.actionPending}
            onClick={() => {
              if (window.confirm("¿Salir de este club? Tu progreso personal no se perderá.")) page.leaveClub();
            }}
          >
            <DoorOpen size={17} /> Salir del club
          </button>
        </aside>
      </div>

      {page.reportingMember ? (
        <ReportarClubDialog
          miembro={page.reportingMember}
          pendiente={page.reporting}
          onClose={() => page.setReportingMember(null)}
          onSubmit={page.reportMember}
        />
      ) : null}

      {page.showCreate ? (
        <AgregarClubModal
          isGuest={page.isGuest}
          joinCode={page.joinCode}
          joining={page.joining}
          creating={page.creating}
          onCodeChange={page.setJoinCode}
          onJoin={page.handleJoinClub}
          onCreate={page.createClub}
          onLinkAccount={() => page.navigate({ to: "/app/perfil" })}
          onClose={() => page.setShowCreate(false)}
        />
      ) : null}
      {page.showChallenge ? (
        <CrearRetoModal
          pending={page.challengePending}
          onClose={() => page.setShowChallenge(false)}
          onSubmit={page.createChallenge}
        />
      ) : null}
    </div>
  );
}
