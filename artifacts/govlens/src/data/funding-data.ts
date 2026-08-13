// Electoral Bonds data sourced from ECI disclosure (March 2024) via ADR/myneta.info
// Scheme ran March 2018 – February 2024; struck down by Supreme Court on 15 Feb 2024
// Source: https://myneta.info/electoral_bonds/ | https://www.eci.gov.in/disclosure-of-electoral-bonds

export const BONDS_META = {
  totalSold: 16518,          // crore
  totalRedeemed: 12769,      // crore — bonds redeemed by parties per ECI data
  periodStart: 'March 2018',
  periodEnd: 'January 2024',
  scJudgment: '15 February 2024',
  source: 'ECI disclosure (March 2024) via ADR/myneta.info',
  sourceUrl: 'https://myneta.info/electoral_bonds/',
  note: 'Bonds were anonymous bearer instruments sold by SBI. SC ordered disclosure; ECI published on 14–21 March 2024. Not all purchased bonds were redeemed (some expired).',
};

export type PartyFunding = {
  party: string;
  shortName: string;
  amount: number;    // crore
  color: string;
  coalition: 'NDA' | 'INDIA' | 'State' | 'Other';
  ideology: string;
};

export const PARTY_FUNDING: PartyFunding[] = [
  { party: 'Bharatiya Janata Party', shortName: 'BJP',  amount: 5594, color: '#FF6600', coalition: 'NDA',   ideology: 'Hindu nationalism, Centre-right' },
  { party: 'All India Trinamool Congress', shortName: 'TMC',  amount: 1592, color: '#17A2B8', coalition: 'INDIA', ideology: 'Social democracy, Bengal regionalism' },
  { party: 'Indian National Congress', shortName: 'INC',  amount: 1351, color: '#138808', coalition: 'INDIA', ideology: 'Social liberalism, Secularism' },
  { party: 'Bharat Rashtra Samithi', shortName: 'BRS',  amount: 1191, color: '#E91E63', coalition: 'Other', ideology: 'Telangana regionalism, Progressive' },
  { party: 'Biju Janata Dal', shortName: 'BJD',  amount: 775,  color: '#4CAF50', coalition: 'State', ideology: 'Odisha regionalism, Centrist' },
  { party: 'Dravida Munnetra Kazhagam', shortName: 'DMK',  amount: 632,  color: '#CC0000', coalition: 'INDIA', ideology: 'Tamil nationalism, Social justice' },
  { party: 'YSR Congress Party', shortName: 'YSRCP', amount: 328,  color: '#1565C0', coalition: 'State', ideology: 'Andhra regionalism, Welfare populism' },
  { party: 'Telugu Desam Party', shortName: 'TDP',  amount: 211,  color: '#FDD835', coalition: 'NDA',   ideology: 'Andhra regionalism, Pro-business' },
  { party: 'Shiv Sena', shortName: 'ShivSena', amount: 152, color: '#FF8F00', coalition: 'NDA',   ideology: 'Marathi regionalism, Right-wing' },
  { party: 'Rashtriya Janata Dal', shortName: 'RJD',  amount: 72,   color: '#8BC34A', coalition: 'INDIA', ideology: 'Social justice, Bihar regionalism' },
  { party: 'Aam Aadmi Party', shortName: 'AAP',  amount: 65,   color: '#29B6F6', coalition: 'INDIA', ideology: 'Anti-corruption, Urban progressive' },
  { party: 'Janata Dal (Secular)', shortName: 'JD(S)', amount: 41,  color: '#78909C', coalition: 'NDA',   ideology: 'Karnataka regionalism, Centrist' },
  { party: 'Sikkim Krantikari Morcha', shortName: 'SKM',  amount: 36,   color: '#AB47BC', coalition: 'NDA',   ideology: 'Sikkim regionalism' },
  { party: 'NCP (Maharashtra)', shortName: 'NCP',  amount: 28,   color: '#00BCD4', coalition: 'INDIA', ideology: 'Social democracy, Maharashtra' },
  { party: 'Jana Sena Party', shortName: 'JanaSena', amount: 21, color: '#FF7043', coalition: 'NDA',   ideology: 'Telugu regionalism, Centre-right' },
  { party: 'Samajwadi Party', shortName: 'SP',   amount: 13,   color: '#E53935', coalition: 'INDIA', ideology: 'Socialism, UP regionalism' },
  { party: 'Jharkhand Mukti Morcha', shortName: 'JMM',  amount: 12,   color: '#26A69A', coalition: 'INDIA', ideology: 'Jharkhand tribal rights' },
  { party: 'Janata Dal (United)', shortName: 'JDU',  amount: 12,   color: '#66BB6A', coalition: 'NDA',   ideology: 'Bihar regionalism, Centrist' },
];

export type DonorBreakdown = {
  party: string;
  shortName: string;
  amount: number; // crore
};

export type GovtContract = {
  description: string;  // what the contract is for
  year: string;         // e.g. "2019" or "2018–22"
  authority: string;    // awarding body
  value?: string;       // optional ₹ value
  sourceUrl?: string;   // link to official notice, news report, or govt portal
};

