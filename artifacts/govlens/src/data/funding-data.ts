// Types only. Electoral-bond payloads live in content_documents
// under funding:electoral-bonds.

export type PartyFunding = {
  party: string;
  shortName: string;
  amount: number;
  color: string;
  coalition: 'NDA' | 'INDIA' | 'State' | 'Other';
  ideology: string;
};

export type DonorBreakdown = {
  party: string;
  shortName: string;
  amount: number;
};

export type GovtContract = {
  description: string;
  year: string;
  authority: string;
  value?: string;
  sourceUrl?: string;
};

export type Donor = {
  rank: number;
  name: string;
  shortName: string;
  sector: string;
  amount: number;
  note: string;
  parties: DonorBreakdown[];
  contracts?: GovtContract[];
};

export type PartyIncomeYear = {
  year: string;
  election?: boolean;
  bondsStart?: boolean;
  BJP: number;
  INC: number;
  TMC: number | null;
  BSP: number | null;
  SP: number | null;
  AAP: number | null;
};

export type PartyBalance = {
  party: string;
  shortName: string;
  color: string;
  balance: number;
  note: string;
};
