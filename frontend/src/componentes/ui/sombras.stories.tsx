import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCircle2, Layout, Layers, Minus, Square } from "lucide-react";

const meta = {
  title: "Design Tokens/Sombras, Bordes y Radios",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

// ── Helpers ──────────────────────────────────────────────────────────────────

function TarjetaSombra({ label, sublabel, sombra }: { label: string; sublabel: string; sombra: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          background: "white",
          borderRadius: "12px",
          boxShadow: sombra,
          border: "1px solid rgba(0,0,0,0.03)",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#374151", margin: "0 0 1px" }}>{label}</p>
        <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>{sublabel}</p>
      </div>
    </div>
  );
}

function TarjetaBorde({ label, sublabel, borde, bgColor = "white" }: { label: string; sublabel: string; borde: string; bgColor?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "60px",
          height: "60px",
          background: bgColor,
          borderRadius: "8px",
          border: borde,
        }}
      />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#374151", margin: "0 0 1px" }}>{label}</p>
        <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0, lineHeight: 1.3, whiteSpace: "pre-line" }}>{sublabel}</p>
      </div>
    </div>
  );
}

function TarjetaRadio({ label, sublabel, radio }: { label: string; sublabel: string; radio: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          background: "white",
          borderRadius: radio,
          border: "1.5px solid #6C3AED",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#374151", margin: "0 0 1px" }}>{label}</p>
        <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0 }}>{sublabel}</p>
      </div>
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #16A34A, #2E9E5B)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🌱</div>
          <div>
            <div className="text-sm font-extrabold leading-none text-[#16A34A] sm:text-base">Semillas</div>
            <div className="text-[10px] leading-snug text-slate-400">Crece en la fe cada día</div>
          </div>
        </div>

        <div>
          <h1 className="mb-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-[1.75rem]">
            Sombras, bordes<br />y radios
          </h1>
          <p className="m-0 text-sm leading-6 text-slate-500">
            Estos estilos aportan profundidad, jerarquía visual y consistencia a toda la interfaz.
          </p>
        </div>

        {/* Principios */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#6C3AED", margin: "0 0 10px" }}>Principios</h2>
          {[
            { Icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7", text: "Sombras suaves para dar profundidad sin distracciones." },
            { Icon: Square, color: "#6C3AED", bg: "#EDE9FE", text: "Bordes sutiles para separar elementos." },
            { Icon: Layers, color: "#0EA5E9", bg: "#E0F2FE", text: "Radios redondeados para una experiencia amigable." },
            { Icon: Layout, color: "#F59E0B", bg: "#FEF3C7", text: "Consistencia en todos los componentes." },
          ].map(({ Icon, color, bg, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "26px", height: "26px", minWidth: "26px", borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} color={color} />
              </div>
              <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.4, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Uso recomendado */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#6C3AED", margin: "0 0 10px" }}>Uso recomendado</h2>
          {[
            { Icon: Layers, color: "#6C3AED", bg: "#EDE9FE", text: "Usar sombras para indicar elevación y jerarquía." },
            { Icon: Minus, color: "#64748B", bg: "#F1F5F9", text: "Usar bordes para separar secciones o elementos." },
            { Icon: Square, color: "#0EA5E9", bg: "#E0F2FE", text: "Usar radios grandes en tarjetas y modales. Medianos en inputs y botones." },
            { Icon: Layout, color: "#16A34A", bg: "#DCFCE7", text: "Mantener consistencia entre web, tablet y móvil." },
          ].map(({ Icon, color, bg, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "26px", height: "26px", minWidth: "26px", borderRadius: "6px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} color={color} />
              </div>
              <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.4, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px 12px" }}>
          <p style={{ fontSize: "11px", color: "#92400E", margin: 0, lineHeight: 1.5 }}>
            💡 Menos es más: usa sombras sutiles y bordes suaves para mantener una interfaz limpia y accesible.
          </p>
        </div>
        </div>
      </aside>

      {/* ── Contenido principal ───────────────────────────────── */}
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">

        {/* 01. Sombras */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>01. Sombras (elevación)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-start">
            {/* Escala principal */}
            <TarjetaSombra label="Sin sombra" sublabel="—" sombra="none" />
            <TarjetaSombra label="Sombra XS" sublabel={"0px 1px 2px\nrgba(15, 23, 42, 0.05)"} sombra="0px 1px 2px rgba(15,23,42,0.05)" />
            <TarjetaSombra label="Sombra SM" sublabel={"0px 2px 6px\nrgba(15, 23, 42, 0.08)"} sombra="0px 2px 6px rgba(15,23,42,0.08)" />
            <TarjetaSombra label="Sombra MD" sublabel={"0px 6px 16px\nrgba(15, 23, 42, 0.08)"} sombra="0px 6px 16px rgba(15,23,42,0.08)" />
            <TarjetaSombra label="Sombra LG" sublabel={"0px 12px 28px\nrgba(15, 23, 42, 0.12)"} sombra="0px 12px 28px rgba(15,23,42,0.12)" />
            <TarjetaSombra label="Sombra XL" sublabel={"0px 20px 40px\nrgba(15, 23, 42, 0.18)"} sombra="0px 20px 40px rgba(15,23,42,0.18)" />

            {/* Sombras de color - título */}
            <div style={{ gridColumn: "7 / span 3" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#374151", margin: "0 0 12px" }}>Sombras de color</p>
              <div style={{ display: "flex", gap: "16px" }}>
                <TarjetaSombra label="Morada" sublabel={"0px 8px 20px\nrgba(109, 53, 232, 0.20)"} sombra="0px 8px 20px rgba(109,53,232,0.20)" />
                <TarjetaSombra label="Verde" sublabel={"0px 8px 20px\nrgba(34, 164, 71, 0.18)"} sombra="0px 8px 20px rgba(34,164,71,0.18)" />
                <TarjetaSombra label="Amarilla" sublabel={"0px 8px 20px\nrgba(255, 200, 61, 0.20)"} sombra="0px 8px 20px rgba(255,200,61,0.20)" />
              </div>
            </div>
          </div>
        </section>

        {/* 02 + 03 fila */}
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-12">

          {/* 02. Bordes */}
          <section>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>02. Bordes</h2>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <TarjetaBorde label="Sin borde" sublabel="—" borde="none" />
              <TarjetaBorde label="Borde sutil" sublabel={"1px sólido\n#F1F5F9"} borde="1px solid #F1F5F9" />
              <TarjetaBorde label="Borde medio" sublabel={"1px sólido\n#E2E8F0"} borde="1px solid #E2E8F0" />
              <TarjetaBorde label="Borde marcado" sublabel={"1.5px sólido\n#CBD5E1"} borde="1.5px solid #CBD5E1" />
              <TarjetaBorde label="Borde grueso" sublabel={"2px sólido\n#94A3B8"} borde="2px solid #94A3B8" />
              <TarjetaBorde label="Borde color" sublabel={"1.5px sólido\n#6D35E8"} borde="1.5px solid #6D35E8" />
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "60px", height: "60px", background: "#F0FDF4", borderRadius: "8px", border: "1.5px solid #22C55E" }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E", margin: "0 0 1px" }}>Éxito</p>
                    <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0 }}>1.5px sólido<br />#22C55E</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "60px", height: "60px", background: "#FFF5F5", borderRadius: "8px", border: "1.5px solid #EF4444" }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", margin: "0 0 1px" }}>Error</p>
                    <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0 }}>1.5px sólido<br />#EF4444</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 03. Radios */}
          <section>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>03. Radios (redondeados)</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <TarjetaRadio label="Radio 0" sublabel="0px" radio="0px" />
              <TarjetaRadio label="Radio XS" sublabel="4px" radio="4px" />
              <TarjetaRadio label="Radio SM" sublabel="8px" radio="8px" />
              <TarjetaRadio label="Radio MD" sublabel="12px" radio="12px" />
              <TarjetaRadio label="Radio LG" sublabel="16px" radio="16px" />
              <TarjetaRadio label="Radio XL" sublabel="20px" radio="20px" />
              <TarjetaRadio label="Radio 2XL" sublabel="28px" radio="28px" />
              <TarjetaRadio label="Píldora / Full" sublabel="9999px" radio="9999px" />
            </div>
          </section>
        </div>

        {/* 04. Divisores */}
        <section>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6C3AED", margin: "0 0 16px" }}>04. Divisores y separadores</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 32px" }}>

            {/* Divisores horizontales */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Divisores horizontales</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "Sutil", style: "1px solid #F1F5F9" },
                  { label: "Normal", style: "1px solid #E2E8F0" },
                  { label: "Marcado", style: "2px solid #CBD5E1" },
                  { label: "Punteado", style: "1px dotted #D1D5DB" },
                  { label: "Discontinuo", style: "2px dashed #CBD5E1" },
                ].map(({ label, style }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ borderTop: style, width: "100%" }} />
                    <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>{label} — {style.split(" ")[0]} {style.split(" ")[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divisores verticales */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Divisores verticales</p>
              <div style={{ display: "flex", gap: "20px", height: "120px" }}>
                {[
                  { label: "Sutil", style: "1px solid #F1F5F9" },
                  { label: "Normal", style: "1px solid #E2E8F0" },
                  { label: "Marcado", style: "2px solid #CBD5E1" },
                  { label: "Punteado", style: "1px dotted #D1D5DB" },
                  { label: "Discontinuo", style: "2px dashed #CBD5E1" },
                ].map(({ label, style }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                    <div style={{ borderLeft: style, height: "100%" }} />
                    <p style={{ fontSize: "9px", color: "#94A3B8", margin: 0, writingMode: "vertical-lr", transform: "rotate(180deg)" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Separadores de sección */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Separadores de sección</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Espacio XS", px: "8px", width: "60%" },
                  { label: "Espacio SM", px: "16px", width: "70%" },
                  { label: "Espacio MD", px: "24px", width: "80%" },
                  { label: "Espacio LG", px: "32px", width: "90%" },
                  { label: "Espacio XL", px: "48px", width: "100%" },
                ].map(({ label, px, width }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "10px", color: "#64748B", minWidth: "70px" }}>{label}</span>
                    <div style={{ height: "6px", background: "#EDE9FE", borderRadius: "99px", width }} />
                    <span style={{ fontSize: "10px", color: "#94A3B8" }}>{px}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nota */}
        <div style={{ marginTop: "28px", background: "#EDE9FE", border: "1px solid #C4B5FD", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🛡️</span>
          <p style={{ fontSize: "12px", color: "#4C1D95", margin: 0 }}>
            <strong>Nota de diseño:</strong> Las sombras, bordes y radios deben aplicarse de forma consistente para mantener una experiencia visual armoniosa y accesible en todos los dispositivos.
          </p>
        </div>
      </main>
    </div>
  ),
};
