"use client";

import { useState } from "react";
import type { VacationInput } from "@/types";

interface Props {
  onSubmit: (input: VacationInput) => void;
  isLoading: boolean;
}

type Mode = VacationInput["optimizationMode"];

const YEARS = [2025, 2026, 2027, 2028];

/**
 * The planner reads as one sentence; each input is a blank inside it.
 */
export function VacationForm({ onSubmit, isLoading }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(YEARS.includes(currentYear) ? currentYear : YEARS[1]);
  const [daysToUse, setDaysToUse] = useState(5);
  const [worksOnSaturday, setWorksOnSaturday] = useState(false);
  const [mode, setMode] = useState<Mode>("MAX_TOTAL_REST");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      year,
      vacationDaysToUse: Math.min(30, Math.max(1, daysToUse || 1)),
      worksOnSaturday,
      optimizationMode: mode,
      searchStartDate: fromDate || undefined,
      searchEndDate: toDate || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Planear vacaciones">
      <p className="font-display text-[clamp(1.5rem,4.2vw,2.5rem)] font-medium leading-[1.45] text-ink [overflow-wrap:anywhere]">
        Tengo{" "}
        <label className="sr-only" htmlFor="days">
          Días de vacaciones disponibles
        </label>
        <input
          id="days"
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          value={daysToUse}
          onChange={(e) => setDaysToUse(+e.target.value)}
          className="blank w-[2.4ch] text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />{" "}
        días de vacaciones en{" "}
        <label className="sr-only" htmlFor="year">
          Año
        </label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(+e.target.value)}
          className="blank appearance-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        . Los sábados{" "}
        <label className="sr-only" htmlFor="saturday">
          ¿Trabajas los sábados?
        </label>
        <select
          id="saturday"
          value={worksOnSaturday ? "yes" : "no"}
          onChange={(e) => setWorksOnSaturday(e.target.value === "yes")}
          className="blank appearance-none"
        >
          <option value="no">no trabajo</option>
          <option value="yes">sí trabajo</option>
        </select>{" "}
        y quiero{" "}
        <label className="sr-only" htmlFor="mode">
          Qué priorizar
        </label>
        <select
          id="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="blank appearance-none"
        >
          <option value="MAX_TOTAL_REST">el descanso más largo</option>
          <option value="MAX_EFFICIENCY">sacarle jugo a cada día</option>
        </select>
        .
      </p>

      <p className="mt-3 max-w-prose text-sm text-ink-muted">
        {mode === "MAX_TOTAL_REST"
          ? "Buscamos la mayor cantidad de días seguidos fuera, usando hasta todos tus días."
          : "Buscamos el bloque que más días gratis te regala por cada día que pides, aunque uses menos."}
      </p>

      <fieldset className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-rule pt-5">
        <legend className="sr-only">Rango de fechas opcional</legend>
        <span className="w-full text-sm text-ink-2 sm:w-auto sm:self-center">
          ¿Solo puedes en ciertas fechas?
        </span>
        <DateField id="from" label="Desde" value={fromDate} onChange={setFromDate} />
        <DateField id="to" label="Hasta" value={toDate} onChange={setToDate} />

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="ml-auto inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-control bg-ink px-6 py-3.5 font-display text-lg font-bold text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink-2 active:translate-y-px disabled:cursor-wait disabled:bg-ink-muted sm:w-auto"
        >
          {isLoading ? "Buscando fechas…" : "Buscar mis fechas"}
          <span aria-hidden="true" className="text-sun">
            →
          </span>
        </button>
      </fieldset>
    </form>
  );
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-control border border-rule bg-paper-2 px-3 py-2 font-mono text-sm text-ink transition-colors duration-150 ease-out hover:border-ink-muted"
      />
    </div>
  );
}
