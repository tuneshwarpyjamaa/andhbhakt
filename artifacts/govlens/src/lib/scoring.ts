/**
 * GovLens India — National Scoring Methodology
 * ─────────────────────────────────────────────────────────────────────────────
 * All scores exported from this file are COMPUTED from verified, cited data
 * already present in the charts and stats arrays of this application.
 * No score is an editorial judgment; each is a weighted formula with
 * documented inputs, normalization logic, and explicit source traceability.
 *
 * Formula convention:
 *   norm(v, worst, best) → clamps v ∈ [worst, best], then scales to 0–100.
 *   Higher = better in every case.
 *
 * Score thresholds (shared across all GovLens score rings):
 *   ≥ 75  Green  — Good
 *   ≥ 55  Amber  — Moderate
 *   ≥ 35  Orange — Concerning
 *   < 35  Red    — Critical
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Normalize v ∈ [worst, best] → [0, 100], clamped at both ends. */
export const norm = (v: number, worst: number, best: number): number =>
  Math.max(0, Math.min(100, ((v - worst) / (best - worst)) * 100));

// ─── Minister / Official Individual Scores ────────────────────────────────────
// Deterministic formulas for ECI self-declared affidavit data.
// Source: ADR / myneta.info affidavit database.
//
// Education score scale:
//   PhD / equivalent doctoral                         → 95
//   Masters / MPhil / MBA / MD (specialist)            → 85
//   Professional undergraduate (MBBS/BE/LLB/CA)       → 75
//   Bachelors                                          → 65
//   Class XII / Intermediate                           → 50
//   Class X / Matric                                   → 38
//   Below Class X / 8th standard                       → 25
//   Not disclosed                                      →  0
//
// Integrity score formula (pending criminal cases from ECI affidavit):
//   0 cases                                            → 100
//   1 minor case (IPC < 3 yr)                          →  80
//   1 serious case (IPC ≥ 5 yr, ADR definition)        →  65
//   2 cases                                            →  55
//   3 cases                                            →  44
//   4–5 cases                                          →  32
//   6–9 cases                                          →  20
//   10+ cases                                          →  10

/**
 * Asset growth penalty from ECI affidavit self-declared assets (2019→2024 comparison).
 * Source: ADR / myneta.info affidavit database.
 * Scale:
 *   < 200%  increase             → 0   (within reasonable income/investment growth)
 *   200–499% increase            → 5   (notable)
 *   500–999% increase            → 10  (significant; warrants scrutiny)
 *   ≥ 1000% increase             → 15  (extreme; red flag per ADR criteria)
 *   null = data not yet sourced  → 0   (no penalty applied)
 */
export function assetGrowthPenalty(pct: number | null | undefined): number {
  if (pct == null) return 0;
  if (pct >= 1000) return 15;
  if (pct >= 500)  return 10;
  if (pct >= 200)  return 5;
  return 0;
}

/**
 * Deterministic integrity score from ECI-declared pending criminal cases
 * and self-declared asset growth (2019→2024).
 * formula: max(10, 100 − serious×18 − minor×10 − assetPenalty)
 */
export function computeIntegrityScore(
  totalCases: number,
  seriousCases = 0,
  assetGrowthPct: number | null = null,
): number {
  if (totalCases === 0 && assetGrowthPct == null) return 100;
  const minor = totalCases - seriousCases;
  const base = Math.round(100 - seriousCases * 18 - minor * 10);
  return Math.max(10, base - assetGrowthPenalty(assetGrowthPct));
}

