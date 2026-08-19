import { useQuery } from '@tanstack/react-query';
import { fetchContent } from '@/lib/content-api';
import type { MinisterProfile } from '@/data/ministers';
import type { ManifestoYear, NationalIndicator } from '@/pages/central/types';
import type {
  Donor,
  PartyBalance,
  PartyFunding,
  PartyIncomeYear,
} from '@/data/funding-data';

export const MANIFESTO_YEARS = [2014, 2019, 2024] as const;

export type MinisterHi = {
  educationHi?: string;
  criminalCaseNoteHi?: string;
  assetGrowthNoteHi?: string;
  controversiesHi?: string[];
  govtExpenditure?: { labelHi?: string; periodHi?: string }[];
};

export type ManifestoHi = {
  titleHi?: string;
  taglineHi?: string;
  categories: Array<{
    nameHi?: string;
    promises: Array<{
      promiseHi?: string;
      noteHi?: string;
      cagVerdictHi?: string;
    }>;
  }>;
};

export type IndicatorsHi = {
  remarks?: Record<string, Array<Array<string | undefined>>>;
};

export type FundingPayload = {
  meta: {
    totalSold: number;
    totalRedeemed: number;
    periodStart: string;
    periodEnd: string;
    scJudgment: string;
    source: string;
    sourceUrl: string;
    note: string;
  };
  parties: PartyFunding[];
  donors: Donor[];
  incomeHistory: PartyIncomeYear[];
  closingBalance: PartyBalance[];
  partyColor: Record<string, string>;
};

export function mergeMinisterHi(
  en: MinisterProfile,
  hi?: MinisterHi | null,
): MinisterProfile {
  if (!hi) return en;
  return {
    ...en,
    educationHi: hi.educationHi ?? en.educationHi,
    criminalCaseNoteHi: hi.criminalCaseNoteHi ?? en.criminalCaseNoteHi,
    assetGrowthNoteHi: hi.assetGrowthNoteHi ?? en.assetGrowthNoteHi,
    controversiesHi: hi.controversiesHi ?? en.controversiesHi,
    govtExpenditure: en.govtExpenditure?.map((row, i) => ({
      ...row,
      labelHi: hi.govtExpenditure?.[i]?.labelHi ?? row.labelHi,
      periodHi: hi.govtExpenditure?.[i]?.periodHi ?? row.periodHi,
    })),
  };
}

export function mergeManifestoHi(en: ManifestoYear, hi?: ManifestoHi | null): ManifestoYear {
  if (!hi) return en;
  return {
    ...en,
    titleHi: hi.titleHi ?? en.titleHi,
    taglineHi: hi.taglineHi ?? en.taglineHi,
    categories: en.categories.map((category, i) => ({
      ...category,
      nameHi: hi.categories[i]?.nameHi ?? category.nameHi,
      promises: category.promises.map((promise, j) => ({
        ...promise,
        promiseHi: hi.categories[i]?.promises[j]?.promiseHi ?? promise.promiseHi,
        noteHi: hi.categories[i]?.promises[j]?.noteHi ?? promise.noteHi,
        cagVerdictHi: hi.categories[i]?.promises[j]?.cagVerdictHi ?? promise.cagVerdictHi,
      })),
    })),
  };
}

export function mergeIndicatorsHi(
  rows: NationalIndicator[],
  hi?: IndicatorsHi | null,
): NationalIndicator[] {
  if (!hi?.remarks) return rows;
  return rows.map((ind) => ({
    ...ind,
    charts: ind.charts?.map((chart, ci) => ({
      ...chart,
      remarks: chart.remarks?.map((remark, ri) => ({
        ...remark,
        noteHi: hi.remarks?.[ind.key]?.[ci]?.[ri] ?? remark.noteHi,
      })),
    })),
  }));
}

export function useCivicDoc<T>(key: string | null | undefined) {
  return useQuery({
    queryKey: ['content', key],
    queryFn: () => fetchContent<T>(key!),
    enabled: Boolean(key),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}

export function useMinistersIndex(isHi: boolean) {
  const index = useCivicDoc<MinisterProfile[]>('ministers-index');
  const hi = useCivicDoc<Record<string, MinisterHi>>(isHi ? 'ministers-index-hi' : null);
  const ministers = (index.data ?? []).map((row) => mergeMinisterHi(row, hi.data?.[row.slug]));
  return {
    ministers,
    isLoading: index.isLoading,
    isError: index.isError,
  };
}

export function useMinister(slug: string | undefined, isHi: boolean) {
  const en = useCivicDoc<MinisterProfile>(slug ? `minister:${slug}` : null);
  const hi = useCivicDoc<MinisterHi>(isHi && slug ? `minister-hi:${slug}` : null);
  return {
    minister: en.data ? mergeMinisterHi(en.data, hi.data) : undefined,
    isLoading: en.isLoading,
    isError: en.isError,
  };
}

export function useManifestos(isHi: boolean) {
  return useQuery({
    queryKey: ['content', 'manifestos', isHi],
    staleTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const ens = await Promise.all(
        MANIFESTO_YEARS.map((year) => fetchContent<ManifestoYear>(`manifesto:${year}`)),
      );
      if (!isHi) return ens;
      const his = await Promise.all(
        MANIFESTO_YEARS.map((year) =>
          fetchContent<ManifestoHi>(`manifesto-hi:${year}`).catch(() => null),
        ),
      );
      return ens.map((row, i) => mergeManifestoHi(row, his[i]));
    },
  });
}

export function useIndicators() {
  return useCivicDoc<NationalIndicator[]>('indicators');
}

export function useFunding() {
  return useCivicDoc<FundingPayload>('funding:electoral-bonds');
}
