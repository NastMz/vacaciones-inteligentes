"use client";

import { useState } from "react";
import type { VacationInput, VacationRecommendation } from "@/types";
import { generateRecommendations } from "@/domain/vacation-optimizer";
import { VacationForm } from "@/components/VacationForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { RecommendationTable } from "@/components/RecommendationTable";

export default function Home() {
  const [results, setResults] = useState<VacationRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(input: VacationInput) {
    setIsLoading(true);
    // setTimeout mantiene la UI responsiva durante el cálculo
    setTimeout(() => {
      const recommendations = generateRecommendations(input);
      setResults(recommendations);
      setIsLoading(false);
    }, 50);
  }

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
                <RecommendationCard recommendation={results[0]} />
                {results.length > 1 && (
                  <RecommendationTable recommendations={results} />
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