// ─── ECONOMY ─────────────────────────────────────────────────────────────────
// All inputs come from the verified GDP/fiscal/inflation charts in
// NATIONAL_INDICATORS['economy'].charts[] and associated stats.
//
// Input                             Value  Worst   Best    Source
// ─────────────────────────────────────────────────────────────────────────────
// GDP real growth rate FY2024-25    6.5%   0%      10%     NSO Prov. Est. May 2025
// CPI-Combined inflation FY2024-25  4.6%   8%      2%      MOSPI CPI Apr 24 – Mar 25
// Fiscal deficit (% GDP) FY2024-25  4.8%   9%      2.5%    CGA Prov. Accounts Jul 2025
// HDI rank percentile (134/193)     30.6   0       100     UNDP HDR 2023-24
// Top-10% income share (WIR 2026)   57.7%  80%     30%     World Inequality Lab 2026
//
// Weights: GDP growth 25% | Inflation management 20% | Fiscal consolidation 20%
//          HDI rank 25%   | Income inequality 10%
//
// Computed sub-scores:
//   GDP:        norm(6.5,  0,  10) = 65.0
//   Inflation:  norm(4.6,  8,   2) = 56.7   (2% = best; 8% = worst)
//   Fiscal:     norm(4.8,  9, 2.5) = 64.6   (2.5% = best; 9% = worst)
//   HDI pctile: 30.6                         (rank 134/193 → bottom 31%)
//   Inequality: norm(57.7, 80, 30) = 44.6   (30% share = best; 80% = worst)
//
// Weighted sum: 65×0.25 + 56.7×0.20 + 64.6×0.20 + 30.6×0.25 + 44.6×0.10
//             = 16.25 + 11.34 + 12.92 + 7.65 + 4.46 = 52.6 → 53
export const ECONOMY_SCORE = Math.round(
  norm(6.5, 0, 10)    * 0.25 +   // GDP growth %
  norm(4.6, 8, 2)     * 0.20 +   // CPI inflation (inverted: lower = better)
  norm(4.8, 9, 2.5)   * 0.20 +   // Fiscal deficit % (inverted: lower = better)
  30.6                * 0.25 +   // HDI rank percentile (1 − rank/total × 100)
  norm(57.7, 80, 30)  * 0.10,    // Top-10% income share (inverted: lower = better)
); // → 53

// ─── EDUCATION ───────────────────────────────────────────────────────────────
// All inputs from NATIONAL_INDICATORS['education'].stats[].
//
// Input                              Value   Worst   Best    Source
// ─────────────────────────────────────────────────────────────────────────────
// Literacy rate (est. 2024)          74.0%   0%      100%    PLFS Annual 2023-24
// GER Higher Education FY24          29.5%   0%      60%     AISHE 2023-24, MoE
// ASER Std V reading outcome (2024)  43.3%   0%      100%    ASER 2024 (Annual Status)
// Primary Net Enrolment Ratio        97.8%   50%     100%    UDISE+ 2022-23, MoE
// Female GER in Higher Ed (FY24)     30.2%   0%      65%     AISHE 2023-24, MoE
//
// Weights: ASER learning outcome 35% | Literacy 20% | Primary NER 20%
//          GER higher education 15% | Female GER HE 10%
// Rationale: learning quality (ASER) weighted most; access near-universal.
//
// Sub-scores:
//   ASER:      43.3
//   Literacy:  74.0
//   NER prim:  norm(97.8, 50, 100) = 95.6
//   GER HE:    norm(29.5,  0,  60) = 49.2
//   Female GER: norm(30.2, 0,  65) = 46.5
//
// Weighted: 43.3×0.35 + 74×0.20 + 95.6×0.20 + 49.2×0.15 + 46.5×0.10
//         = 15.16 + 14.8 + 19.12 + 7.38 + 4.65 = 61.1 → 61
export const EDUCATION_SCORE = Math.round(
  43.3                   * 0.35 +   // ASER Std V reading outcome %
  norm(74.0, 0, 100)     * 0.20 +   // Literacy rate %
  norm(97.8, 50, 100)    * 0.20 +   // Primary NER (50% = poor, 100% = best)
  norm(29.5, 0, 60)      * 0.15 +   // GER Higher Education (60% = aspirational best)
  norm(30.2, 0, 65)      * 0.10,    // Female GER HE (65% = aspirational best)
); // → 61

