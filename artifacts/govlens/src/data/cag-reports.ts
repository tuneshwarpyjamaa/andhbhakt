// Types and small constants only — the 1,808-report data array lives in
// cag-reports-data.json and is lazy-loaded by reports.tsx at runtime.

export type ReportCategory =
  | 'State Finances'
  | 'Compliance Audit'
  | 'Revenue & Tax'
  | 'PSU Audit'
  | 'Performance Audit'
  | 'Social Schemes'
  | 'Environment & Mining';

export type ReportLevel = 'Central' | 'State' | 'UT';
export type StatStatus  = 'critical' | 'warning' | 'caution' | 'ok';

// ── Source citation ────────────────────────────────────────────────
export interface SourceCitation {
  page: number;
  section: string;
  quote: string;
}

// ── Finding ────────────────────────────────────────────────────────
export interface ReportFinding {
  text: string;
  source: SourceCitation;
}

// ── Stat ──────────────────────────────────────────────────────────
export interface ReportStat {
  label: string;
  value: string;
  pct?: number;
  status: StatStatus;
  note?: string;
  source: SourceCitation;
}

// ── Report ────────────────────────────────────────────────────────
export interface CagReport {
  id: string;
  reportNo: string;
  year: number;
  title: string;
  overview: string;
  stats?: ReportStat[];
  keyFindings: ReportFinding[];
  recommendations: string[];
  auditPeriod: string;
  datePresented: string;
  state: string;
  stateCode: string;
  level: ReportLevel;
  category: ReportCategory;
  ministry: string;
  severity: 'high' | 'medium' | 'low';
  url?: string;
  fileName?: string;
}

// ── Small filter constants (derived from data, hardcoded to avoid bundling the array) ──
export const ALL_STATES: string[] = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Central','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir',
  'Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','North-East India',
  'Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];
export const ALL_YEARS: number[] = [
  2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,
  2012,2011,2010,2009,2008,2007,2006,2005,2004,
];
export const ALL_CATEGORIES: ReportCategory[] = [
  'Compliance Audit','Environment & Mining','PSU Audit','Performance Audit',
  'Revenue & Tax','Social Schemes','State Finances',
];
export const ALL_LEVELS: ReportLevel[] = ['Central','State','UT'];

// ── State map metadata ──────────────────────────────────────────
export interface StateMapMeta {
  stateCode: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'NorthEast' | 'UT';
  governanceScore?: number;
  populationM: number;
  catalogueReports: number;
}

