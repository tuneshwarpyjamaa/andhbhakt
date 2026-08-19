import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { computeIntegrityScore, assetGrowthPenalty } from '@/lib/scoring';
import { useHiJson } from '@/lib/use-hi-json';
import { useMinistersIndex } from '@/lib/civic-catalog';
import { MemberAvatar, ScoreBar, hiDate } from './shared';

const CABINET_SUMMARY = {
  total: 71, withCriminalCases: 28, withSeriousCases: 19,
  percentCriminal: 39, percentSerious: 27,
  source: 'ADR / National Election Watch — Analysis of 71 of 72 Union Council of Ministers, 11 June 2024',
};

function ScoringMethodologyModal({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{t('scoreMethodology')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-xs text-muted-foreground">
          <p className="text-[11px] leading-relaxed">
            {isHi
              ? 'सभी स्कोर ECI के स्व-घोषित शपथ पत्रों से ADR / myneta.info के माध्यम से संकलित किए जाते हैं। ये वही दर्शाते हैं जो मंत्रियों ने शपथ के तहत घोषित किया है — स्वतंत्र सत्यापन नहीं।'
              : <>All scores are computed from <strong className="text-foreground">ECI self-declared affidavits</strong> as reported by ADR / myneta.info. They reflect what ministers have declared under oath — not independent verification.</>
            }
          </p>

          {/* Education */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground mb-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              {t('educationScore')}
            </h3>
            <p className="text-[11px] mb-2 leading-relaxed">
              {isHi
                ? 'ECI शपथ पत्र में घोषित उच्चतम योग्यता के आधार पर निश्चित तालिका से निर्धारित।'
                : 'Fixed lookup based on the highest qualification declared in the ECI affidavit.'
              }
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left px-3 py-1.5 font-medium text-foreground">{t('qualification')}</th>
                    <th className="text-right px-3 py-1.5 font-medium text-foreground w-14">{t('score')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [t('phdDoctoralEquivalent'), 95],
                    [t('mastersMphilMbaMd'), 85],
                    [t('professionalUg'), 75],
                    [t('bachelors'), 65],
                    [t('classXiiIntermediate'), 50],
                    [t('classXMatric'), 38],
                    [t('belowClassX'), 25],
                    [t('notDisclosed'), 0],
                  ].map(([label, score]) => (
                    <tr key={label as string} className="hover:bg-muted/30">
                      <td className="px-3 py-1.5 text-muted-foreground">{label}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-semibold text-foreground">{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Integrity */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground mb-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              {t('integrityScore')}
            </h3>
            <p className="text-[11px] mb-2 leading-relaxed">
              {isHi
                ? 'ECI शपथ पत्र में घोषित लंबित आपराधिक मामलों से निर्धारित। गंभीर IPC धाराएं (≥ 5 वर्ष के कारावास वाले अपराध, PC Act 13(2)) को सामान्य मामलों की लगभग दोगुनी दर पर दंडित किया जाता है।'
                : <>Derived from <strong className="text-foreground">pending criminal cases</strong> declared in the ECI affidavit. Serious IPC charges (offences carrying ≥ 5 years imprisonment, PC Act 13(2)) are penalised at nearly double the rate of minor ones.</>
              }
            </p>
            <div className="rounded-lg bg-muted/40 border border-border px-3 py-2.5 font-mono text-[11px] leading-relaxed mb-2">
              <span className="text-foreground font-semibold">{t('score')}</span>
              {' = max(10, 100 − serious × 18 − minor × 10)'}
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left px-3 py-1.5 font-medium text-foreground">{t('cases')}</th>
                    <th className="text-right px-3 py-1.5 font-medium text-foreground w-14">{t('score')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [t('zeroCases'), 100],
                    [t('oneMinorCase'), 90],
                    [t('oneSeriousCase'), 82],
                    [t('twoCases'), t('formula')],
                    [t('threeCases'), t('formula')],
                    [t('sixToNineCases'), t('approximatelyTwenty')],
                    [t('tenPlusCases'), t('tenFloor')],
                  ].map(([label, score]) => (
                    <tr key={label as string} className="hover:bg-muted/30">
                      <td className="px-3 py-1.5 text-muted-foreground">{label}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-semibold text-foreground">
                        {typeof score === 'number' ? score : score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] mt-2 leading-relaxed">
              <strong className="text-foreground">{t('serious')}</strong> = IPC sections 302, 307, 354, 420, 467, 506, PC Act 13(2), and any offence with ≥ 5-year imprisonment.
              Per <a href="https://adrindia.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">{t('adrIndia')}</a> definition.
            </p>
          </section>

          {/* Asset Growth */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground mb-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
              {t('assetGrowthFactor')}
            </h3>
            <p className="text-[11px] mb-2 leading-relaxed">
              {isHi
                ? '2019 और 2024 के ECI शपथ पत्रों के बीच स्व-घोषित कुल संपत्ति में अनुपातहीन वृद्धि को एक चेतावनी संकेत माना जाता है और इससे ईमानदारी स्कोर कम होता है। यह ADR के अपने "करोड़पति सांसद" जांच ढांचे का अनुसरण करता है।'
                : <>Disproportionate growth in self-declared total assets between the <strong className="text-foreground">2019 and 2024 ECI affidavits</strong> is treated as a red flag and reduces the integrity score. This follows ADR's own "crorepati MP" scrutiny framework.</>
              }
            </p>
            <div className="rounded-lg bg-muted/40 border border-border px-3 py-2.5 font-mono text-[11px] leading-relaxed mb-2">
              <span className="text-foreground font-semibold">{isHi ? 'ईमानदारी' : 'integrity'}</span>
              {' = max(10, criminal_score − asset_penalty)'}
            </div>
            <div className="rounded-lg border border-border overflow-hidden mb-2">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left px-3 py-1.5 font-medium text-foreground">{t('assetGrowth')}</th>
                    <th className="text-right px-3 py-1.5 font-medium text-foreground w-20">{t('penalty')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [t('underTwoHundredIncrease'), t('zeroPoints'), t('withinReasonableGrowth')],
                    [t('twoToFourNinetyNineIncrease'), t('minusFivePoints'), t('notableWarrantsAttention')],
                    [t('fiveToNineNinetyNineIncrease'), t('minusTenPoints'), t('significantAdrFlags')],
                    [t('thousandPlusIncrease'), t('minusFifteenPoints'), t('extremeRedFlag')],
                    [t('dataNotSourced'), t('noPenalty'), t('sourcingInProgress')],
                  ].map(([range, penalty, note]) => (
                    <tr key={range} className="hover:bg-muted/30">
                      <td className="px-3 py-1.5">
                        <span className="text-muted-foreground">{range}</span>
                        <span className="block text-[10px] text-muted-foreground/60">{note}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono font-semibold text-orange-500">{penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground/70">
              {t('assetGrowthFootnote')}{' '}
              <a href="https://myneta.info" target="_blank" rel="noopener noreferrer" className="text-primary underline">myneta.info</a>.
              {isHi
                ? 'जिन मंत्रियों का 2019 लोकसभा शपथ पत्र रिकॉर्ड में नहीं है (पहली बार सांसद, राज्यसभा सदस्य) उन्हें कोई दंड नहीं मिलता।'
                : 'Ministers without a 2019 Lok Sabha affidavit on record (first-time MPs, Rajya Sabha members) receive no penalty.'
              }
            </p>
          </section>

          {/* Source */}
          <section className="border-t border-border pt-4">
            <p className="text-[10px] leading-relaxed">
              <strong className="text-foreground">{t('source')}:</strong> Association for Democratic Reforms (ADR) /&nbsp;
              <a href="https://myneta.info" target="_blank" rel="noopener noreferrer" className="text-primary underline">myneta.info</a>
              {isHi ? '\u00a0— 2024 आम चुनाव (लोकसभा) के दौरान दाखिल ECI शपथ पत्रों का विश्लेषण।' : '\u00a0— analysis of ECI affidavits filed during the 2024 general elections (Lok Sabha).'}
              {t('individualAffidavitFootnote')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Section: PM + Cabinet ────────────────────────────────────────────────────

export default function PMCabinetSection() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const namesHi = useHiJson<Record<string, string>>('person-names-hi', isHi) ?? {};
  const officialTitlesHi = useHiJson<Record<string, string>>('official-titles-hi', isHi) ?? {};
  const ministerMinistriesHi = useHiJson<Record<string, string>>('minister-ministries-hi', isHi) ?? {};
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const { ministers, isLoading } = useMinistersIndex(isHi);
  const PM = ministers.find(m => m.title === 'Prime Minister');
  const CABINET = ministers.filter(m => m.title !== 'Prime Minister');
  const cabinetMinisters = CABINET.filter(m => m.title === 'Cabinet Minister');
  const mosIC = CABINET.filter(m => m.title === 'MoS (Independent Charge)');
  const mos = CABINET.filter(m => m.title === 'Minister of State');

  if (isLoading || !PM) {
    return (
      <div className="px-4 py-8 flex items-center justify-center" role="status" aria-live="polite">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {t('primeMinister')}
      </p>

      {/* PM row — identical to CM in state-facts */}
      <div className="flex items-start gap-4">
        <Link href={`/minister/${PM.slug}`} className="flex-shrink-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
          <MemberAvatar name={PM.name} wikiTitle={PM.wikiTitle} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/minister/${PM.slug}`} className="group">
            <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{i18n.language === 'hi' ? (namesHi[PM.name] ?? PM.name) : PM.name}</p>
          </Link>
          <p className="text-sm text-muted-foreground">{i18n.language === 'hi' ? (officialTitlesHi[PM.title] ?? PM.title) : PM.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{PM.party}</span>
            <span className="text-xs text-muted-foreground">{t('since')} {i18n.language === 'hi' ? hiDate(PM.since) : PM.since}</span>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <ScoreBar label={t('education')} score={PM.educationScore} caption={(isHi ? (PM.educationHi ?? PM.education) : PM.education).split(',')[0]} colorClass="bg-blue-500" />
            <ScoreBar label={t('legalIntegrity')} score={computeIntegrityScore(PM.criminalCases, PM.seriousCriminalCases ?? 0, PM.assetGrowthPct)} caption={t('zeroCasesDeclared')} colorClass={computeIntegrityScore(PM.criminalCases, PM.seriousCriminalCases ?? 0, PM.assetGrowthPct) < 70 ? 'bg-amber-500' : 'bg-green-500'} />
            {PM.criminalCaseNote && <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">{i18n.language === 'hi' ? (PM.criminalCaseNoteHi ?? PM.criminalCaseNote) : PM.criminalCaseNote}</p>}
            {PM.assetGrowthPct != null && (
              <p className="text-[10px] text-orange-500/80 mt-0.5">↑ {t('assetGrowth')} {PM.assetGrowthPct}% (2019→2024) · −{assetGrowthPenalty(PM.assetGrowthPct)} {t('integrityPts')}</p>
            )}
            <p className="text-[10px] text-muted-foreground/50 font-mono">{t('eciAffidavitSource')} {PM.affidavitYear}</p>
            <button
              onClick={() => setMethodologyOpen(true)}
              className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary mt-0.5 transition-colors"
            >
              <Info className="w-3 h-3" />
              {t('howScoresCalculated')}
            </button>
          </div>
        </div>
      </div>

      {/* Cabinet toggle */}
      <div className="mt-4">
        <button
          onClick={() => setCabinetOpen(v => !v)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {cabinetOpen
            ? <><ChevronUp className="w-4 h-4" /> {t('hideCabinetMinisters')}</>
            : <><ChevronDown className="w-4 h-4" /> {t('viewCabinetMinisters')} ({CABINET_SUMMARY.total})</>
          }
        </button>

        {cabinetOpen && (
          <div className="mt-4">
            {/* ADR summary banner */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-2.5 mb-3">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                {t('fullCouncil')} ({CABINET_SUMMARY.total} ministers):&nbsp;
                <strong>{CABINET_SUMMARY.percentCriminal}%</strong> ({CABINET_SUMMARY.withCriminalCases}/{CABINET_SUMMARY.total}) {t('declaredCriminalCases')}&nbsp;
                <strong>{CABINET_SUMMARY.percentSerious}%</strong> ({CABINET_SUMMARY.withSeriousCases}/{CABINET_SUMMARY.total}) {t('seriousCriminalCases')}
              </p>
              <p className="text-[10px] text-amber-700/60 dark:text-amber-400/60 mt-0.5">{isHi ? 'ADR / नेशनल इलेक्शन वॉच — 11 जून 2024 को मंत्रिपरिषद के 72 में से 71 मंत्रियों का विश्लेषण।' : CABINET_SUMMARY.source}</p>
            </div>

            {[
              { label: `${t('cabinetMinisters')} (${cabinetMinisters.length})`, members: cabinetMinisters },
              { label: `${t('ministersOfStateIndependentCharge')} (${mosIC.length})`, members: mosIC },
              { label: `${t('ministersOfStateAttached')} (${mos.length})`, members: mos },
            ].map(group => (
              <div key={group.label} className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">{group.label}</p>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                  {group.members.map(member => {
                    const hasCases = member.criminalCases > 0;
                    return (
                      <div key={member.name} className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <Link href={`/minister/${member.slug}`} className="flex-shrink-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <MemberAvatar name={member.name} wikiTitle={member.wikiTitle} size="sm" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Link href={`/minister/${member.slug}`} className="group">
                                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{i18n.language === 'hi' ? (namesHi[member.name] ?? member.name) : member.name}</p>
                                </Link>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{i18n.language === 'hi' ? (ministerMinistriesHi[member.ministry] ?? member.ministry) : member.ministry}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">{member.party}</span>
                                <span className="text-xs text-muted-foreground">{t('since')} {i18n.language === 'hi' ? hiDate(member.since) : member.since}</span>
                              </div>
                            </div>
                            <div className="mt-2.5 flex flex-col gap-1.5">
                              <ScoreBar label={t('education')} score={member.educationScore} caption={(isHi ? (member.educationHi ?? member.education) : member.education).split(',')[0].trim()} colorClass="bg-blue-500" />
                              {(() => {
                                const displayed = computeIntegrityScore(member.criminalCases, member.seriousCriminalCases ?? 0, member.assetGrowthPct);
                                return (
                                  <ScoreBar
                                    label={t('legalIntegrity')}
                                    score={displayed}
                                    caption={hasCases ? `${member.criminalCases} ${member.criminalCases > 1 ? t('casePlural') : t('caseSingular')} ${t('casesDeclared')}` : t('zeroCasesDeclared')}
                                    colorClass={hasCases ? 'bg-red-500' : displayed < 70 ? 'bg-amber-500' : 'bg-green-500'}
                                  />
                                );
                              })()}
                              {member.criminalCaseNote && (
                                <p className={`text-[10px] mt-0.5 ${hasCases ? 'text-red-500/80' : 'text-amber-600/80 dark:text-amber-400/80'}`}>{i18n.language === 'hi' ? (member.criminalCaseNoteHi ?? member.criminalCaseNote) : member.criminalCaseNote}</p>
                              )}
                              {member.assetGrowthPct != null && (
                                <p className="text-[10px] text-orange-500/80 mt-0.5">↑ {t('assetGrowth')} {member.assetGrowthPct}% (2019→2024) · −{assetGrowthPenalty(member.assetGrowthPct)} {t('integrityPts')}</p>
                              )}
                              <p className="text-[10px] text-muted-foreground/50 font-mono">{t('eciAffidavitSource')} {member.affidavitYear}</p>
                              <button
                                onClick={() => setMethodologyOpen(true)}
                                className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary mt-0.5 transition-colors"
                              >
                                <Info className="w-3 h-3" />
                                {t('howScoresCalculated')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {methodologyOpen && <ScoringMethodologyModal onClose={() => setMethodologyOpen(false)} />}
    </div>
  );
}
