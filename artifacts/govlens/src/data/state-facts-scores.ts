import { fetchStaticJson } from '@/lib/content-api';

export interface StateFactScoreRow {
  stateCode: string;
  name: string;
  region: string;
  accountability: Record<string, number>;
  indicators: Record<string, number>;
}

/** Slim ranking rows — loaded from the database via /api/static/json/state-facts-scores */
export async function loadStateFactScores(): Promise<StateFactScoreRow[]> {
  return fetchStaticJson<StateFactScoreRow[]>('state-facts-scores');
}
