import { describe, expect, it } from "vitest";

import { generateRecommendations } from "./vacation-optimizer";
import type { VacationInput, VacationRecommendation } from "@/types";

function createInput(overrides: Partial<VacationInput> = {}): VacationInput {
  return {
    year: 2025,
    vacationDaysToUse: 1,
    worksOnSaturday: false,
    optimizationMode: "MAX_TOTAL_REST",
    ...overrides,
  };
}

function getDayOfWeek(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function toWindowKeys(recommendations: VacationRecommendation[]): string[] {
  return recommendations.map(
    (recommendation) =>
      `${recommendation.realRestStartDate}::${recommendation.realRestEndDate}`
  );
}

describe("generateRecommendations", () => {
  it("never starts the request on weekends or the New Year holiday when Saturdays are non-working", () => {
    const recommendations = generateRecommendations(
      createInput({
        searchStartDate: "2025-01-01",
        searchEndDate: "2025-01-05",
      })
    );

    expect(recommendations).not.toHaveLength(0);
    expect(recommendations.map((item) => item.requestStartDate)).toEqual([
      "2025-01-03",
      "2025-01-02",
    ]);
    expect(recommendations.every((item) => getDayOfWeek(item.requestStartDate) < 6 && getDayOfWeek(item.requestStartDate) !== 0)).toBe(true);
  });

  it("never ends the request on Sunday, Saturday, or Christmas when Saturdays are non-working", () => {
    const recommendations = generateRecommendations(
      createInput({
        vacationDaysToUse: 4,
        searchStartDate: "2025-12-22",
        searchEndDate: "2025-12-27",
      })
    );

    expect(recommendations).not.toHaveLength(0);
    expect(recommendations.every((item) => getDayOfWeek(item.requestEndDate) !== 0)).toBe(true);
    expect(recommendations.every((item) => getDayOfWeek(item.requestEndDate) !== 6)).toBe(true);
    expect(recommendations.every((item) => item.requestEndDate !== "2025-12-25")).toBe(true);
  });

  it("can end the request on Saturday when Saturdays are working days", () => {
    const recommendations = generateRecommendations(
      createInput({
        worksOnSaturday: true,
        searchStartDate: "2025-01-03",
        searchEndDate: "2025-01-04",
      })
    );

    expect(
      recommendations.some(
        (item) =>
          item.requestStartDate === "2025-01-04" &&
          item.requestEndDate === "2025-01-04"
      )
    ).toBe(true);
  });

  it("extends real rest across adjacent weekends and holidays", () => {
    const recommendations = generateRecommendations(
      createInput({
        searchStartDate: "2025-01-03",
        searchEndDate: "2025-01-03",
      })
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        requestStartDate: "2025-01-03",
        requestEndDate: "2025-01-03",
        realRestStartDate: "2025-01-03",
        realRestEndDate: "2025-01-06",
        calendarDaysRested: 4,
        weekendsIncluded: 2,
      }),
    ]);
    expect(recommendations[0]?.holidaysIncluded).toEqual([
      expect.objectContaining({ date: "2025-01-06", name: "Reyes Magos" }),
    ]);
  });

  it("extends real rest backward across adjacent weekends and holidays", () => {
    const recommendations = generateRecommendations(
      createInput({
        searchStartDate: "2025-01-07",
        searchEndDate: "2025-01-07",
      })
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        requestStartDate: "2025-01-07",
        requestEndDate: "2025-01-07",
        realRestStartDate: "2025-01-04",
        realRestEndDate: "2025-01-07",
        calendarDaysRested: 4,
        weekendsIncluded: 2,
      }),
    ]);
    expect(recommendations[0]?.holidaysIncluded).toEqual([
      expect.objectContaining({ date: "2025-01-06", name: "Reyes Magos" }),
    ]);
  });

  it("excludes recommendations whose charged vacation range exceeds searchEndDate", () => {
    const recommendations = generateRecommendations(
      createInput({
        vacationDaysToUse: 3,
        searchStartDate: "2025-12-29",
        searchEndDate: "2025-12-30",
      })
    );

    expect(recommendations).toEqual([]);
  });

  it("computes returnToWorkDate as the first working day after the real rest ends", () => {
    const recommendations = generateRecommendations(
      createInput({
        searchStartDate: "2025-01-03",
        searchEndDate: "2025-01-03",
      })
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        realRestEndDate: "2025-01-06",
        returnToWorkDate: "2025-01-07",
      }),
    ]);
  });

  it("can return to work on Saturday when Saturdays are working days", () => {
    const recommendations = generateRecommendations(
      createInput({
        vacationDaysToUse: 1,
        worksOnSaturday: true,
        searchStartDate: "2025-01-03",
        searchEndDate: "2025-01-03",
      })
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        realRestEndDate: "2025-01-03",
        returnToWorkDate: "2025-01-04",
      }),
    ]);
  });

  it("can extend real rest into the next year when the adjacent day is a holiday", () => {
    const recommendations = generateRecommendations(
      createInput({
        searchStartDate: "2025-12-31",
        searchEndDate: "2025-12-31",
      })
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        requestStartDate: "2025-12-31",
        requestEndDate: "2025-12-31",
        realRestStartDate: "2025-12-31",
        realRestEndDate: "2026-01-01",
      }),
    ]);
    expect(recommendations[0]?.holidaysIncluded).toEqual([
      expect.objectContaining({ date: "2026-01-01", name: "Año Nuevo" }),
    ]);
  });

  it("returns recommendations sorted by calendar days for MAX_TOTAL_REST", () => {
    const recommendations = generateRecommendations(
      createInput({
        vacationDaysToUse: 2,
        searchStartDate: "2025-01-01",
        searchEndDate: "2025-02-28",
        optimizationMode: "MAX_TOTAL_REST",
      })
    );

    expect(recommendations).not.toHaveLength(0);

    for (let index = 1; index < recommendations.length; index += 1) {
      const previous = recommendations[index - 1];
      const current = recommendations[index];

      expect(
        previous.calendarDaysRested > current.calendarDaysRested ||
          (previous.calendarDaysRested === current.calendarDaysRested &&
            previous.efficiencyRatio >= current.efficiencyRatio)
      ).toBe(true);
    }
  });

  it("returns recommendations sorted by efficiency for MAX_EFFICIENCY", () => {
    const recommendations = generateRecommendations(
      createInput({
        vacationDaysToUse: 2,
        searchStartDate: "2025-01-01",
        searchEndDate: "2025-02-28",
        optimizationMode: "MAX_EFFICIENCY",
      })
    );

    expect(recommendations).not.toHaveLength(0);

    for (let index = 1; index < recommendations.length; index += 1) {
      const previous = recommendations[index - 1];
      const current = recommendations[index];

      expect(
        previous.efficiencyRatio > current.efficiencyRatio ||
          (previous.efficiencyRatio === current.efficiencyRatio &&
            previous.calendarDaysRested >= current.calendarDaysRested)
      ).toBe(true);
    }
  });

  it("deduplicates recommendations that would produce the same real rest window", () => {
    const recommendations = generateRecommendations(
      createInput({
        searchStartDate: "2025-01-01",
        searchEndDate: "2025-02-28",
      })
    );

    const windowKeys = toWindowKeys(recommendations);

    expect(new Set(windowKeys).size).toBe(windowKeys.length);
  });
});