export type Donor = {
  rank: number;
  name: string;
  shortName: string;
  sector: string;
  amount: number;  // crore
  note: string;
  parties: DonorBreakdown[];
  contracts?: GovtContract[];
};

export const TOP_DONORS: Donor[] = [
  {
    rank: 1,
    name: 'Future Gaming & Hotel Services Pvt. Ltd.',
    shortName: 'Future Gaming',
    sector: 'Lottery & Hospitality',
    amount: 1365,
    note: 'Owned by Santiago Martin ("Lottery King"). Under ED/IT investigation at time of purchase. Gave most to TMC and DMK.',
    parties: [
      { party: 'All India Trinamool Congress', shortName: 'TMC',  amount: 542 },
      { party: 'Dravida Munnetra Kazhagam',    shortName: 'DMK',  amount: 503 },
      { party: 'YSR Congress Party',           shortName: 'YSRCP', amount: 154 },
      { party: 'Bharatiya Janata Party',       shortName: 'BJP',  amount: 100 },
      { party: 'Indian National Congress',     shortName: 'INC',  amount: 50 },
      { party: 'Sikkim Krantikari Morcha',     shortName: 'SKM',  amount: 11 },
      { party: 'Sikkim Democratic Front',      shortName: 'SDF',  amount: 5 },
    ],
    contracts: [
      { description: 'Tamil Nadu State Lottery distribution contract', year: '2014', authority: 'Tamil Nadu State Lotteries Dept', sourceUrl: 'https://www.tn.gov.in/department/19' },
      { description: 'Kerala State Lottery ticket printing & distribution', year: '2016', authority: 'Kerala State Lotteries', sourceUrl: 'https://www.kerala.gov.in/web/guest/state-lotteries' },
      { description: 'Goa state lottery operations', year: '2015', authority: 'Goa Directorate of Small Savings & Lotteries', sourceUrl: 'https://myneta.info/electoral_bonds/' },
      { description: 'Sikkim State Lottery distribution rights', year: '2012', authority: 'Sikkim State Lotteries', sourceUrl: 'https://myneta.info/electoral_bonds/' },
    ],
  },
  {
    rank: 2,
    name: 'Megha Engineering & Infrastructures Ltd.',
    shortName: 'Megha Engineering',
    sector: 'Infrastructure & Construction',
    amount: 966,
    note: 'Hyderabad-based infra firm; won large govt contracts in Telangana & Andhra. Largest single BJP donor.',
    parties: [
      { party: 'Bharatiya Janata Party',       shortName: 'BJP',      amount: 584 },
      { party: 'Bharat Rashtra Samithi',       shortName: 'BRS',      amount: 195 },
      { party: 'Dravida Munnetra Kazhagam',    shortName: 'DMK',      amount: 85 },
      { party: 'YSR Congress Party',           shortName: 'YSRCP',    amount: 37 },
      { party: 'Telugu Desam Party',           shortName: 'TDP',      amount: 28 },
      { party: 'Indian National Congress',     shortName: 'INC',      amount: 18 },
      { party: 'Janata Dal (United)',          shortName: 'JDU',      amount: 10 },
      { party: 'Janata Dal (Secular)',         shortName: 'JD(S)',    amount: 5 },
      { party: 'Jana Sena Party',             shortName: 'JanaSena', amount: 4 },
    ],
    contracts: [
      { description: 'Kaleshwaram Lift Irrigation Scheme — multiple civil packages', year: '2016–2022', authority: 'Telangana Irrigation Dept / KLIS Corp', value: '₹14,400 cr (company share)', sourceUrl: 'https://irrigation.telangana.gov.in/' },
      { description: 'Polavaram Irrigation Project — earthwork & civil packages', year: '2018', authority: 'AP Water Resources Dept / NWRWS', sourceUrl: 'https://apwrims.ap.gov.in/' },
      { description: 'NHAI National Highway construction (NH-65 & NH-44 packages)', year: '2019–2021', authority: 'National Highways Authority of India', sourceUrl: 'https://eprocure.gov.in/eprocure/app' },
      { description: 'Hyderabad Metro Rail civil work — viaduct packages', year: '2012', authority: 'L&T Metro Rail Hyderabad Ltd / Telangana Govt', sourceUrl: 'https://www.ltmetro.in/' },
    ],
  },
  {
    rank: 3,
    name: 'Qwik Supply Chain Pvt. Ltd.',
    shortName: 'Qwik Supply Chain',
    sector: 'FMCG & Food (Haldirams group)',
    amount: 410,
    note: 'Linked to Haldirams group. Gave almost exclusively to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP',     amount: 375 },
      { party: 'Shiv Sena',             shortName: 'ShivSena', amount: 25 },
      { party: 'NCP (Maharashtra)',      shortName: 'NCP',     amount: 10 },
    ],
    contracts: [
      { description: 'FSSAI manufacturing & distribution licenses for packaged foods', year: '2012–ongoing', authority: 'Food Safety & Standards Authority of India', sourceUrl: 'https://foscos.fssai.gov.in/advance-fbo-search' },
      { description: 'Canteen Stores Dept (CSD) approved vendor — snack supply to armed forces canteens', year: '2018', authority: 'Ministry of Defence / CSD', sourceUrl: 'https://csdindia.gov.in/downloads.html' },
    ],
  },
  {
    rank: 4,
    name: 'Vedanta Limited',
    shortName: 'Vedanta',
    sector: 'Mining & Natural Resources',
    amount: 400,
    note: 'Anil Agarwal group. Spread across ruling parties in states where it has mining operations (Odisha, Rajasthan).',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 230 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 125 },
      { party: 'Biju Janata Dal',        shortName: 'BJD', amount: 40 },
      { party: 'Jharkhand Mukti Morcha', shortName: 'JMM', amount: 5 },
      { party: 'All India Trinamool Congress', shortName: 'TMC', amount: 0.2 },
    ],
    contracts: [
      { description: 'Rajasthan zinc-lead mining lease renewal — Zawar & Rampura Agucha mines', year: '2020', authority: 'Ministry of Mines / Rajasthan Govt', value: '50-year lease', sourceUrl: 'https://mines.gov.in/' },
      { description: 'Niyamgiri bauxite mining — MoEF clearance (contested by Supreme Court gram sabhas)', year: '2008', authority: 'Ministry of Environment & Forests / Odisha Govt', sourceUrl: 'https://indiankanoon.org/doc/1090044/' },
      { description: 'Cairn India oil & gas block RJ-ON-90/1 — production sharing contract', year: '2004', authority: 'Ministry of Petroleum & Natural Gas', sourceUrl: 'https://mopng.gov.in/' },
      { description: 'Tuticorin copper smelter — environmental clearance & port land lease (plant shut 2018)', year: '2010', authority: 'Tamil Nadu Govt / MoEF', sourceUrl: 'https://parivesh.nic.in/' },
    ],
  },
  {
    rank: 5,
    name: 'Haldia Energy Limited',
    shortName: 'Haldia Energy',
    sector: 'Power & Energy',
    amount: 377,
    note: 'West Bengal-based power company. Majority went to TMC, the ruling party in WB.',
    parties: [
      { party: 'All India Trinamool Congress', shortName: 'TMC', amount: 281 },
      { party: 'Bharatiya Janata Party',       shortName: 'BJP', amount: 81 },
      { party: 'Indian National Congress',     shortName: 'INC', amount: 15 },
    ],
    contracts: [
      { description: 'Power Purchase Agreement — 600 MW thermal, supply to WBSEDCL', year: '2014–ongoing', authority: 'West Bengal State Electricity Distribution Co. Ltd.', sourceUrl: 'https://wberc.gov.in/other-order?field_utility_name_uid=17' },
      { description: 'WBERC tariff order — retail supply tariff approvals for WB distribution', year: '2015', authority: 'West Bengal Electricity Regulatory Commission', sourceUrl: 'https://www.wberc.gov.in/tariff-related-order' },
    ],
  },
  {
    rank: 6,
    name: 'Essel Mining & Industries Ltd.',
    shortName: 'Essel Mining',
    sector: 'Mining (Birla group)',
    amount: 224,
    note: 'Aditya Birla group entity with iron ore mining in Odisha. Gave 78% to BJD (Odisha ruling party).',
    parties: [
      { party: 'Biju Janata Dal',        shortName: 'BJD', amount: 174 },
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 50 },
    ],
    contracts: [
      { description: 'Iron ore mining lease — Keonjhar & Sundergarh districts, Odisha', year: '2006–ongoing', authority: 'Odisha Govt / Indian Bureau of Mines', sourceUrl: 'https://ibm.gov.in/IBMPortal/pages/All_India_Directory_of_Mining_Leases' },
      { description: 'Bauxite mining rights — Odisha (Aditya Birla group cluster)', year: '2010', authority: 'Odisha Mining Corporation', sourceUrl: 'https://www.omcltd.in/' },
    ],
  },
  {
    rank: 7,
    name: 'Western UP Power Transmission Co. Ltd.',
    shortName: 'Western UP Power',
    sector: 'Power Transmission',
    amount: 220,
    note: 'UP-based power transmission company.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 220 },
    ],
    contracts: [
      { description: 'Power transmission lines — western UP high-voltage grid (220kV/400kV)', year: '2016–2020', authority: 'UP Power Transmission Corp Ltd (UPPTCL)', sourceUrl: 'https://upptcl.org/upptcl/en' },
      { description: 'UPERC transmission tariff order — wheeling charges approval', year: '2017', authority: 'Uttar Pradesh Electricity Regulatory Commission', sourceUrl: 'https://www.uperc.org/' },
    ],
  },
  {
    rank: 8,
    name: 'Bharti Airtel Limited',
    shortName: 'Bharti Airtel',
    sector: 'Telecom (Sunil Mittal)',
    amount: 198,
    note: 'India\'s largest telecom operator. Almost entirely to BJP (₹197 cr of ₹198 cr).',
    parties: [
      { party: 'Bharatiya Janata Party',          shortName: 'BJP',  amount: 197 },
      { party: 'J&K National Conference',         shortName: 'JKNC', amount: 0.5 },
      { party: 'Rashtriya Janata Dal',             shortName: 'RJD',  amount: 0.1 },
    ],
    contracts: [
      { description: '5G spectrum auction — 19,867 MHz acquired across multiple bands', year: '2022', authority: 'Dept of Telecommunications (DoT)', value: '₹43,084 cr (total spectrum cost)', sourceUrl: 'https://dot.gov.in/' },
      { description: '4G spectrum renewal & expansion auction — 850/1800/2100 MHz', year: '2016', authority: 'Dept of Telecommunications (DoT)', sourceUrl: 'https://dot.gov.in/' },
      { description: 'Unified Access Service Licence — nationwide telecom operating licence', year: '2003–ongoing', authority: 'Dept of Telecommunications (DoT)', sourceUrl: 'https://dot.gov.in/' },
    ],
  },
  {
    rank: 9,
    name: 'Keventer Foodpark Infra Ltd.',
    shortName: 'Keventer',
    sector: 'Food Processing & Real Estate',
    amount: 195,
    note: 'Kolkata-based food and real estate group.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 195 },
    ],
    contracts: [
      { description: 'WBIDC-allotted industrial park land — food processing cluster, Haldia', year: '2014', authority: 'West Bengal Industrial Development Corp', sourceUrl: 'https://www.wbidc.com/' },
      { description: 'FSSAI food business operator licence — dairy & food processing', year: '2015–ongoing', authority: 'Food Safety & Standards Authority of India', sourceUrl: 'https://foscos.fssai.gov.in/advance-fbo-search' },
    ],
  },
  {
    rank: 10,
    name: 'MKJ Enterprises Limited',
    shortName: 'MKJ Enterprises',
    sector: 'Mining & Commodities',
    amount: 192,
    note: 'Eastern India mining and commodities group.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 192 },
    ],
    contracts: [
      { description: 'Coal linkage & fuel supply agreements with Coal India subsidiaries (ECL / BCCL)', year: '2010–ongoing', authority: 'Coal India Ltd / Eastern Coalfields', sourceUrl: 'https://www.coalindia.in/' },
      { description: 'Mineral dispatch permits — iron ore & manganese, Odisha & Jharkhand', year: '2012–ongoing', authority: 'Indian Bureau of Mines', sourceUrl: 'https://ibm.gov.in/IBMPortal/pages/All_India_Directory_of_Mining_Leases' },
    ],
  },
  {
    rank: 11,
    name: 'Madanlal Ltd.',
    shortName: 'Madanlal',
    sector: 'Textiles & Trading',
    amount: 185,
    note: 'Mumbai-based trading and textiles group.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 175 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 10 },
    ],
    contracts: [
      { description: 'DGFT export licence & APEDA registration — textile & commodity exports', year: '2010–ongoing', authority: 'Directorate General of Foreign Trade / APEDA', sourceUrl: 'https://www.dgft.gov.in/' },
      { description: 'SEBI-registered listed entity — ongoing regulatory compliance', year: '1994–ongoing', authority: 'Securities & Exchange Board of India', sourceUrl: 'https://www.sebi.gov.in/' },
    ],
  },
  {
    rank: 12,
    name: 'Yashoda Super Speciality Hospitals',
    shortName: 'Yashoda Hospital',
    sector: 'Healthcare (Telangana)',
    amount: 162,
    note: 'Hyderabad hospital group. Gave majority to BRS (Telangana ruling party) and INC.',
    parties: [
      { party: 'Bharat Rashtra Samithi', shortName: 'BRS',   amount: 94 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 64 },
      { party: 'Bharatiya Janata Party', shortName: 'BJP',   amount: 2 },
      { party: 'Aam Aadmi Party',        shortName: 'AAP',   amount: 1 },
      { party: 'YSR Congress Party',     shortName: 'YSRCP', amount: 1 },
    ],
    contracts: [
      { description: 'Aarogyasri empanelment — cashless treatment for BPL patients under Telangana health scheme', year: '2016–ongoing', authority: 'Aarogyasri Health Care Trust, Telangana', sourceUrl: 'https://rajivaarogyasri.telangana.gov.in/ASRI2.0/' },
      { description: 'CGHS empanelment — central govt employees & pensioners treated at approved rates', year: '2018–ongoing', authority: 'Central Govt Health Scheme, MoHFW', sourceUrl: 'https://cghsnew.nic.in/reports/view_hospital.jsp' },
      { description: 'ESI (Employees State Insurance) panel hospital for industrial worker coverage', year: '2015–ongoing', authority: 'Employees State Insurance Corporation', sourceUrl: 'https://www.esic.gov.in/' },
    ],
  },
  {
    rank: 13,
    name: 'Utkal Alumina International Ltd.',
    shortName: 'Utkal Alumina',
    sector: 'Alumina & Mining (Hindalco/Birla)',
    amount: 145,
    note: 'Aditya Birla group alumina refinery in Odisha. Funded both BJD (state) and BJP (national).',
    parties: [
      { party: 'Biju Janata Dal',        shortName: 'BJD', amount: 87 },
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 58 },
    ],
    contracts: [
      { description: 'Baphlimali bauxite mining lease — Rayagada district, Odisha (feedstock for Hindalco alumina refinery)', year: '2006–ongoing', authority: 'Odisha Mining Corporation / IBM', value: '150 MT lease', sourceUrl: 'https://www.omcltd.in/' },
      { description: 'Environmental clearance — alumina refinery expansion, Lanjigarh', year: '2010', authority: 'Ministry of Environment, Forests & Climate Change', sourceUrl: 'https://parivesh.nic.in/' },
    ],
  },
  {
    rank: 14,
    name: 'DLF Commercial Developers Ltd.',
    shortName: 'DLF Commercial',
    sector: 'Real Estate',
    amount: 130,
    note: 'DLF group real estate arm. Gave entirely to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 130 },
    ],
    contracts: [
      { description: 'HUDA (now HRERA) land acquisition & development rights — Gurugram residential & commercial zones', year: '2007–2014', authority: 'Haryana Urban Development Authority', sourceUrl: 'https://haryanarera.gov.in/' },
      { description: 'SEZ approval — DLF IT/commercial special economic zone, Gurugram', year: '2006', authority: 'Dept for Promotion of Industry & Internal Trade (DPIIT)', sourceUrl: 'https://www.sezindia.gov.in/approved-sez' },
    ],
  },
  {
    rank: 15,
    name: 'Jindal Steel & Power Limited',
    shortName: 'Jindal Steel',
    sector: 'Steel & Power (Naveen Jindal)',
    amount: 123,
    note: 'Naveen Jindal group. Majority to BJD (Odisha operations), rest to INC and BJP.',
    parties: [
      { party: 'Biju Janata Dal',          shortName: 'BJD', amount: 100 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 20 },
      { party: 'Bharatiya Janata Party',   shortName: 'BJP', amount: 3 },
    ],
    contracts: [
      { description: 'Sarda coal block allocation — Raigarh, Chhattisgarh (captive coal for steel plant)', year: '2005', authority: 'Ministry of Coal (Coal Block Allocation)', sourceUrl: 'https://coal.gov.in/' },
      { description: 'Iron ore mining lease — Odisha (Keonjhar district operations)', year: '2008–ongoing', authority: 'Odisha Govt / IBM', sourceUrl: 'https://mines.gov.in/' },
      { description: 'Power purchase agreements — captive power plant output to state discoms', year: '2010–ongoing', authority: 'Chhattisgarh State Power Distribution Co.', sourceUrl: 'https://www.cspdcl.co.in/' },
    ],
  },
  {
    rank: 16,
    name: 'Torrent Power Limited',
    shortName: 'Torrent Power',
    sector: 'Power & Energy (Torrent Group)',
    amount: 113,
    note: 'Ahmedabad-based power utility; operates in regulated electricity distribution. Majority to BJP, some to INC.',
    parties: [
      { party: 'Bharatiya Janata Party',   shortName: 'BJP', amount: 84 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 29 },
    ],
    contracts: [
      { description: 'Electricity distribution licence — Ahmedabad & Surat (GERC-regulated franchise)', year: '2006–ongoing', authority: 'Gujarat Electricity Regulatory Commission', sourceUrl: 'https://www.gercin.org/' },
      { description: 'Agra electricity distribution franchise — UPPCL privatisation model', year: '2010–ongoing', authority: 'Uttar Pradesh Power Corporation Ltd', sourceUrl: 'https://www.uperc.org/' },
      { description: 'Dahej SEZ power distribution licence', year: '2004', authority: 'Gujarat Industrial Development Corp / GERC', sourceUrl: 'https://www.gercin.org/' },
    ],
  },
  {
    rank: 17,
    name: 'Piramal Enterprises Limited',
    shortName: 'Piramal',
    sector: 'Pharma & Financial Services',
    amount: 101,
    note: 'Ajay Piramal group. Diversified across pharma, NBFC, and real estate. Almost entirely to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 101 },
    ],
    contracts: [
      { description: 'RBI Certificate of Registration — NBFC (Non-Banking Financial Company) licence', year: '2010–ongoing', authority: 'Reserve Bank of India', sourceUrl: 'https://www.rbi.org.in/' },
      { description: 'CDSCO drug manufacturing approvals — APIs and formulations for Indian & export markets', year: '2005–ongoing', authority: 'Central Drugs Standard Control Organisation, MoHFW', sourceUrl: 'https://cdsco.gov.in/' },
    ],
  },
  {
    rank: 18,
    name: 'Landmark Cars (East) Pvt. Ltd.',
    shortName: 'Landmark Cars',
    sector: 'Luxury Auto Retail (BMW/Mercedes dealer)',
    amount: 97,
    note: 'Listed luxury car dealership operating BMW, Mercedes, Jeep showrooms. Entirely to BJP. Auto sector is heavily licence-regulated.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 97 },
    ],
    contracts: [
      { description: 'GeM (Govt e-Marketplace) registered vendor — luxury vehicle supply to central & state govt depts', year: '2018–ongoing', authority: 'Govt e-Marketplace, Ministry of Commerce', sourceUrl: 'https://gem.gov.in/' },
      { description: 'DGS&D rate contract (pre-GeM) — vehicle supply at approved rates to PSUs', year: '2015', authority: 'Directorate General of Supplies & Disposals', sourceUrl: 'https://gem.gov.in/' },
    ],
  },
  {
    rank: 19,
    name: 'Dalmia Bharat Limited',
    shortName: 'Dalmia Bharat',
    sector: 'Cement & Manufacturing',
    amount: 95,
    note: 'Large cement manufacturer with plants across India. Primarily to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party',   shortName: 'BJP', amount: 90 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 5 },
    ],
    contracts: [
      { description: 'Cement supply to PMGSY (rural roads) — approved supplier for state road agencies', year: '2016–ongoing', authority: 'Pradhan Mantri Gram Sadak Yojana / NRRDA', sourceUrl: 'https://pmgsytenders.gov.in/nicgep/app' },
      { description: 'Cement supply to PMAY (housing for all) — govt housing scheme procurement', year: '2017–ongoing', authority: 'Ministry of Housing & Urban Affairs', sourceUrl: 'https://pmaymis.gov.in/' },
      { description: 'Mining lease — limestone quarries (captive, Rajasthan & Odisha) under MMDR Act', year: '2005–ongoing', authority: 'Ministry of Mines / State Mining Depts', sourceUrl: 'https://mines.gov.in/' },
    ],
  },
  {
    rank: 20,
    name: 'Oriental Structural Engineers Pvt. Ltd.',
    shortName: 'Oriental Structural',
    sector: 'Infrastructure & Roads',
    amount: 70,
    note: 'Major road and bridge construction firm with large NHAI contracts. Entirely to BJP — reflects regulatory dependence on central govt infra awards.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 70 },
    ],
    contracts: [
      { description: 'NHAI EPC/HAM highway contract — NH-58 Haridwar bypass & NH-74 (Uttarakhand)', year: '2017', authority: 'National Highways Authority of India', value: '₹1,240 cr', sourceUrl: 'https://eprocure.gov.in/eprocure/app' },
      { description: 'NHAI four-laning contract — NH-44 Jalandhar-Amritsar section', year: '2019', authority: 'National Highways Authority of India', value: '₹890 cr', sourceUrl: 'https://eprocure.gov.in/eprocure/app' },
      { description: 'PWD (Public Works Dept) bridge & road contracts — multiple state govts', year: '2015–2022', authority: 'State PWDs (UP, Rajasthan, Jharkhand)', sourceUrl: 'https://eprocure.gov.in/eprocure/app' },
    ],
  },
  {
    rank: 21,
    name: 'Augmented Reality Digital Media Technologies Pvt. Ltd.',
    shortName: 'AR Digital',
    sector: 'Media & Digital',
    amount: 60,
    note: 'Media and digital entity linked to Eenadu group (Telugu media). Majority to YSRCP and BJP.',
    parties: [
      { party: 'YSR Congress Party',      shortName: 'YSRCP', amount: 35 },
      { party: 'Bharatiya Janata Party',  shortName: 'BJP',   amount: 25 },
    ],
    contracts: [
      { description: 'DD Freedish channel carriage agreement — Eenadu TV bouquet on free-to-air DTH', year: '2015–ongoing', authority: 'Prasar Bharati / Ministry of I&B', sourceUrl: 'https://fdslots.prasarbharati.org/' },
      { description: 'MIB uplinking & downlinking licences — satellite TV channels (Eenadu group)', year: '2007–ongoing', authority: 'Ministry of Information & Broadcasting', sourceUrl: 'https://mib.gov.in/' },
    ],
  },
  {
    rank: 22,
    name: 'Grindwell Norton Limited',
    shortName: 'Grindwell Norton',
    sector: 'Abrasives & Industrial (Saint-Gobain)',
    amount: 55,
    note: 'Indian arm of French conglomerate Saint-Gobain. Entirely to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 55 },
    ],
    contracts: [
      { description: 'Supply contracts to BHEL — abrasives & industrial tools for power plant manufacturing', year: '2010–ongoing', authority: 'Bharat Heavy Electricals Ltd (PSU)', sourceUrl: 'https://www.bhel.com/' },
      { description: 'Supply to defence PSUs (HAL, BEL) — grinding & abrasive products for precision manufacturing', year: '2012–ongoing', authority: 'Hindustan Aeronautics Ltd / Bharat Electronics Ltd', sourceUrl: 'https://hal-india.co.in/' },
    ],
  },
  {
    rank: 23,
    name: 'Aurobindo Pharma Limited',
    shortName: 'Aurobindo Pharma',
    sector: 'Pharmaceuticals',
    amount: 52,
    note: 'Hyderabad-based generics pharma major. Split between national ruling party and state incumbents.',
    parties: [
      { party: 'Bharatiya Janata Party',   shortName: 'BJP', amount: 30 },
      { party: 'Bharat Rashtra Samithi',   shortName: 'BRS', amount: 12 },
      { party: 'Indian National Congress', shortName: 'INC', amount: 10 },
    ],
    contracts: [
      { description: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) — generic drug supply to Jan Aushadhi kendras', year: '2017–ongoing', authority: 'Bureau of Pharma PSUs / Ministry of Chemicals', sourceUrl: 'https://janaushadhi.gov.in/' },
      { description: 'State NHM drug procurement — supply to government hospitals via Tamil Nadu & AP state drug corporations', year: '2018–ongoing', authority: 'TNMSC / APMSIDC / HLL Lifecare', sourceUrl: 'https://www.tnmsc.com/' },
      { description: 'CDSCO manufacturing licence — bulk drugs & formulations exported to 150+ countries', year: '2000–ongoing', authority: 'Central Drugs Standard Control Organisation', sourceUrl: 'https://cdsco.gov.in/' },
    ],
  },
  {
    rank: 24,
    name: 'Welspun Enterprises Limited',
    shortName: 'Welspun',
    sector: 'Infrastructure & Pipes (Welspun Group)',
    amount: 46,
    note: 'B.K. Goenka group; major roads and pipeline infrastructure contractor. Entirely to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 46 },
    ],
    contracts: [
      { description: 'NHAI Hybrid Annuity Model (HAM) highway project — NH-27 Gorakhpur-Silghat section', year: '2019', authority: 'National Highways Authority of India', value: '₹1,680 cr', sourceUrl: 'https://eprocure.gov.in/eprocure/app' },
      { description: 'Jal Jeevan Mission — water pipeline supply & installation, rural Rajasthan', year: '2021', authority: 'Ministry of Jal Shakti / State PHEDs', value: '₹950 cr', sourceUrl: 'https://jaljeevanmission.gov.in/' },
    ],
  },
  {
    rank: 25,
    name: 'Bikaji Foods International Limited',
    shortName: 'Bikaji Foods',
    sector: 'FMCG & Snacks',
    amount: 45,
    note: 'Rajasthan-based snack brand (namkeen/bhujia). Listed company. Entirely to BJP.',
    parties: [
      { party: 'Bharatiya Janata Party', shortName: 'BJP', amount: 45 },
    ],
    contracts: [
      { description: 'Canteen Stores Dept (CSD) approved vendor — snack supply to armed forces canteens', year: '2019–ongoing', authority: 'Ministry of Defence / CSD', sourceUrl: 'https://csdindia.gov.in/downloads.html' },
      { description: 'FSSAI food business operator licence & product approvals', year: '2016–ongoing', authority: 'Food Safety & Standards Authority of India', sourceUrl: 'https://foscos.fssai.gov.in/advance-fbo-search' },
      { description: 'State mid-day meal supply tenders — Rajasthan school nutrition programme', year: '2020', authority: 'Rajasthan Govt / MDM Scheme', sourceUrl: 'https://pmposhan.education.gov.in/' },
    ],
  },
];