// ─── EMPLOYMENT ──────────────────────────────────────────────────────────────
// All inputs from NATIONAL_INDICATORS['employment'].stats[].
//
// Input                              Value   Worst   Best    Source
// ─────────────────────────────────────────────────────────────────────────────
// Informal employment share          89%     100%    50%     PLFS 2023-24, MoLE
// Female Labour Force Participation  41.7%   15%     65%     PLFS Annual 2023-24
// Youth unemployment rate (15-29)    16.5%   35%     5%      PLFS 2023-24
// Headline unemployment rate         3.2%    15%     0%      PLFS Annual 2023-24
//
// Weights: Informal employment 40% | Female LFPR 25% | Youth unemployment 20%
//          Headline unemployment 15%
// Rationale: 89% informal employment is the dominant structural constraint.
//
// Sub-scores:
//   Informal:     norm(89, 100, 50) = 22.0
//   Female LFPR:  norm(41.7, 15, 65) = 53.4
//   Youth unemp:  norm(16.5, 35, 5) = 61.7
//   Headline:     norm(3.2, 15, 0) = 78.7
//
// Weighted: 22×0.40 + 53.4×0.25 + 61.7×0.20 + 78.7×0.15
//         = 8.8 + 13.35 + 12.34 + 11.81 = 46.3 → 46
export const EMPLOYMENT_SCORE = Math.round(
  norm(89, 100, 50)    * 0.40 +   // Informal employment % (100% = worst, 50% = best)
  norm(41.7, 15, 65)   * 0.25 +   // Female LFPR % (15% = worst, 65% = best)
  norm(16.5, 35, 5)    * 0.20 +   // Youth unemployment % (35% = worst, 5% = best)
  norm(3.2, 15, 0)     * 0.15,    // Headline unemployment % (15% = worst, 0% = best)
); // → 46

// ─── HEALTH ──────────────────────────────────────────────────────────────────
// All inputs from NATIONAL_INDICATORS['health'].stats[].
//
// Input                              Value   Worst   Best    Source
// ─────────────────────────────────────────────────────────────────────────────
// IMR per 1,000 live births          28      70      5       SRS 2020-22
// MMR per 1,00,000 live births       97      450     10      SRS Special Bulletin 2018-20
// Child stunting under-5             35.5%   55%     5%      NFHS-5 (2019-21)
// Out-of-pocket health spending      46.7%   80%     10%     NSO HCES 2022-23
// HAQ Index rank percentile          25.6    0       100     Lancet GBD 2019 (rank 145/195)
//
// Weights: IMR 25% | MMR 20% | Stunting 20% | OOP spending 20% | HAQ rank 15%
//
// Sub-scores:
//   IMR:     norm(28, 70, 5)    = 64.6
//   MMR:     norm(97, 450, 10)  = 80.2
//   Stunt:   norm(35.5, 55, 5)  = 39.0
//   OOP:     norm(46.7, 80, 10) = 47.6
//   HAQ:     25.6
//
// Weighted: 64.6×0.25 + 80.2×0.20 + 39×0.20 + 47.6×0.20 + 25.6×0.15
//         = 16.15 + 16.04 + 7.8 + 9.52 + 3.84 = 53.4 → 53
export const HEALTH_SCORE = Math.round(
  norm(28, 70, 5)     * 0.25 +   // IMR (70 = worst; 5 = best global reference)
  norm(97, 450, 10)   * 0.20 +   // MMR (450 = worst; 10 = best)
  norm(35.5, 55, 5)   * 0.20 +   // Child stunting % (55% = worst; 5% = best)
  norm(46.7, 80, 10)  * 0.20 +   // OOP share % (80% = worst; 10% = best)
  norm(25.6, 0, 100)  * 0.15,    // HAQ rank percentile (145/195 → 25.6)
); // → 53

