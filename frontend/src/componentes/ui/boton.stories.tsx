import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertTriangle,
  Ban,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CloudDownload,
  CloudUpload,
  Download,
  ExternalLink,
  Headphones,
  HelpCircle,
  MoreHorizontal,
  Palette,
  Play,
  PlayCircle,
  Plus,
  Save,
  Settings,
  Share2,
  Star,
  TouchpadIcon,
  Trash2,
  Type,
} from "lucide-react";

import { Boton } from "./boton";

const meta = {
  title: "Componentes/Boton",
  component: Boton,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Continuar",
  },
} satisfies Meta<typeof Boton>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Historias individuales ───────────────────────────────────────────────────

export const Primario: Story = {
  args: {
    variante: "primario",
    iconoIzquierdo: <Star className="size-4" />,
  },
};

export const Exito: Story = {
  args: {
    variante: "exito",
    children: "Guardar",
    iconoIzquierdo: <Star className="size-4" />,
  },
};

export const Secundario: Story = {
  args: {
    variante: "secundario",
    children: "Cancelar",
  },
};

export const Contorno: Story = {
  args: {
    variante: "contorno",
    children: "Nuevo",
    iconoIzquierdo: <Plus className="size-4" />,
  },
};

export const Texto: Story = {
  args: {
    variante: "texto",
    children: "Ver más",
    iconoDerecho: <ChevronRight className="size-4" />,
  },
};

export const Peligro: Story = {
  args: {
    variante: "peligro",
    children: "Eliminar",
    iconoIzquierdo: <Trash2 className="size-4" />,
  },
};

export const PeligroContorno: Story = {
  args: {
    variante: "peligroContorno",
    children: "Reportar",
    iconoIzquierdo: <AlertTriangle className="size-4" />,
  },
};

export const Cargando: Story = {
  args: {
    variante: "primario",
    cargando: true,
    textoCargando: "Cargando...",
  },
};

export const Deshabilitado: Story = {
  args: {
    variante: "primario",
    deshabilitado: true,
    iconoIzquierdo: <Star className="size-4" />,
  },
};

// ── Página de documentación completa ────────────────────────────────────────

