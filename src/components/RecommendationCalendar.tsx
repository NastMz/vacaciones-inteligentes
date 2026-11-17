import { addDays, fromDateKey, isNonWorkingDay, toDateKey } from "@/domain/business-day";
import { getColombianHolidays } from "@/domain/colombian-holidays";
import { formatDateFull } from "@/lib/formatters";
import type { VacationRecommendation } from "@/types";

interface Props {
  recommendation: VacationRecommendation;
  year: number;
  worksOnSaturday: boolean;
}

interface CalendarDay {
  dateKey: string;
  holidayName?: string;
  isRequestedVacation: boolean;
  isHoliday: boolean;
  isWeekendRest: boolean;
  isExtension: boolean;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const WEEKDAY_INITIALS = ["L", "M", "M", "J", "V", "S", "D"] as const;

export function RecommendationCalendar({
  recommendation,
  year,
  worksOnSaturday,
}: Props) {
  const calendarDays = buildCalendarDays(recommendation, worksOnSaturday, year);
  const monthGroups = groupByMonth(calendarDays);
  const holidays = calendarDays.filter((day) => day.isHoliday);

  return (
    <section aria-labelledby="calendar-title">
      <h2 id="calendar-title" className="font-display text-2xl font-bold text-ink">
        Tu descanso, día por día
      </h2>
      <p className="mt-1 max-w-prose text-sm text-ink-muted">
        Del {formatDateFull(recommendation.realRestStartDate)} al{" "}
        {formatDateFull(recommendation.realRestEndDate)}. Solo los días en naranja salen de tus
        vacaciones; el resto te lo regalan los fines de semana y los festivos.
      </p>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-2">
        <LegendItem swatch="bg-sun" label="Día que pides" />
        <LegendItem swatch="bg-sea" label="Festivo" />
        <LegendItem swatch="bg-paper-3 ring-1 ring-inset ring-rule" label="Fin de semana" />
      </ul>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {monthGroups.map(([monthKey, days]) => (
          <MonthGrid key={monthKey} monthKey={monthKey} days={days} />
        ))}
      </div>

      {holidays.length > 0 && (
        <ul className="mt-5 space-y-1 text-sm text-ink-2">
          {holidays.map((day) => (
            <li key={day.dateKey}>
              <span className="font-mono text-sea">{formatDateShortKey(day.dateKey)}</span>{" "}
              {day.holidayName}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function buildCalendarDays(
  recommendation: VacationRecommendation,
  worksOnSaturday: boolean,
  fallbackYear: number
): CalendarDay[] {
  const start = fromDateKey(recommendation.realRestStartDate);
  const end = fromDateKey(recommendation.realRestEndDate);
  const requestStart = fromDateKey(recommendation.requestStartDate);
  const requestEnd = fromDateKey(recommendation.requestEndDate);
  const holidays = getHolidayMap(start.getFullYear(), end.getFullYear(), fallbackYear);
  const days: CalendarDay[] = [];

  let current = new Date(start);
  while (current <= end) {
    const dateKey = toDateKey(current);
    const holidayName = holidays.get(dateKey);
    const nonWorking = isNonWorkingDay(current, holidays, worksOnSaturday);
    const inRequestRange = current >= requestStart && current <= requestEnd;
    const isRequestedVacation = inRequestRange && !nonWorking;
    const isHoliday = Boolean(holidayName);
    const isWeekendRest = !isHoliday && nonWorking;

    days.push({
      dateKey,
      holidayName,
      isRequestedVacation,
      isHoliday,
      isWeekendRest,
      isExtension: !isRequestedVacation,
    });

    current = addDays(current, 1);
  }

  return days;
}

function getHolidayMap(startYear: number, endYear: number, fallbackYear: number) {
  const holidays = new Map<string, string>();
  const years = new Set<number>([fallbackYear - 1, fallbackYear, fallbackYear + 1]);

  for (let year = startYear - 1; year <= endYear + 1; year++) {
    years.add(year);
  }

  for (const targetYear of years) {
    for (const [date, name] of getColombianHolidays(targetYear)) {
      holidays.set(date, name);
    }
  }

  return holidays;
}

function groupByMonth(days: CalendarDay[]) {
  const groups = new Map<string, CalendarDay[]>();

  for (const day of days) {
    const monthKey = day.dateKey.slice(0, 7);
    const monthDays = groups.get(monthKey);

    if (monthDays) {
      monthDays.push(day);
    } else {
      groups.set(monthKey, [day]);
    }
  }

  return Array.from(groups.entries());
}

function formatMonthTitle(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function formatDateShortKey(dateKey: string) {
  const [, month, date] = dateKey.split("-").map(Number);
  return `${date} ${MONTH_NAMES[month - 1].slice(0, 3).toLowerCase()}`;
}

/** Full month grid, Monday first, with the rest period painted in. */
function MonthGrid({ monthKey, days }: { monthKey: string; days: CalendarDay[] }) {
  const [year, month] = monthKey.split("-").map(Number);
  const byKey = new Map(days.map((day) => [day.dateKey, day]));
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  return (
    <figure className="rounded-ticket bg-card p-4 shadow-[0_1px_0_var(--color-rule)]">
      <figcaption className="mb-3 flex items-baseline justify-between">
        <span className="font-display text-lg font-bold text-ink">{formatMonthTitle(monthKey)}</span>
        <span className="font-mono text-xs text-ink-muted">
          {days.length} {days.length === 1 ? "día" : "días"} fuera
        </span>
      </figcaption>
      <div aria-hidden="true" className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <span key={i} className="pb-1 font-mono text-[11px] text-ink-muted">
            {initial}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <li key={`blank-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = i + 1;
          const dateKey = `${monthKey}-${String(date).padStart(2, "0")}`;
          return <DayCell key={dateKey} date={date} day={byKey.get(dateKey)} />;
        })}
      </ol>
    </figure>
  );
}

function DayCell({ date, day }: { date: number; day?: CalendarDay }) {
  if (!day) {
    return (
      <li className="py-1.5 font-mono text-sm tabular-nums text-rule">{date}</li>
    );
  }

  const tone = day.isRequestedVacation
    ? "bg-sun text-sun-ink font-semibold"
    : day.isHoliday
      ? "bg-sea text-sea-ink font-semibold"
      : "bg-paper-3 text-ink";
  const description = day.isRequestedVacation
    ? "día de vacaciones que pides"
    : day.isHoliday
      ? `festivo: ${day.holidayName}`
      : "fin de semana, no se cobra";

  return (
    <li
      aria-label={`${date}, ${description}`}
      title={day.isHoliday ? day.holidayName : undefined}
      className={`rounded-md py-1.5 font-mono text-sm tabular-nums ${tone}`}
    >
      {date}
    </li>
  );
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className={`h-3 w-3 rounded-sm ${swatch}`} />
      {label}
    </li>
  );
}