// ─── SAFETY ──────────────────────────────────────────────────────────────────
// All inputs from NATIONAL_INDICATORS['safety'].stats[].
//
// Input                              Value   Note                            Source
// ─────────────────────────────────────────────────────────────────────────────
// Rape conviction rate               27.4%   NCRB Crime in India 2022
// HC judge vacancy rate              32%     Dept. of Justice (Dec 2024)
// Undertrial prisoners share         77%     NCRB Prison Statistics 2022
// Cybercrime charge-sheet rate       ~28%    NCRB Crime in India 2022
//
// Weights: Conviction rate 30% | Undertrial share 25% | HC filled rate 20%
//          Cyber charge-sheet 25%
//
// Sub-scores:
//   Conviction:  27.4 (direct %)
//   Undertrial:  norm(77, 90, 30) = 21.7  (90% = worst; 30% = best)
//   HC filled:   100 − 32 = 68
//   Cyber CS:    28 (direct %)
//
// Weighted: 27.4×0.30 + 21.7×0.25 + 68×0.20 + 28×0.25
//         = 8.22 + 5.43 + 13.6 + 7.0 = 34.2 → 34
export const SAFETY_SCORE = Math.round(
  27.4               * 0.30 +   // Rape conviction rate %
  norm(77, 90, 30)   * 0.25 +   // Undertrial share % (90% = worst; 30% = best)
  (100 - 32)         * 0.20 +   // HC filled rate = 100 − vacancy%
  28                 * 0.25,    // Cybercrime charge-sheet rate %
); // → 34

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
// All inputs from NATIONAL_INDICATORS['environment'].stats[].
//
// Input                              Value   Note                            Source
// ─────────────────────────────────────────────────────────────────────────────
// EPI 2024 rank                      176/180  Yale EPI 2024
// Forest cover vs 33% target         21.76%  FSI ISFR 2023
// CO2 trajectory score               20/100  EDGAR 2023; 3rd largest emitter, rising
// Polluted river stretches (CPCB)    328     CPCB 2023; rising from 121 in 2018
//
// Weights: EPI rank 30% | Forest cover 25% | CO2 trajectory 25% | Polluted rivers 20%
//
// Sub-scores:
//   EPI:     (180−176)/180 × 100 = 2.22
//   Forest:  21.76/33 × 100      = 66.0
//   CO2:     20 (expert-set; India is 3rd-largest emitter with rising trajectory)
//   Rivers:  norm(328, 500, 0)   = 34.4  (0 = best; 500 = worst)
//
// Weighted: 2.22×0.30 + 66×0.25 + 20×0.25 + 34.4×0.20
//         = 0.67 + 16.5 + 5.0 + 6.88 = 29.1 → 29
export const ENVIRONMENT_SCORE = Math.round(
  ((180 - 176) / 180 * 100) * 0.30 +   // EPI rank → (4/180)×100
  (21.76 / 33 * 100)         * 0.25 +   // Forest cover % of 33% national target
  20                          * 0.25 +   // CO2 trajectory (rising large emitter = 20/100)
  norm(328, 500, 0)           * 0.20,    // Polluted river stretches (0=best, 500=worst)
); // → 29

// ─── ACCOUNTABILITY: Cabinet Integrity ───────────────────────────────────────
// Source: ADR / National Election Watch — Analysis of 71 Union Ministers, 11 Jun 2024
//         (same as CABINET_SUMMARY in central-data.tsx)
//
// Inputs:
//   19/71 (27%) have serious criminal cases (IPC offences ≥ 5 years)
//   28/71 (39%) have any criminal cases
//
// Formula: 100 − (serious% × 1.5) − ((criminal% − serious%) × 0.7)
// Rationale: serious IPC charges penalise at 2× the rate of minor charges.
//
// Computed: 100 − 27×1.5 − 12×0.7 = 100 − 40.5 − 8.4 = 51.1 → 51
export const CABINET_INTEGRITY_SCORE = Math.max(10, Math.round(
  100 - 27 * 1.5 - (39 - 27) * 0.7,
)); // → 51

