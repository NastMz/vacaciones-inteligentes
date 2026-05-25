import type { VacationRecommendation } from "@/types";
import { formatDateShort } from "@/lib/formatters";

interface Props {
  recommendations: VacationRecommendation[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function RecommendationTable({
  recommendations,
  selectedIndex,
  onSelect,
}: Props) {
  return (
    <div className="bg-navy-800 border border-white/[0.07] rounded-2xl p-6">
      <p className="text-[10px] font-semibold text-[#8aa7b9] uppercase tracking-widest mb-4">
        Top {recommendations.length} opciones
      </p>

      <div className="overflow-x-auto themed-scrollbar pb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["#", "Días cobrados", "Descanso real", "Vuelves", "Días", "+ Extra", "Ratio", "Festivos", "Acción"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 text-[#8aa7b9] font-semibold uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {recommendations.map((r, i) => (
              <Row
                key={`${r.realRestStartDate}::${r.realRestEndDate}`}
                r={r}
                i={i}
                isSelected={i === selectedIndex}
                onSelect={onSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  r,
  i,
  isSelected,
  onSelect,
}: {
  r: VacationRecommendation;
  i: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}) {
  const isBest = i === 0;
  const base = "py-2.5 px-3 border-b border-white/[0.03]";
  const rowBg = isSelected
    ? "bg-accent/8"
    : isBest
      ? "bg-success-bg/40"
      : "hover:bg-white/[0.015]";

  const td = `${base} ${rowBg}`;
  const selectRow = () => onSelect(i);

  return (
    <tr
      className={`${rowBg} cursor-pointer ${isSelected ? "outline outline-1 outline-accent/35 -outline-offset-1" : ""}`}
      onClick={selectRow}
      aria-label={isSelected ? `Opción ${i + 1} seleccionada` : `Seleccionar opción ${i + 1}`}
    >
      <td className={td + " text-[#7ea0b7]"}>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span>{i + 1}</span>
          {isBest && (
            <span className="rounded-full border border-success/20 bg-success-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
              Mejor
            </span>
          )}
          {isSelected && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Seleccionada
            </span>
          )}
        </div>
      </td>
      <td className={td + " font-mono text-[#9ab8cc] whitespace-nowrap"}>
        {formatDateShort(r.requestStartDate)} → {formatDateShort(r.requestEndDate)}
      </td>
      <td className={td + " font-mono text-[#8aa7b9] whitespace-nowrap"}>
        {formatDateShort(r.realRestStartDate)} – {formatDateShort(r.realRestEndDate)}
      </td>
      <td className={td + " font-mono text-[#7ea0b7] whitespace-nowrap"}>
        {formatDateShort(r.returnToWorkDate)}
      </td>
      <td className={td + " text-center font-semibold text-[#c8dce8]"}>
        {r.calendarDaysRested}
      </td>
      <td className={td + " text-center font-semibold text-success whitespace-nowrap"}>
        +{r.extraRestDays} extra
      </td>
      <td className={td + " text-center text-[#6a8ba0] whitespace-nowrap"}>
        {r.efficiencyRatio}×
      </td>
      <td className={td + " text-[#7ea0b7] max-w-[180px] truncate"}>
        {r.holidaysIncluded.length > 0
          ? r.holidaysIncluded.map((h) => h.name).join(" · ")
          : "—"}
      </td>
      <td className={td + " text-right whitespace-nowrap"}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            selectRow();
          }}
          className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
            isSelected
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-white/10 text-[#9ab8cc] hover:border-white/20 hover:text-[#d1e4f0]"
          }`}
          aria-pressed={isSelected}
          aria-label={isSelected ? `Opción ${i + 1} seleccionada` : `Seleccionar opción ${i + 1}`}
        >
          {isSelected ? "Vista actual" : "Seleccionar"}
        </button>
      </td>
    </tr>
  );
}
