import type { VacationRecommendation } from "@/types";
import { formatDateFull, formatDateShort } from "@/lib/formatters";

interface Props {
  recommendation: VacationRecommendation;
  rank?: number;
  isBest?: boolean;
}

export function RecommendationCard({
  recommendation: r,
  rank = 1,
  isBest = false,
}: Props) {
  const badgeLabel = isBest ? "✦ Mejor opción encontrada" : `Opción seleccionada #${rank}`;

  return (
    <div className="bg-success-bg border border-success/25 rounded-2xl p-6">

      {/* Badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-success text-xs font-semibold tracking-widest uppercase">
          {badgeLabel}
        </span>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-success font-mono text-7xl leading-none font-medium tabular-nums">
          {r.calendarDaysRested}
        </span>
        <span className="text-success/60 text-xl">días de descanso</span>
      </div>
      <p className="mb-6 text-sm font-semibold text-success">
        +{r.extraRestDays} días extra por fines de semana y festivos
      </p>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <DateBlock
          label="Primer día cobrado"
          primary={formatDateFull(r.requestStartDate)}
          secondary="Inicio de vacaciones cobradas"
        />
        <DateBlock
          label="Último día cobrado"
          primary={formatDateFull(r.requestEndDate)}
          secondary="Fin de vacaciones cobradas"
        />
        <DateBlock
          label="Descanso real"
          primary={formatDateFull(r.realRestStartDate)}
          secondary={"hasta " + formatDateFull(r.realRestEndDate)}
        />
        <DateBlock
          label="Vuelves al trabajo"
          primary={formatDateFull(r.returnToWorkDate)}
          secondary="Primer día laboral después del descanso"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-6 flex-wrap pt-4 border-t border-success/[0.15] mb-4">
        <Stat value={r.vacationDaysUsed} label="días usados" />
        <Stat value={`+${r.extraRestDays}`} label="días extra" highlight />
        <Stat value={`${r.efficiencyRatio}×`} label="ratio" />
        <Stat value={r.holidaysIncluded.length} label="festivos" />
        <Stat value={r.weekendsIncluded} label="fines de sem." />
      </div>

      {/* Festivos */}
      {r.holidaysIncluded.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {r.holidaysIncluded.map((h) => (
            <span
              key={h.date}
              className="bg-white/[0.04] border border-success/20 rounded-full px-3 py-1 text-success text-xs"
            >
              {formatDateShort(h.date)} · {h.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────

function DateBlock({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div>
      <p className="text-success/40 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-success font-mono text-sm">{primary}</p>
      <p className="text-success/60 font-mono text-sm">{secondary}</p>
    </div>
  );
}

function Stat({
  value,
  label,
  highlight = false,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center min-w-[60px]">
      <div
        className={`font-mono text-xl font-medium tabular-nums ${
          highlight ? "text-success" : "text-success/65"
        }`}
      >
        {value}
      </div>
      <div className="text-success/35 text-[10px] uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}
