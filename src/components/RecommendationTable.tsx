import type { VacationRecommendation } from "@/types";
import { formatDateShort } from "@/lib/formatters";

interface Props {
  recommendations: VacationRecommendation[];
}

export function RecommendationTable({ recommendations }: Props) {
  return (
    <div className="bg-navy-800 border border-white/[0.07] rounded-2xl p-6">
      <p className="text-[10px] font-semibold text-[#4a6a80] uppercase tracking-widest mb-4">
        Top {recommendations.length} opciones
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["#", "Solicitar del → al", "Descanso real", "Días", "Efic.", "Festivos"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 text-[#3a5a70] font-semibold uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {recommendations.map((r, i) => (
              <Row key={`${r.realRestStartDate}::${r.realRestEndDate}`} r={r} i={i} />
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
}: {
  r: VacationRecommendation;
  i: number;
}) {
  const isBest = i === 0;
  const base = "py-2.5 px-3 border-b border-white/[0.03]";
  const rowBg = isBest ? "bg-success-bg/60" : "hover:bg-white/[0.015]";

  const td = `${base} ${rowBg}`;

  return (
    <tr className={rowBg}>
      <td className={td + " text-[#3a5a70]"}>{i + 1}</td>
      <td className={td + " font-mono text-[#9ab8cc] whitespace-nowrap"}>
        {formatDateShort(r.requestStartDate)} → {formatDateShort(r.requestEndDate)}
      </td>
      <td className={td + " font-mono text-[#5a7a8a] whitespace-nowrap"}>
        {formatDateShort(r.realRestStartDate)} – {formatDateShort(r.realRestEndDate)}
      </td>
      <td className={td + " text-center font-semibold text-[#c8dce8]"}>
        {r.calendarDaysRested}
      </td>
      <td className={td + " text-center text-[#6a8ba0]"}>
        {r.efficiencyRatio}×
      </td>
      <td className={td + " text-[#4a6a80] max-w-[180px] truncate"}>
        {r.holidaysIncluded.length > 0
          ? r.holidaysIncluded.map((h) => h.name).join(" · ")
          : "—"}
      </td>
    </tr>
  );
}