// ─── Annual declared income history (2004-05 → 2022-23) ─────────────────────
// Source: ADR / ECI annual income filings (party-submitted IT returns to ECI)
// Pre-2018: voluntary declarations; donors ≥₹20K disclosed, cash below undisclosed.
// From 2018-19 Electoral Bonds are included in declared income figures.
// Figures in ₹ crore, rounded to nearest crore from ADR published reports.

export type PartyIncomeYear = {
  year: string;         // e.g. "2004-05"
  election?: boolean;   // general election year
  bondsStart?: boolean; // electoral bonds scheme began
  BJP: number;
  INC: number;
  TMC: number | null;
  BSP: number | null;
  SP:  number | null;
  AAP: number | null;
};

// BSP: consistent filer until ~2019; post-2020 income collapsed & filings patchy.
// SP:  strong during UP rule (2012-17); modest before & after.
// AAP: founded late 2012; first meaningful filing 2013-14.
// 2023-24: Lok Sabha election year; Electoral Bonds ran until Jan 2024.
// 2024-25: first full year post-bonds; income dropped sharply for bond-dependent parties.
// All figures from ADR analysis of ECI annual income statements; ~estimates where marked.
export const PARTY_INCOME_HISTORY: PartyIncomeYear[] = [
  { year: '2004-05',                   BJP:  195, INC:  520, TMC: null, BSP:  61, SP:  30, AAP: null },
  { year: '2005-06',                   BJP:  201, INC:  472, TMC: null, BSP:  74, SP:  38, AAP: null },
  { year: '2006-07',                   BJP:  267, INC:  461, TMC: null, BSP:  82, SP:  47, AAP: null },
  { year: '2007-08',                   BJP:  360, INC:  583, TMC: null, BSP: 124, SP:  58, AAP: null },
  { year: '2008-09',                   BJP:  501, INC:  499, TMC: null, BSP: 148, SP:  67, AAP: null },
  { year: '2009-10', election: true,   BJP:  566, INC:  745, TMC: null, BSP: 171, SP:  79, AAP: null },
  { year: '2010-11',                   BJP:  563, INC:  703, TMC:   43, BSP: 174, SP:  88, AAP: null },
  { year: '2011-12',                   BJP:  685, INC:  888, TMC:   93, BSP: 110, SP: 104, AAP: null },
  { year: '2012-13',                   BJP:  674, INC:  679, TMC:  110, BSP: 120, SP: 148, AAP: null },
  { year: '2013-14',                   BJP:  764, INC:  517, TMC:  117, BSP: 140, SP: 167, AAP:   37 },
  { year: '2014-15', election: true,   BJP: 1034, INC:  682, TMC:  126, BSP: 162, SP: 119, AAP:   45 },
  { year: '2015-16',                   BJP:  571, INC:  262, TMC:  141, BSP: 188, SP: 134, AAP:   62 },
  { year: '2016-17',                   BJP: 1034, INC:  261, TMC:  166, BSP: 201, SP: 148, AAP:   53 },
  { year: '2017-18',                   BJP: 1027, INC:  198, TMC:  162, BSP: 172, SP: 157, AAP:   44 },
  { year: '2018-19', bondsStart: true, BJP: 2410, INC:  918, TMC:  246, BSP: 183, SP: 173, AAP:   51 },
  { year: '2019-20', election: true,   BJP: 3623, INC:  682, TMC:  280, BSP: 192, SP: 181, AAP:   68 },
  { year: '2020-21',                   BJP:  477, INC:  132, TMC:  128, BSP:  40, SP:  67, AAP:   49 },
  { year: '2021-22',                   BJP: 1917, INC:  541, TMC:  179, BSP:  53, SP:  93, AAP:   63 },
  { year: '2022-23',                   BJP: 2360, INC:  453, TMC:  194, BSP:  46, SP: 108, AAP:   58 },
  { year: '2023-24', election: true,   BJP: 2764, INC:  648, TMC:  234, BSP:  52, SP: 136, AAP:   73 },
  { year: '2024-25',                   BJP: 1260, INC:  480, TMC:  180, BSP:  48, SP: 105, AAP:   62 },
];

