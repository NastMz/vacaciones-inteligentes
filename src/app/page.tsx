"use client";

import { useState } from "react";
import type { VacationInput, VacationRecommendation } from "@/types";
import { generateRecommendations } from "@/domain/vacation-optimizer";
import { VacationForm } from "@/components/VacationForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { RecommendationTable } from "@/components/RecommendationTable";
import { RecommendationCalendar } from "@/components/RecommendationCalendar";

interface SubmittedContext {
  year: number;
  worksOnSaturday: boolean;
  optimizationMode: VacationInput["optimizationMode"];
  vacationDaysToUse: number;
}

export default function Home() {
  const [results, setResults] = useState<VacationRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [submittedContext, setSubmittedContext] = useState<SubmittedContext | null>(null);

  function handleSubmit(input: VacationInput) {
    setIsLoading(true);
    // setTimeout mantiene la UI responsiva durante el cálculo
    setTimeout(() => {
      const recommendations = generateRecommendations(input);
      setResults(recommendations);
      setSelectedIndex(0);
      setSubmittedContext({
        year: input.year,
        worksOnSaturday: input.worksOnSaturday,
        optimizationMode: input.optimizationMode,
        vacationDaysToUse: input.vacationDaysToUse,
      });
      setIsLoading(false);
    }, 50);
  }

  const selectedRecommendation =
    results && results.length > 0
      ? results[Math.min(selectedIndex, results.length - 1)]
      : null;
  const rankingExplanation = submittedContext
    ? submittedContext.optimizationMode === "MAX_TOTAL_REST"
      ? `Ordenamos por descanso total: la mayor cantidad de días seguidos fuera usando hasta ${submittedContext.vacationDaysToUse} días de vacaciones. Si tus fechas tocan fines de semana o festivos, tu ausencia se alarga sin gastar días extra.`
      : `Ordenamos por aprovechamiento: los bloques que más días regalan por cada día que pides, aunque usen menos de tus ${submittedContext.vacationDaysToUse} días.`
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
      <header className="flex items-center justify-between gap-4 py-6">
        <p className="flex items-center gap-2.5 text-ink">
          <SunMark />
          <span className="font-display text-xl font-extrabold lowercase tracking-tight">
            vacaciones inteligentes
          </span>
        </p>
        <span className="hidden font-mono text-xs uppercase tracking-[0.14em] text-ink-muted sm:block">
          Festivos de Colombia
        </span>
      </header>

      <section className="pt-10 sm:pt-16" aria-labelledby="hero-title">
        <h1
          id="hero-title"
          className="font-display text-[clamp(3.25rem,11vw,8rem)] font-extrabold leading-[0.88] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]"
        >
          Estira tus <span className="text-sun-strong">vacaciones</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
          Cruzamos tus días libres con los festivos y puentes de Colombia para encontrar la
          salida más larga, sin pedir un día de más.
        </p>

        <div className="mt-12">
          <VacationForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </section>

      {results !== null && (
        <section className="mt-16 sm:mt-20" aria-label="Resultados" aria-live="polite">
          {results.length === 0 ? (
            <p className="rounded-ticket bg-paper-2 px-6 py-10 text-center text-ink-2">
              No encontramos salidas con esas condiciones. Prueba con un rango de fechas más amplio.
            </p>
          ) : (
            selectedRecommendation && (
              <>
                <RecommendationCard
                  key={`${selectedRecommendation.realRestStartDate}::${selectedRecommendation.realRestEndDate}`}
                  recommendation={selectedRecommendation}
                  rank={selectedIndex + 1}
                  total={results.length}
                  isBest={selectedIndex === 0}
                />
                {rankingExplanation && (
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-muted">
                    {rankingExplanation}
                  </p>
                )}

                <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                  {submittedContext && (
                    <RecommendationCalendar
                      recommendation={selectedRecommendation}
                      year={submittedContext.year}
                      worksOnSaturday={submittedContext.worksOnSaturday}
                    />
                  )}
                  {results.length > 1 && (
                    <RecommendationTable
                      recommendations={results}
                      selectedIndex={selectedIndex}
                      onSelect={setSelectedIndex}
                    />
                  )}
                </div>
              </>
            )
          )}
        </section>
      )}

      <footer className="mt-24 flex flex-col gap-3 border-t border-rule pt-6 text-xs leading-relaxed text-ink-muted sm:flex-row sm:justify-between">
        <p className="max-w-2xl">
          Cálculo informativo. La aprobación de vacaciones depende de las políticas de cada
          empleador, la jornada pactada y la disponibilidad operacional.
        </p>
        <a
          href="https://github.com/NastMz/vacaciones-inteligentes"
          className="whitespace-nowrap font-medium text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
        >
          Código en GitHub
        </a>
      </footer>
    </main>
  );
}

function SunMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7">
      <circle cx="16" cy="13" r="7" fill="var(--color-accent)" />
      <path
        d="M4 24c4-3 8-3 12 0s8 3 12 0"
        stroke="var(--color-sea)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
