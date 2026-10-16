import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { obtenerGamificacionPropia } from "../../gamification/gamification.api";
import { obtenerMiPerfil } from "../../perfil/profile.api";
import {
  actualizarClub,
  archivarClub,
  crearClub,
  crearRetoCooperativo,
  listarMisClubes,
  listarRetosClub,
  obtenerClub,
  obtenerRankingClub,
  quitarMiembroClub,
  reclamarRecompensaReto,
  reportarEnClub,
  regenerarCodigoClub,
  salirDeClub,
  transferirLiderazgoClub,
  unirseAClub,
  type CodigoMetricaReto,
  type MiembroClub,
  type CategoriaReporteClub,
} from "../clubes.api";

export type VistaClub = "resumen" | "ranking" | "retos" | "miembros" | "ajustes";

export type CrearClubInput = { nombre: string; descripcion?: string };
export type CrearRetoInput = {
  nombre: string;
  descripcion?: string;
  codigo_metrica: CodigoMetricaReto;
  valor_objetivo: number;
  xp_reto?: number;
  fecha_inicio: string;
  fecha_fin: string;
};

const STORAGE_CLUB = "semillas-club-activo";

export function useClubesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(() => localStorage.getItem(STORAGE_CLUB));
  const [vista, setVista] = useState<VistaClub>("resumen");
  const [showCreate, setShowCreate] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [reportingMember, setReportingMember] = useState<MiembroClub | null>(null);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: obtenerMiPerfil, staleTime: 1000 * 60 * 5 });
  const clubesQuery = useQuery({ queryKey: ["clubs", "mine"], queryFn: listarMisClubes });
  const clubes = clubesQuery.data ?? [];

  useEffect(() => {
    if (clubes.length === 0) {
      setSelectedClubId(null);
      localStorage.removeItem(STORAGE_CLUB);
      return;
    }
    if (!selectedClubId || !clubes.some((club) => club.id === selectedClubId)) {
      setSelectedClubId(clubes[0]!.id);
      localStorage.setItem(STORAGE_CLUB, clubes[0]!.id);
    }
  }, [clubes, selectedClubId]);

  const selectClub = useCallback((id: string) => {
    setSelectedClubId(id);
    setVista("resumen");
    localStorage.setItem(STORAGE_CLUB, id);
  }, []);

  const club = clubes.find((item) => item.id === selectedClubId) ?? null;
  const detalleQuery = useQuery({
    queryKey: ["clubs", selectedClubId, "detail"],
    queryFn: () => obtenerClub(selectedClubId!),
    enabled: Boolean(selectedClubId),
  });
  const rankingQuery = useQuery({
    queryKey: ["clubs", selectedClubId, "ranking"],
    queryFn: () => obtenerRankingClub(selectedClubId!),
    enabled: Boolean(selectedClubId),
  });
  const retosQuery = useQuery({
    queryKey: ["clubs", selectedClubId, "challenges"],
    queryFn: () => listarRetosClub(selectedClubId!),
    enabled: Boolean(selectedClubId),
  });
  const gamificationQuery = useQuery({ queryKey: ["gamification", "me"], queryFn: obtenerGamificacionPropia, staleTime: 1000 * 60 * 3 });

  const invalidateClub = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["clubs"] }),
      queryClient.invalidateQueries({ queryKey: ["gamification"] }),
    ]);
  }, [queryClient]);

  const unirMutation = useMutation({
    mutationFn: (codigo: string) => unirseAClub({ codigo_acceso: codigo }),
    onSuccess: async (resultado) => {
      setJoinCode("");
      setShowCreate(false);
      await invalidateClub();
      selectClub(resultado.club.id);
      toast.success(resultado.ya_era_miembro ? "Ya pertenecías a este club" : "Te uniste al club");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo unir al club"),
  });

  const crearMutation = useMutation({
    mutationFn: crearClub,
    onSuccess: async (nuevo) => {
      setShowCreate(false);
      await invalidateClub();
      selectClub(nuevo.id);
      toast.success("Club creado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo crear el club"),
  });

  const actualizarMutation = useMutation({
    mutationFn: (datos: CrearClubInput) => actualizarClub(selectedClubId!, datos),
    onSuccess: async () => {
      await invalidateClub();
      toast.success("Club actualizado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo actualizar el club"),
  });

  const regenerarMutation = useMutation({
    mutationFn: () => regenerarCodigoClub(selectedClubId!),
    onSuccess: async () => {
      await invalidateClub();
      toast.success("Código de invitación renovado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo renovar el código"),
  });

  const salirMutation = useMutation({
    mutationFn: () => salirDeClub(selectedClubId!),
    onSuccess: async () => {
      localStorage.removeItem(STORAGE_CLUB);
      setSelectedClubId(null);
      await invalidateClub();
      toast.success("Saliste del club");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo salir del club"),
  });

  const archivarMutation = useMutation({
    mutationFn: () => archivarClub(selectedClubId!),
    onSuccess: async () => {
      localStorage.removeItem(STORAGE_CLUB);
      setSelectedClubId(null);
      await invalidateClub();
      toast.success("Club archivado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo archivar el club"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (miembroToken: string) => quitarMiembroClub(selectedClubId!, miembroToken),
    onSuccess: async () => {
      await invalidateClub();
      toast.success("Miembro retirado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo retirar al miembro"),
  });

  const transferMutation = useMutation({
    mutationFn: (miembroToken: string) => transferirLiderazgoClub(selectedClubId!, miembroToken),
    onSuccess: async () => {
      await invalidateClub();
      setVista("resumen");
      toast.success("Liderazgo transferido");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo transferir el liderazgo"),
  });

  const challengeMutation = useMutation({
    mutationFn: (datos: CrearRetoInput) => crearRetoCooperativo(selectedClubId!, datos),
    onSuccess: async () => {
      setShowChallenge(false);
      await queryClient.invalidateQueries({ queryKey: ["clubs", selectedClubId, "challenges"] });
      toast.success("Reto creado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo crear el reto"),
  });

  const claimChallengeMutation = useMutation({
    mutationFn: (retoId: string) => reclamarRecompensaReto(selectedClubId!, retoId),
    onSuccess: async (resultado) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clubs", selectedClubId, "challenges"] }),
        queryClient.invalidateQueries({ queryKey: ["gamification"] }),
      ]);
      toast.success(resultado.ya_reclamada ? "Ya habías reclamado esta recompensa" : `Ganaste ${resultado.xp_otorgada} XP`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo reclamar la recompensa"),
  });

  const reportMutation = useMutation({
    mutationFn: (datos: { miembro_token: string; categoria: CategoriaReporteClub; detalle?: string }) => reportarEnClub(selectedClubId!, datos),
    onSuccess: () => {
      setReportingMember(null);
      toast.success("Reporte enviado para revisión");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo enviar el reporte"),
  });

  const xpInfo = useMemo(() => {
    const nivel = gamificationQuery.data?.nivel;
    const reglas = [...(gamificationQuery.data?.reglas_nivel ?? [])].sort((a, b) => a.xp_minima - b.xp_minima);
    const xpTotal = nivel?.xp_total ?? 0;
    const actualIndex = Math.max(0, reglas.findLastIndex((regla) => regla.xp_minima <= xpTotal));
    const actual = reglas[actualIndex];
    const siguiente = reglas[actualIndex + 1];
    const base = actual?.xp_minima ?? 0;
    const meta = siguiente?.xp_minima ?? base;
    const tramo = Math.max(1, meta - base);
    const porcentaje = siguiente ? Math.min(100, Math.round(((xpTotal - base) / tramo) * 100)) : 100;
    return {
      xpTotal,
      numNivel: nivel?.numero_nivel ?? actual?.numero_nivel ?? 1,
      nombreNivel: nivel?.nombre_nivel || actual?.nombre || "Brote",
      porcentaje,
      xpRestantes: siguiente ? Math.max(0, siguiente.xp_minima - xpTotal) : 0,
      nombreSiguienteNivel: siguiente?.nombre ?? null,
      esNivelMaximo: !siguiente,
    };
  }, [gamificationQuery.data]);

  const copiarTexto = useCallback(async (texto: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
    } else {
      const area = document.createElement("textarea");
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCopyCode = useCallback(() => {
    const selected = detalleQuery.data ?? club;
    if (!selected) return;
    void copiarTexto(selected.codigo_invitacion).then(() => toast.success("Código copiado"));
  }, [club, copiarTexto, detalleQuery.data]);

  const handleShareCode = useCallback(() => {
    const selected = detalleQuery.data ?? club;
    if (!selected) return;
    const texto = `Únete a ${selected.nombre} en Semillas con el código ${selected.codigo_invitacion}.`;
    if (navigator.share) {
      void navigator.share({ title: selected.nombre, text: texto }).catch(() => undefined);
      return;
    }
    void copiarTexto(texto).then(() => toast.success("Invitación copiada"));
  }, [club, copiarTexto, detalleQuery.data]);

  const handleJoinClub = useCallback((e: FormEvent) => {
    e.preventDefault();
    const codigo = joinCode.trim().toUpperCase();
    if (!codigo || unirMutation.isPending) return;
    unirMutation.mutate(codigo);
  }, [joinCode, unirMutation]);

  return {
    copied,
    joinCode,
    setJoinCode,
    clubes,
    club,
    selectedClubId,
    selectClub,
    vista,
    setVista,
    showCreate,
    setShowCreate,
    showChallenge,
    setShowChallenge,
    reportingMember,
    setReportingMember,
    clubesQuery,
    detalleQuery,
    rankingQuery,
    retosQuery,
    gamificationQuery,
    meQuery,
    xpInfo,
    isGuest: meQuery.data?.usuario?.proveedor === "invitado",
    isLeader: ["lider", "propietario"].includes(detalleQuery.data?.membership.rol_miembro ?? club?.rol_miembro ?? ""),
    joining: unirMutation.isPending,
    creating: crearMutation.isPending,
    updating: actualizarMutation.isPending,
    actionPending:
      regenerarMutation.isPending || salirMutation.isPending || archivarMutation.isPending ||
      removeMemberMutation.isPending || transferMutation.isPending,
    challengePending: challengeMutation.isPending,
    claimingChallenge: claimChallengeMutation.isPending,
    reporting: reportMutation.isPending,
    createClub: (datos: CrearClubInput) => crearMutation.mutate(datos),
    updateClub: (datos: CrearClubInput) => actualizarMutation.mutate(datos),
    regenerateCode: () => regenerarMutation.mutate(),
    leaveClub: () => salirMutation.mutate(),
    archiveClub: () => archivarMutation.mutate(),
    removeMember: (miembroToken: string) => removeMemberMutation.mutate(miembroToken),
    transferLeadership: (miembroToken: string) => transferMutation.mutate(miembroToken),
    createChallenge: (datos: CrearRetoInput) => challengeMutation.mutate(datos),
    claimChallenge: (retoId: string) => claimChallengeMutation.mutate(retoId),
    reportMember: (datos: { miembro_token: string; categoria: CategoriaReporteClub; detalle?: string }) => reportMutation.mutate(datos),
    handleCopyCode,
    handleShareCode,
    handleJoinClub,
    navigate,
  };
}
