import type { ReactNode } from "react";
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

const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"] as const;

export function RecommendationCalendar({
  recommendation,
  year,
  worksOnSaturday,
}: Props) {
  const calendarDays = buildCalendarDays(recommendation, worksOnSaturday, year);
  const monthGroups = groupByMonth(calendarDays);

  return (
    <section className="bg-navy-800 border border-white/[0.07] rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-semibold text-[#4a6a80] uppercase tracking-widest mb-1">
            Calendario del descanso
          </p>
          <h2 className="text-lg font-semibold text-[#d1e4f0]">
            Día por día del período real
          </h2>
          <p className="text-sm text-[#6a8ba0] mt-1">
            Del {formatDateFull(recommendation.realRestStartDate)} al{" "}
            {formatDateFull(recommendation.realRestEndDate)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-[#9ab8cc]">
          <Legend label="Vacación solicitada" className="bg-accent/15 border-accent/35 text-accent" />
          <Legend label="Festivo" className="bg-success-bg border-success/25 text-success" />
          <Legend label="Fin de semana / no laboral" className="bg-white/[0.04] border-white/10 text-[#d1e4f0]" />
          <Legend label="Extensión" className="bg-navy-950 border-white/10 text-[#6a8ba0]" />
        </div>
      </div>

      <div className="space-y-5">
        {monthGroups.map(([monthKey, days]) => (
          <section key={monthKey}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#d1e4f0]">
                {formatMonthTitle(days[0].dateKey)}
              </h3>
              <span className="text-[11px] text-[#4a6a80]">{days.length} días</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {days.map((day) => (
                <DayCard key={day.dateKey} day={day} />
              ))}
            </div>
          </section>
        ))}
      </div>
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

function formatMonthTitle(dateKey: string) {
  const [year, month] = dateKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function DayCard({ day }: { day: CalendarDay }) {
  const [year, month, date] = day.dateKey.split("-").map(Number);
  const weekday = WEEKDAY_SHORT[new Date(year, month - 1, date).getDay()];
  const tone = day.isRequestedVacation
    ? "bg-accent/10 border-accent/30"
    : day.isHoliday
      ? "bg-success-bg/70 border-success/25"
      : "bg-white/[0.03] border-white/[0.08]";

  return (
    <article className={`rounded-xl border p-3 ${tone}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#4a6a80]">{weekday}</p>
          <p className="font-mono text-base text-[#d1e4f0]">{day.dateKey}</p>
        </div>
        <span className="text-2xl font-mono text-[#d1e4f0] tabular-nums">{date}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {day.isRequestedVacation && <Tag className="bg-accent/15 border-accent/35 text-accent">Vacación</Tag>}
        {day.isHoliday && <Tag className="bg-success-bg border-success/25 text-success">Festivo</Tag>}
        {day.isWeekendRest && (
          <Tag className="bg-white/[0.04] border-white/10 text-[#d1e4f0]">No laboral</Tag>
        )}
        {day.isExtension && (
          <Tag className="bg-navy-950 border-white/10 text-[#6a8ba0]">Extensión</Tag>
        )}
      </div>

      <p className="text-xs text-[#8aa7b9]">
        {day.isRequestedVacation
          ? "Cuenta como día hábil solicitado."
          : day.isHoliday
            ? day.holidayName
            : "Descanso por fin de semana o día no laboral."}
      </p>
    </article>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return <Tag className={className}>{label}</Tag>;
}

function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}
