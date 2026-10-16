import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Book,
  BookOpen,
  Check,
  Clock,
  Compass,
  Download,
  Eye,
  FileText,
  Flame,
  Gamepad2,
  Home,
  Hourglass,
  Info,
  Lock,
  Music,
  Plus,
  RotateCw,
  Shield,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  Users,
  WifiOff,
} from "lucide-react";

import { Chip, Badge, CampanaBadge } from "./chip";
import { Alerta } from "./alerta";
import { BarraProgreso } from "./barra-progreso";
import { ProgresoCircular } from "./progreso-circular";
import { StepperCRECER } from "./stepper-crecer";
import { TabsLinea, PillsFiltros, TabsSegmentado, BottomNav } from "./navegacion-tabs";

const meta = {
  title: "Componentes/Chips, Badges y Estados",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

const NavigationWrapper: React.FC = () => {
  const [tabLineaActivo, setTabLineaActivo] = React.useState("Resumen");
  const [pillActivo, setPillActivo] = React.useState("Todos");
  const [segmentadoActivo, setSegmentadoActivo] = React.useState("progreso");
  const [bottomNavActivo, setBottomNavActivo] = React.useState("inicio");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
      {/* Tabs con línea */}
      <div>
        <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>
          Tabs con línea (activo)
        </p>
        <TabsLinea
          tabs={["Resumen", "Lecciones", "Juegos", "Actividades", "Logros"]}
          activo={tabLineaActivo}
          onCambiar={setTabLineaActivo}
        />
      </div>

      {/* Pills / Filtros */}
      <div>
        <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>
          Pills (filtros)
        </p>
        <PillsFiltros
          opciones={["Todos", "Lecciones", "Juegos", "Actividades", "Canciones"]}
          activo={pillActivo}
          onCambiar={setPillActivo}
        />
      </div>

      {/* Tabs con fondo & Tabs con icono */}
      <div style={{ display: "flex", gap: "48px", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>
            Tabs con fondo (segmentado)
          </p>
          <TabsSegmentado
            opciones={[
              { id: "progreso", etiqueta: "Progreso", icono: <Trophy className="size-3.5" /> },
              { id: "actividad", etiqueta: "Actividad", icono: <Activity className="size-3.5" /> },
              { id: "historial", etiqueta: "Historial", icono: <Clock className="size-3.5" /> },
            ]}
            activo={segmentadoActivo}
            onCambiar={setSegmentadoActivo}
          />
        </div>

        <div style={{ flex: 1, maxWidth: "340px", border: "1px solid #F1F5F9", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
          <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, margin: "10px 12px 6px" }}>
            Tabs con ícono
          </p>
          <BottomNav
            opciones={[
              { id: "inicio", etiqueta: "Inicio", icono: <Home className="size-4.5" /> },
              { id: "sendas", etiqueta: "Sendas", icono: <BookOpen className="size-4.5" /> },
              { id: "club", etiqueta: "Club", icono: <Users className="size-4.5" /> },
              { id: "perfil", etiqueta: "Perfil", icono: <Trophy className="size-4.5" /> },
            ]}
            activo={bottomNavActivo}
            onCambiar={setBottomNavActivo}
          />
        </div>
      </div>
    </div>
  );
};

export const DocumentacionCompleta: Story = {
  name: "📄 Documentación Completa",
  render: () => (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        fontFamily: "Nunito, Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        style={{
          width: "240px",
          minWidth: "240px",
          borderRight: "1px solid #F1F5F9",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #16A34A, #2E9E5B)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🌱
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#2E9E5B", lineHeight: 1 }}>
              Semillas
            </div>
            <div style={{ fontSize: "10px", color: "#94A3B8", lineHeight: 1.3 }}>
              Crece en la fe cada día
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px", lineHeight: 1.2 }}>
            Chips, Badges y Estados
          </h1>
          <p style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
            Componentes pequeños que comunican información rápida de manera visual y consistente.
          </p>
        </div>

        {/* Principios */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#2E9E5B", margin: "0 0 10px" }}>
            Principios
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Comunican estado de un vistazo",
              "Usan color con significado claro",
              "Tienen bordes redondeados",
              "Textos cortos y legibles",
              "Accesibles y consistentes",
            ].map((principio) => (
              <div key={principio} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#DCFCE7",
                  display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center"
                }}>
                  <Check className="size-3 text-[#2E9E5B]" />
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>{principio}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Uso recomendado */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#6C3AED", margin: "0 0 10px" }}>
            Uso recomendado
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                icon: <ArrowRight className="size-4 text-[#6C3AED]" />,
                title: "Chips",
                desc: "Categorías, filtros, sendas, edades.",
              },
              {
                icon: <Star className="size-4 text-[#6C3AED]" />,
                title: "Badges",
                desc: "Conteos, niveles, logros, notificaciones.",
              },
              {
                icon: <Info className="size-4 text-[#6C3AED]" />,
                title: "Alertas",
                desc: "Mensajes importantes para el usuario.",
              },
              {
                icon: <Hourglass className="size-4 text-[#6C3AED]" />,
                title: "Progreso",
                desc: "Visualización de avance y métricas.",
              },
              {
                icon: <FileText className="size-4 text-[#6C3AED]" />,
                title: "Tabs/Pills",
                desc: "Navegación entre secciones o vistas.",
              },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ marginTop: "2px" }}>{item.icon}</span>
                <div>
                  <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#334155", margin: 0 }}>{item.title}</h4>
                  <p style={{ fontSize: "10px", color: "#64748B", margin: 0, lineHeight: 1.3 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "24px 28px", overflowX: "auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        
        {/* 01. Chips */}
        <section>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 14px" }}>
            01. Chips
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
            {/* Por Senda */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>Por senda</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <Chip color="azul" icono={<ArrowRight />}>Senda del Padre</Chip>
                <Chip color="morado" icono={<ArrowRight />}>Senda del Hijo</Chip>
                <Chip color="naranja" icono={<Flame />}>Espíritu Santo</Chip>
              </div>
            </div>

            {/* Por Edad */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>Por edad</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <Chip color="verde" icono={<Sprout />}>Semillas (5-8)</Chip>
                <Chip color="azul" icono={<Compass />}>Exploradores (9-12)</Chip>
                <Chip color="morado" icono={<Shield />}>Embajadores (13-17)</Chip>
              </div>
            </div>

            {/* Por Estado / Progreso */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>Por estado / progreso</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <Chip color="verde" icono={<Check />}>Completado</Chip>
                <Chip color="morado" icono={<RotateCw />}>En progreso</Chip>
                <Chip color="amarillo" icono={<Clock />}>Pendiente</Chip>
                <Chip color="gris" icono={<Lock />}>Bloqueado</Chip>
              </div>
            </div>

            {/* Por Tipo de Contenido */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>Por tipo de contenido</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <Chip color="amarillo" icono={<Book />}>Lección</Chip>
                <Chip color="azul" icono={<Gamepad2 />}>Juego</Chip>
                <Chip color="verde" icono={<Sprout />}>Actividad</Chip>
                <Chip color="rosa" icono={<Music />}>Canción</Chip>
              </div>
            </div>

            {/* Otros chips */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>Otros chips</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <Chip color="morado" icono={<Sparkles />}>Nuevo</Chip>
                <Chip color="verde" icono={<Flame />}>Popular</Chip>
                <Chip color="azul" icono={<WifiOff />}>Sin conexión</Chip>
                <Chip color="gris" icono={<Download />}>Descargado</Chip>
              </div>
            </div>
          </div>
        </section>

        {/* 02. Badges */}
        <section>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 14px" }}>
            02. Badges
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <Badge color="morado" icono={<Shield />}>Nivel 7</Badge>
            <Badge color="amarillo" icono={<Star />}>+250 XP</Badge>
            <Badge color="naranja" icono={<Flame />}>5 días</Badge>
            <Badge color="verde" icono={<Eye />}>18 / 30</Badge>
            
            {/* Bell Notif */}
            <CampanaBadge conteo={3} />

            <Badge color="morado" icono={<Sparkles />}>Nuevo</Badge>
            <Badge color="verde" icono={<Flame />}>Popular</Badge>
            <Badge color="azul" icono={<WifiOff />}>Sin conexión</Badge>
            
            <Chip color="verde" forma="badge" icono={<Check />}>Publicado</Chip>
            <Chip color="morado" forma="badge" icono={<FileText />}>Borrador</Chip>
            <Chip color="amarillo" forma="badge" icono={<Clock />}>En revisión</Chip>
          </div>
        </section>

        {/* 03. Alertas */}
        <section>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 14px" }}>
            03. Alertas
          </h2>
          {/* Horizontal 5-column grid layout for alerts matching the design spec */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            <Alerta variante="exito">¡Excelente! Completaste la lección.</Alerta>
            <Alerta variante="atencion">Atención: Tienes cambios sin sincronizar.</Alerta>
            <Alerta variante="error">Ocurrió un error al sincronizar.</Alerta>
            <Alerta variante="informacion">Recuerda descargar tus lecciones.</Alerta>
            <Alerta variante="offline">Estás sin conexión. Estás en modo offline.</Alerta>
          </div>
        </section>

        {/* 04. Indicadores de progreso */}
        <section>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 14px" }}>
            04. Indicadores de progreso
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "32px" }}>
            {/* Barra lineal */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "12px" }}>Barra lineal</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <BarraProgreso valor={60} etiqueta="Progreso de lección" color="morado" />
                <BarraProgreso valor={80} etiqueta="Progreso de senda" color="verde" />
                <BarraProgreso valor={45} etiqueta="Progreso general" color="azul" />
                <BarraProgreso valor={12} maximo={20} etiqueta="Descargas offline" color="naranja" />
              </div>
            </div>

            {/* Circular */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "12px" }}>Circular</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                <ProgresoCircular porcentaje={75} etiqueta="Lecciones" color="morado" />
                <ProgresoCircular porcentaje={60} etiqueta="Senda" color="verde" />
                <ProgresoCircular porcentaje={30} etiqueta="Retos" color="naranja" />
                <ProgresoCircular porcentaje={90} etiqueta="XP semanal" color="azul" />
              </div>
            </div>

            {/* Stepper CRECER */}
            <div>
              <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, marginBottom: "12px" }}>Stepper (CRECER)</p>
              <div style={{ padding: "0 10px" }}>
                <StepperCRECER
                  pasos={[
                    { numero: 1, nombre: "Conectar", estado: "completado", colorHex: "#2E9E5B" },
                    { numero: 2, nombre: "Relatar", estado: "completado", colorHex: "#3D8BD4" },
                    { numero: 3, nombre: "Enseñar", estado: "completado", colorHex: "#6C3AED" },
                    { numero: 4, nombre: "Comprobar", estado: "actual", colorHex: "#F4B740" },
                    { numero: 5, nombre: "Experimentar", estado: "pendiente", colorHex: "#17A398" },
                    { numero: 6, nombre: "Recompensar", estado: "pendiente", colorHex: "#EE6C4D" },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 05. Tabs / Pills (Navegación) */}
        <section>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 14px" }}>
            05. Tabs / Pills (Navegación)
          </h2>
          <NavigationWrapper />
        </section>

        {/* Tip footer */}
        <div
          style={{
            marginTop: "12px",
            background: "#FAF5FF",
            border: "1px solid #E9D5FF",
            borderRadius: "10px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>💡</span>
          <p style={{ fontSize: "12px", color: "#6C3AED", margin: 0 }}>
            <strong>Tip:</strong> Usa chips y badges para evitar textos largos. Mantén la información corta, clara y con significado.
          </p>
        </div>

      </main>
    </div>
  ),
};
