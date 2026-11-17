import type { VacationRecommendation } from "@/types";
import { formatDateFull, formatDateShort } from "@/lib/formatters";

interface Props {
  recommendation: VacationRecommendation;
  rank?: number;
  total?: number;
  isBest?: boolean;
}

/**
 * The selected recommendation as a boarding pass: the main pass carries the
 * trip and the days you request; the torn-off stub carries what you get free.
 */
export function RecommendationCard({
  recommendation: r,
  rank = 1,
  total,
  isBest = false,
}: Props) {
  return (
    <article
      aria-label={`Opción ${rank}: ${r.calendarDaysRested} días de descanso`}
      className="ticket-enter md:ticket grid grid-cols-1 overflow-hidden rounded-ticket bg-card shadow-[0_1px_0_var(--color-rule),0_18px_40px_-28px_var(--color-ink)] [--tear-x:calc(100%-17rem)] md:grid-cols-[minmax(0,1fr)_17rem]"
    >
      {/* Main pass */}
      <div className="min-w-0 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">
          <span>Pasabordo</span>
          <span aria-hidden="true">·</span>
          <span>
            Opción {rank}
            {total ? ` de ${total}` : ""}
          </span>
          {isBest && (
            <span className="rounded-full bg-sun px-2.5 py-0.5 font-sans text-[11px] font-semibold normal-case tracking-normal text-sun-ink">
              La mejor salida
            </span>
          )}
        </div>

        <p className="mt-4 flex items-baseline gap-3 font-display text-ink">
          <span className="text-[clamp(4.5rem,14vw,7.5rem)] font-extrabold leading-[0.85] tabular-nums tracking-tight">
            {r.calendarDaysRested}
          </span>
          <span className="text-2xl font-semibold sm:text-3xl">días fuera</span>
        </p>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
          <Leg label="Sales" date={r.realRestStartDate} />
          <Route />
          <Leg label="Vuelves al trabajo" date={r.returnToWorkDate} align="end" />
        </div>

        <p className="mt-6 border-t border-dashed border-rule pt-4 text-sm leading-relaxed text-ink-2">
          Pides del <strong className="font-semibold text-ink">{formatDateFull(r.requestStartDate)}</strong> al{" "}
          <strong className="font-semibold text-ink">{formatDateFull(r.requestEndDate)}</strong>:{" "}
          <span className="font-mono tabular-nums">{r.vacationDaysUsed}</span>{" "}
          {r.vacationDaysUsed === 1 ? "día hábil" : "días hábiles"} de vacaciones. El descanso
          termina el {formatDateFull(r.realRestEndDate)}.
        </p>
      </div>

      {/* Stub */}
      <div className="flex min-w-0 flex-col gap-5 border-t-2 border-dashed border-rule bg-paper-2 p-6 sm:p-8 md:border-l-2 md:border-t-0">
        <div>
          <p className="font-display text-6xl font-extrabold leading-none text-sun-strong tabular-nums">
            +{r.extraRestDays}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">
            {r.extraRestDays === 1 ? "día que no pides" : "días que no pides"}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink-muted">Rinde cada día</dt>
            <dd className="font-mono text-lg text-ink tabular-nums">{r.efficiencyRatio}×</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Fines de semana</dt>
            <dd className="font-mono text-lg text-ink tabular-nums">{r.weekendsIncluded}</dd>
          </div>
        </dl>

        {r.holidaysIncluded.length > 0 && (
          <ul aria-label="Festivos incluidos" className="flex flex-wrap gap-2">
            {r.holidaysIncluded.map((h, i) => (
              <li
                key={h.date}
                className={`rounded-[4px] border-2 border-dashed border-sea px-2 py-1 text-xs font-semibold text-sea ${
                  i % 2 === 0 ? "-rotate-2" : "rotate-1"
                }`}
              >
                <span className="font-mono">{formatDateShort(h.date)}</span> · {h.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function Leg({
  label,
  date,
  align = "start",
}: {
  label: string;
  date: string;
  align?: "start" | "end";
}) {
  return (
    <div className={`min-w-0 ${align === "end" ? "text-right" : ""}`}>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-bold leading-tight text-ink sm:text-2xl">
        {formatDateFull(date)}
      </p>
    </div>
  );
}

function Route() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 24"
      className="mb-2 h-5 w-14 text-sun sm:w-24"
      fill="none"
    >
      <path d="M2 12h70" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      <circle cx="84" cy="12" r="7" fill="currentColor" />
    </svg>
  );
}
