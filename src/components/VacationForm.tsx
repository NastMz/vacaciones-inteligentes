"use client";

import { useState } from "react";
import type { VacationInput } from "@/types";

interface Props {
  onSubmit: (input: VacationInput) => void;
  isLoading: boolean;
}

export function VacationForm({ onSubmit, isLoading }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [daysToUse, setDaysToUse] = useState(5);
  const [worksOnSaturday, setWorksOnSaturday] = useState(false);
  const [mode, setMode] = useState<"MAX_TOTAL_REST" | "MAX_EFFICIENCY">(
    "MAX_TOTAL_REST"
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      year,
      vacationDaysToUse: Math.max(1, daysToUse),
      worksOnSaturday,
      optimizationMode: mode,
      searchStartDate: fromDate || undefined,
      searchEndDate: toDate || undefined,
    });
  }

  const fieldLabel = "text-[10px] font-semibold text-[#5a7a90] uppercase tracking-widest mb-1.5 block";
  const input =
    "w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#d1e4f0] focus:outline-none focus:border-accent transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-navy-800 border border-white/[0.07] rounded-2xl p-6"
    >
      <p className={fieldLabel + " mb-5"}>Parámetros del cálculo</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">

        {/* Año */}
        <div>
          <label htmlFor="year" className={fieldLabel}>Año</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className={input}
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Días */}
        <div>
          <label htmlFor="days" className={fieldLabel}>Días hábiles a usar</label>
          <input
            id="days"
            type="number"
            min={1}
            max={30}
            value={daysToUse}
            onChange={(e) => setDaysToUse(+e.target.value)}
            className={input}
          />
        </div>

        {/* Sábados */}
        <div>
          <span className={fieldLabel}>¿Trabajas sábados?</span>
          <ToggleGroup
            value={worksOnSaturday}
            onChange={setWorksOnSaturday}
            options={[
              { value: false, label: "No" },
              { value: true, label: "Sí" },
            ]}
          />
        </div>

        {/* Modo */}
        <div>
          <span className={fieldLabel}>Optimizar por</span>
          <ToggleGroup
            value={mode}
            onChange={setMode}
            options={[
              { value: "MAX_TOTAL_REST", label: "Más días" },
              { value: "MAX_EFFICIENCY", label: "Eficiencia" },
            ]}
          />
        </div>

        {/* Desde */}
        <div>
          <label htmlFor="from" className={fieldLabel}>
            Desde <span className="normal-case font-normal text-[#3a5a70]">(opcional)</span>
          </label>
          <input
            id="from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={input}
          />
        </div>

        {/* Hasta */}
        <div>
          <label htmlFor="to" className={fieldLabel}>
            Hasta <span className="normal-case font-normal text-[#3a5a70]">(opcional)</span>
          </label>
          <input
            id="to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={input}
          />
        </div>

      </div>

      <p className="mb-5 text-xs text-[#4a6a80] leading-relaxed">
        El rango de búsqueda limita los días de vacaciones cobrados; el descanso real
        puede extenderse por fines de semana o festivos.
      </p>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 font-bold rounded-xl py-3 text-sm transition-all"
      >
        {isLoading ? "Calculando…" : "Encontrar mejores fechas →"}
      </button>
    </form>
  );
}

// ── Toggle group reutilizable ──────────────────────────────────
interface ToggleOption<T> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T> {
  value: T;
  onChange: (v: T) => void;
  options: ToggleOption<T>[];
}

function ToggleGroup<T>({ value, onChange, options }: ToggleGroupProps<T>) {
  return (
    <div className="flex gap-1 bg-navy-950 border border-white/10 rounded-lg p-1">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? "bg-accent text-navy-950"
                : "text-[#5a7a90] hover:text-[#d1e4f0]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