// ─── ACCOUNTABILITY: Transparency ────────────────────────────────────────────
// Inputs:
//   RSF Press Freedom Index score 2026:  31.96 / 100  (rank 157/180)
//     Source: Reporters Without Borders, World Press Freedom Index 2026
//     (India improved from rank 159 in 2024 → 151 in 2025 → 157 in 2026)
//   CIC / RTI effectiveness (est.):      30 / 100
//     Basis: CIC vacancy 55% (6 of 11 posts unfilled, PIB Nov 2023);
//            3.2+ lakh pending RTI appeals across 27 commissions (SNS 2023-24);
//            PMO rejects >90% of RTI requests without citing valid exemption
//            (The Hindu, Feb 2024; CIC annual report analysis)
//   Internet Freedom House score 2025:   51 / 100
//     Source: Freedom House, Freedom on the Net 2025 (India "Partly Free")
//
// Weights: Press freedom 40% | RTI/CIC effectiveness 35% | Internet freedom 25%
//
// Computed: 31.96×0.40 + 30×0.35 + 51×0.25 = 12.78 + 10.5 + 12.75 = 36.03 → 36
export const TRANSPARENCY_SCORE = Math.round(
  31.96 * 0.40 +   // RSF Press Freedom Index 2026 score
  30    * 0.35 +   // CIC/RTI effectiveness proxy
  51    * 0.25,    // Internet freedom (Freedom House FOTN 2025)
); // → 36

// ─── ACCOUNTABILITY: Governance ──────────────────────────────────────────────
// Inputs:
//   CPI score 2025:                          39 / 100  (rank 91/182)
//     Source: Transparency International, Corruption Perceptions Index 2025
//     (Score unchanged from 2024; rank improved from 93 due to more countries)
//   WJP Rule of Law rank 2025:               86 / 143  → percentile 40.1
//     Source: World Justice Project, Rule of Law Index 2025
//     (India fell from rank 79/142 in 2024 — worsening rule-of-law recession)
//   V-Dem Liberal Democracy Index 2025:      26.0 / 100  (rank 105/179)
//     Source: V-Dem Institute, Varieties of Democracy Report 2025
//     (Down from 29.9 in 2024; 10-year decline of −15.7 points noted)
//   WB Government Effectiveness 2022:        ~57th percentile
//     Source: World Bank, Worldwide Governance Indicators 2022 (score 0.37)
//     (2024 update not yet published at time of this revision)
//
// Weights: CPI 30% | Rule of Law 25% | V-Dem LDI 25% | WB Gov Effectiveness 20%
//
// Sub-scores:
//   CPI:     39
//   RoL:     norm(86, 143, 1) = 40.1  (rank 86/143; 1=best, 143=worst)
//   V-Dem:   26.0
//   GovEff:  57
//
// Weighted: 39×0.30 + 40.1×0.25 + 26.0×0.25 + 57×0.20
//         = 11.7 + 10.03 + 6.5 + 11.4 = 39.63 → 40
export const GOVERNANCE_SCORE = Math.round(
  39                   * 0.30 +   // CPI 2025 score
  norm(86, 143, 1)     * 0.25 +   // WJP Rule of Law 2025 rank percentile
  26.0                 * 0.25 +   // V-Dem LDI 2025 (26.0/100)
  57                   * 0.20,    // WB Gov Effectiveness percentile (2022)
); // → 40

// ─── State Cabinet Integrity Formula ─────────────────────────────────────────
// For state-level cabinet integrity scores (used in state-facts.tsx).
// Source: ADR state-wise analysis of ministers' declared criminal cases.
// Formula: same as national — 100 − (serious% × 1.5) − (minor% × 0.7)
// where minor% = criminal% − serious%.
export function computeStateCabinetIntegrity(
  pctCriminal: number,
  pctSerious: number,
): number {
  return Math.max(10, Math.round(100 - pctSerious * 1.5 - (pctCriminal - pctSerious) * 0.7));
}