export const DocumentacionCompleta: Story = {
  name: "📄 Documentación Completa",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen bg-white font-sans lg:flex">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-full border-b border-slate-100 bg-white p-4 sm:p-6 lg:w-[224px] lg:min-w-[224px] lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex flex-col gap-5 lg:sticky lg:top-0">
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
            <div className="text-sm font-extrabold leading-none text-[#16A34A] sm:text-base">
              Semillas
            </div>
            <div className="text-[10px] leading-snug text-slate-400">
              Crece en la fe cada día
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="mb-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
            Botones
          </h1>
          <p className="m-0 text-sm leading-6 text-slate-500">
            Nuestros botones son amigables, claros y accesibles. Tienen bordes redondeados,
            colores consistentes y estados definidos para cada interacción.
          </p>
        </div>

        {/* Principios */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-700 sm:text-[13px]">
            Principios
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                Icon: TouchpadIcon,
                color: "#6C3AED",
                bg: "#EDE9FE",
                text: "Tamaño mínimo táctil de 44px de altura.",
              },
              {
                Icon: Palette,
                color: "#0EA5E9",
                bg: "#E0F2FE",
                text: "Uso consistente de color según la acción.",
              },
              {
                Icon: Settings,
                color: "#16A34A",
                bg: "#DCFCE7",
                text: "Estados claros para cada interacción.",
              },
              {
                Icon: Type,
                color: "#7C3AED",
                bg: "#EDE9FE",
                text: "Texto legible y contraste adecuado.",
              },
            ].map(({ Icon, color, bg, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    minWidth: "28px",
                    borderRadius: "50%",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={14} color={color} />
                </div>
                <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendaciones */}
        <div>
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#6C3AED",
              margin: "0 0 12px",
            }}
          >
            Recomendaciones
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Usa los botones primarios para acciones principales.",
              "Usa secundarios para acciones complementarias.",
              "Usa peligro únicamente para eliminar o acciones críticas.",
              "No uses más de 2 botones principales en una misma vista.",
            ].map((rec) => (
              <div key={rec} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ color: "#16A34A", fontSize: "14px", lineHeight: 1.4 }}>✓</span>
                <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────── */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
        {/* ── Tipos de botones ──────────────────────────── */}
        <section style={{ marginBottom: "36px" }}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700 sm:text-[15px]">
            Tipos de botones
          </h2>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-6">
            {/* Headers */}
            {[
              "Primario (Morado)",
              "Primario (Verde)",
              "Secundario",
              "Contorno",
              "Texto",
              "Peligro",
            ].map((label) => (
              <div
                key={label}
                style={{
                  fontSize: "11px",
                  color: "#94A3B8",
                  fontWeight: 600,
                  textAlign: "center",
                  paddingBottom: "4px",
                }}
              >
                {label}
              </div>
            ))}

            {/* Fila 1: botón estándar */}
            <div><Boton variante="primario" iconoIzquierdo={<Star className="size-4" />}>Continuar</Boton></div>
            <div><Boton variante="exito" iconoIzquierdo={<CheckCircle2 className="size-4" />}>Guardar</Boton></div>
            <div><Boton variante="secundario">Cancelar</Boton></div>
            <div><Boton variante="contorno" iconoIzquierdo={<Plus className="size-4" />}>Nuevo</Boton></div>
            <div><Boton variante="texto" iconoDerecho={<ChevronRight className="size-4" />}>Ver más</Boton></div>
            <div><Boton variante="peligro" iconoIzquierdo={<Trash2 className="size-4" />}>Eliminar</Boton></div>

            {/* Fila 2: píldora */}
            <div>
              <Boton variante="primario" forma="pildora" iconoIzquierdo={<BookOpen className="size-4" />}>Ver lección</Boton>
            </div>
            <div>
              <Boton variante="exito" forma="pildora" iconoIzquierdo={<Play className="size-4" />}>Iniciar actividad</Boton>
            </div>
            <div>
              <Boton variante="secundario" forma="pildora" iconoDerecho={<MoreHorizontal className="size-4" />}>Más opciones</Boton>
            </div>
            <div>
              <Boton variante="contorno" forma="pildora" iconoIzquierdo={<Save className="size-4" />}>Guardar para después</Boton>
            </div>
            <div>
              <Boton variante="texto" iconoDerecho={<ExternalLink className="size-4" />}>Aprender más</Boton>
            </div>
            <div>
              <Boton variante="peligroContorno" iconoIzquierdo={<AlertTriangle className="size-4" />}>Reportar</Boton>
            </div>

            {/* Fila 3: solo ícono */}
            <div>
              <Boton variante="primario" tamano="icono" aria-label="Descargar">
                <Download className="size-4" />
              </Boton>
            </div>
            <div>
              <Boton variante="exito" tamano="icono" aria-label="Subir">
                <CloudUpload className="size-4" />
              </Boton>
            </div>
            <div>
              <Boton variante="secundario" tamano="icono" aria-label="Ajustes">
                <Settings className="size-4" />
              </Boton>
            </div>
            <div>
              <Boton variante="contorno" tamano="icono" aria-label="Compartir">
                <Share2 className="size-4" />
              </Boton>
            </div>
            <div>
              <Boton variante="texto" iconoIzquierdo={<HelpCircle className="size-4" />}>
                Ayuda
              </Boton>
            </div>
            <div>
              <Boton variante="peligroContorno" tamano="icono" aria-label="Bloquear">
                <Ban className="size-4" />
              </Boton>
            </div>
          </div>
        </section>

        {/* ── Estados ───────────────────────────────────── */}
        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#6C3AED",
              margin: "0 0 16px",
            }}
          >
            Estados
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px 16px",
            }}
          >
            {/* Headers */}
            {["Default", "Hover", "Pressed (Activo)", "Disabled", "Loading"].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: "11px",
                  color: "#94A3B8",
                  fontWeight: 600,
                  textAlign: "center",
                  paddingBottom: "4px",
                }}
              >
                {h}
              </div>
            ))}

            {/* Primario */}
            <Boton variante="primario" iconoIzquierdo={<Star className="size-4" />}>Continuar</Boton>
            <Boton variante="primario" estadoVisual="encima" iconoIzquierdo={<Star className="size-4" />}>Continuar</Boton>
            <Boton variante="primario" estadoVisual="presionado" iconoIzquierdo={<Star className="size-4" />}>Continuar</Boton>
            <Boton variante="primario" deshabilitado iconoIzquierdo={<Star className="size-4" />}>Continuar</Boton>
            <Boton variante="primario" cargando textoCargando="Cargando...">Continuar</Boton>

            {/* Exito */}
            <div><Boton variante="exito" iconoIzquierdo={<CheckCircle2 className="size-4" />}>Guardar</Boton></div>
            <div><Boton variante="exito" estadoVisual="encima" iconoIzquierdo={<CheckCircle2 className="size-4" />}>Guardar</Boton></div>
            <div><Boton variante="exito" estadoVisual="presionado" iconoIzquierdo={<CheckCircle2 className="size-4" />}>Guardar</Boton></div>
            <div><Boton variante="exito" deshabilitado iconoIzquierdo={<CheckCircle2 className="size-4" />}>Guardar</Boton></div>
            <div><Boton variante="exito" cargando textoCargando="Guardando...">Guardar</Boton></div>

            {/* Secundario */}
            <Boton variante="secundario">Cancelar</Boton>
            <Boton variante="secundario" estadoVisual="encima">Cancelar</Boton>
            <Boton variante="secundario" estadoVisual="presionado">Cancelar</Boton>
            <Boton variante="secundario" deshabilitado>Cancelar</Boton>
            <Boton variante="secundario" cargando textoCargando="Procesando...">Cancelar</Boton>

            {/* Contorno */}
            <Boton variante="contorno" iconoIzquierdo={<Plus className="size-4" />}>Nuevo</Boton>
            <Boton variante="contorno" estadoVisual="encima" iconoIzquierdo={<Plus className="size-4" />}>Nuevo</Boton>
            <Boton variante="contorno" estadoVisual="presionado" iconoIzquierdo={<Plus className="size-4" />}>Nuevo</Boton>
            <Boton variante="contorno" deshabilitado iconoIzquierdo={<Plus className="size-4" />}>Nuevo</Boton>
            <Boton variante="contorno" cargando textoCargando="Cargando...">Nuevo</Boton>

            {/* Peligro */}
            <Boton variante="peligro" iconoIzquierdo={<Trash2 className="size-4" />}>Eliminar</Boton>
            <Boton variante="peligro" estadoVisual="encima" iconoIzquierdo={<Trash2 className="size-4" />}>Eliminar</Boton>
            <Boton variante="peligro" estadoVisual="presionado" iconoIzquierdo={<Trash2 className="size-4" />}>Eliminar</Boton>
            <Boton variante="peligro" deshabilitado iconoIzquierdo={<Trash2 className="size-4" />}>Eliminar</Boton>
            <Boton variante="peligro" cargando textoCargando="Eliminando...">Eliminar</Boton>
          </div>
        </section>

        {/* ── Tamaños + Botones con íconos ──────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-12">
          {/* Tamaños */}
          <section>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#6C3AED",
                margin: "0 0 16px",
              }}
            >
              Tamaños
            </h2>
            <div className="grid grid-cols-1 items-end gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { key: "Grande", tamano: "grande" as const, iconSize: "size-5", px: "56px" },
                { key: "Mediano", tamano: "mediano" as const, iconSize: "size-4", px: "44px" },
                { key: "Pequeño", tamano: "pequeno" as const, iconSize: "size-3", px: "36px" },
              ].map(({ key, tamano, iconSize, px }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>{key}</div>
                  <Boton variante="primario" tamano={tamano} iconoIzquierdo={<Star className={iconSize} />}>Continuar</Boton>
                  <span style={{ fontSize: "10px", color: "#94A3B8" }}>Altura: {px}</span>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>Ícono</div>
                <Boton variante="primario" tamano="icono" aria-label="Favorito">
                  <Star className="size-5" />
                </Boton>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>44x44px</span>
              </div>

            </div>
          </section>

          {/* Botones con íconos */}
          <section>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#6C3AED",
                margin: "0 0 16px",
              }}
            >
              Botones con íconos
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <Boton variante="exito" iconoIzquierdo={<CloudDownload className="size-5" />}>
                Descargar
              </Boton>
              <Boton variante="primario" iconoIzquierdo={<PlayCircle className="size-5" />}>
                Ver video
              </Boton>
              <Boton variante="primario" iconoIzquierdo={<Headphones className="size-5" />}>
                Escuchar
              </Boton>
              <Boton variante="contorno" iconoIzquierdo={<Bookmark className="size-5" />}>
                Guardar
              </Boton>
            </div>
          </section>
        </div>

        {/* ── Tip ──────────────────────────────────────── */}
        <div
          style={{
            marginTop: "32px",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "10px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>💡</span>
          <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
            <strong>Tip:</strong> Usa los botones primarios para guiar al usuario y mantener un
            flujo claro en la experiencia.
          </p>
        </div>
      </main>
    </div>
  ),
};
