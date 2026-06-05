import { addDays, toDateKey } from "./business-day";
import type { Holiday } from "@/types";

/**
 * Algoritmo de Gauss para calcular la fecha de Pascua.
 */
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Ley Emiliani: si el festivo no cae en lunes, se traslada al lunes siguiente.
 */
function nextMonday(date: Date): Date {
  const result = new Date(date);
  const dow = result.getDay();
  if (dow === 1) return result;
  result.setDate(result.getDate() + ((8 - dow) % 7));
  return result;
}

/**
 * Retorna un Map<YYYY-MM-DD, name> con todos los festivos del año dado.
 * Incluye festivos fijos, Ley Emiliani y relativos a Pascua.
 */
export function getColombianHolidays(year: number): Map<string, string> {
  const holidays = new Map<string, string>();

  function add(date: Date, name: string) {
    holidays.set(toDateKey(date), name);
  }

  function emiliani(month: number, day: number): Date {
    return nextMonday(new Date(year, month - 1, day));
  }

  const easter = getEasterDate(year);

  // Festivos fijos (nunca se trasladan)
  add(new Date(year, 0, 1),   "Año Nuevo");
  add(new Date(year, 4, 1),   "Día del Trabajo");
  add(new Date(year, 6, 20),  "Día de la Independencia");
  add(new Date(year, 7, 7),   "Batalla de Boyacá");
  add(new Date(year, 11, 8),  "Inmaculada Concepción");
  add(new Date(year, 11, 25), "Navidad");

  // Festivos Ley Emiliani (se trasladan al lunes siguiente)
  add(emiliani(1, 6),   "Reyes Magos");
  add(emiliani(3, 19),  "San José");
  add(emiliani(6, 29),  "San Pedro y San Pablo");
  add(emiliani(7, 9),   "Nuestra Señora del Rosario de Chiquinquirá");
  add(emiliani(8, 15),  "Asunción de la Virgen");
  add(emiliani(10, 12), "Día de la Raza");
  add(emiliani(11, 1),  "Todos los Santos");
  add(emiliani(11, 11), "Independencia de Cartagena");

  // Semana Santa (fecha fija relativa a Pascua)
  add(addDays(easter, -3), "Jueves Santo");
  add(addDays(easter, -2), "Viernes Santo");

  // Pascua + Ley Emiliani
  add(nextMonday(addDays(easter, 39)), "Ascensión del Señor");
  add(nextMonday(addDays(easter, 60)), "Corpus Christi");
  add(nextMonday(addDays(easter, 68)), "Sagrado Corazón de Jesús");

  return holidays;
}

/**
 * Retorna los festivos del año como array tipado (útil para UI).
 */
export function getHolidayList(year: number): Holiday[] {
  return Array.from(getColombianHolidays(year).entries())
    .map(([date, name]) => ({ date, name, type: "fixed" as const }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