export const STATE_METADATA: StateMapMeta[] = [
  { stateCode: 'AP',  name: 'Andhra Pradesh',    capital: 'Amaravati',          lat: 15.91, lng: 79.74, region: 'South',     populationM: 49.4,  catalogueReports: 77 },
  { stateCode: 'AR',  name: 'Arunachal Pradesh',  capital: 'Itanagar',           lat: 28.22, lng: 94.73, region: 'NorthEast',  populationM: 1.4,   catalogueReports: 28 },
  { stateCode: 'AS',  name: 'Assam',              capital: 'Dispur',             lat: 26.20, lng: 92.94, region: 'NorthEast',  populationM: 31.2,  catalogueReports: 87 },
  { stateCode: 'BR',  name: 'Bihar',              capital: 'Patna',              lat: 25.10, lng: 85.31, region: 'East',       governanceScore: 32, populationM: 104.1, catalogueReports: 79 },
  { stateCode: 'CG',  name: 'Chhattisgarh',       capital: 'Raipur',             lat: 21.28, lng: 81.87, region: 'Central',    populationM: 25.5,  catalogueReports: 49 },
  { stateCode: 'DL',  name: 'Delhi',              capital: 'New Delhi',          lat: 28.70, lng: 77.10, region: 'UT',         populationM: 16.8,  catalogueReports: 44 },
  { stateCode: 'GA',  name: 'Goa',                capital: 'Panaji',             lat: 15.30, lng: 74.12, region: 'West',       governanceScore: 61, populationM: 1.5,   catalogueReports: 38 },
  { stateCode: 'GJ',  name: 'Gujarat',            capital: 'Gandhinagar',        lat: 22.26, lng: 71.19, region: 'West',       governanceScore: 67, populationM: 60.4,  catalogueReports: 75 },
  { stateCode: 'HR',  name: 'Haryana',            capital: 'Chandigarh',         lat: 29.06, lng: 76.09, region: 'North',      populationM: 25.4,  catalogueReports: 57 },
  { stateCode: 'HP',  name: 'Himachal Pradesh',   capital: 'Shimla',             lat: 31.10, lng: 77.17, region: 'North',      populationM: 6.9,   catalogueReports: 75 },
  { stateCode: 'JH',  name: 'Jharkhand',          capital: 'Ranchi',             lat: 23.61, lng: 85.28, region: 'East',       governanceScore: 48, populationM: 33.0,  catalogueReports: 54 },
  { stateCode: 'JK',  name: 'Jammu & Kashmir',    capital: 'Srinagar/Jammu',     lat: 33.78, lng: 76.58, region: 'North',      populationM: 12.5,  catalogueReports: 27 },
  { stateCode: 'KA',  name: 'Karnataka',          capital: 'Bengaluru',          lat: 15.32, lng: 75.71, region: 'South',      governanceScore: 79, populationM: 61.1,  catalogueReports: 96 },
  { stateCode: 'KL',  name: 'Kerala',             capital: 'Thiruvananthapuram', lat: 10.85, lng: 76.27, region: 'South',      governanceScore: 82, populationM: 33.4,  catalogueReports: 85 },
  { stateCode: 'MH',  name: 'Maharashtra',        capital: 'Mumbai',             lat: 19.75, lng: 75.71, region: 'West',       populationM: 112.4, catalogueReports: 78 },
  { stateCode: 'ML',  name: 'Meghalaya',          capital: 'Shillong',           lat: 25.47, lng: 91.37, region: 'NorthEast',  populationM: 3.0,   catalogueReports: 42 },
  { stateCode: 'MN',  name: 'Manipur',            capital: 'Imphal',             lat: 24.66, lng: 93.91, region: 'NorthEast',  populationM: 2.9,   catalogueReports: 35 },
  { stateCode: 'MP',  name: 'Madhya Pradesh',     capital: 'Bhopal',             lat: 22.97, lng: 78.66, region: 'Central',    populationM: 72.6,  catalogueReports: 91 },
  { stateCode: 'MZ',  name: 'Mizoram',            capital: 'Aizawl',             lat: 23.16, lng: 92.94, region: 'NorthEast',  populationM: 1.1,   catalogueReports: 23 },
  { stateCode: 'NL',  name: 'Nagaland',           capital: 'Kohima',             lat: 26.16, lng: 94.56, region: 'NorthEast',  governanceScore: 46, populationM: 2.0,  catalogueReports: 30 },
  { stateCode: 'OD',  name: 'Odisha',             capital: 'Bhubaneswar',        lat: 20.95, lng: 85.10, region: 'East',       governanceScore: 62, populationM: 41.9,  catalogueReports: 72 },
  { stateCode: 'PB',  name: 'Punjab',             capital: 'Chandigarh',         lat: 31.15, lng: 75.34, region: 'North',      governanceScore: 44, populationM: 27.7,  catalogueReports: 61 },
  { stateCode: 'PY',  name: 'Puducherry',         capital: 'Puducherry',         lat: 11.94, lng: 79.81, region: 'UT',         populationM: 1.2,   catalogueReports: 19 },
  { stateCode: 'RJ',  name: 'Rajasthan',          capital: 'Jaipur',             lat: 27.02, lng: 74.22, region: 'North',      populationM: 68.6,  catalogueReports: 83 },
  { stateCode: 'SK',  name: 'Sikkim',             capital: 'Gangtok',            lat: 27.53, lng: 88.51, region: 'NorthEast',  populationM: 0.6,   catalogueReports: 40 },
  { stateCode: 'TN',  name: 'Tamil Nadu',         capital: 'Chennai',            lat: 11.13, lng: 78.66, region: 'South',      populationM: 72.1,  catalogueReports: 52 },
  { stateCode: 'TR',  name: 'Tripura',            capital: 'Agartala',           lat: 23.94, lng: 91.99, region: 'NorthEast',  populationM: 3.7,   catalogueReports: 33 },
  { stateCode: 'TS',  name: 'Telangana',          capital: 'Hyderabad',          lat: 17.12, lng: 79.21, region: 'South',      populationM: 35.0,  catalogueReports: 37 },
  { stateCode: 'UK',  name: 'Uttarakhand',        capital: 'Dehradun',           lat: 30.07, lng: 79.02, region: 'North',      populationM: 10.1,  catalogueReports: 33 },
  { stateCode: 'UP',  name: 'Uttar Pradesh',      capital: 'Lucknow',            lat: 26.85, lng: 80.95, region: 'North',      populationM: 199.8, catalogueReports: 105 },
  { stateCode: 'WB',  name: 'West Bengal',        capital: 'Kolkata',            lat: 22.99, lng: 87.85, region: 'East',       governanceScore: 51, populationM: 91.3,  catalogueReports: 97 },
  { stateCode: 'IN',  name: 'Central',            capital: 'New Delhi',          lat: 20.59, lng: 78.96, region: 'North',      populationM: 0,     catalogueReports: 416 },
];
