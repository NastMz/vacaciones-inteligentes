import type { VacationInput, VacationRecommendation, Holiday } from "@/types";
import { getColombianHolidays } from "./colombian-holidays";
import { toDateKey, fromDateKey, addDays, isNonWorkingDay } from "./business-day";

/**
 * Genera un ranking de las mejores fechas de vacaciones.
 *
 * Algoritmo: fuerza bruta O(365 * N).
 * Para cada día hábil del año como posible inicio de solicitud:
 *   1. Avanza exactamente `vacationDaysToUse` días hábiles → fin de solicitud.
 *   2. Extiende hacia atrás mientras haya días no laborables (fines de semana / festivos).
 *   3. Extiende hacia adelante mientras haya días no laborables.
 *   4. El bloque resultante es el descanso real.
 *   5. Calcula días calendario y ratio de eficiencia.
 * Deduplicación por ventana de descanso real (realRestStart::realRestEnd).
 */
export function generateRecommendations(
  input: VacationInput
): VacationRecommendation[] {
  const {
    year,
    vacationDaysToUse,
    worksOnSaturday,
    searchStartDate,
    searchEndDate,
    optimizationMode,
  } = input;

  // Cargamos festivos del año anterior, actual y siguiente
  // para manejar extensiones que cruzan año (ej: dec 30 → jan 2)
  const holidays = new Map<string, string>([
    ...getColombianHolidays(year - 1),
    ...getColombianHolidays(year),
    ...getColombianHolidays(year + 1),
  ]);

  const rangeStart = searchStartDate
    ? fromDateKey(searchStartDate)
    : new Date(year, 0, 1);
  const rangeEnd = searchEndDate
    ? fromDateKey(searchEndDate)
    : new Date(year, 11, 31);
  const yearEnd = new Date(year, 11, 31);

  const candidates: VacationRecommendation[] = [];
  let current = new Date(year, 0, 1);

  while (current <= yearEnd) {
    const isValidStart =
      !isNonWorkingDay(current, holidays, worksOnSaturday) &&
      current >= rangeStart &&
      current <= rangeEnd;

    if (isValidStart) {
      // ── Paso 1: avanzar N días hábiles ──────────────────────
      let consumed = 0;
      let d = new Date(current);
      let guard = 0;

      while (consumed < vacationDaysToUse && guard++ < 500) {
        if (!isNonWorkingDay(d, holidays, worksOnSaturday)) consumed++;
        if (consumed < vacationDaysToUse) d = addDays(d, 1);
      }

      if (consumed < vacationDaysToUse) {
        current = addDays(current, 1);
        continue;
      }

      const requestEndDate = new Date(d);

      // ── Paso 2: extender hacia atrás ────────────────────────
      let realRestStart = new Date(current);
      let prev = addDays(realRestStart, -1);
      let backLimit = 0;
      while (
        isNonWorkingDay(prev, holidays, worksOnSaturday) &&
        backLimit++ < 14
      ) {
        realRestStart = new Date(prev);
        prev = addDays(prev, -1);
      }

      // ── Paso 3: extender hacia adelante ─────────────────────
      let realRestEnd = new Date(requestEndDate);
      let next = addDays(realRestEnd, 1);
      let fwdLimit = 0;
      while (
        isNonWorkingDay(next, holidays, worksOnSaturday) &&
        fwdLimit++ < 14
      ) {
        realRestEnd = new Date(next);
        next = addDays(next, 1);
      }

      // ── Métricas ─────────────────────────────────────────────
      const calendarDaysRested =
        Math.round(
          (realRestEnd.getTime() - realRestStart.getTime()) / 86400000
        ) + 1;
      const efficiencyRatio =
        Math.round((calendarDaysRested / vacationDaysToUse) * 100) / 100;

      // Festivos dentro del bloque de descanso real
      const holidaysIncluded: Holiday[] = [];
      let hs = new Date(realRestStart);
      while (hs <= realRestEnd) {
        const name = holidays.get(toDateKey(hs));
        if (name) {
          holidaysIncluded.push({ date: toDateKey(hs), name, type: "fixed" });
        }
        hs = addDays(hs, 1);
      }

      // Fines de semana dentro del bloque
      let weekendsIncluded = 0;
      let ws = new Date(realRestStart);
      while (ws <= realRestEnd) {
        const dow = ws.getDay();
        if (dow === 0 || (dow === 6 && !worksOnSaturday)) weekendsIncluded++;
        ws = addDays(ws, 1);
      }

      const score =
        optimizationMode === "MAX_EFFICIENCY"
          ? efficiencyRatio
          : calendarDaysRested;

      candidates.push({
        requestStartDate: toDateKey(current),
        requestEndDate: toDateKey(requestEndDate),
        realRestStartDate: toDateKey(realRestStart),
        realRestEndDate: toDateKey(realRestEnd),
        vacationDaysUsed: vacationDaysToUse,
        calendarDaysRested,
        efficiencyRatio,
        holidaysIncluded,
        weekendsIncluded,
        score,
      });
    }

    current = addDays(current, 1);
  }

  // ── Ordenar ────────────────────────────────────────────────
  candidates.sort((a, b) => {
    if (optimizationMode === "MAX_EFFICIENCY") {
      if (b.efficiencyRatio !== a.efficiencyRatio)
        return b.efficiencyRatio - a.efficiencyRatio;
      return b.calendarDaysRested - a.calendarDaysRested;
    } else {
      if (b.calendarDaysRested !== a.calendarDaysRested)
        return b.calendarDaysRested - a.calendarDaysRested;
      return b.efficiencyRatio - a.efficiencyRatio;
    }
  });

  // ── Deduplicar por ventana de descanso real ─────────────────
  const seen = new Set<string>();
  return candidates
    .filter((c) => {
      const key = `${c.realRestStartDate}::${c.realRestEndDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}
