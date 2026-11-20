import { generateData } from './generate';

/** Fixed so the dashboard shows the same numbers on every visit instead of drifting with today's date. */
export const DATA_SEED = 2026;
export const DATA_END_DATE = '2026-11-20';

export const dataset = generateData({ seed: DATA_SEED, endDate: DATA_END_DATE });
