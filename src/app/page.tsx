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
      ? `Ranking priorizado por descanso total: busca la mayor cantidad de días seguidos fuera, usando hasta ${submittedContext.vacationDaysToUse} días disponibles.`
      : `Ranking priorizado por eficiencia: busca el mejor descanso por cada día cobrado y puede recomendar usar menos de ${submittedContext.vacationDaysToUse} días disponibles.`
    : null;

  return (
    <main className="min-h-screen bg-navy-950 text-[#d1e4f0]">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-accent tracking-tight mb-1">
            Vacaciones inteligentes
          </h1>
          <p className="text-[#4a6a80] text-sm">
            Optimizador de vacaciones · Colombia · Festivos y puentes nacionales
          </p>
        </header>

        {/* Formulario */}
        <VacationForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Resultados */}
        {results !== null && (
          <section className="mt-6 space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-14 text-[#4a6a80] italic text-sm">
                Sin resultados con esos parámetros. Intenta ampliar el rango de fechas.
              </div>
            ) : (
              <>
                <p className="text-xs text-[#4a6a80] leading-relaxed">
                  Los resultados separan los días cobrados como vacaciones del descanso real.
                  Si el período toca fines de semana o festivos, tu ausencia puede extenderse sin
                  consumir días adicionales.
                </p>
                {rankingExplanation && (
                  <p className="text-xs text-[#5a7a90] leading-relaxed">
                    {rankingExplanation}
                  </p>
                )}
                {results.length > 1 && (
                  <RecommendationTable
                    recommendations={results}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                  />
                )}
                {selectedRecommendation && (
                  <>
                    <RecommendationCard
                      recommendation={selectedRecommendation}
                      rank={selectedIndex + 1}
                      isBest={selectedIndex === 0}
                    />
                    {submittedContext && (
                      <RecommendationCalendar
                        recommendation={selectedRecommendation}
                        year={submittedContext.year}
                        worksOnSaturday={submittedContext.worksOnSaturday}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* Disclaimer */}
        <footer className="mt-10 text-[#2a4a5a] text-xs text-center italic leading-relaxed">
          Este cálculo es informativo. La aprobación de vacaciones depende de las políticas
          internas de cada empleador, la jornada pactada y la disponibilidad operacional.
        </footer>

      </div>
    </main>
  );
}