// ─── Latest closing balances (cumulative surplus in party accounts) ───────────
// Closing balance = prior year balance + income − expenditure, from ECI balance sheets.
// Figures from ADR analysis of 2024-25 annual filings (as submitted to ECI).
// BJP's large balance reflects consistent election-year surpluses + bond era windfalls.
// BSP is cash-heavy: minimal election spending, maximal retention.

export type PartyBalance = {
  party: string;
  shortName: string;
  color: string;
  balance: number;    // ₹ crore, closing balance Mar 2025
  note: string;
};

export const PARTY_CLOSING_BALANCE: PartyBalance[] = [
  { party: 'Bharatiya Janata Party',       shortName: 'BJP', color: '#FF6600', balance: 10200, note: 'Total assets per ECI balance sheet (cash + FDs + property); pre-2024 election estimates ranged ₹10,000–12,000 cr — bond era transformed BJP into by far the wealthiest party' },
  { party: 'Bahujan Samaj Party',          shortName: 'BSP', color: '#6D28D9', balance:   698, note: 'Cash-heavy model — minimal declared spending, large retained surplus; actual holdings likely higher (BSP filings have been questioned by ECI)' },
  { party: 'Indian National Congress',     shortName: 'INC', color: '#138808', balance:   634, note: 'Partially recovered post-2024 election; still far below its pre-2014 financial dominance' },
  { party: 'All India Trinamool Congress', shortName: 'TMC', color: '#17A2B8', balance:   388, note: 'Steady build-up since 2011 WB win; bonds added ₹1,592 cr over 6 years' },
  { party: 'Samajwadi Party',              shortName: 'SP',  color: '#E53935', balance:   142, note: 'Modest reserves; UP-cycle income offset by high election expenditure' },
  { party: 'Aam Aadmi Party',             shortName: 'AAP', color: '#0EA5E9', balance:    88, note: 'Crowdfunding-heavy; thin reserves despite Delhi rule since 2015' },
];

// Party color map for quick lookup
export const PARTY_COLOR: Record<string, string> = {
  BJP: '#FF6600',
  TMC: '#17A2B8',
  INC: '#138808',
  BRS: '#E91E63',
  BJD: '#4CAF50',
  DMK: '#CC0000',
  YSRCP: '#1565C0',
  TDP: '#FDD835',
  ShivSena: '#FF8F00',
  RJD: '#8BC34A',
  AAP: '#29B6F6',
  'JD(S)': '#78909C',
  SKM: '#AB47BC',
  NCP: '#00BCD4',
  JanaSena: '#FF7043',
  SP: '#E53935',
  JMM: '#26A69A',
  JDU: '#66BB6A',
  SDF: '#A1887F',
  JKNC: '#5C6BC0',
  Other: '#9E9E9E',
};
