export type Holiday = {
  date: string; // YYYY-MM-DD
  name: string;
  type: "fixed" | "emiliani" | "easter-relative";
};

export type VacationInput = {
  year: number;
  vacationDaysToUse: number;
  worksOnSaturday: boolean;
  searchStartDate?: string;
  searchEndDate?: string;
  optimizationMode: "MAX_TOTAL_REST" | "MAX_EFFICIENCY";
};

export type VacationRecommendation = {
  requestStartDate: string;
  requestEndDate: string;
  realRestStartDate: string;
  realRestEndDate: string;
  returnToWorkDate: string;
  vacationDaysUsed: number;
  calendarDaysRested: number;
  efficiencyRatio: number;
  holidaysIncluded: Holiday[];
  weekendsIncluded: number;
  score: number;
};
