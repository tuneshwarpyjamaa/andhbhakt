import scores from './state-facts-scores.json';

export interface StateFactScoreRow {
  stateCode: string;
  name: string;
  region: string;
  accountability: Record<string, number>;
  indicators: Record<string, number>;
}

/** Slim ranking rows. Regenerated from state-facts-data.ts via scripts/extract-state-fact-scores.mjs */
export const STATE_FACT_SCORES = scores as StateFactScoreRow[];
