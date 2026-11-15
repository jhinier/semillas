import { AlertTriangle, Check, Circle, PencilLine } from "lucide-react";

export type CrecerMatrixCellStatus = "complete" | "draft" | "missing" | "error";

export interface CrecerMatrixAgeGroup {
  id: string;
  nombre?: string | null;
}

export interface CrecerMatrixStep {
  codigo: string;
  nombre: string;
}

export interface CrecerMatrixCell {
  ageGroupId: string;
  stepCode: string;
  status: CrecerMatrixCellStatus;
  message?: string;
}

interface CrecerMatrixStatusProps {
  ageGroups: CrecerMatrixAgeGroup[];
  steps: CrecerMatrixStep[];
  activeAgeGroupId?: string;
  activeStepCode?: string;
  getCell: (ageGroupId: string, stepCode: string) => CrecerMatrixCellStatus | CrecerMatrixCell;
  onSelect: (ageGroupId: string, stepCode: string) => void;
}

const statusLabels: Record<CrecerMatrixCellStatus, string> = {
  complete: "Completo",
  draft: "Borrador",
  missing: "Pendiente",
  error: "Revisar",
};

function normalizeCell(
  value: CrecerMatrixCellStatus | CrecerMatrixCell,
  ageGroupId: string,
  stepCode: string,
): CrecerMatrixCell {
  return typeof value === "string"
    ? { ageGroupId, stepCode, status: value }
    : value;
}

function StatusIcon({ status }: { status: CrecerMatrixCellStatus }) {
  if (status === "complete") return <Check size={15} />;
  if (status === "draft") return <PencilLine size={14} />;
  if (status === "error") return <AlertTriangle size={14} />;
  return <Circle size={13} />;
}

export function CrecerMatrixStatus({
  ageGroups,
  steps,
  activeAgeGroupId,
  activeStepCode,
  getCell,
  onSelect,
}: CrecerMatrixStatusProps) {
  return (
    <section className="admin-editor-section admin-crecer-matrix" aria-label="Matriz de cobertura CRECER">
      <div className="admin-crecer-matrix__header">
        <div>
          <span className="admin-eyebrow">Mapa de avance (18 momentos)</span>
          <h2>Tabla resumen por edad y momento</h2>
          <p>Haz clic en cualquier casilla para saltar a ese momento. El recuadro morado indica cuál estás editando ahora.</p>
        </div>
        <div className="admin-crecer-matrix__legend" aria-label="Leyenda de estados">
          {(Object.keys(statusLabels) as CrecerMatrixCellStatus[]).map((status) => (
            <span key={status} data-status={status}>
              <StatusIcon status={status} /> {statusLabels[status]}
            </span>
          ))}
        </div>
      </div>

      <div className="admin-crecer-matrix__scroll" role="region" aria-label="Tabla de cobertura" tabIndex={0}>
        <table className="admin-crecer-matrix__table">
          <thead>
            <tr>
              <th scope="col">Edad</th>
              {steps.map((step, index) => (
                <th key={step.codigo} scope="col">{index + 1}. {step.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ageGroups.map((ageGroup) => (
              <tr key={ageGroup.id}>
                <th scope="row">{ageGroup.nombre ?? "Franja"}</th>
                {steps.map((step) => {
                  const cell = normalizeCell(getCell(ageGroup.id, step.codigo), ageGroup.id, step.codigo);
                  const isCurrent = ageGroup.id === activeAgeGroupId && step.codigo === activeStepCode;
                  return (
                    <td key={step.codigo}>
                      <button
                        type="button"
                        className={`admin-crecer-matrix__cell admin-crecer-matrix__cell--${cell.status} ${isCurrent ? "admin-crecer-matrix__cell--current" : ""}`}
                        onClick={() => onSelect(ageGroup.id, step.codigo)}
                        aria-current={isCurrent ? "step" : undefined}
                        aria-label={`${ageGroup.nombre ?? "Franja"}, ${step.nombre}: ${statusLabels[cell.status]}`}
                        title={isCurrent ? "Editando actualmente" : (cell.message ?? statusLabels[cell.status])}
                      >
                        <StatusIcon status={cell.status} />
                        <span>{isCurrent ? "Editando" : statusLabels[cell.status]}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
