import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Palette, Target, ThumbsUp, Zap } from "lucide-react";

const meta = {
  title: "Design Tokens/Colores",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

// ── Helpers ──────────────────────────────────────────────────────────────────

function SwatchRow({ colores }: { colores: { hex: string; label?: string }[] }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {colores.map(({ hex, label }) => (
        <div key={hex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
          <div
            style={{
              width: "32px",
              height: "20px",
              borderRadius: "4px",
              background: hex,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          />
          {label && <span style={{ fontSize: "9px", color: "#94A3B8" }}>{label}</span>}
        </div>
      ))}
    </div>
  );
}

function MainSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div
      style={{
        background: hex,
        borderRadius: "8px",
        padding: "12px 16px",
        color: "white",
        fontWeight: 700,
        fontSize: "16px",
        marginBottom: "8px",
        width: "100%",
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
}

// ── Documentación completa ───────────────────────────────────────────────────

export const DocumentacionCompleta: Story = {
  name: "📄 Documentación Completa",
  render: () => (
    <div className="min-h-screen bg-white font-sans lg:flex">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-full border-b border-slate-100 p-4 sm:p-6 lg:w-[224px] lg:min-w-[224px] lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex flex-col gap-5 lg:sticky lg:top-0">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #16A34A, #2E9E5B)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🌱</div>
          <div>
            <div className="text-sm font-extrabold leading-none text-[#16A34A] sm:text-base">Semillas</div>
            <div className="text-[10px] leading-snug text-slate-400">Crece en la fe cada día</div>
          </div>
        </div>

        <div>
          <h1 className="mb-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">Colores</h1>
          <p className="m-0 text-sm leading-6 text-slate-500">
            Nuestra paleta de colores comunica tranquilidad, esperanza y claridad. Diseñada para ser accesible, consistente y adaptable a todos los componentes.
          </p>
        </div>

        {/* Principios */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#6C3AED", margin: "0 0 10px" }}>Principios</h2>
          {[
            { Icon: Target, color: "#6C3AED", bg: "#EDE9FE", text: "Colores con propósito y significado." },
            { Icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7", text: "Contraste AA o superior." },
            { Icon: Palette, color: "#0EA5E9", bg: "#E0F2FE", text: "Consistencia en todos los componentes." },
            { Icon: Zap, color: "#F59E0B", bg: "#FEF3C7", text: "Soporte para modo claro y oscuro." },
          ].map(({ Icon, color, bg, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "28px", height: "28px", minWidth: "28px", borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={14} color={color} />
              </div>
              <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Uso recomendado */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#6C3AED", margin: "0 0 10px" }}>Uso recomendado</h2>
          {[
            { Icon: Target, color: "#6C3AED", text: "Primarios: acciones principales, enlaces y elementos clave." },
            { Icon: CheckCircle2, color: "#16A34A", text: "Éxito: confirmaciones, logros y estados positivos." },
            { Icon: AlertTriangle, color: "#F59E0B", text: "Advertencia: alertas importantes o acciones que requieren atención." },
            { Icon: AlertCircle, color: "#EF4444", text: "Error: problemas, errores y acciones destructivas." },
            { Icon: Info, color: "#3B82F6", text: "Neutros: textos, fondos, bordes y elementos de interfaz." },
          ].map(({ Icon, color, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
              <Icon size={14} color={color} style={{ marginTop: "1px", flexShrink: 0 }} />
              <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px 12px" }}>
          <p style={{ fontSize: "11px", color: "#92400E", margin: 0, lineHeight: 1.5 }}>
            💡 Usa los colores de acuerdo al contexto y significado, evitando el uso excesivo de colores llamativos.
          </p>
        </div>
        </div>
      </aside>

      {/* ── Contenido principal ───────────────────────────────── */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">

        {/* 01. Paleta principal */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>01. Paleta principal</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Primario", subtitle: "Confianza, sabiduría, propósito.", hex: "#6C3AED",
                colores: ["#F5F3FF","#EDE9FE","#DDD6FE","#C4B5FD","#A78BFA","#8B5CF6","#6C3AED","#5B21B6","#4C1D95","#2E1065"],
                mainLabel: "600", mainHex: "#6C3AED", acento: "#6C3AED",
              },
              {
                title: "Secundario", subtitle: "Crecimiento, esperanza, vida.", hex: "#16A34A",
                colores: ["#F0FDF4","#DCFCE7","#BBF7D0","#86EFAC","#4ADE80","#22C55E","#16A34A","#15803D","#166534","#14532D"],
                mainLabel: "600", mainHex: "#16A34A",
              },
              {
                title: "Acento", subtitle: "Alegría, energía, inspiración.", hex: "#F59E0B",
                colores: ["#FFFBEB","#FEF3C7","#FDE68A","#FCD34D","#FBBF24","#F59E0B","#D97706","#B45309","#92400E","#78350F"],
                mainLabel: "500", mainHex: "#F59E0B",
              },
              {
                title: "Información", subtitle: "Claridad, comunicación, confianza.", hex: "#3B82F6",
                colores: ["#EFF6FF","#DBEAFE","#BFDBFE","#93C5FD","#60A5FA","#3B82F6","#2563EB","#1D4ED8","#1E40AF","#1E3A8A"],
                mainLabel: "500", mainHex: "#3B82F6",
              },
            ].map(({ title, subtitle, colores, mainLabel, mainHex }) => (
              <div key={title}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>{title}</p>
                <MainSwatch hex={mainHex} label={mainLabel} />
                <SwatchRow colores={colores.map((c) => ({ hex: c }))} />
                <p style={{ fontSize: "10px", color: "#94A3B8", margin: "6px 0 2px" }}>{subtitle}</p>
                <p style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>{mainHex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 02. Estados semánticos */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>02. Estados semánticos</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Éxito", desc: "Confirmaciones, logros, acciones exitosas.", hex: "#22C55E", label: "600",
                colores: ["#F0FDF4","#DCFCE7","#BBF7D0","#86EFAC","#4ADE80","#22C55E","#16A34A","#15803D","#166534","#14532D"] },
              { title: "Advertencia", desc: "Atención, precaución, información importante.", hex: "#F59E0B", label: "500",
                colores: ["#FFFBEB","#FEF3C7","#FDE68A","#FCD34D","#FBBF24","#F59E0B","#D97706","#B45309","#92400E","#78350F"] },
              { title: "Error", desc: "Errores, problemas, acciones destructivas.", hex: "#EF4444", label: "500",
                colores: ["#FFF5F5","#FEE2E2","#FECACA","#FCA5A5","#F87171","#EF4444","#DC2626","#B91C1C","#991B1B","#7F1D1D"] },
              { title: "Información", desc: "Información general, actualizaciones.", hex: "#0EA5E9", label: "500",
                colores: ["#F0F9FF","#E0F2FE","#BAE6FD","#7DD3FC","#38BDF8","#0EA5E9","#0284C7","#0369A1","#075985","#0C4A6E"] },
            ].map(({ title, desc, hex, label, colores }) => (
              <div key={title}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>{title}</p>
                <MainSwatch hex={hex} label={label} />
                <SwatchRow colores={colores.map((c) => ({ hex: c }))} />
                <p style={{ fontSize: "10px", color: "#94A3B8", margin: "6px 0 2px" }}>{desc}</p>
                <p style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>{hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03. Neutros */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>03. Neutros</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Gris", desc: "Textos secundarios, deshabilitados, íconos.",
                colores: [
                  { hex: "#F9FAFB", label: "50" }, { hex: "#F3F4F6", label: "100" }, { hex: "#E5E7EB", label: "200" },
                  { hex: "#D1D5DB", label: "300" }, { hex: "#9CA3AF", label: "400" }, { hex: "#6B7280", label: "600" },
                  { hex: "#374151", label: "700" }, { hex: "#1F2937", label: "800" }, { hex: "#111827", label: "900" },
                  { hex: "#030712", label: "950" },
                ],
              },
              {
                title: "Gris azulado", desc: "Bordes, divisores, fondos de componentes.",
                colores: [
                  { hex: "#F8FAFC", label: "50" }, { hex: "#F1F5F9", label: "100" }, { hex: "#E2E8F0", label: "200" },
                  { hex: "#CBD5E1", label: "300" }, { hex: "#94A3B8", label: "400" }, { hex: "#64748B", label: "600" },
                  { hex: "#475569", label: "700" }, { hex: "#334155", label: "800" }, { hex: "#1E293B", label: "900" },
                  { hex: "#0F172A", label: "950" },
                ],
              },
              {
                title: "Fondo", desc: "Fondos de página, tarjetas y modales.",
                colores: [
                  { hex: "#FFFFFF", label: "White" }, { hex: "#F8FAFC", label: "Gray 50" },
                  { hex: "#F1F5F9", label: "Gray 100" }, { hex: "#E2E8F0", label: "Gray 200" },
                  { hex: "#64748B", label: "Gray 50/Blue" },
                ],
              },
              {
                title: "Texto", desc: "Jerarquía de texto y legibilidad.",
                colores: [
                  { hex: "#0F172A", label: "Primary" }, { hex: "#334155", label: "Secondary" },
                  { hex: "#64748B", label: "Muted" }, { hex: "#94A3B8", label: "Disabled" },
                  { hex: "#FFFFFF", label: "Inverse" },
                ],
              },
            ].map(({ title, desc, colores }) => (
              <div key={title}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>{title}</p>
                <SwatchRow colores={colores} />
                <p style={{ fontSize: "10px", color: "#94A3B8", margin: "6px 0 0" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 + 05 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-8">

          {/* 04. Gradientes */}
          <section>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>04. Gradientes</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { title: "Primario", desc: "Usado en botones, encabezados y elementos destacados.", from: "#8B5CF6", to: "#6C3AED" },
                { title: "Secundario", desc: "Usado en elementos de éxito y crecimiento.", from: "#22C55E", to: "#16A34A" },
                { title: "Acento", desc: "Usado para destacar información importante.", from: "#FBBF24", to: "#F59E0B" },
                { title: "Info", desc: "Usado en información y enlaces.", from: "#60A5FA", to: "#3B82F6" },
              ].map(({ title, desc, from, to }) => (
                <div key={title}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>{title}</p>
                  <div style={{ background: `linear-gradient(135deg, ${from}, ${to})`, borderRadius: "8px", height: "36px", marginBottom: "4px" }} />
                  <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 05. Uso en componentes */}
          <section>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>05. Uso en componentes</h2>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Botón primario" },
                { label: "Botón secundario" },
                { label: "Enlace" },
                { label: "Estado de éxito" },
                { label: "Advertencia" },
                { label: "Error" },
                { label: "Información" },
                { label: "Deshabilitado" },
              ].map(({ label }) => (
                <div key={label} style={{ fontSize: "10px", color: "#94A3B8", marginBottom: "2px" }}>{label}</div>
              ))}

              {/* Botón primario */}
              <button style={{ background: "#6C3AED", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 700, cursor: "default" }}>Guardar</button>
              {/* Botón secundario */}
              <button style={{ background: "white", color: "#6C3AED", border: "1px solid #6C3AED", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 700, cursor: "default" }}>Cancelar</button>
              {/* Enlace */}
              <span style={{ color: "#6C3AED", fontSize: "12px", fontWeight: 600, textDecoration: "underline", cursor: "default" }}>Ver detalles →</span>
              {/* Estado éxito */}
              <span style={{ background: "#DCFCE7", color: "#16A34A", borderRadius: "99px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}><CheckCircle2 size={11} /> Completado</span>

              {/* Advertencia */}
              <span style={{ background: "#FEF3C7", color: "#D97706", borderRadius: "99px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}><AlertTriangle size={11} /> Atención</span>
              {/* Error */}
              <span style={{ background: "#FEE2E2", color: "#DC2626", borderRadius: "99px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}><AlertCircle size={11} /> Error</span>
              {/* Información */}
              <span style={{ background: "#DBEAFE", color: "#2563EB", borderRadius: "99px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}><Info size={11} /> Información</span>
              {/* Deshabilitado */}
              <button style={{ background: "#E5E7EB", color: "#9CA3AF", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 700, cursor: "not-allowed" }}>Deshabilitado</button>
            </div>
          </section>
        </div>

        {/* Nota accesibilidad */}
        <div style={{ marginTop: "28px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <ThumbsUp size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "#1D4ED8", margin: 0 }}>
            <strong>Nota de accesibilidad:</strong> Todos los colores han sido validados con contraste AA mínimo de 4.5:1 para texto normal y 3:1 para texto grande.
          </p>
        </div>
      </main>
    </div>
  ),
};
