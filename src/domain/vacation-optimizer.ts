import type { VacationInput, VacationRecommendation, Holiday } from "@/types";
import { getColombianHolidays } from "./colombian-holidays";
import { toDateKey, fromDateKey, addDays, isNonWorkingDay } from "./business-day";

/**
 * Genera un ranking de las mejores fechas de vacaciones.
 *
 * Algoritmo: fuerza bruta O(365 * N).
 * Para cada día hábil del año como posible inicio de solicitud:
 *   1. Genera candidatos usando de 1 a `vacationDaysToUse` días hábiles.
 *   2. Extiende hacia atrás mientras haya días no laborables (fines de semana / festivos).
 *   3. Extiende hacia adelante mientras haya días no laborables.
 *   4. El bloque resultante es el descanso real.
 *   5. Calcula días calendario, días extra y ratio secundario.
 * Deduplicación por ventana de descanso real (realRestStart::realRestEnd)
 * conservando primero el mejor candidato según el modo de optimización.
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
  const maxVacationDaysToUse = Math.max(1, vacationDaysToUse);

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
      for (
        let vacationDaysUsed = 1;
        vacationDaysUsed <= maxVacationDaysToUse;
        vacationDaysUsed += 1
      ) {
        let consumed = 0;
        let d = new Date(current);
        let guard = 0;

        while (consumed < vacationDaysUsed && guard++ < 500) {
          if (!isNonWorkingDay(d, holidays, worksOnSaturday)) consumed++;
          if (consumed < vacationDaysUsed) d = addDays(d, 1);
        }

        if (consumed < vacationDaysUsed) {
          break;
        }

        const requestEndDate = new Date(d);

        if (requestEndDate > rangeEnd) {
          break;
        }

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

        const returnToWorkDate = getNextWorkingDay(
          realRestEnd,
          holidays,
          worksOnSaturday
        );

        const calendarDaysRested =
          Math.round(
            (realRestEnd.getTime() - realRestStart.getTime()) / 86400000
          ) + 1;
        const extraRestDays = calendarDaysRested - vacationDaysUsed;
        const efficiencyRatio =
          Math.round((calendarDaysRested / vacationDaysUsed) * 100) / 100;

        const holidaysIncluded: Holiday[] = [];
        let hs = new Date(realRestStart);
        while (hs <= realRestEnd) {
          const name = holidays.get(toDateKey(hs));
          if (name) {
            holidaysIncluded.push({ date: toDateKey(hs), name, type: "fixed" });
          }
          hs = addDays(hs, 1);
        }

        let weekendsIncluded = 0;
        let ws = new Date(realRestStart);
        while (ws <= realRestEnd) {
          const dow = ws.getDay();
          if (dow === 0 || (dow === 6 && !worksOnSaturday)) weekendsIncluded++;
          ws = addDays(ws, 1);
        }

        const score =
          optimizationMode === "MAX_EFFICIENCY"
            ? extraRestDays
            : calendarDaysRested;

        candidates.push({
          requestStartDate: toDateKey(current),
          requestEndDate: toDateKey(requestEndDate),
          realRestStartDate: toDateKey(realRestStart),
          realRestEndDate: toDateKey(realRestEnd),
          returnToWorkDate: toDateKey(returnToWorkDate),
          vacationDaysUsed,
          calendarDaysRested,
          extraRestDays,
          efficiencyRatio,
          holidaysIncluded,
          weekendsIncluded,
          score,
        });
      }
    }

    current = addDays(current, 1);
  }

  // ── Ordenar ────────────────────────────────────────────────
  candidates.sort((a, b) => compareRecommendations(a, b, optimizationMode));

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

function compareRecommendations(
  a: VacationRecommendation,
  b: VacationRecommendation,
  optimizationMode: VacationInput["optimizationMode"]
): number {
  // MAX_EFFICIENCY en UI significa "Mejor aprovechamiento":
  // primero más días extra, luego mejor ratio, luego menos días cobrados,
  // después más descanso real y finalmente orden estable por fecha.
  if (optimizationMode === "MAX_EFFICIENCY") {
    if (b.extraRestDays !== a.extraRestDays) {
      return b.extraRestDays - a.extraRestDays;
    }

    if (b.efficiencyRatio !== a.efficiencyRatio) {
      return b.efficiencyRatio - a.efficiencyRatio;
    }

    if (a.vacationDaysUsed !== b.vacationDaysUsed) {
      return a.vacationDaysUsed - b.vacationDaysUsed;
    }

    if (b.calendarDaysRested !== a.calendarDaysRested) {
      return b.calendarDaysRested - a.calendarDaysRested;
    }
  } else if (b.calendarDaysRested !== a.calendarDaysRested) {
    return b.calendarDaysRested - a.calendarDaysRested;
  } else if (b.extraRestDays !== a.extraRestDays) {
    return b.extraRestDays - a.extraRestDays;
  } else if (b.efficiencyRatio !== a.efficiencyRatio) {
    return b.efficiencyRatio - a.efficiencyRatio;
  }

  if (a.vacationDaysUsed !== b.vacationDaysUsed) {
    return a.vacationDaysUsed - b.vacationDaysUsed;
  }

  if (a.requestStartDate !== b.requestStartDate) {
    return a.requestStartDate.localeCompare(b.requestStartDate);
  }

  return a.requestEndDate.localeCompare(b.requestEndDate);
}

function getNextWorkingDay(
  date: Date,
  holidays: Map<string, string>,
  worksOnSaturday: boolean
): Date {
  let current = addDays(date, 1);
  let guard = 0;

  while (isNonWorkingDay(current, holidays, worksOnSaturday) && guard++ < 30) {
    current = addDays(current, 1);
  }

  return current;
}
