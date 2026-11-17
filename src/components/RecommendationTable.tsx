import type { VacationRecommendation } from "@/types";
import { formatDateShort } from "@/lib/formatters";

interface Props {
  recommendations: VacationRecommendation[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Ranked alternatives as a stack of ticket stubs. Selecting one swaps the
 * boarding pass and the calendar.
 */
export function RecommendationTable({ recommendations, selectedIndex, onSelect }: Props) {
  return (
    <section aria-labelledby="alternatives-title">
      <h2 id="alternatives-title" className="font-display text-2xl font-bold text-ink">
        Otras salidas
      </h2>
      <p className="mt-1 text-sm text-ink-muted">Ordenadas de mejor a peor. Toca una para verla.</p>

      <ol className="mt-4 flex flex-col gap-2">
        {recommendations.map((r, i) => {
          const isSelected = i === selectedIndex;
          return (
            <li key={`${r.realRestStartDate}::${r.realRestEndDate}`}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={isSelected}
                aria-label={`Opción ${i + 1}: ${r.calendarDaysRested} días de descanso, +${r.extraRestDays} extra, del ${formatDateShort(r.requestStartDate)} al ${formatDateShort(r.requestEndDate)}`}
                className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-control border px-3 py-2.5 text-left transition-colors duration-150 ease-out ${
                  isSelected
                    ? "border-ink bg-ink text-paper"
                    : "border-rule bg-card text-ink hover:border-ink-muted hover:bg-paper-2"
                }`}
              >
                <span
                  className={`font-mono text-sm tabular-nums ${isSelected ? "text-sun" : "text-ink-muted"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm">
                    {formatDateShort(r.realRestStartDate)} → {formatDateShort(r.returnToWorkDate)}
                  </span>
                  <span
                    className={`block truncate text-xs ${isSelected ? "text-paper-3" : "text-ink-muted"}`}
                  >
                    Pides {r.vacationDaysUsed} {r.vacationDaysUsed === 1 ? "día" : "días"}
                    {r.holidaysIncluded.length > 0
                      ? ` · ${r.holidaysIncluded.map((h) => h.name).join(", ")}`
                      : ""}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-xl font-extrabold leading-none tabular-nums">
                    {r.calendarDaysRested}
                  </span>
                  <span
                    className={`block font-mono text-xs tabular-nums ${isSelected ? "text-sun" : "text-sun-strong"}`}
                  >
                    +{r.extraRestDays}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
