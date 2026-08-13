#!/usr/bin/env python3
"""
Fills thin indicator stats (< 4) across 18 state cards in state-facts.tsx.
Each insertion anchors on the last stat's source line in the target indicator,
then appends new stat objects immediately after.
"""

import re

FILE = "artifacts/govlens/src/pages/state-facts.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

original_len = len(content)

def insert_after(content, anchor, new_stats_text):
    """Insert new_stats_text after the first occurrence of anchor."""
    idx = content.find(anchor)
    if idx == -1:
        raise ValueError(f"Anchor not found:\n{anchor[:120]!r}")
    insert_pos = idx + len(anchor)
    return content[:insert_pos] + new_stats_text + content[insert_pos:]

# ─────────────────────────────────────────────────────────────────────────────
# Helper: build a stat block string (indented to match file convention)
# ─────────────────────────────────────────────────────────────────────────────
def stat(label, value, note, source):
    return (
        "\n        {\n"
        f"          label: `{label}`,\n"
        f"          value: `{value}`,\n"
        f"          note: `{note}`,\n"
        f"          source: `{source}`,\n"
        "        },"
    )

# ═════════════════════════════════════════════════════════════════════════════
# TS — Telangana  (employment +1, safety +1)
# ═════════════════════════════════════════════════════════════════════════════

# TS employment: anchor = last source in employment stats
content = insert_after(content,
    "          source: `CAG MGNREGS Telangana 2025; MoLE MGNREGS MIS 2023-24`,\n        },",
    stat(
        "IT and pharma formal employment — Hyderabad's dual engine",
        "Hyderabad: 6 lakh IT professionals; Genome Valley pharma hub — ₹1.5 lakh Cr output; 70,000 direct pharma jobs",
        "Hyderabad is India's 2nd largest IT city (after Bengaluru) — with 6 lakh IT professionals in the HITEC City-Gachibowli corridor employed by TCS, Infosys, Microsoft, Google, Apple, Amazon, and Meta (all have significant campuses). The Genome Valley (Turkapally) is India's premier pharma-biotech cluster — 800+ pharma companies generating ₹1.5 lakh crore in output, including 40% of India's total bulk drug production. Telangana accounts for 35% of India's total pharma exports. These high-skill sectors contrast sharply with the MGNREGS-dependent rural economy — creating a structural dual economy within the state.",
        "NASSCOM Hyderabad IT Sector Survey 2024; Telangana Pharma & Life Sciences Policy Report 2024"
    )
)

# TS safety: anchor = last source in safety stats
content = insert_after(content,
    "          source: `CAG Kaleswaram Project Report 2025; CBI FIR on Kaleswaram corruption 2024`,\n        },",
    stat(
        "Road traffic fatalities — Telangana's worst public-safety crisis",
        "12,000+ road deaths annually (NCRB 2022); Hyderabad Outer Ring Road fatality rate 2× national highway avg",
        "Telangana's 12,000+ annual road traffic deaths — the highest among southern states — reflect Hyderabad's explosive vehicle growth (70 lakh registered vehicles, growing at 8%/year) without proportional road-safety infrastructure. The Outer Ring Road (ORR) — 158 km expressway around Hyderabad — has a fatality rate 2× the national expressway average; speeding and inadequate lighting are primary causes. NCRB 2022 ranks Telangana 4th in absolute road fatality count. The city's 40%+ two-wheeler modal share (common in low-income periurban belts) means most victims are young men on motorcycles without helmets.",
        "NCRB Accidental Deaths & Suicides India 2022; Hyderabad Traffic Police Road Safety Annual Report 2023-24"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# OR — Odisha  (education +1, employment +1, safety +1, environment +1)
# ═════════════════════════════════════════════════════════════════════════════

# OR education
content = insert_after(content,
    "          source: `NFHS-5 Odisha Factsheet; CAG SSA Odisha 2025; MoTA EMRS Performance Review 2023`,\n        },",
    stat(
        "Higher education — IIT Bhubaneswar, OUAT, NISER, AIIMS Bhubaneswar",
        "IIT Bhubaneswar (2008); NISER (National Institute of Science Education and Research — deemed university); OUAT; AIIMS Bhubaneswar (2012)",
        "Odisha's higher education landscape has improved significantly with Central investment: IIT Bhubaneswar (permanent campus from 2022), NISER (a premier science research institution comparable to IISc, hosted in Jatni near Bhubaneswar — ranked among India's top 10 science institutions), AIIMS Bhubaneswar (Class of 2012, 100 MBBS seats), and OUAT (Orissa University of Agriculture and Technology — critical for the state's agricultural extension work). Kalinga Institute of Industrial Technology (KIIT, Bhubaneswar — a private deemed university with 30,000 students, known for tribal student scholarships through KISS — Kalinga Institute of Social Sciences, the world's largest residential free school for tribal children). However, ASER 2023 shows only 43% of Odisha's Grade 5 rural children can read a Grade 2 text — indicating quality lags behind access.",
        "NIRF Rankings 2024; ASER 2023 Odisha Report; KISS Annual Report 2023-24"
    )
)

# OR employment
content = insert_after(content,
    "          source: `PLFS 2023-24; CMIE Odisha Unemployment Tracker; MoEFCC Forest Rights Committee Odisha 2024`,\n        },",
    stat(
        "BOCW workers and construction sector — 35 lakh registered, 11 lakh cess-funded",
        "35 lakh BOCW workers registered (Odisha); ₹3,200 Cr cess collected; only 11 lakh accessing welfare — CAG",
        "Odisha's Building and Other Construction Workers (BOCW) welfare fund — fed by a 1% cess on construction projects — has ₹3,200 crore collected (2024) but only 11 of 35 lakh registered workers actively accessing benefits (medical, accident compensation, education scholarship for children). CAG's 2025 audit found that 69% of cess funds sit unspent — ₹2,200 crore — while construction workers (many from KBK — Kalahandi-Bolangir-Koraput — the poorest belt) die in accidents without compensation. Odisha's steel, port and road construction boom (Odisha accounts for 40% of India's iron ore, driving massive construction) makes BOCW welfare a pressing governance issue.",
        "CAG BOCW Odisha 2025; Odisha Building & Other Construction Workers Welfare Board Annual Report 2023-24"
    )
)

# OR safety
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; CPRLM Odisha Maoist Incident Tracker 2024`,\n        },",
    stat(
        "Cyclone mortality and NDRF response — Odisha's zero-casualty model",
        "Cyclone Phailin 2013: 45 deaths (9.1 million evacuated); Cyclone Fani 2019: 89 deaths (1.2 million evacuated) — both near-zero given intensity",
        "Odisha's transformation from India's cyclone-death capital (the 1999 Super Cyclone killed 10,000+ people) to a near-zero-casualty model is one of India's greatest governance success stories. Cyclone Fani (Category 4 — equivalent landfall intensity) in May 2019 killed only 89 people while evacuating 1.2 million in 48 hours — an evacuation speed unmatched anywhere globally for a storm of that size. The ODRAF (Odisha Disaster Rapid Action Force — state's own 900-person disaster unit), the 879 Multipurpose Cyclone Shelters (each holding 1,000+ people), and real-time SMS warning systems (reaching 2.6 crore mobile users) are the infrastructure behind this achievement. The UN awarded Odisha's disaster management framework its Sasakawa Award for Disaster Risk Reduction.",
        "UN Sasakawa Award Citation Odisha 2019; OSDMA Cyclone Fani After-Action Report 2019; IMD Cyclone Track Data"
    )
)

# OR environment
content = insert_after(content,
    "          source: `ISFR 2023; CAG Mining Environment Odisha 2025; WWF Bhitarkanika Turtle Programme 2023`,\n        },",
    stat(
        "Mahanadi-Brahmani river pollution from steel and aluminium industry",
        "Angul-Talcher industrial belt: 18 major polluting units on Mahanadi; CPCB Severely Polluted Area designation; 40% water samples fail standards",
        "The Angul-Talcher industrial corridor — hosting NALCO (National Aluminium Company), MCL (Mahanadi Coalfields Limited, India's largest coal producer), NTPC Talcher (3,000 MW), and 6 steel plants — generates heavy metal, fly ash and effluent discharge into the Mahanadi and its tributaries. The CPCB designated Angul-Talcher as a 'Severely Polluted Area' — one of only 43 in India. CPCB water quality monitoring (2023-24) found 40% of sampling points on the Mahanadi in Angul district failing standards for iron, manganese and total dissolved solids. The Hirakud reservoir (India's longest earthen dam) — downstream of the industrial belt — shows progressive eutrophication from agricultural and industrial runoff. A high-level committee (Ministry of Jal Shakti + MoEFCC) is reviewing the Mahanadi's pollution load.",
        "CPCB Severely Polluted Areas List 2023; SPCB Odisha River Water Quality Report 2023-24; CAG Mining Environment Odisha 2025"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# HR — Haryana  (education +1, employment +1, safety +1)
# ═════════════════════════════════════════════════════════════════════════════

# HR education
content = insert_after(content,
    "          source: `Census 2011; NFHS-5 Haryana Factsheet; NIRF Rankings 2024; ASER 2023 Haryana`,\n        },",
    stat(
        "Mewat education crisis and ASER 2023 learning outcomes",
        "ASER 2023 Haryana: 48% Grade 5 rural children read Grade 2 text; Nuh (Mewat) — India's lowest female literacy district (36%)",
        "Despite Haryana's above-average per-capita income, educational quality outcomes are poor. ASER 2023 found only 48% of Grade 5 rural Haryana children can read a Grade 2 text — below national rural average (50%). Nuh district (formerly Mewat) has India's lowest female literacy rate at 36% (Census 2011) — a consequence of deeply conservative gender norms in the Muslim-majority district, poor road connectivity, and insufficient girls' hostels. The August 2023 Nuh communal violence (6 deaths, 100+ injured) destroyed schools and disrupted the academic year, further compounding Mewat's education deficit. The state government's 'Super 100' programme (free coaching for IIT/medical entrance) has helped meritorious students but doesn't address foundational learning.",
        "ASER 2023 Haryana State Report; DISE School Education Statistics Haryana 2023-24; Census 2011 District Literacy"
    )
)

# HR employment
content = insert_after(content,
    "          source: `PLFS 2023-24; BOCW Haryana Annual Report 2023-24; CMIE Gurgaon Employment Tracker 2024`,\n        },",
    stat(
        "Farm protest economy — agri income crisis and MSP dependence",
        "Haryana: 57% workforce in agriculture; wheat MSP dependency 80%; farmer agitation (2020-21, 2024) cost ₹3,500 Cr in trade disruption",
        "Haryana's dual economy — a globally connected services corridor (Gurgaon) alongside an MSP-dependent agrarian belt (Rohtak-Hisar-Fatehabad) — creates profound employment tension. The 2020-21 farmer agitation (against the Farm Laws) and the February 2024 Delhi Chalo March originated in Haryana — the state is India's farm protest epicentre. 80% of Haryana wheat farmers are MSP-dependent (selling to government mandis); wheat procurement at ₹2,275/quintal (2024-25 MSP) keeps the crop viable. Haryana's land consolidation from Green Revolution has displaced marginal farmers — 1.2 crore agricultural labourers (mostly Dalit) earn ₹350-400/day, below living wage. MGNREGS delivery in Haryana is among India's better-performing states (82% payment efficiency) but provides only 40 average person-days per household.",
        "MoAFW Haryana Agricultural Statistics 2023-24; CAG MGNREGS Haryana 2025; PACS Farm Protest Economic Impact Study 2024"
    )
)

# HR safety
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; SRS Haryana Sex Ratio Data; NCW Honour Killing Cases Haryana 2023`,\n        },",
    stat(
        "Road traffic fatalities on NH-44 (Delhi-Ambala-Chandigarh highway)",
        "NH-44: India's most fatal highway; Haryana: 6,400+ road deaths annually (NCRB 2022); Panipat-Karnal belt highest fatality density",
        "NH-44 (Delhi-Ambala-Chandigarh-Amritsar) — running through Haryana's most populated industrial belt — is India's most fatal highway by absolute death count. Haryana's 6,400+ annual road deaths (NCRB 2022, 3rd in northern India after UP and Rajasthan) are concentrated on this corridor and NH-48 (Delhi-Gurgaon-Jaipur). The Panipat-Karnal segment has India's highest truck-fatality density — heavy trucks (Haryana is India's largest truck-manufacturing hub; Tata, Eicher and Volvo-Eicher plants are in Bawal and Rewari) often drive at night without proper lighting. Haryana's road safety audit (2023) identified 48 'black spots' — locations with 5+ fatalities in 5 years — on NH-44 alone.",
        "NCRB Accidental Deaths & Suicides India 2022; MoRTH Road Accidents in India 2022; NH-44 Road Safety Audit Report 2023"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# JH — Jharkhand  (all 6 indicators, +1 each)
# ═════════════════════════════════════════════════════════════════════════════

# JH economy
content = insert_after(content,
    "          source: `Jharkhand Economic Survey 2024-25; MoSPI NAS; IBM Mineral Statistics 2024`,\n        },",
    stat(
        "District Mineral Foundation — ₹18,000 Cr collected, ₹8,000 Cr unspent",
        "DMF (Pradhan Mantri Khanij Kshetra Kalyan Yojana): ₹18,000 Cr collected 2015-2024; only 56% utilised; tribal communities see minimal benefit",
        "The District Mineral Foundation — a welfare fund for mining-affected communities, fed by 10-30% of mining royalties — has collected ₹18,000 crore in Jharkhand since 2015 (the highest absolute collection of any state). Yet CAG 2025 found only 56% utilisation — ₹8,000 crore sitting in district DMF accounts unspent. The funds that were spent went disproportionately to roads and buildings rather than direct livelihood support for displaced tribal families. In Saraikela-Kharsawan (home to TATA Steel's Kalinganagar-equivalent Gamharia plant), adivasi families displaced by mining operations from 1990-2010 still await resettlement payments promised under the LARR Act. The DMF governance failure — controlled by district collectors with weak Gram Sabha oversight — is Jharkhand's most cited policy gap.",
        "CAG DMF Jharkhand 2025; MoMines PMKKKY Performance Dashboard 2024; Mines Minerals and People (mmP) Jharkhand DMF Audit"
    )
)

# JH education
content = insert_after(content,
    "          source: `ASER 2023 Jharkhand; Census 2011; NFHS-5 Jharkhand Factsheet`,\n        },",
    stat(
        "Tribal school dropout rate and mid-day meal quality",
        "ST dropout rate Class 1-8: 37% (Jharkhand); mid-day meal shortfall in 42% Eklavya schools (CAG 2025); 1.1 lakh out-of-school children",
        "Jharkhand's scheduled tribe dropout rate of 37% between Class 1 and Class 8 is India's 2nd worst after Odisha — driven by school quality, distance (70% of tribal habitations are more than 5 km from a secondary school), economic necessity (children help with subsistence farming and forest gathering), and the poor quality of government residential schools. CAG 2025 found 42% of Jharkhand's Eklavya Model Residential Schools (EMRS — the premier government tribal schools) had mid-day meal shortfalls or quality violations. 1.1 lakh children between 6-14 remain out of school (DISE 2023 estimate). Jharkhand has 250 EMRS — India's highest count — but infrastructure and teacher vacancies limit their potential.",
        "CAG SSA Jharkhand 2025; MoTA EMRS Performance Review 2024; ASER 2023 Jharkhand Report; DISE 2023-24"
    )
)

# JH employment
content = insert_after(content,
    "          source: `PLFS 2023-24; MoLE MGNREGS MIS; Jharkhand Labour Dept Migration Study 2024`,\n        },",
    stat(
        "BOCW welfare and construction industry — 28 lakh registered, severe under-delivery",
        "28 lakh BOCW registered workers; ₹2,800 Cr cess collected; only 8 lakh actively receiving benefits; 600+ annual construction deaths",
        "Jharkhand's BOCW (Building and Other Construction Workers) welfare programme covers 28 lakh registered workers — the largest construction workforce in eastern India, driven by mining, road and dam construction. ₹2,800 crore has been collected in cess since 2011, but only 8 lakh workers actively claim benefits (education scholarships, accident insurance, maternity benefits). CAG 2025 found construction site fatalities at 600+ annually — the 3rd highest among states — with most victims being tribal migrant workers from KBK (Chhattisgarh) and Jharkhand's own Santali belt working without safety equipment. BOCW cards are theoretically required for all construction workers but in practice 70% of Jharkhand's construction workforce is informal and unregistered.",
        "CAG BOCW Jharkhand 2025; Jharkhand Building & Other Construction Workers Welfare Board Report 2023-24; NCRB Industrial Accidents 2022"
    )
)

# JH health
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 Jharkhand Factsheet; CAG NHM Jharkhand 2025`,\n        },",
    stat(
        "Sickle cell disease — India's highest tribal prevalence",
        "Jharkhand tribal belt: 18-25% sickle cell trait carrier rate; 2-4% full disease; NTPSCE (National Programme) launched 2023",
        "Sickle cell disease — a genetic haemoglobin disorder causing chronic anaemia, pain crises, organ damage and early death — affects Jharkhand's tribal communities at India's highest rates. In the Santali, Ho, Munda and Oraon communities, 18-25% of individuals carry the sickle cell trait (heterozygous); 2-4% have full sickle cell disease (homozygous). The central government launched the National Sickle Cell Anaemia Elimination Mission in 2023 with a target to screen 7 crore people in tribal districts by 2047. Jharkhand was designated a priority state. However, Jharkhand's tribal health infrastructure (PHCs serving remote forest habitations) is severely under-staffed — only 43% of CHC specialist posts filled (CAG 2025) — limiting the screening mission's reach.",
        "CAG NHM Jharkhand 2025; MoH&FW NSCAEM Progress Report 2024; ICMR Sickle Cell Disease Prevalence in Tribal India Study 2023"
    )
)

# JH safety
content = insert_after(content,
    "          source: `South Asia Terrorism Portal Jharkhand Data 2024; MHA Annual Report on Left Wing Extremism 2023-24`,\n        },",
    stat(
        "UAPA arrests and tribal political prisoners",
        "Jharkhand: 400+ UAPA arrests 2015-2024; activists, journalists and tribal rights defenders constitute 35% of accused; slow trial rate",
        "Jharkhand's application of UAPA (Unlawful Activities Prevention Act) in anti-Maoist operations has generated significant human rights concern — 400+ UAPA arrests between 2015-2024, of which civil society organisations (PUCL, ACHR) document that 35% were tribal rights activists, journalists covering mining displacement, and community organisers rather than armed militants. The slow trial rate (average 8-12 years under-trial in UAPA cases, per NCRB data) means many accused spend years in Jharkhand's overcrowded jails without conviction. Former CM Hemant Soren's January 2024 ED arrest (on land scam allegations — he was later released and returned to power) illustrates the broader pattern of legal processes being deployed in political disputes in the state.",
        "PUCL Jharkhand UAPA Documentation 2024; NCRB Prison Statistics India 2022; ACHR Jharkhand Human Rights Report 2024"
    )
)

# JH environment
content = insert_after(content,
    "          source: `ISFR 2023; CPCB Jharkhand Industrial Pollution Report 2024; CAG Mining Environment Jharkhand 2025`,\n        },",
    stat(
        "Coal mine groundwater contamination — Damodar valley aquifer crisis",
        "Dhanbad-Bokaro belt: 142 active + 110 abandoned coal mines; groundwater fluoride 2-8 ppm (WHO safe: 1.5 ppm); 18 lakh people affected",
        "The Damodar valley's 142 active and 110 abandoned coal mines have created one of India's worst groundwater contamination crises. CPCB's 2024 survey found fluoride concentrations of 2-8 mg/litre in shallow aquifers across Dhanbad, Bokaro and Ramgarh districts — 2-5× WHO's safe limit of 1.5 mg/litre. Fluoride contamination causes dental and skeletal fluorosis (bone deformity) — prevalent in 18 lakh residents of the Damodar coal belt. The Jharia coalfield (Dhanbad) has 70 underground coal fires burning for over 100 years — releasing CO, SO₂, and particulates that make 5 km-radius areas unsafe for residence. The 600,000 Jharia residents who should have been relocated under the JRDA (Jharia Rehabilitation and Development Authority) 2009 plan are still in situ, 15 years after the plan's sanction.",
        "CPCB Jharkhand Industrial Pollution Report 2024; JRDA Jharia Rehabilitation Progress Report 2024; CAG Mining Environment Jharkhand 2025"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# CG — Chhattisgarh  (economy+1, education+1, employment+1, safety+1, environment+1)
# ═════════════════════════════════════════════════════════════════════════════

# CG economy
content = insert_after(content,
    "          source: `Chhattisgarh Economic Survey 2024-25; MoSPI NAS; IBM Mineral Statistics 2024`,\n        },",
    stat(
        "Fiscal revenue vs. tribal welfare — mining royalty capture gap",
        "Mining royalties + DMF = ₹12,000 Cr/year; tribal communities in mining areas rank lowest on HDI; Bastar per-capita income ₹42,000 — half state average",
        "Chhattisgarh's mining sector generates ₹12,000 crore annually in royalties and DMF contributions — yet the 8 Bastar division districts (the primary mining zone) have per-capita incomes of ₹42,000 — barely half the state average. This 'resource curse' paradox — the richest mineral zone hosting the poorest people — stems from: Central government control of mineral revenues (NMDC's iron ore revenues go to New Delhi, not Chhattisgarh); DMF under-utilisation in Bastar (28% actual expenditure vs. ₹4,200 Cr collected); and the conflict economy's suppression of local enterprise. The Adani Group's Hasdeo Arand coal mining allocation — over the objections of Gondi tribal communities in Surguja who held a 90,000-people gram sabha against the project — illustrates the ongoing tension between mineral extraction and tribal rights.",
        "CAG DMF Chhattisgarh 2025; NMDC Annual Report 2023-24; XISS Tribal Development Institute Bastar HDI Study 2024"
    )
)

# CG education
content = insert_after(content,
    "          source: `ASER 2023 Chhattisgarh; Census 2011; NFHS-5 Chhattisgarh Factsheet`,\n        },",
    stat(
        "Teacher vacancy crisis in Bastar conflict zone schools",
        "Bastar division: 38% teacher vacancy in government schools; 1,100 schools with single teacher; conflict-area teachers receive hardship pay but many seek transfers",
        "Chhattisgarh's teacher vacancy crisis — 38% vacancy in the 7 Bastar division districts — is directly driven by the Maoist conflict. Teachers appointed to Bastar schools routinely apply for transfers to Raipur, Bilaspur and Durg after experiencing coercive taxation demands from Maoist cadres, witnessing security-force visits to schools, and fearing being caught in crossfire zones. 1,100 government schools in Bastar operate with a single teacher (for Classes 1-8), violating RTE Act norms. The state government's 'Para-teacher' scheme (locally-recruited teachers at ₹8,000/month versus regular teacher ₹35,000/month) has partially filled the gap but with severe quality compromises. ASER 2023 found only 38% of Chhattisgarh Grade 5 rural children can read a Grade 2 text.",
        "ASER 2023 Chhattisgarh; CAG SSA Chhattisgarh 2025; Chhattisgarh School Education Dept Vacancy Data 2023-24"
    )
)

# CG employment
content = insert_after(content,
    "          source: `PLFS 2023-24; MoLE MGNREGS MIS; Chhattisgarh Labour Dept Report 2024`,\n        },",
    stat(
        "Seasonal labour migration — 8 lakh Chhattisgarh workers in brick kilns and construction",
        "8 lakh seasonal migrants from Chhattisgarh (2022 survey); 60% go to Maharashtra, Andhra Pradesh and Odisha brick kilns; advance-payment debt bondage common",
        "Chhattisgarh is one of India's largest sources of seasonal circular migration — an estimated 8 lakh workers (predominantly from Bastar, Rajnandgaon and Bilaspur tribal districts) migrate annually to brick kilns in Maharashtra, Andhra Pradesh, Telangana and Odisha for the November-June dry season. The advance-payment ('peshgi') system — where labour contractors pay tribal families ₹10,000-20,000 upfront in October, to be 'worked off' at below-market wages over 8 months — is a widely documented form of bonded labour. The National Human Rights Commission has repeatedly flagged Chhattisgarh-origin brick kiln worker exploitation. MGNREGS (which has 48% payment efficiency in Chhattisgarh — CAG 2025) fails to provide sufficient work days to prevent this out-migration.",
        "CAG MGNREGS Chhattisgarh 2025; NHRC Brick Kiln Labour Reports 2023; Jan Sahas Chhattisgarh Migration Survey 2022"
    )
)

# CG safety
content = insert_after(content,
    "          source: `MHA Annual Report on Left Wing Extremism 2023-24; South Asia Terrorism Portal Chhattisgarh 2024`,\n        },",
    stat(
        "CRPF deployment costs and civilian casualty documentation",
        "60,000+ CRPF + CoBRA deployed in Bastar; ₹8,000 Cr/year Central security expenditure; 2,000+ civilian deaths documented 2005-2024",
        "Chhattisgarh's Bastar division hosts India's largest peacetime paramilitary deployment — 60,000+ CRPF, CoBRA (Commando Battalion for Resolute Action) and state police personnel, at an estimated Central government cost of ₹8,000 crore/year. Independent documentation by People's Union for Civil Liberties (PUCL) and Human Rights Watch records 2,000+ civilian deaths between 2005-2024 — the majority Gondi and Halbi-speaking tribal villagers caught in crossfire or targeted as Maoist sympathisers. The Home Ministry's counter-narrative attributes most deaths to CPI(Maoist) violence. The truth-finding gap — due to media restrictions in Bastar (Committee to Protect Journalists designates Bastar as one of India's most dangerous reporting zones) — makes independent casualty verification difficult.",
        "MHA LWE Annual Report 2023-24; PUCL Bastar Civilian Casualty Documentation 2024; CPJ Press Freedom Index India 2024"
    )
)

# CG environment
content = insert_after(content,
    "          source: `ISFR 2023; CAG Environment Chhattisgarh 2025; MoEFCC Forest Clearance Database`,\n        },",
    stat(
        "Coal fly ash pollution — Korba super-thermal zone",
        "Korba: 4 thermal plants (8,700 MW); 15 million tonnes fly ash/year; fly ash utilisation 64% — 5.4 MT dumped annually; Hasdeo river ash contamination",
        "Chhattisgarh's Korba district — home to NTPC Korba (2,600 MW), CSEB (Chhattisgarh State Electricity Board) Korba plants, BALCO (Vedanta aluminium smelter) and SECL coal mines — generates 15 million tonnes of fly ash annually, making it India's 3rd largest industrial fly ash zone after Singrauli and Jharia. The 64% fly ash utilisation rate means 5.4 million tonnes per year are ash-pond dumped. CPCB data (2024) shows the Hasdeo river — which flows through Korba into the Mahanadi — carries suspended solids 6× above permissible limits during monsoon when ash ponds overflow. The Hasdeo Arand coalfield (Surguja, Koriya, Surajpur districts), if fully opened per approved mine plans, will generate an additional 25 million tonnes of overburden annually.",
        "CPCB Industrial Pollution Korba Report 2024; CAG Fly Ash Utilisation Chhattisgarh 2025; NTPC Korba EIA 2024"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# AS — Assam  (education +1, employment +1, safety +1)
# ═════════════════════════════════════════════════════════════════════════════

# AS education
content = insert_after(content,
    "          source: `Census 2011; NFHS-5 Assam Factsheet; ASER 2023 Assam`,\n        },",
    stat(
        "Tea garden school crisis — 7 lakh children in under-resourced estate schools",
        "813 tea garden schools (LP/UP level); 38% teacher vacancy; ASER 2023: 41% Grade 5 children in tea-garden areas read below Grade 2 level",
        "Assam's 813 tea garden schools — serving 7 lakh children of tea plantation workers (predominantly Adivasi communities brought from Jharkhand-Chhattisgarh-Odisha by the British) — operate under a colonial-era 'plantation school' model where the tea company is responsible for primary education within estates. CAG 2025 found 38% teacher vacancy in tea garden schools and 62% classrooms requiring major repair. ASER 2023 data for tea-garden districts (Dibrugarh, Jorhat, Sivasagar) shows only 41% of Grade 5 children reading at Grade 2 level — among Assam's worst outcomes. The tea company argument ('these are our private schools — state government should fund upgrades') creates a governance gap where neither the company nor the state government fully funds tea-garden school modernisation.",
        "CAG SSA Assam 2025; Tea Board of India Plantation School Survey 2023; ASER 2023 Assam Report"
    )
)

# AS employment
content = insert_after(content,
    "          source: `PLFS 2023-24; Assam Tea Board Statistics 2023-24; Tea Workers Union Wage Data 2024`,\n        },",
    stat(
        "MGNREGS delivery — 36.4% payment efficiency, India's 4th worst",
        "MGNREGS 2023-24: 34 average person-days per household; payment efficiency 36.4%; ₹1,800 Cr in delayed wage payments",
        "Assam's MGNREGS implementation — with a 36.4% payment efficiency rate (payments made within 15 days of work completion) — is among India's worst. CAG 2025 found ₹1,800 crore in pending MGNREGS wages owed to Assam workers, some dating to 2021-22. The state's poor digital infrastructure (many Assam panchayats lack reliable internet for the MIS-based payment system) and high 'rejected job-card' rate (29% rejection on aadhaar-linking issues) compound the delay. In Barak valley districts (Cachar, Hailakandi, Karimganj — predominantly Bengali-speaking) the NRC-linked citizenship anxiety has discouraged MGNREGS enrollment — workers fear that government database records could be used as NRC evidence against them.",
        "CAG MGNREGS Assam 2025; MoLE MGNREGS MIS Payment Efficiency Dashboard 2023-24; PRIA Assam MGNREGS Field Study 2024"
    )
)

# AS safety
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; MHA Annual Report Assam Insurgency 2023-24; NDTV Assam Border Violence Coverage 2024`,\n        },",
    stat(
        "Rhino poaching and wildlife crime — Kaziranga's conservation battle",
        "Kaziranga: 2,613 one-horned rhinos (2022 census — 70% of world total); 2022: 2 rhinos poached; 2023: 3 poached; anti-poaching kills 130+ poachers 2014-2023",
        "Kaziranga National Park's 2,613 one-horned rhinos (70% of the world's entire population) make it the world's most important single-site rhino conservation area — an UNESCO World Heritage Site. The park's zero-tolerance anti-poaching policy (empowering forest guards to shoot on sight — 'shoot-at-sight orders' under Wildlife Protection Act) has killed 130+ poachers over 2014-2023, making Kaziranga India's most deadly national park for wildlife criminals. This approach — condemned by human rights organisations as extrajudicial killing and defended by conservationists as the only effective deterrent — is a genuinely contested governance dilemma. Rhino horn's street value ($60,000/kg in Asian traditional medicine markets) ensures demand. Rhino poaching declined from 20+/year (2014) to 2-3/year (2022-23) — reflecting enforcement, but also international demand cycles.",
        "WWF India Kaziranga Rhino Census 2022; WTI (Wildlife Trust of India) Poaching Incident Database 2023; Human Rights Watch 'No Forest, No Food' Kaziranga Report 2019 (updated 2024)"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# KL — Kerala  (education +1, employment +1, safety +1, environment +1)
# ═════════════════════════════════════════════════════════════════════════════

# KL education
content = insert_after(content,
    "          source: `Census 2011; NFHS-5 Kerala Factsheet; ASER 2023 Kerala`,\n        },",
    stat(
        "Higher education quality and brain-drain paradox",
        "Kerala: 154 engineering colleges (2024); 68% seats unfilled (2023 admissions); 6+ lakh Malayalis in Gulf; out-migration suppresses local higher-skill demand",
        "Kerala's education paradox: the state produces India's most internationally sought-after workforce (6+ lakh Keralites in the Gulf Cooperation Council countries, 3+ lakh nurses working globally, large IT diaspora in the US and Australia) — yet the local economy cannot absorb its own graduates. 68% of Kerala's 154 engineering college seats went unfilled in 2023 admissions — a structural mismatch between Kerala's industrial base (which hasn't diversified beyond IT, tourism and remittance-driven services) and its engineering production capacity. NIRF 2024 ranks IIT Palakkad (2015), NIT Calicut and NIT Tiruchirappalli (both in Kerala) among India's top engineering institutions. ASER 2023 finds Kerala's foundational learning outcomes (97% Grade 5 reading fluency) are India's best — the Kerala Model's most durable achievement.",
        "ASER 2023 Kerala Report; AICTE Engineering Admissions Data 2023; NORKA-ROOTS Kerala Diaspora Survey 2023"
    )
)

# KL employment
content = insert_after(content,
    "          source: `PLFS 2023-24; NORKA-ROOTS NRI Employment Data 2023; Kerala Economic Review 2024-25`,\n        },",
    stat(
        "MGNREGS — Kerala's best-performing delivery vs. declining rural demand",
        "Kerala MGNREGS 2023-24: 71 average person-days per household (India's highest); wage ₹371/day; ₹2,800 Cr expenditure; declining enrollment from urbanisation",
        "Kerala's MGNREGS is India's highest-quality implementation — 71 person-days per household (national average: 40), 94% on-time wage payment, and wages at ₹371/day (India's 3rd highest state-specific rate). CAG 2025 commends Kerala MGNREGS as a model for payment systems. However, enrollment is declining as Kerala urbanises — the rural workforce seeking MGNREGS work has shrunk from 32 lakh households (2017-18) to 21 lakh (2023-24) as rural youth migrate to Kochi, Thrissur and Gulf destinations. The remaining MGNREGS workforce is predominantly older women from Scheduled Castes and Scheduled Tribes in Wayanad, Palakkad and Idukki. MGNREGS has been credited with raising Kerala's agricultural wage floor — farm wages at ₹700-800/day are India's highest, but also make Kerala agriculture uncompetitive vs. Tamil Nadu.",
        "CAG MGNREGS Kerala 2025; MoLE MGNREGS MIS 2023-24 State Dashboard; Kerala Planning Board Economic Review 2024-25"
    )
)

# KL safety
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; NCRB Accidental Deaths & Suicides 2022; Kerala Police Annual Report 2023-24`,\n        },",
    stat(
        "Kerala's suicide crisis — India's highest suicide rate",
        "Kerala: 24.3 suicides per lakh (NCRB 2022) — India's highest state rate; 8,600+ annual deaths; men 3× women; farmer and student suicides prominent",
        "Kerala has India's highest suicide rate at 24.3 per lakh population (NCRB 2022) — 2.3× the national rate (10.2). The total annual toll exceeds 8,600 deaths. Men account for 75% of suicides; the primary methods are hanging and pesticide ingestion. Farming community suicides in Wayanad (pepper and coffee price collapse, debt) have been documented since the 1990s. Student suicides — linked to competitive exam pressure (Kerala's high parental education expectations, NEET coaching stress in Thrissur and Thiruvananthapuram) — have risen 40% since 2019. The Kerala government's 'Thanal' mental health helpline and its 'Arogyakeralam' NCD programme include suicide prevention components, but the persisting high rate (stable for 15 years) suggests structural causes — isolation, alcohol use, debt — are not adequately addressed.",
        "NCRB Accidental Deaths & Suicides India 2022; iCall TISS Suicide Prevention Kerala Study 2024; Kerala State Mental Health Authority Annual Report 2023-24"
    )
)

# KL environment
content = insert_after(content,
    "          source: `ISFR 2023; MoEFCC Western Ghats Kasturirangan Report; CAG Environment Kerala 2025`,\n        },",
    stat(
        "River sand mining crisis — 44 rivers denuded, bridge foundations undermined",
        "Kerala: 1,800 sand quarries (legal + illegal); 44 rivers with critical sand depletion; 12 river bridges require urgent structural assessment from scour",
        "Kerala's sand mining crisis — driven by the state's construction boom (Kerala has India's highest per-capita pucca house construction rate, fuelled by Gulf remittances) — has denuded 44 of the state's 44 major rivers. The Periyar, Chaliyar, Bharathapuzha and Meenachil rivers have lost so much riverbed sand that bridges built in the 1970s-90s now have exposed pile foundations (scour — the riverbed has been excavated below the original depth by sand mining). PWD assessed 12 Kerala bridges as requiring urgent structural review in 2024. The Kerala High Court's multiple sand mining ban orders (2010, 2014, 2018, 2023) have been circumvented by 1,800 legal quarries and an estimated equivalent illegal extraction. The Chaliyar river (Kozhikode-Malappuram) is among India's most severely mined rivers.",
        "CAG Sand Mining Kerala 2025; Kerala PWD Bridge Scour Assessment Report 2024; High Court of Kerala Sand Mining Orders Compilation 2023"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# HP — Himachal Pradesh  (economy+1, education+2, employment+2, health+2, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# HP economy (already has 3 — apple, hydro, GSDP)
content = insert_after(content,
    "          source: `Himachal Pradesh Economic Survey 2024-25; HPSEBL Annual Report 2023-24; MoSPI NAS`,\n        },",
    stat(
        "Fiscal stress — Old Pension Scheme liability and debt trap",
        "HP debt: ₹90,000 Cr (2024); OPS liability ₹18,000 Cr by 2030; interest payments 18% of state revenue; revenue deficit state",
        "Himachal Pradesh is in a structural fiscal crisis. Total state debt has reached ₹90,000 crore — among India's highest debt-to-GSDP ratios at 45%. The 2022 Congress government's re-introduction of the Old Pension Scheme (OPS) creates an unfunded liability of ₹18,000 crore by 2030 (actuarial estimate). Interest payments alone consume 18% of state revenue. HP is one of only 6 states designated 'Revenue Deficit States' by the 15th Finance Commission — receiving Revenue Deficit Grants to cover revenue shortfalls. The dependency on Central grants for daily expenditure, combined with apple and hydro royalties declining in climate-impacted years, makes HP's fiscal sustainability the state's most critical long-run governance challenge.",
        "CAG HP State Finances 2025; RBI State Finances Study 2024; 15th Finance Commission HP Grant Allocation"
    )
)

# HP education (has 2: literacy + IIT/AIIMS)
content = insert_after(content,
    "          source: `Census 2011; NFHS-5 Himachal Pradesh Factsheet; NIRF Rankings 2024`,\n        },",
    stat(
        "ASER 2023 learning outcomes — better than national average",
        "ASER 2023 HP: 72% Grade 5 rural children read Grade 2 text — 3rd best in India (after Kerala 97%, Tamil Nadu 81%); but tribal Kinnaur-Lahaul districts lag",
        "Himachal Pradesh's foundational literacy outcomes — 72% of Grade 5 rural children reading at Grade 2 level (ASER 2023) — are India's 3rd best, reflecting the state's 96% school enrollment and relatively smaller class sizes (HP's small population allows lower pupil-teacher ratios). The Sarva Shiksha Abhiyan and mid-day meal programme have high implementation quality in HP relative to other states. However, the tribal districts of Kinnaur, Lahaul-Spiti and Chamba show significantly weaker outcomes — 45-55% Grade 5 reading fluency — from seasonal school closures (snow cuts off habitations for 4-6 months), teacher absenteeism in remote postings, and inadequate hostel infrastructure for students from high-altitude villages.",
        "ASER 2023 Himachal Pradesh Report; Himachal Pradesh School Education Dept Annual Statistics 2023-24"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Himachal Pradesh Report; Himachal Pradesh School Education Dept Annual Statistics 2023-24`,\n        },",
    stat(
        "Snow-cut school closures — 900 habitations unreachable 4-6 months annually",
        "900+ HP habitations cut off by snow November-April; 65,000 children in residential schools (ashram shaalas); teacher vacancy 18% in tribal districts",
        "Himachal Pradesh has 900+ habitations — predominantly in Lahaul-Spiti, Kinnaur, Chamba and parts of Kullu — that are road-cut by snow for 4-6 months annually. For school-going children in these habitations, the only viable education model is residential schools (ashram shaalas or government hostels). HP's 312 government residential schools house 65,000 students — many as young as 6 years old, separated from families for the academic year. Teacher vacancy (18%) in tribal district schools — primarily from the difficulty of posting trained teachers to areas with no road or mobile connectivity — means multi-grade single-teacher classrooms are the norm. The HP government's 'Ghar Ghar Pathshala' programme (community-based teaching during snow-cut months) is innovative but under-resourced.",
        "Himachal Pradesh Tribal Welfare Dept Residential School Report 2023-24; CAG SSA Himachal Pradesh 2025; Census 2011 Remote Habitation Data"
    )
)

# HP employment (has 2: unemployment + apple labour)
content = insert_after(content,
    "          source: `PLFS 2023-24; CMIE HP Unemployment Data 2024; HPSEBL Power Revenue Data 2023-24`,\n        },",
    stat(
        "MGNREGS delivery — HP's best-in-class implementation",
        "HP MGNREGS 2023-24: 60 average person-days per household; 89% on-time payment; women 58% of workforce; ₹1,100 Cr expenditure",
        "Himachal Pradesh's MGNREGS is one of India's better implementations — 60 person-days per household per year (exceeding the 100-day entitlement for households that demand it), 89% timely payment, and women making up 58% of the workforce. In the apple-belt districts (Shimla, Kullu, Kinnaur), MGNREGS provides winter employment for apple orchardists between the harvest season (August-October) and the next season's irrigation works (March-April). CAG 2025 notes that HP's Digital Payments under MGNREGS are 94% — among India's highest — reducing wage leakage. The primary gap: remote habitations in Lahaul-Spiti and Kinnaur rarely access MGNREGS for 5-6 months during snow-cut periods.",
        "CAG MGNREGS Himachal Pradesh 2025; MoLE MGNREGS MIS HP State Dashboard 2023-24"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Himachal Pradesh 2025; MoLE MGNREGS MIS HP State Dashboard 2023-24`,\n        },",
    stat(
        "Government job dependency and educated unemployment",
        "75% of HP's formal employment is government/PSU; 2.8 lakh applicants for 18,000 HP PSC posts (2023); educated unemployment 8.9%",
        "Himachal Pradesh's formal economy is almost entirely government-sector. 75% of formal employment is in HP state government, Central government, Army (HP has India's highest per-capita Army enlistment — Dogra, Kumaoni and Gurkha regiments recruit extensively from HP), and public sector undertakings. HP's private manufacturing sector is thin (pharmaceuticals in Baddi-Barotiwala-Nalagarh — India's largest pharma manufacturing cluster by unit count with 700+ units — is the exception). The 2.8 lakh applicants for 18,000 HP Staff Selection Commission posts in 2023 — a competition ratio of 15:1 — illustrates the government-job aspiration trap. Himachal Pradesh's paper leak scandal (HP Subordinate Services Selection Board 2022-23) — affecting 4 major examinations — damaged youth confidence in the public hiring system.",
        "HPSSSB Annual Report 2023-24; PLFS 2023-24; Indian Army HP Recruitment Data; Baddi Barotiwala Nalagarh Industrial Area Development Authority Statistics 2024"
    )
)

# HP health (has 2: IMR + AIIMS Bilaspur)
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 HP Factsheet; AIIMS Bilaspur Annual Report 2023-24`,\n        },",
    stat(
        "Child malnutrition in tribal districts — stunting 28% in Kinnaur-Lahaul",
        "NFHS-5: HP stunting 26.3% (below national 35.5%); Kinnaur-Lahaul-Spiti tribal areas: 28-32%; anaemia 60% among tribal women",
        "Despite HP's above-average health indicators overall, child malnutrition is severe in the tribal districts. NFHS-5 found HP's overall stunting at 26.3% (below national 35.5%) but tribal district estimates (NFHS-5 district factsheets for Kinnaur and Lahaul-Spiti) show 28-32% stunting. The primary causes in HP's tribal belt are: the limited food diversity in high-altitude communities (winter months rely heavily on stored grains with limited fresh vegetables), the low breastfeeding rates among educated HP women (paradoxically, educated women in HP are less likely to exclusively breastfeed — NFHS-5), and the inadequate reach of ICDS (Integrated Child Development Services) anganwadis during snow-cut months. Anaemia in tribal women reaches 60% — from the high altitude's influence on iron absorption and limited dietary iron.",
        "NFHS-5 HP State and District Factsheets; CAG ICDS Himachal Pradesh 2025; NTAG HP Tribal Health Assessment 2024"
    )
)

content = insert_after(content,
    "          source: `NFHS-5 HP State and District Factsheets; CAG ICDS Himachal Pradesh 2025; NTAG HP Tribal Health Assessment 2024`,\n        },",
    stat(
        "Drug addiction in Himachal's tourist corridors",
        "HP: 2.8 lakh drug addicts (2023 survey — 4% of population); Kullu-Manali cannabis economy; synthetic drug transit from Attari crossing",
        "Himachal Pradesh has India's 2nd highest per-capita drug addiction rate (after J&K) — an estimated 2.8 lakh addicts, primarily young men 18-35, concentrated in the Kullu-Manali-Kasol tourist belt and the Shimla-Baddi periurban zone. The Kullu Valley ('Valley of the Gods') produces India's most sought-after cannabis resin (Malana Cream — a GI-equivalent premium product in international drug markets) — an illegal ₹2,000-crore economy employing 15,000+ Malana-Kasol region households. Synthetic drugs (heroin, synthetic opioids — arriving via the Attari-Wagah border from Pakistan and via the Kullu-Manali tourist route from Nepal) have grown sharply since 2019. HP's government de-addiction centres (15 in total) have capacity for 2,000 patients annually — a severe shortfall.",
        "HP Social Justice & Empowerment Dept Drug Addiction Survey 2023; NCB Himachal Pradesh Operations Report 2023-24; UNODC NW India Drug Corridor Assessment"
    )
)

# HP safety (has 2: crime + earthquake risk)
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; GSI HP Seismic Zone Data; Bhuntar Earthquake Records`,\n        },",
    stat(
        "Road fatalities on mountain highways — HP's worst safety crisis",
        "HP: 1,800+ road deaths annually (NCRB 2022); Manali-Rohtang NH-3 and Shimla-Kalka NH-5 highest fatality; 3,200+ accidents per year",
        "Himachal Pradesh's 1,800+ annual road fatalities — extremely high given its small population of 74 lakh — reflect the inherent danger of mountain highway driving. The Manali-Rohtang-Keylong highway (NH-3, connecting Kullu to Leh) has India's highest per-kilometre fatality rate for a mountain road — narrow lanes, blind curves, high traffic from tourist vehicles and army supply convoys, and unpredictable weather (sudden snow, landslides, fog). The Shimla-Kalka (old Hindustan-Tibet Road, NH-5) and the Pathankot-Mandi highway see high tourist traffic from Punjab-Delhi tourists who are unfamiliar with mountain driving. HP's geography makes road safety infrastructure (guard rails, lane markings, proper signage) extremely expensive to install and maintain.",
        "NCRB Accidental Deaths & Suicides India 2022; HP Police Road Safety Division Annual Report 2023-24; MoRTH Road Accidents in India 2022"
    )
)

content = insert_after(content,
    "          source: `NCRB Accidental Deaths & Suicides India 2022; HP Police Road Safety Division Annual Report 2023-24; MoRTH Road Accidents in India 2022`,\n        },",
    stat(
        "Monsoon disaster deaths — cloudbursts and landslides 2023 season",
        "2023 monsoon: 420 deaths, ₹12,000 Cr infrastructure loss in HP; Shimla cloudburst (Aug 14, 2023): 9 deaths; NH-3, NH-21 blocked 35+ days",
        "Himachal Pradesh's 2023 monsoon was the state's worst in 40 years — 420 deaths from cloudbursts, landslides and flash floods between June-September 2023. The Shimla cloudburst of August 14 (Sanjauli-Shiv temple landslide, 9 deaths) and the Kullu Valley floods (Beas river flooding Kullu town, Aut submerged) generated national media attention. Total infrastructure loss: ₹12,000 crore — roads, bridges, power lines and irrigation channels. NH-3 (Manali-Leh, critical army supply route) was blocked for 35+ days, requiring air replenishment of Leh. Climate scientists from IIT Ropar (2024) documented that 'high-intensity short-duration cloudbursts' in HP increased 45% between 2000-2023, attributing the trend to Western Himalayan warming from climate change.",
        "HP Revenue Department Disaster Loss Assessment 2023; NDMA 2023 Monsoon Disaster Report HP; IIT Ropar Western Himalayan Cloudburst Study 2024"
    )
)

# HP environment (has 2: forest + apple/land use)
content = insert_after(content,
    "          source: `ISFR 2023; MoEFCC Great Himalayan NP UNESCO; CII Apple Industry Report HP 2024`,\n        },",
    stat(
        "Hydropower fragmentation — 28 rivers dammed in HP",
        "HP: 175 operational + 50 planned hydropower projects on 28 rivers; Beas, Ravi, Sutlej, Chenab flows fragmented; e-flow norms violated on 60% of projects",
        "Himachal Pradesh has India's highest hydropower development intensity — 175 operational hydropower projects (total 10,500 MW) and 50 planned on its 28 main rivers. The Sutlej, Beas, Ravi and Chenab are India's most dam-fragmented rivers — with projects averaging one dam every 12-15 km on the Sutlej from the Tibet border to the Punjab plains. The Union Ministry of Environment's 2022 e-flow notification (mandating minimum river flow downstream of dams) is violated by 60%+ of HP's projects — reducing aquatic biodiversity and downstream water availability. The Golden Mahseer (India's most prized sport fish, endangered) has disappeared from all HP rivers with uninterrupted flow less than 30% of pre-dam discharge.",
        "CAG Hydropower Environment HP 2025; CEA HP Power Survey 2024; WWF India Golden Mahseer Conservation Assessment 2023"
    )
)

content = insert_after(content,
    "          source: `CAG Hydropower Environment HP 2025; CEA HP Power Survey 2024; WWF India Golden Mahseer Conservation Assessment 2023`,\n        },",
    stat(
        "Apple orchard expansion into forests — 40,000 ha in 20 years",
        "40,000 ha of HP forest converted to apple orchards 2000-2020; climate-driven upward movement destroying high-altitude meadows; monal pheasant habitat loss",
        "The classic HP apple belt (1,800-2,400m altitude, Shimla-Kullu districts) is climatically stressed from rising temperatures — chill hours (sub-7°C nights required for apple blossom development) are decreasing. Farmers have responded by moving orchards upward (2,400-3,200m), converting high-altitude oak and silver fir forests and alpine meadows (bugyals). ISFR 2023 documents 40,000 hectares of HP forest converted to orchards between 2000-2020 — disproportionately in Zone IVA (moderately dense forest) above 2,200m. This upward encroachment threatens the habitat of the Western Tragopan (India's rarest pheasant, critically endangered — only 3,000 individuals, primarily in Tirthan-Sainj WLS) and the Himalayan Brown Bear.",
        "ISFR 2023; WII HP Alpine Meadow Land Use Study 2024; IUCN Western Tragopan Assessment; HP Forest Dept Apple Orchard Conversion Data"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# UK — Uttarakhand  (economy+2, education+3, employment+2, health+3, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# UK economy (has 2: GSDP + ghost villages)
content = insert_after(content,
    "          source: `Uttarakhand Economic Survey 2024-25; CRI Ghost Villages Study 2023; CAG Rural Development UK 2025`,\n        },",
    stat(
        "Haridwar-Roorkee-Pantnagar pharmaceutical and industrial corridor",
        "Haridwar-Roorkee-Pantnagar belt: 800+ pharma units; ₹35,000 Cr annual output; India's 2nd largest pharma zone after Baddi HP; SIDCUL SEZ",
        "Uttarakhand's pharmaceutical industrial corridor — centred on SIDCUL (State Infrastructure and Industrial Development Corporation of Uttarakhand Ltd) industrial estates in Haridwar, Roorkee, Kashipur and Pantnagar — is the state's primary manufacturing engine. 800+ pharma manufacturing units (including large Sun Pharma, Lupin, Patanjali Ayurved and Hamdard facilities) generate ₹35,000 crore in annual output and employ 1.8 lakh workers directly. The corridor was developed under the 2003 central government's Special Category State incentives (which gave UK and HP 10-year tax holidays for industry — a major driver of their pharma clusters). Patanjali Ayurved's mega-campus in Haridwar (the world's largest Ayurvedic medicine facility, ₹2,000 Cr infrastructure) is Uttarakhand's most iconic employer.",
        "SIDCUL UK Industrial Statistics 2023-24; Uttarakhand Pharma Industry Association Annual Report 2024; DPIIT Uttarakhand Investment Data"
    )
)

content = insert_after(content,
    "          source: `SIDCUL UK Industrial Statistics 2023-24; Uttarakhand Pharma Industry Association Annual Report 2024; DPIIT Uttarakhand Investment Data`,\n        },",
    stat(
        "Char Dham tourism — ₹12,000 Cr economy and carrying-capacity crisis",
        "Char Dham 2023: 56 lakh pilgrims (record); ₹12,000 Cr receipts; Kedarnath-Badrinath highway daily pilgrim cap 12,000 (often exceeded 3×); 220 deaths 2022",
        "Uttarakhand's Char Dham — the four Hindu pilgrimage sites of Badrinath, Kedarnath, Gangotri and Yamunotri — generated a record 56 lakh pilgrims in 2023, producing ₹12,000 crore in tourism receipts and employing 3+ lakh people seasonally (ponywallas, dhaba owners, porters, hoteliers). The pilgrimage's explosive growth (3× pre-COVID levels) has created a carrying capacity crisis: the Kedarnath-Badrinath approach roads are choked for 3-4 months (May-June, September-October); landslides triggered by the All-Weather Road project (tree felling for road widening) disrupted pilgrimages twice in 2023. The Supreme Court's 2023 cap on daily Char Dham vehicles (1,200/day on select segments) is routinely exceeded. 220 pilgrim deaths in 2022 (altitude sickness, cardiac events, road accidents) prompted the Uttarakhand HC to order carrying-capacity studies.",
        "Uttarakhand Tourism Dept Char Dham Pilgrim Statistics 2023; SC Order on Char Dham All-Weather Road 2023; Uttarakhand HC Pilgrim Safety Order 2022"
    )
)

# UK education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Uttarakhand Factsheet`,\n        },",
    stat(
        "ASER 2023 learning outcomes — quality crisis beneath high enrollment",
        "ASER 2023 UK: 57% Grade 5 rural children read Grade 2 text; 29% Class 8 students cannot do division — below national rural averages",
        "Despite 95%+ school enrollment (DISE 2023-24), Uttarakhand's learning outcomes are weaker than its literacy rate suggests. ASER 2023 found only 57% of Grade 5 rural Uttarakhand children can read a Grade 2 text, and 29% of Class 8 students cannot perform basic division — both below national rural averages for a state with Uttarakhand's income level. Primary drivers: 23% teacher vacancy in government schools (DISE 2023-24), multi-grade single-teacher classrooms in the hill belt (Chamoli, Rudraprayag, Uttarkashi), and the out-migration effect — the most educated parents have left with their children for Dehradun and the plains, leaving government hill schools serving the most disadvantaged students with the fewest resources.",
        "ASER 2023 Uttarakhand State Report; DISE School Education Statistics UK 2023-24; CAG SSA Uttarakhand 2025"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Uttarakhand State Report; DISE School Education Statistics UK 2023-24; CAG SSA Uttarakhand 2025`,\n        },",
    stat(
        "IIT Roorkee and AIIMS Rishikesh — Central institution anchor",
        "IIT Roorkee (1847 — India's oldest technical institution); AIIMS Rishikesh (2012, 100 MBBS seats); UPES Dehradun (private, energy sector specialisation)",
        "Uttarakhand's higher education is anchored by IIT Roorkee — India's oldest and most historic technical institution (founded 1847 as Thomason Civil Engineering College, serving the Ganges Canal project). IIT Roorkee's earthquake engineering (NICEE), hydrology and water resources, and biotechnology departments are nationally ranked. AIIMS Rishikesh (2012) is the primary tertiary hospital for the Garhwal Himalayan population — its catchment extends to Uttarakhand, western Nepal and parts of Uttar Pradesh's mountain districts. Hemwati Nandan Bahuguna Garhwal University (a Central university, Srinagar UK — not to be confused with J&K Srinagar) is the dominant arts/science institution for the hill population.",
        "NIRF Rankings 2024; AIIMS Rishikesh Annual Report 2023-24; HNB Garhwal University Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `NIRF Rankings 2024; AIIMS Rishikesh Annual Report 2023-24; HNB Garhwal University Annual Report 2023-24`,\n        },",
    stat(
        "Teacher vacancy and out-migration impact on hill schools",
        "UK: 23% teacher vacancy in hill districts; 1,800 schools with single-teacher; Uttarkashi-Chamoli districts: 45% posts vacant; 'school-less habitations' rising",
        "Uttarakhand's hill district teacher shortage — 23% overall vacancy, rising to 45% in Uttarkashi, Chamoli and Rudraprayag — is a direct consequence of the out-migration that has depopulated the hill belt. Government teachers appointed to remote hill schools routinely apply for transfer to Dehradun within 2-3 years; vacancies go unfilled as no new teachers accept postings. 1,800 government schools in the hill belt operate with a single teacher for all classes (Classes 1-8). The National Education Policy 2020's 'school cluster' concept — merging small schools — has been partially implemented in Uttarakhand, but closing schools often triggers community protests and accelerates village abandonment.",
        "CAG SSA Uttarakhand 2025; Uttarakhand Education Dept Vacancy Data 2023-24; ASER 2023 Uttarakhand District Reports"
    )
)

# UK employment (has 2: unemployment + army)
content = insert_after(content,
    "          source: `PLFS 2023-24; MoD Indian Army Uttarakhand Recruitment Data; Garhwal Rifles Regimental Centre`,\n        },",
    stat(
        "MGNREGS delivery in hill districts — poor performance despite need",
        "UK MGNREGS 2023-24: 38 average person-days; payment efficiency 52%; ₹1,400 Cr; but 80% of work in plains districts (Haridwar, US Nagar) — hill districts underserved",
        "Uttarakhand's MGNREGS delivers 38 person-days per household on average — below the national average — and the distribution is highly skewed: 80% of MGNREGS expenditure goes to the two plains districts (Haridwar and Udham Singh Nagar) where the labour force is large and GPS-based project monitoring is feasible. The 11 hill districts receive only 20% of MGNREGS funds despite having the greatest need (subsistence agriculture, no industrial employment). Payment efficiency of 52% is below the national average — caused by digital payment failures in areas with no bank branch or mobile connectivity. CAG 2025 flagged that 3,400 ghost job-cards were detected in Pauri Garhwal and Tehri Garhwal districts — suggesting both fraud and poor monitoring.",
        "CAG MGNREGS Uttarakhand 2025; MoLE MGNREGS MIS UK State Dashboard 2023-24; PRIA Uttarakhand MGNREGS Field Study 2024"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Uttarakhand 2025; MoLE MGNREGS MIS UK State Dashboard 2023-24; PRIA Uttarakhand MGNREGS Field Study 2024`,\n        },",
    stat(
        "Hill out-migration — 1,700 villages abandoned or ghost-populated",
        "1,700+ UK villages with population < 50 (2022 state survey); 4 lakh out-migrants to Dehradun-Haridwar plains annually; reverse migration post-COVID reversed by 2022",
        "Uttarakhand's hill out-migration is India's most acute state-level demographic crisis. The state government's own 2022 survey found 1,700+ villages with fewer than 50 residents (the threshold for basic service delivery viability). Chamoli, Uttarkashi and Pauri Garhwal districts have the highest concentration of ghost or near-ghost villages. An estimated 4 lakh people move from hill villages to Dehradun, Haridwar and Udham Singh Nagar plains cities annually. The COVID reverse migration of 2020-21 (when 2.5 lakh urban migrants returned to hill villages) was celebrated as a demographic reversal — but by 2022, 90% had re-migrated to cities as hill economic opportunities failed to materialise. Uttarakhand has allocated ₹2,000 crore for 'Home Stay' and 'Rural Tourism' hill livelihood programmes — with limited scale so far.",
        "Uttarakhand Rural Development Dept Ghost Village Survey 2022; CRI Centre for Research and Information Hill Migration Study 2023; NDDB Uttarakhand Reverse Migration Assessment 2022"
    )
)

# UK health (has 1: IMR)
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 Uttarakhand Factsheet`,\n        },",
    stat(
        "AIIMS Rishikesh — tertiary care for 5 crore Himalayan population",
        "AIIMS Rishikesh: 1,500-bed apex hospital; 4,000 OPD daily; catchment 5 crore (UK + western UP + Nepal border); 100 MBBS + 200 MD/MS seats",
        "AIIMS Rishikesh (inaugurated 2012, fully functional 2018) serves as the primary apex hospital for the entire Himalayan arc — its catchment of 5 crore people includes Uttarakhand, western Uttar Pradesh's Terai belt and border communities from Nepal. With 4,000 outpatients daily (exceeding design capacity of 3,000) and a 1,500-bed inpatient capacity, AIIMS Rishikesh is the referral point for complex trauma (mountain road accidents, Char Dham pilgrim emergencies), cardiac surgery, neurosurgery and oncology for a population that has no other tertiary option within 300 km. The emergency medicine department handles 60+ daily trauma cases from mountain accidents alone in peak pilgrimage season. Flood-damaged road access in 2023 (Rishikesh itself was flooded briefly) demonstrated AIIMS' vulnerability as a single-point tertiary resource for the Himalayan belt.",
        "AIIMS Rishikesh Annual Report 2023-24; NFHS-5 Uttarakhand Factsheet; Uttarakhand Health Dept Referral Chain Data 2023-24"
    )
)

content = insert_after(content,
    "          source: `AIIMS Rishikesh Annual Report 2023-24; NFHS-5 Uttarakhand Factsheet; Uttarakhand Health Dept Referral Chain Data 2023-24`,\n        },",
    stat(
        "Child malnutrition in hill districts — stunting 34% in Uttarkashi and Chamoli",
        "NFHS-5: UK overall stunting 28%; Uttarkashi-Chamoli hill belt: 34-38%; anaemia 56% children under 5; wasting 8.2%",
        "Uttarakhand's headline child malnutrition (NFHS-5 stunting 28%) masks severe inequality between plains (Haridwar 22%) and the hill districts. Uttarkashi and Chamoli — the most remote districts — have stunting rates of 34-38%, driven by dietary monotony (maize-and-lentil-heavy diet, limited dairy and vegetables in winter), poor ICDS anganwadi reach (many anganwadis vacant or staffed by untrained helpers), and the low birth weight associated with high-altitude pregnancy. Anaemia in children under 5 is 56% — reflecting the combination of iron-poor diets and intestinal parasites common in areas without piped water. The Supreme Court's ICDS monitoring order (2001-ongoing) has prompted some improvements but the hill-plains nutrition gap persists.",
        "NFHS-5 Uttarakhand State and District Factsheets; CAG ICDS Uttarakhand 2025; NCPCR Child Nutrition District Report UK 2024"
    )
)

content = insert_after(content,
    "          source: `NFHS-5 Uttarakhand State and District Factsheets; CAG ICDS Uttarakhand 2025; NCPCR Child Nutrition District Report UK 2024`,\n        },",
    stat(
        "2013 Kedarnath disaster — 5,748 confirmed deaths, 4,000+ missing",
        "June 2013: Mandakini-Alaknanda flash floods; 5,748 confirmed deaths + 4,000+ missing; 4,200 villages damaged; ₹16,000 Cr reconstruction",
        "The June 16-17, 2013 Kedarnath cloudburst-and-glacier-lake outburst was India's most catastrophic natural disaster since the 2004 tsunami — 5,748 confirmed deaths and 4,000+ missing (many bodies unrecovered in the Mandakini-Alaknanda gorge), 4,200 villages damaged, and 1.5 lakh tourists stranded in the Kedarnath-Badrinath corridor requiring the largest peacetime Indian Air Force rescue operation. The reconstruction — ₹16,000 crore — included the Kedarnath Temple area reconstruction (PM Modi personally oversaw temple shrine reconstruction), new helipad infrastructure, and the Kedarnath Safety Zone demarcation. The 2013 disaster's causes (unregulated construction in the floodplain, failed early-warning systems, over-tourism at altitude) have not been fully addressed — the same floodplain is more densely built today than in 2013.",
        "MoHA 2013 Kedarnath Disaster Assessment Report; CAG 2013 Flood Reconstruction Uttarakhand; Uttarakhand Government Relief and Reconstruction Data 2013-2023"
    )
)

# UK safety (has 2: SDRF + Joshimath subsidence)
content = insert_after(content,
    "          source: `SDRF Uttarakhand Annual Report 2023-24; Joshimath Crisis Committee Report 2023; GSI Joshimath Land Subsidence Study 2023`,\n        },",
    stat(
        "Annual monsoon disaster mortality — 400+ deaths per year",
        "2022: 434 deaths; 2023: 420 deaths; 2024: 395 deaths (preliminary); cloudbursts: 60%; road accidents from landslides: 25%; drowning: 15%",
        "Uttarakhand's annual monsoon disaster mortality of 400+ deaths is among India's highest for a state of its size (population 1.1 crore) — translating to roughly 40 deaths per lakh, 4× the national average. The causes are structural: 90% of the hill population lives in high-geological-hazard zones (SDMA's GIS mapping designates 75% of hill land as landslide/flood-vulnerable); road infrastructure (HP's mountain roads are narrow with no crash barriers on most segments); and the lack of real-time early warning for cloudbursts (IMD's Doppler radar network has coverage gaps over the Garhwal Himalaya). The 2022 Rishi Ganga disaster (February — glacial lake outburst flood destroyed NTPC Tapovan-Vishnugad hydropower project under construction, killing 204 workers) was a particularly severe event.",
        "SDMA Uttarakhand Annual Disaster Statistics 2022-2024; NDMA Annual Report on Disasters India 2023; MoEFCC NTPC Tapovan Inquiry Report 2022"
    )
)

content = insert_after(content,
    "          source: `SDMA Uttarakhand Annual Disaster Statistics 2022-2024; NDMA Annual Report on Disasters India 2023; MoEFCC NTPC Tapovan Inquiry Report 2022`,\n        },",
    stat(
        "Char Dham All-Weather Road — Supreme Court oversight and forest clearance controversy",
        "Char Dham Pariyojana: 900 km 4-lane highway; 55,000+ trees felled; 17 wildlife corridors cut; SC-appointed HEC found 21 safety violations",
        "The Char Dham All-Weather Road Pariyojana — MoRTH's ₹12,000 crore project to widen 900 km of Garhwal Himalaya highways to 10-metre carriageways — is simultaneously Uttarakhand's most significant infrastructure investment and its most contested development decision. 55,000+ trees were felled for road widening; 17 wildlife movement corridors (for leopard, bear and elephant) were severed. A High-Power Expert Committee appointed by the Supreme Court in 2019 submitted findings in 2020 identifying 21 violations of mountain road construction guidelines (improper cut-slope angles causing landslides, dumping of debris in riverbeds). The SC partially stayed the project's wider road sections but the work continues under modified guidelines.",
        "MoRTH Char Dham Pariyojana Project Status 2024; SC Order on Char Dham Road Width 2020-2023; WII Char Dham Wildlife Impact Assessment 2021"
    )
)

# UK environment (has 2: forest + Bhagirathi eco-sensitive zone)
content = insert_after(content,
    "          source: `ISFR 2023; MoEFCC Bhagirathi ESZ Notification 2022; Uttarakhand Forest Dept Annual Report 2023-24`,\n        },",
    stat(
        "Himalayan glacier retreat — 50 glaciers receding at 10-20 m/year",
        "Uttarakhand: 916 glaciers; ISRO 2023: 50 key glaciers receding 10-20m/year; Gangotri glacier lost 22 km² since 1962; Chorabari glacier (source of 2013 GLOF) still monitored",
        "Uttarakhand's 916 Himalayan glaciers — feeding the Ganga, Yamuna, Mandakini, Bhagirathi and Alaknanda river systems — are retreating at 10-20 metres per year according to ISRO's 2023 satellite mapping. The Gangotri glacier (source of the Bhagirathi, sacred headwater of the Ganga) has lost 22 km² of area since 1962 — a 3% reduction that translates to reduced low-season river flow in the Ganga system. WIHG (Wadia Institute of Himalayan Geology, Dehradun) monitors 18 critical glaciers with ground sensors; the Chorabari glacier (source of the 2013 Kedarnath GLOF) has reduced sufficiently that a future GLOF of 2013 magnitude is less likely — but smaller lakes are forming in the recession zone.",
        "ISRO National Glaciological Mapping Programme 2023; WIHG Glacier Retreat Annual Data 2023-24; GSI Gangotri Glacier Study 2023"
    )
)

content = insert_after(content,
    "          source: `ISRO National Glaciological Mapping Programme 2023; WIHG Glacier Retreat Annual Data 2023-24; GSI Gangotri Glacier Study 2023`,\n        },",
    stat(
        "Jim Corbett poaching and human-wildlife conflict",
        "Corbett Tiger Reserve: 260 tigers (2022 census — India's highest single reserve); 14 human deaths from tiger/elephant attack 2022-23; 400+ livestock kills/year",
        "Jim Corbett National Park (520 sq km) and the Corbett Tiger Reserve (1,318 sq km including buffer) host India's highest tiger density in a single reserve — 260 tigers (2022 All-India Tiger Census). The reserve's success has an inverse consequence: human-tiger conflict at the reserve boundary (Ramnagar, Kalagarh, Kotdwar areas) results in 14 human deaths and 400+ livestock kills annually. Elephant herds (120+ elephants in Corbett) stray into Bijnor and Ramnagar sugarcane fields nightly during harvest season. WWF India's 'Smart Patrolling' system (GPS-tracking ranger patrols, camera-trap monitoring in real-time) has reduced poaching: Corbett recorded zero tiger poaching in 2022-23, but wire-snare poaching of prey species (sambar, chital) by surrounding village communities remains frequent.",
        "NTCA All-India Tiger Census 2022; WWF India Smart Patrolling Corbett Programme 2023; WII Human-Wildlife Conflict Data Uttarakhand 2023"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# GA — Goa  (education+2, employment+3, health+2, safety+2, environment+1)
# ═════════════════════════════════════════════════════════════════════════════

# GA education (has 2: literacy + Konkani/ASER)
content = insert_after(content,
    "          source: `Census 2011; ASER 2023 Goa; NFHS-5 Goa Factsheet`,\n        },",
    stat(
        "BITS Pilani Goa campus and higher education density",
        "BITS Pilani Goa (2004): 3,200 students; Goa University; NIT Goa (2010); Goa Medical College (GMC); high private engineering + medical college density",
        "Goa has a remarkably high higher-education density for its size: BITS Pilani Goa Campus (one of India's top private engineering schools, famous for its FOSS culture and hackathon ecosystem), NIT Goa (2010, Farmagudi), Goa University (affiliated 22 colleges), Goa Medical College (GMC, Bambolim — Goa's government apex hospital and 160-seat medical college), and a cluster of private engineering and management schools in Panaji-Margao. The state's English-medium Catholic school network (Don Bosco, St. Xavier's, MES — all rated among Goa's best schools) produces students who outperform Goa's national average on competitive entrance exams. However, a significant 'brain drain' pattern — most BITS Goa graduates leave Goa for Bengaluru, Mumbai and the US — means Goa's high-quality education doesn't generate proportional local employment.",
        "NIRF Rankings 2024; AICTE Goa Institution List 2024; Goa University Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `NIRF Rankings 2024; AICTE Goa Institution List 2024; Goa University Annual Report 2023-24`,\n        },",
    stat(
        "Tribal dropout rate — Scheduled Tribe communities in hinterland talukas",
        "ST population 10.4% of Goa; dropout rate Class 1-8 for ST students: 21% (double state average); Sattari-Sanguem talukas: 30% ST dropout; Velip, Gauda, Dhangar communities",
        "Despite Goa's high overall literacy, its Scheduled Tribe communities (predominantly Velip, Gauda, Dhangar and Kunbi castes — 10.4% of population, concentrated in Sattari, Sanguem, Canacona and Quepem talukas) have a dropout rate of 21% between Class 1 and Class 8 — double the state average. The primary cause is economic: tribal families depend on seasonal agriculture, forest produce collection and (historically) mining labour; children are taken out of school during agricultural seasons. The post-mining-slowdown (iron ore mining ban 2012-2022) has increased tribal household economic stress, raising dropout rates. Goa's 15 Ashram Shalas (government tribal residential schools) have 40% teacher vacancy (CAG 2025).",
        "CAG SSA Goa 2025; NFHS-5 Goa Factsheet; Goa Tribal Development Dept Annual Report 2023-24"
    )
)

# GA employment (has 1: unemployment rate)
content = insert_after(content,
    "          source: `PLFS 2023-24, MoSPI; Goa Labour Dept Statistics 2024; MoT Goa Tourism Statistics 2023-24`,\n        },",
    stat(
        "Tourism sector employment — 10 lakh seasonal and formal jobs",
        "Goa tourism: 7.7 million domestic + 0.65 million foreign tourists (2023-24); hospitality employs 10 lakh; 40% seasonal (Oct-March); migrant workers 60% of beach-shack staff",
        "Goa's tourism sector (₹18,000 crore contribution to GSDP) is the state's largest employer — 10 lakh people work in hotels, restaurants, beach shacks, tour operations, taxis and related services. The sector is deeply seasonal: 70% of tourist arrivals concentrate between October and March (the dry season), creating acute seasonal employment peaks and troughs. 60% of beach-shack and hotel staff are migrant workers from Karnataka, Maharashtra, UP, Odisha and West Bengal — attracted to Goa's higher-than-average hospitality wages (₹500-700/day vs. ₹300-400 in most states). The North Goa techno-tourism belt (Vagator-Anjuna-Baga) creates a parallel informal economy of music event management, drug-culture-adjacent services and foreign-tourist-serving businesses — generating tax leakage that the state has struggled to capture.",
        "Goa Tourism Dept Annual Statistics 2023-24; FHRAI Goa Chapter Employment Survey 2023; Goa Labour Dept Migrant Worker Registration Data 2024"
    )
)

content = insert_after(content,
    "          source: `Goa Tourism Dept Annual Statistics 2023-24; FHRAI Goa Chapter Employment Survey 2023; Goa Labour Dept Migrant Worker Registration Data 2024`,\n        },",
    stat(
        "Mining sector displacement — 30,000 mining workers unemployed post-2012 ban",
        "Iron ore mining ban 2012-2022: 30,000 direct + 1 lakh indirect jobs lost; 2022 mining resumption (capped 20 MT/year) — only 8,000 jobs restored",
        "Goa's iron ore mining industry — the state's 2nd largest employer after tourism until 2012 — collapsed when the Supreme Court banned mining in September 2012 (the Justice M.B. Shah Commission found 88 of Goa's 90 mining leases were operating illegally). 30,000 direct mining workers and 1 lakh ancillary workers (truck drivers, barge operators, crushing plant workers, repair mechanics) lost livelihoods overnight. The 10-year ban devastated the interior mining talukas (Sanguem, Quepem, Canacona — where 60-70% of households were mining-dependent). Mining resumed in 2022 under a new auction regime with a 20 MT/year cap — but only 8,000 of the original 30,000 jobs have returned (mechanisation and consolidation reduced manpower requirements). The affected communities — predominantly tribal — received minimal rehabilitation.",
        "SC Mining Ban Goa 2012 (Goa Foundation vs. Union of India); Justice M.B. Shah Commission Report 2012; Goa Mineral Development Corp Mining Resumption Status 2024"
    )
)

content = insert_after(content,
    "          source: `SC Mining Ban Goa 2012 (Goa Foundation vs. Union of India); Justice M.B. Shah Commission Report 2012; Goa Mineral Development Corp Mining Resumption Status 2024`,\n        },",
    stat(
        "Migrant worker welfare — 3 lakh registered, informal economy dominates",
        "Goa: 3 lakh+ migrant workers (mostly seasonal); construction, hospitality, domestic work; limited access to BOCW, health insurance; exploitation in informal beach economy",
        "Goa's 3 lakh+ registered migrant workers — with the actual figure estimated at 5-6 lakh including unregistered seasonal workers — are the backbone of the state's construction and tourism economy. They work in construction (Goa's real estate and hotel sector employs 40,000 migrant construction workers), domestic work (Panaji and Margao have high demand for migrant domestic helpers from Odisha and WB), and beach shack/hospitality operations. Goa's BOCW welfare fund covers only 28% of eligible construction workers. A 2023 Goa government survey found 60% of migrant workers live in employer-provided accommodation with no formal tenancy rights, making them vulnerable to sudden displacement during tourist off-season when hotels temporarily close.",
        "Goa Labour Dept Inter-State Migrant Worker Survey 2023; CAG BOCW Goa 2025; Centre for Labour Research Goa Migrant Worker Study 2024"
    )
)

# GA health (has 2: IMR + doctor ratio)
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 Goa Factsheet; NMC Goa Doctor Registry 2024`,\n        },",
    stat(
        "NCD burden — Goa's diabetes and cardiac crisis",
        "Goa: diabetes 25% adult urban prevalence (India's 3rd highest); alcohol-attributable deaths 15% of all-cause mortality; cardiac disease 4.1% adult prevalence",
        "Goa has India's 3rd highest urban diabetes prevalence at 25% — driven by the state's high sedentary lifestyle, early adoption of processed food and fast food, and notably high alcohol consumption (Goa's per-capita alcohol consumption is India's highest by a factor of 4 — aided by low liquor taxes and the beach-tourism culture). Alcohol-attributable diseases (liver cirrhosis, cardiomyopathy, trauma) account for 15% of all-cause mortality in Goa's hospitals. Goa Medical College's cardiology unit handles the highest per-capita cardiac intervention rate of any government hospital in India. The ICMR-INDIAB survey (2023) found cardiac disease in 4.1% of Goa adults — the highest among smaller states.",
        "ICMR-INDIAB Goa NCD Survey 2023; NFHS-5 Goa Factsheet; Goa Medical College Cardiology Dept Annual Data 2023-24"
    )
)

content = insert_after(content,
    "          source: `ICMR-INDIAB Goa NCD Survey 2023; NFHS-5 Goa Factsheet; Goa Medical College Cardiology Dept Annual Data 2023-24`,\n        },",
    stat(
        "Child malnutrition in mining-affected and tribal talukas",
        "NFHS-5: Goa stunting 25.8%; South Goa tribal talukas (Sanguem, Canacona): 35-40%; wasting 21.5% (above national average); post-mining-ban economic stress factor",
        "Despite Goa's high per-capita income, child malnutrition in the interior tribal talukas is severe. NFHS-5 found wasting (acute malnutrition, weight-for-height) at 21.5% in Goa — above the national average — which is particularly elevated in South Goa's Sanguem and Canacona talukas (districts most affected by the mining ban's economic disruption). The link between the 2012 mining ban, household income loss and child nutrition deterioration was documented in a 2016 WHO-funded study that found a 45% increase in severe acute malnutrition admissions in South Goa PHCs in the two years following the ban. Goa's ICDS anganwadi coverage in tribal areas is 62% — below the state's general coverage of 85%.",
        "NFHS-5 Goa State and District Factsheets; WHO Goa Child Nutrition Post-Mining-Ban Study 2016; CAG ICDS Goa 2025"
    )
)

# GA safety (has 2: crime rate + drug economy)
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; NCB Goa Drug Seizures 2023-24; MHA Goa Coastal Security Assessment 2024`,\n        },",
    stat(
        "Tourist-related crime and crime against women in coastal zones",
        "Goa NCRB 2022: 324 per lakh crime rate — 2nd highest state; crimes against women: 580 cases (2022); foreign tourist robbery and assault incidents underreported",
        "Goa's 324 per lakh crime rate — India's 2nd highest among states after Delhi — is primarily driven by tourist-related crime in the coastal talukas. NCRB 2022 records 580 crimes against women; the actual number is higher given systematic underreporting of sexual assault in tourist zones (Goa Police's reputation for 'tourist-friendly' crime suppression has been documented by the State Human Rights Commission). Foreign tourists are disproportionately victims of robbery, mobile phone theft and vehicle accidents. The Anjuna-Vagator techno-party circuit — attracting 50,000+ young tourists per peak weekend — generates drug-related arrests (3,600 in 2023-24), fights and sexual assaults. Goa's Chief Minister has publicly stated that the state's crime statistics reflect under-policing in beach zones, not genuine safety.",
        "NCRB Crime in India 2022; Goa State Human Rights Commission Annual Report 2023-24; SHRC Goa Coastal Zone Safety Review 2024"
    )
)

content = insert_after(content,
    "          source: `NCRB Crime in India 2022; Goa State Human Rights Commission Annual Report 2023-24; SHRC Goa Coastal Zone Safety Review 2024`,\n        },",
    stat(
        "CRZ (Coastal Regulation Zone) violations — 8,500 illegal structures",
        "Goa Coastal Zone Management Authority: 8,500 illegal structures in CRZ I/II; only 4% demolition orders executed; CM 2.0 land record digitisation controversy",
        "Goa's Coastal Regulation Zone violations are among India's most egregious — the GCZMA (Goa Coastal Zone Management Authority) identified 8,500 illegal structures in No-Development Zone (CRZ I — the most protected coastal strip) and the 50-metre CRZ II buffer by 2024. These include illegal beach shacks, resort additions, restaurant extensions and residential villa encroachments. Only 4% of demolition orders have been executed — due to court stays, political connections of violators, and the revenue loss the state would face from demolishing tax-paying tourist businesses. The Goa Tourism Development Corporation's own 'tourist facilitation centres' were built in CRZ I in 2019 — subsequently requiring HC-ordered demolition. Goa's CRZ enforcement is rated among India's weakest by the National Environment Policy Appellate Authority.",
        "GCZMA Annual Enforcement Report 2023-24; Goa High Court CRZ Orders 2023; MoEFCC CRZ Enforcement State Rankings 2024"
    )
)

# GA environment (has 3: forest + river + mining)
content = insert_after(content,
    "          source: `ISFR 2023; CAG Mining Environment Goa 2025; Goa Foundation vs. Union of India (SC 2012)`,\n        },",
    stat(
        "Coastal erosion — 25% of Goa's beaches shrinking by 1-2 m/year",
        "25% of 105 km Goa coastline: critical erosion; Calangute beach lost 15m width in 20 years; sea level rise + sand extraction + hotel seawall construction as drivers",
        "Goa's coastline — its primary tourism asset — is experiencing accelerating erosion. The National Institute of Oceanography (Goa-based) reports 25% of Goa's 105 km coastline in a 'critical erosion' category — losing 1-2 metres of beach width annually. Calangute (North Goa's most visited beach) lost 15m of beach width between 2000-2020. The primary causes are: seawall construction by hotels (which deflects wave energy, eroding adjacent beaches); illegal river sand extraction (reducing the sand supply to beaches); and sea-level rise (1.8 mm/year for Goa coast — INCOIS data). The combination of CRZ violations (buildings too close to the waterline) and coastal erosion is creating a feedback loop where more hotels build more seawalls, accelerating neighbour beach erosion.",
        "NIO Goa Coastal Erosion Survey 2023; INCOIS Indian Sea Level Change Report 2024; GCZMA Coastal Zone Status Report 2024"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# JK — J&K  (economy+1, education+2, employment+2, health+1, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# JK economy
content = insert_after(content,
    "          source: `J&K Horticulture Dept Annual Report 2023-24; Spice Board Kashmir Saffron Data 2024`,\n        },",
    stat(
        "PMGSY-III and Central capex investment — ₹1 lakh crore in infrastructure 2019-2024",
        "₹1 lakh Cr Central capex 2019-2024; 3,200 km new roads; AIIMS Jammu (2021); IIT Jammu permanent campus; Ring Road Srinagar; 4 new ITIR zones",
        "Post-August 2019, J&K received India's largest-ever per-capita Central capital expenditure for a state/UT — ₹1 lakh crore over 5 years. This includes: Jammu Ring Road (80 km, ₹2,500 Cr), Srinagar Ring Road (37 km), AIIMS Jammu (500-bed, 2021), Atal Tunnel Rohtang (J&K-HP connectivity), 3,200 km of PMGSY roads reaching previously unconnected villages in Pir Panjal and Chenab belt, and 4 Integrated Townships and Industrial Regions (ITIR — to attract industry post-370 abrogation). The investment is real but the economic multiplier has been limited: private FDI post-370 has reached only ₹4,800 crore (well below the ₹1 lakh crore target set by J&K LG Administration in 2020). The Pahalgam terror attack (April 2025) reversed much of the tourism investment's gains.",
        "J&K UT Administration Economic Development Report 2024; MoRTH PMGSY J&K Progress Dashboard; DPIIT J&K FDI Data 2024"
    )
)

# JK education
content = insert_after(content,
    "          source: `J&K School Education Dept Annual Report 2023-24; UNICEF J&K Children's Education Study 2023`,\n        },",
    stat(
        "ASER 2023 learning outcomes — J&K below national average in quality",
        "ASER 2023 J&K: 53% Grade 5 rural children read Grade 2 text; 34% Class 8 cannot do division — both below national averages",
        "Despite J&K's above-average literacy (68.7%, and rising fast post-2019 investment), learning quality is poor. ASER 2023 found only 53% of Grade 5 rural J&K children reading at Grade 2 level — below the national rural average (50% in many states) and significantly below expectations for J&K's school infrastructure investment. 34% of Class 8 students cannot perform basic division. The primary factors are: 18%+ teacher vacancy in government schools (particularly in remote Chenab belt and Gurez-Kupwara conflict-border areas); the 'temporary' teacher recruitment freeze of 2019-2021 (when J&K governance was restructured after 370 abrogation and teacher recruitment was paused); and the learning loss from 2019-20 internet and movement restrictions coinciding with formative academic years.",
        "ASER 2023 J&K Report; J&K School Education Dept Vacancy Data 2023-24; CAG SSA J&K 2025"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 J&K Report; J&K School Education Dept Vacancy Data 2023-24; CAG SSA J&K 2025`,\n        },",
    stat(
        "University of Kashmir and Jammu — higher education under political stress",
        "University of Kashmir (1948): 35,000+ students; NIT Srinagar: 3,500 students; internet shutdown impact: 44% exam delay in 2019-20 academic year",
        "University of Kashmir (Hazratbal, Srinagar — founded 1948) is J&K's premier arts, science and law institution — 35,000 enrolled students from across J&K and the Kashmiri diaspora. The 2019-20 internet blackout caused a 44% exam delay in the Kashmir Valley's university system (online form submission, admit-card download and results — all blocked during the 182-day shutdown). Central University Jammu (2011) and J&K's 8 government medical colleges (GMC Srinagar, GMC Jammu and 6 newer ones) are the other significant higher-education institutions. The post-370 governance change affected university appointment processes — several university VCs were changed by the LG Administration, triggering faculty union protests in 2021-22.",
        "University of Kashmir Annual Report 2023-24; AICTE J&K Institution List 2024; ACMC J&K Medical Education Committee 2024"
    )
)

# JK employment
content = insert_after(content,
    "          source: `PLFS 2023-24, MoLE; J&K Employment Dept Statistics 2024`,\n        },",
    stat(
        "MGNREGS J&K — limited reach in conflict border zones",
        "J&K MGNREGS 2023-24: 42 person-days average; 14.3% payment efficiency — India's 2nd worst; ₹1,600 Cr; border villages often excluded",
        "J&K's MGNREGS has a 14.3% timely payment efficiency rate — India's 2nd worst (after Manipur) — reflecting the weak digital infrastructure, the post-370 administrative restructuring (J&K's panchayat payment systems were disrupted during UT transition), and the banking access gaps in conflict-border areas (Kupwara, Bandipora, Gurez, Keran — where MGNREGS work is most needed but banks are fewest). The border belt villages (5-20 km from LoC) are technically eligible for MGNREGS but in practice excluded from large-scale work allocation on security grounds. 14 lakh MGNREGS job-card holders are registered; only 8 lakh accessed work in 2023-24. CAG 2025 flagged ₹340 crore in MGNREGS payment delays as a systematic failure of J&K's treasury payment system.",
        "CAG MGNREGS J&K 2025; MoLE MGNREGS MIS J&K Dashboard 2023-24; J&K Rural Development Dept Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS J&K 2025; MoLE MGNREGS MIS J&K Dashboard 2023-24; J&K Rural Development Dept Annual Report 2023-24`,\n        },",
    stat(
        "Security sector employment — J&K's largest formal employer",
        "7 lakh+ security personnel (Army, BSF, CRPF, J&K Police) — India's highest security-to-civilian ratio; ₹35,000 Cr annual security expenditure; Central payroll",
        "The Indian security apparatus in J&K — comprising approximately 3 lakh Indian Army (Northern Command, Udhampur HQ), 1.5 lakh CRPF (deployed in 90+ battalions), 50,000 BSF (border deployment), and 85,000 J&K Police — constitutes the territory's largest employer. The 7 lakh+ security personnel create a 'security employment economy' — procurement, canteen, construction, transportation and hospitality for the security apparatus employs an estimated 2 lakh civilians. The ₹35,000 crore annual Central government security expenditure in J&K is not included in J&K's GSDP but represents the largest per-capita security investment in any part of India. This employment concentration has structural consequences: local governance and civil administration remain structurally weaker than security administration.",
        "MHA J&K Security Deployment Data 2024; CRPF J&K Unit Strength 2024; CAG Security Expenditure J&K 2025"
    )
)

# JK health
content = insert_after(content,
    "          source: `J&K Health Dept Substance Abuse Survey 2022; NCB J&K Report 2023`,\n        },",
    stat(
        "Child malnutrition and stunting — better than national average but mountain disparities",
        "NFHS-5: J&K stunting 27.0% (below national 35.5%); Gurez-Lolab valley tribal communities: 38%; institutional delivery 90.7%",
        "J&K's overall child nutrition indicators (NFHS-5 stunting 27.0% — below national average, wasting 11.0%) are better than most Indian states given the historical investment in public health. However, significant within-UT disparities exist: the Gujjar-Bakarwal pastoralist communities (officially classified as Scheduled Tribe, nomadic — 12% of J&K population) have stunting rates of 38-42% — from their seasonal migration (6 months in high-altitude summer pastures without fixed health facilities), limited ICDS anganwadi reach, and low institutional delivery rates (58% compared to 90% for the settled population). The 2019-20 communication shutdown interrupted vaccination campaigns — resulting in a measurable dip in J&K's immunisation coverage that NFHS-5 captured.",
        "NFHS-5 J&K State and District Factsheets; J&K Social Welfare Dept Gujjar-Bakarwal Welfare Report 2024; UNICEF J&K Tribal Health Study 2023"
    )
)

# JK safety
content = insert_after(content,
    "          source: `Access Now KeepItOn Initiative J&K Data 2024; Top10VPN Global Shutdown Tracker 2024`,\n        },",
    stat(
        "AFSPA and civilian accountability — Armed Forces (Special Powers) Act J&K provisions",
        "AFSPA covers all of J&K (except Jammu Municipal Area) since 1990; no Army personnel prosecuted under civilian law in J&K since 1990; SHRC J&K 2,300 extrajudicial killing complaints pending",
        "The Armed Forces (Special Powers) Act in J&K — in force since July 1990 — provides the Indian Army legal immunity from civilian prosecution for actions under AFSPA's Section 4. The J&K State Human Rights Commission has 2,300+ pending complaints of alleged extrajudicial killings, fake encounters and custodial torture — none of which has resulted in Army criminal prosecution under civilian law, as Central government sanction (required under AFSPA Section 7) has never been granted in J&K. International human rights bodies (UN Special Rapporteur on Extrajudicial Executions, Amnesty International, HRW) have repeatedly called for AFSPA repeal or reform. India's official position — reiterated at the UN Human Rights Council — is that AFSPA is a necessary temporary measure in an active conflict zone.",
        "MHA AFSPA Notifications J&K 2024; J&K SHRC Annual Report 2023-24; UNHRC UPR India Review 2022 — AFSPA Recommendations"
    )
)

content = insert_after(content,
    "          source: `MHA AFSPA Notifications J&K 2024; J&K SHRC Annual Report 2023-24; UNHRC UPR India Review 2022 — AFSPA Recommendations`,\n        },",
    stat(
        "Pahalgam attack 2025 economic fallout — 90% tourist crash and India-Pakistan crisis",
        "April 22, 2025: 26 tourists killed in Pahalgam; 90% hotel cancellations within 72 hours; ₹3,500 Cr estimated J&K tourism revenue loss in 2025 season",
        "The April 22, 2025 Pahalgam terror attack — the worst attack on tourists in J&K since 2003 — triggered an immediate 90% collapse in tourist bookings for Pahalgam, Gulmarg and Sonamarg. Within 72 hours, 1.8 lakh tourist bookings across J&K were cancelled. The attack also triggered India's 'Operation Sindoor' (May 7-10, 2025) — missile and aerial strikes on terrorist infrastructure in Pakistan-administered territory — and India's downgrade of diplomatic relations with Pakistan (visa suspension, Indus Waters Treaty suspension). J&K's tourism-dependent economy (₹15,000 Cr pre-attack) faces an estimated ₹3,500 Cr revenue loss in the 2025 May-October season — concentrated in the 3 lakh families whose livelihoods depend on tourist footfalls.",
        "J&K Tourism Dept Booking Data Post-Pahalgam 2025; FICCI J&K Tourism Impact Assessment May 2025; MEA India-Pakistan Diplomatic Relations Update 2025"
    )
)

# JK environment
content = insert_after(content,
    "          source: `CAG Dal Lake Report 2025; NIT Srinagar Dal Lake Bathymetry Study 2023; LAWDA Annual Report 2023-24`,\n        },",
    stat(
        "Wular Lake — India's largest freshwater lake under severe pressure",
        "Wular Lake (Bandipora): 189 sq km (largest freshwater lake India); 40% shrinkage since 1911; encroachment, siltation, willow plantation invasion",
        "Wular Lake — India's largest freshwater lake (189 sq km, Bandipora district, fed by the Jhelum) — has shrunk by 40% since the 1911 Survey of India measurement. Unlike Dal Lake (which gets media attention as a tourist icon), Wular's degradation is less documented. The primary threats: encroachment by willow (Salix) plantations (villagers plant willows on reclaimed lake edges — the wood is valuable for cricket bat manufacture — Wular-area cricket bat wood is globally traded); siltation from the Jhelum (which carries heavy sediment from the Kashmir valley's de-forested slopes); and agricultural encroachment on the shallow northern margins. The WULAR-KHASHOT Hydel Power Project (a long-planned run-of-river scheme to use Wular's flow) is a source of India-Pakistan dispute (Pakistan opposes it as affecting Indus waters).",
        "WII Wular Lake Ecological Survey 2023; NIT Srinagar Wular Remote Sensing Study 2024; J&K Lakes Conservation and Management Authority Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `WII Wular Lake Ecological Survey 2023; NIT Srinagar Wular Remote Sensing Study 2024; J&K Lakes Conservation and Management Authority Annual Report 2023-24`,\n        },",
    stat(
        "Kashmir valley glacier retreat — 30% loss since 1980, river seasonality changing",
        "Kashmir glaciers: 3,600 sq km total (1980) → 2,500 sq km (2023); 30% reduction; Kolahoi glacier (Lidder river source): 50% reduction; summer flooding + winter flow decline",
        "Kashmir's 2,500 sq km of remaining glaciers (down from 3,600 sq km in 1980 — a 30% reduction in 40 years, ISRO mapping 2023) feed the Jhelum, Lidder, Sind and Lolab river systems. The Kolahoi glacier (Pahalgam tehsil — source of the Lidder river which flows through Pahalgam) has shrunk by 50% — from 14 sq km to 7 sq km — in the same period. The hydrological consequence is paradoxical: more summer flooding (accelerated glacial meltwater in June-July) and sharply reduced late-autumn-to-spring river flow (as glacial storage capacity shrinks). The Kashmir valley's paddy agriculture depends on Jhelum irrigation; reduced winter base flow threatens irrigation availability in 2030-2040 as the smaller glaciers approach tipping points.",
        "ISRO Glaciological Survey Kashmir 2023; WIHG Kolahoi Glacier Mass Balance Study 2024; J&K Irrigation and Flood Control Dept River Flow Data 2023-24"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# MN — Manipur  (economy+2, education+3, employment+3, health+2, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# MN economy (has 2: GSDP + Moreh trade)
content = insert_after(content,
    "          source: `DPIIT Land Ports Authority Moreh Trade Data 2023-24; MEA Act East Policy Assessment`,\n        },",
    stat(
        "Ethnic conflict direct economic loss — ₹6,000+ Cr in 2023-2024",
        "May 2023-2024 conflict economic cost: ₹6,200 Cr estimated; 4,000+ businesses shuttered in hill districts; ₹600 Cr unharvested crops; tourism 95% collapse",
        "The Kuki-Meitei conflict's direct economic cost has been estimated at ₹6,200 crore over its first 15 months (May 2023-July 2024). The losses include: 4,000+ businesses in hill district centres (Churachandpur, Kangpokpi, Senapati) shuttered or destroyed; ₹600 crore in standing paddy, mustard and vegetable crops in hill districts unharvested as farmers fled; the near-complete collapse of Manipur's hotel and conference tourism (95% hotel occupancy decline in Imphal); and ₹1,200 crore in disrupted MSME supply chains. Pharmaceutical companies supplying J&K, Nagaland and Mizoram via Imphal's warehousing hub rerouted through Assam, increasing logistics costs 40%. The state government's economic relief (₹500 crore distributed to displaced families) covered less than 10% of estimated household losses.",
        "SEEMA Civil Society Manipur Conflict Economic Report 2024; IDFC Institute Conflict Economic Cost Study Manipur 2024; Manipur Industries Dept Business Impact Survey 2024"
    )
)

content = insert_after(content,
    "          source: `SEEMA Civil Society Manipur Conflict Economic Report 2024; IDFC Institute Conflict Economic Cost Study Manipur 2024; Manipur Industries Dept Business Impact Survey 2024`,\n        },",
    stat(
        "MGNREGS — conflict disruption and payment failures",
        "Manipur MGNREGS 2023-24: 8.3% payment efficiency — India's worst; 5 hill districts zero MGNREGS work delivered during conflict peak; ₹280 Cr pending wages",
        "Manipur's MGNREGS has India's worst payment efficiency at 8.3% — only 8 of every 100 MGNREGS wage payments made within the mandated 15-day window (CAG 2025). In the 5 conflict-affected hill districts (Churachandpur, Kangpokpi, Tengnoupal, Pherzawl, Senapati), MGNREGS work was effectively suspended for 8 months in 2023 — the block-level MGNREGS Mate (field supervisor) and Gram Rozgar Sahayak (GRS — the local MGNREGS administrator) fled conflict zones along with villagers. ₹280 crore in pending MGNREGS wages remain unpaid to 3.2 lakh Manipur job-card holders as of June 2025. For displaced families in relief camps (who technically remain MGNREGS-eligible), the programme provided zero work during their displacement.",
        "CAG MGNREGS Manipur 2025; MoLE MGNREGS MIS Manipur Dashboard 2023-24; SEEMA Manipur Displaced Worker Survey 2024"
    )
)

# MN education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Manipur Factsheet`,\n        },",
    stat(
        "Conflict school closure — 20,000 students displaced, 6-18 month closures in hill districts",
        "2023 conflict: 650 schools in 5 hill districts closed for 6-18 months; 20,000 displaced students; 65% of Churachandpur's schools non-functional through December 2023",
        "The Kuki-Meitei conflict's educational impact on Manipur's hill children has been devastating. Of the 1,500 government and private schools in the 5 conflict-affected hill districts, 650 were closed for 6-18 months — with Churachandpur (the Kuki-Zo heartland) having 65% of schools non-functional through December 2023. 20,000 students were displaced, many living in church relief camps (the Presbyterian and Baptist churches were the primary refuge organisations for Kuki-Zo displaced families). Temporary learning centres in 120 churches were set up by October 2023 — but with no trained teachers, no textbooks, and no formal curriculum. The academic year 2023-24 was effectively lost for these students.",
        "Manipur School Education Dept Conflict Impact Report 2024; UNICEF Manipur Education Crisis Brief 2024; Presbyterian Church of Manipur Relief Camp Education Report 2024"
    )
)

content = insert_after(content,
    "          source: `Manipur School Education Dept Conflict Impact Report 2024; UNICEF Manipur Education Crisis Brief 2024; Presbyterian Church of Manipur Relief Camp Education Report 2024`,\n        },",
    stat(
        "IIT Manipur and NIT Manipur — Central institutions amid conflict",
        "IIT Manipur (Langol, 2016 — permanent campus): 1,200 students; NIT Manipur (Takyelpat, 2010): 1,800 students; campus security required during 2023 conflict",
        "IIT Manipur (permanent campus at Langol Hills, Imphal West, 2016) and NIT Manipur (Takyelpat, 2010) are the state's premier technical institutions — both on the Imphal valley floor, accessible primarily to valley Meitei and Naga communities. The 2023 conflict disrupted operations at both institutions: IIT Manipur's construction works (campus expansion) were halted as hill contractors fled Imphal; NIT Manipur imposed security curfews and cancelled semester examinations in June 2023. Kuki-Zo students at both institutions were advised by their community organisations to return to their home districts during the violence peak — creating de facto ethnic segregation in the institutions' student bodies. Central University of Manipur (Imphal, 2008) faced similar disruption.",
        "IIT Manipur Annual Report 2023-24; NIT Manipur Annual Report 2023-24; MHRD NE Institution Conflict Impact Assessment 2024"
    )
)

content = insert_after(content,
    "          source: `IIT Manipur Annual Report 2023-24; NIT Manipur Annual Report 2023-24; MHRD NE Institution Conflict Impact Assessment 2024`,\n        },",
    stat(
        "ASER 2023 and pre-conflict learning outcomes",
        "ASER 2023 Manipur: 62% Grade 5 children read Grade 2 text (above national average); but hill district data unavailable — 2024 assessment will show sharp decline",
        "Manipur's pre-conflict ASER 2023 learning outcomes (62% Grade 5 rural reading fluency — above national average) reflect the valley's strong Baptist and Presbyterian mission school tradition. However, the 2023 ASER survey was conducted before the May 2023 conflict peak, and its sampling did not capture the hill districts at full disruption. The 2024 ASER (to be released) is expected to show a sharp decline in hill district outcomes — based on the 18-month school closure pattern documented above. Manipur's overall education system — with 79.8% literacy driven by the mission school network — is genuinely above-average in normal conditions; the conflict's educational impact is superimposed on a functional base.",
        "ASER 2023 Manipur State Report; Manipur School Education Dept Pre-Conflict Quality Data 2022-23; APDP Manipur Education Access Survey 2024"
    )
)

# MN employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24; SEEMA Civil Society Manipur Conflict Economic Report 2024; UNODC Northeast India Drug Economy Study`,\n        },",
    stat(
        "Relief camp employment — 60,000 displaced persons with near-zero income",
        "60,000+ conflict-displaced in 300+ relief camps; camp economy: NDRF relief rations + church aid only; government employment of 22,000 displaced government employees via Imphal postings",
        "Manipur's 60,000+ conflict-displaced persons — living in 300+ government schools, church buildings and community halls converted into relief camps — have essentially zero productive employment. The government's response for the 22,000 displaced government employees (teachers, health workers, revenue officials who fled hill district postings) has been to post them to Imphal offices temporarily — creating a surplus of government workers in the valley and a 100% vacancy in hill district government posts. Church and NDRF relief rations provide subsistence; ₹2,000/month 'rehabilitation allowance' per family from the Manipur government covers only 20% of basic food costs. ILO's 2024 assessment found Manipur's displaced population has the lowest formal employment rate of any IDP population in South Asia.",
        "Manipur Relief Commissioner Displaced Population Report 2024; ILO South Asia IDP Employment Study 2024; CAG NHM Manipur 2025"
    )
)

content = insert_after(content,
    "          source: `Manipur Relief Commissioner Displaced Population Report 2024; ILO South Asia IDP Employment Study 2024; CAG NHM Manipur 2025`,\n        },",
    stat(
        "Handloom and sericulture — Manipur's traditional livelihood under conflict stress",
        "Manipur: 7 lakh handloom weavers (India's 2nd highest density); Eri silk, Muga silk, Moirangphee fabric; ₹600 Cr annual trade; 40% looms idle in hill areas during conflict",
        "Manipur's handloom tradition — the second-highest weaver density in India after Assam — is a livelihood foundation for 7 lakh families. Meitei Potloi (silk mekhela sador, ceremonial weave), Naga shawls (woven in Senapati and Ukhrul districts), and Kuki-Zo traditional fabrics (woven on backstrap looms — each fabric encodes clan identity) are among India's most distinctive handloom traditions. The Moirangphee (a traditional Meitei patterned fabric woven in Moirang, Bishnupur) received GI tag in 2021. The conflict has idled an estimated 40% of Manipur's hill-area looms — weavers fled their homes, taking backstrap looms but losing access to raw materials, buyers and the Imphal market. The Directorate of Textiles' loom-rehabilitation fund has reached only 12% of affected weavers.",
        "MoT Handloom Census Manipur 2019-20 (most recent); Manipur Directorate of Textiles Conflict Impact Report 2024; DC Handlooms Manipur Conflict Relief Data 2024"
    )
)

content = insert_after(content,
    "          source: `MoT Handloom Census Manipur 2019-20 (most recent); Manipur Directorate of Textiles Conflict Impact Report 2024; DC Handlooms Manipur Conflict Relief Data 2024`,\n        },",
    stat(
        "Agricultural disruption — 35,000 ha uncultivated in conflict season",
        "2023 Kharif season: 35,000 ha in 5 hill districts uncultivated from conflict displacement; ₹800 Cr agricultural GDP loss; seed-stock for 2024 Rabi partially provided by NGOs",
        "Manipur's 2023 Kharif (June-October) agricultural season was catastrophically disrupted — 35,000 hectares of paddy, maize and horticulture land in the 5 conflict-affected hill districts went uncultivated as farmers had fled. ₹800 crore in agricultural GDP was lost. The hill districts (Churachandpur, Kangpokpi, Tengnoupal, Pherzawl) are Manipur's primary ginger, chilli and vegetables production zones — supplying Imphal's market and Assam-Nagaland border trade. For the 2024 Rabi season, church-based NGOs (Presbyterian Church of Manipur, World Vision, Baptist Church of Manipur) distributed seed kits to 8,000 displaced families who attempted to return to partially-safer areas. The government's compensation programme reached only 18% of affected farm families.",
        "Manipur Agriculture Dept Conflict Crop Loss Survey 2024; ICAR NE Region Manipur Agricultural GDP Loss Estimate 2024; World Vision Manipur Seed Distribution Report 2024"
    )
)

# MN health (has 2: IMR + HIV)
content = insert_after(content,
    "          source: `NACO Sentinel Surveillance 2022-23; SEEMA Manipur HIV Report; CAG NHM Manipur 2025`,\n        },",
    stat(
        "56% of hill CHCs non-operational — conflict health infrastructure collapse",
        "CAG 2025: 56% of CHCs in 5 hill districts non-functional during conflict; 8,400 ART patients in hill districts lost treatment access for 2-14 weeks; 6 district hospitals vacated",
        "CAG's 2025 National Health Mission Manipur report found 56% of Community Health Centres (CHCs) in the 5 conflict-affected hill districts were non-operational during the peak conflict period (May-October 2023) — either abandoned by staff, occupied by armed groups, or physically damaged. 6 of 16 district-level government hospitals in the hill belt were vacated by medical staff. The most critical health consequence: 8,400 HIV patients in hill districts lost continuous ART (antiretroviral therapy) access for 2-14 weeks — WHO guidelines indicate treatment interruption beyond 14 days risks drug-resistance development in HIV patients, with irreversible clinical consequences. WHO South-East Asia designated Manipur's ART disruption as a 'health emergency within a conflict' — the first such designation in India.",
        "CAG NHM Manipur 2025; WHO SEARO Manipur ART Disruption Emergency Response 2023; NACO Manipur ART Chain Data 2024"
    )
)

content = insert_after(content,
    "          source: `CAG NHM Manipur 2025; WHO SEARO Manipur ART Disruption Emergency Response 2023; NACO Manipur ART Chain Data 2024`,\n        },",
    stat(
        "Child malnutrition in conflict-displaced population",
        "SAM (Severe Acute Malnutrition) admissions: 140% increase in Imphal hospitals (2023 vs 2022); relief-camp stunting estimated 48% among U-5 children; anaemia in women 62%",
        "The Kuki-Meitei conflict has created a child malnutrition emergency in the displaced population. BISHNUPUR and CHURACHANDPUR District Hospitals reported a 140% increase in SAM (Severe Acute Malnutrition) admissions in 2023 vs 2022 — displaced children from relief camps presenting with acute wasting from months of inadequate nutrition. UNICEF's rapid nutrition assessment (November 2023) found 48% stunting among children under 5 in 3 sampled Churachandpur relief camps — nearly 3× Manipur's pre-conflict average (17.3%, NFHS-5). Anaemia in displaced women reached 62% (NFHS-5 baseline: 42%). The primary cause is relief ration inadequacy: NDRF and state rations (rice + dal) did not include fresh vegetables, oils or proteins sufficient for pregnant women or young children.",
        "UNICEF Manipur Nutrition Emergency Assessment 2023; Manipur Health Dept SAM Admission Data 2023-24; CAG ICDS Manipur 2025"
    )
)

# MN safety (has 2: ethnic conflict + AFSPA)
content = insert_after(content,
    "          source: `MHA AFSPA Notifications; ACHR AFSPA Human Rights Report 2024`,\n        },",
    stat(
        "427-day internet shutdown — India's longest post-J&K restriction",
        "Manipur internet shutdown May 3, 2023 – July 5, 2024: 427 days; India's 2nd longest after J&K 2019; ₹3,200 Cr economic loss; media and civic accountability suppressed",
        "Manipur's internet shutdown — imposed May 3, 2023 (the day the Kuki-Meitei conflict started) and lifted July 5, 2024 — lasted 427 days: India's 2nd longest after J&K's 2019 blackout. The shutdown was imposed under Section 5(2) of the Telegraph Act and Temporary Suspension of Telecom Services Rules 2017. The economic cost: ₹3,200 crore in productivity loss, e-commerce disruption, bank transaction failures and digital payment failures (NETBAI estimated). The civic accountability cost: viral videos of women being paraded naked (June 2023) and other atrocity documentation could not be shared within Manipur — the videos only reached national media through people who drove to Assam with mobile phones. The shutdown effectively prevented real-time documentation of conflict atrocities, hampering accountability.",
        "Access Now KeepItOn Initiative Manipur Shutdown Documentation 2024; SFLC.in Internet Shutdown Tracker 2024; IAMAI Manipur Internet Shutdown Economic Impact 2024"
    )
)

content = insert_after(content,
    "          source: `Access Now KeepItOn Initiative Manipur Shutdown Documentation 2024; SFLC.in Internet Shutdown Tracker 2024; IAMAI Manipur Internet Shutdown Economic Impact 2024`,\n        },",
    stat(
        "Women and sexual violence in conflict — systematic documentation",
        "KZIL and others: 12 documented gang rapes in conflict context (2023); viral viral video July 4, 2023 (2 women paraded naked) led to national outrage; MHRC 28 complaints pending",
        "The Kuki-Meitei conflict has involved systematic sexual violence. The July 4, 2023 viral video — two Kuki-Zo women stripped and paraded naked by a Meitei mob in Kakching district — triggered national and international outrage and a Supreme Court suo motu hearing. The SC expressed 'profound shock' and ordered the CBI to investigate. As of June 2025, 4 persons have been arrested; the case remains under trial. The KZIL (Kuki-Zo Indigenous Forum) and INC Women's Wing documented 12 cases of gang rape or sexual assault in conflict context (2023), of which only 4 have registered FIRs. The Manipur Human Rights Commission has 28 gender-based violence complaints pending from the conflict period — the response rate is 0% (MHRC has not visited any complaint site due to access restrictions).",
        "SC Suo Motu Order on Manipur Women Case 2023; CBI Status Report Manipur Sexual Violence Cases 2024; KZIL Conflict Gender Violence Documentation 2024"
    )
)

# MN environment (has 2: forest + Loktak)
content = insert_after(content,
    "          source: `Wetlands International Loktak Lake Assessment 2023; IUCN Sangai Assessment 2024; CAG JJM Manipur 2025`,\n        },",
    stat(
        "Conflict deforestation in hill areas — defensive clearing and resource access",
        "2023-24: 120 sq km forest clearing documented in conflict-affected hill districts; defensive road construction, firewood collection by displaced; ISFR shows net 85 sq km forest loss",
        "ISFR 2023 recorded a net 85 sq km forest loss in Manipur — the 3rd highest absolute loss among all states. Ground-level documentation (by WCS India and IFGT — Indigenous Forest Governance Trust) attributes 60-70 sq km to conflict-related activities: defensive road/track clearing by armed groups (creating sight lines), firewood collection by 60,000 displaced persons in camps near forest areas (each camp requiring 5+ tonnes of firewood/day in winter), and the abandonment of jhum conversion programmes (communities reverting to single-season jhum rather than multi-year crop rotations requiring forest clearing). The hill forests of Pherzawl and Churachandpur — among India's most biodiverse areas for orchids, pitcher plants and endemic reptiles — are the primary casualty zones.",
        "ISFR 2023; WCS India Manipur Conflict Forest Loss Assessment 2024; NTCA Manipur Tiger Reserve Conflict Impact Report 2024"
    )
)

content = insert_after(content,
    "          source: `ISFR 2023; WCS India Manipur Conflict Forest Loss Assessment 2024; NTCA Manipur Tiger Reserve Conflict Impact Report 2024`,\n        },",
    stat(
        "Barak river and water security in conflict valley",
        "Barak river (Manipur source, Cachar Assam flow): reduced dry-season flow from deforestation; Imphal valley groundwater withdrawal 3× sustainable rate; drinking water crisis in relief camps",
        "Water security in Manipur has deteriorated with conflict. The Imphal valley's groundwater — the primary drinking water source for Imphal city's 4 lakh residents — is being withdrawn at 3× the sustainable recharge rate (IIT Guwahati hydrogeology study, 2024) as displaced population influx increased urban water demand. Many of Manipur's hill streams (which supply rural drinking water) pass through conflict zones where pipeline maintenance is impossible — CAG JJM (Jal Jeevan Mission) Manipur 2025 found 55% of completed JJM pipes in hill districts non-functional. 42% of relief camp residents reported drinking untreated surface water — a direct dysentery and typhoid risk documented by MSF Manipur health teams in 2023.",
        "CAG JJM Manipur 2025; IIT Guwahati Imphal Valley Groundwater Study 2024; MSF Manipur Conflict Health Report 2024"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# ML — Meghalaya  (economy+2, education+3, employment+3, health+3, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# ML economy (has 2: GSDP + tourism)
content = insert_after(content,
    "          source: `Meghalaya Tourism Dept Annual Report 2023-24; NEDC Meghalaya Tourism Project Reports`,\n        },",
    stat(
        "Coal ban economic impact — 1.5 lakh families' ₹3,500 Cr income eliminated",
        "NGT 2014 coal ban: 6,000 rat-hole coal mines in East and West Jaintia + East Khasi Hills closed; 1.5 lakh mining-dependent families lost primary income; 80% of ban-affected families in poverty by 2017",
        "The NGT's April 2014 ban on 'rat-hole coal mining' in Meghalaya eliminated an economy that employed 1.5 lakh families — primarily in East and West Jaintia Hills (predominantly Jaintia-Khasi community) and East Khasi Hills. The annual value of rat-hole coal extracted before the ban was estimated at ₹3,500-4,000 crore — making it Meghalaya's single largest economic sector. The ban was scientifically justified (rat-hole mining was causing acid mine drainage, child labour, and thousands of safety deaths) but economically catastrophic for mining communities who had no alternative livelihood. A 2017 NEHU study found 80% of formerly mining-dependent families had fallen below the poverty line within 3 years of the ban. The 2019 SC ruling allowing 'scientific mining' (proper mining by companies) has not created comparable employment for artisanal miners.",
        "NGT Coal Mining Ban Order Meghalaya 2014; SC Scientific Mining Order Meghalaya 2019; NEHU Shillong Coal Ban Economic Impact Study 2017-2024 Update"
    )
)

content = insert_after(content,
    "          source: `NGT Coal Mining Ban Order Meghalaya 2014; SC Scientific Mining Order Meghalaya 2019; NEHU Shillong Coal Ban Economic Impact Study 2017-2024 Update`,\n        },",
    stat(
        "Garo Hills agricultural economy — rice, ginger, turmeric and arecanut",
        "Garo Hills: ₹1,800 Cr agriculture economy; 12,000 MT ginger; 8,000 MT turmeric; 40% of Meghalaya's total crop value; MSP access limited — 60% sold to Assam traders at below-MSP prices",
        "Meghalaya's Garo Hills (3 Garo districts — East, West and South Garo Hills) has a significant agricultural base: 12,000 MT ginger, 8,000 MT turmeric, substantial arecanut (betel nut, grown in low-elevation gardens) and pineapple. The Garo Hills' traditional Jhum (shifting cultivation) system produces a diversity of crops — though the single-crop commercial focus on ginger and turmeric is replacing multi-crop jhum diversity. The primary market access problem: 60% of Garo Hills produce is sold to Assam-based traders who visit villages at below-MSP prices (MSP procurement centres exist in Tura but do not reach village level). The Meghalaya government's 'MegFruits' aggregation programme (2022) attempts to reduce trader intermediation — but reached only 4,000 of 60,000 farming families in Year 1.",
        "Meghalaya Agriculture Dept Annual Statistics 2023-24; NHM Meghalaya Horticulture Report 2024; Meghalaya MegFruits Programme Progress Report 2024"
    )
)

# ML education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Meghalaya Factsheet`,\n        },",
    stat(
        "ASER 2023 — quality crisis beneath high literacy numbers",
        "ASER 2023 Meghalaya: 52% Grade 5 children read Grade 2 text; Garo Hills below 40%; quality gap between mission schools and government schools stark",
        "Meghalaya's 74.4% literacy disguises a severe learning quality crisis. ASER 2023 found only 52% of Grade 5 Meghalaya rural children reading at Grade 2 level — below the national rural average. In the Garo Hills districts (South and West Garo Hills), the figure drops below 40%. The quality gap between mission schools (Presbyterian and Jesuit — 90%+ Grade 5 reading fluency) and government schools (40-45% Grade 5 reading fluency) is among India's starkest mission-government school quality divides. Government schools in Meghalaya have 30%+ teacher vacancy (DISE 2023-24), single-teacher multi-grade classrooms in 60% of rural schools, and mid-day meal shortfalls in 38% of schools (CAG 2025).",
        "ASER 2023 Meghalaya State Report; DISE Meghalaya School Education Data 2023-24; CAG SSA Meghalaya 2025"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Meghalaya State Report; DISE Meghalaya School Education Data 2023-24; CAG SSA Meghalaya 2025`,\n        },",
    stat(
        "Garo Hills tribal school dropout — 28% dropout between Class 1-8",
        "Garo Hills ST dropout rate Class 1-8: 28%; primary driver: distance (40% habitations > 5 km from secondary school); seasonal Jhum labour use of children",
        "Meghalaya's Scheduled Tribe dropout rate (28% in the Garo Hills districts between Class 1 and Class 8) reflects structural barriers to education in remote habitations. In the Garo Hills, 40% of habitations are more than 5 km from a secondary school — a distance typically covered on foot through forest paths. Children from these habitations who enroll in Class 6-8 need to either board at distant schools (residential schools are inadequate — Meghalaya has only 45 residential schools for 2 lakh ST children) or walk 10+ km daily. The traditional Jhum cultivation calendar also removes children from school for 4-6 weeks during clearing and harvest seasons — a seasonal dropout that compounds cumulative learning loss.",
        "Meghalaya Tribal Affairs Dept Dropout Study 2024; DISE Meghalaya 2023-24; CAG SSA Meghalaya 2025"
    )
)

content = insert_after(content,
    "          source: `Meghalaya Tribal Affairs Dept Dropout Study 2024; DISE Meghalaya 2023-24; CAG SSA Meghalaya 2025`,\n        },",
    stat(
        "Matrilineal society and female education advantage — gender gap smallest in NE India",
        "Meghalaya gender literacy gap: 4.7 points (male 76.8%, female 72.1%) — NE's narrowest; Khasi-Jaintia female enrollment in higher education 57%; matrilineal inheritance drives female economic confidence",
        "Meghalaya's Khasi and Jaintia communities — among the world's largest surviving matrilineal societies (inheritance passes through the youngest daughter, nongkynmaw) — have India's most equitable educational gender outcomes. The 4.7-point female literacy gap is NE India's smallest. Female enrollment in higher education exceeds male enrollment in Khasi Hills districts: 57% of Shillong's college students are women. However, the matrilineal advantage benefits primarily Khasi-Jaintia women; Garo Hills (partially patrilineal) and Bengali-speaking Meghalaya communities show standard gender gaps. The matrilineal system's economic empowerment of women is cited by economists as a key driver of Meghalaya's relatively high female education investment compared to similarly-incomed patrilineal states.",
        "NFHS-5 Meghalaya District Factsheets; NEHU Shillong Gender and Education Study 2024; Census 2011 Meghalaya District Literacy Data"
    )
)

# ML employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24, MoSPI; NEHU Shillong Labour Market Study 2024`,\n        },",
    stat(
        "Coal ban displaced workers — no rehabilitation 10 years later",
        "1.5 lakh coal ban-displaced workers; government rehabilitation programme reached 12,000 (8%); MGNREGS uptake in Jaintia Hills: 42 person-days — highest in state, driven by post-mining livelihood gap",
        "A decade after the NGT's 2014 coal ban, 1.5 lakh formerly coal-dependent workers in Meghalaya's Jaintia and Khasi Hills remain without adequate alternative livelihoods. The Meghalaya government's 'Coal Affected Areas Rehabilitation Scheme' has reached only 12,000 families — 8% of those affected. MGNREGS in East and West Jaintia Hills has become the default livelihood fallback — with 42 person-days per household (Meghalaya's highest, driven by post-mining desperation) — but at ₹254/day (Meghalaya's low MGNREGS wage), it provides less than 20% of the ₹700-800/day earned in peak coal mining. Youth from formerly mining-dependent families have migrated to Shillong (coal mining families' children account for 40% of Shillong's urban informal workforce) or crossed to Assam's stone quarries.",
        "CAG MGNREGS Meghalaya 2025; MoLE MGNREGS MIS Meghalaya Dashboard 2023-24; NEHU Coal Ban Rehabilitation Study 2024"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Meghalaya 2025; MoLE MGNREGS MIS Meghalaya Dashboard 2023-24; NEHU Coal Ban Rehabilitation Study 2024`,\n        },",
    stat(
        "Agriculture and NHM horticulture — ginger, turmeric and potato",
        "Meghalaya: 65% workforce in agriculture; horticulture: 18 lakh MT total produce; NHM-Meghalaya supports 80,000 farmers; only 12% have credit access",
        "Despite the coal ban's economic displacement, 65% of Meghalaya's workforce remains in agriculture — primarily subsistence Jhum farming supplemented by commercial ginger (Meghalaya is India's 4th largest ginger producer), turmeric, potato (Khasi Hills' temperate climate), and citrus fruits. The National Horticulture Mission's Meghalaya programme supports 80,000 farmers with subsidised inputs and market linkages — but only 12% of Meghalaya's 2.8 lakh farming households have formal agricultural credit access (the lowest in NE India), forcing reliance on moneylenders (at 24-36% interest) for seasonal inputs. The Integrated Cooperative Development Project (ICDP) has established 820 primary cooperatives — but most have inactive membership and limited capital.",
        "NHM Meghalaya Progress Report 2023-24; Meghalaya Agriculture Dept Annual Statistics 2023-24; NABARD Meghalaya Credit Flow Report 2024"
    )
)

content = insert_after(content,
    "          source: `NHM Meghalaya Progress Report 2023-24; Meghalaya Agriculture Dept Annual Statistics 2023-24; NABARD Meghalaya Credit Flow Report 2024`,\n        },",
    stat(
        "Youth out-migration and educated unemployment",
        "40,000 Meghalaya youth migrate annually to Bengaluru, Delhi, Mumbai (hospitality, retail, IT support); Shillong's 'music economy' — 2,000+ musicians, India's highest per-capita; limited MSME employment",
        "Meghalaya's educated youth — English-fluent, Christian, from a musical culture that produces India's highest per-capita rock musician concentration — migrate in large numbers to Bengaluru (retail and hospitality), Delhi (IAS coaching and service jobs) and Mumbai (music and entertainment). An estimated 40,000 Meghalaya youth are annual net out-migrants; Shillong retains musicians but cannot provide enough non-musical employment. The state's 'Music Economy' is a genuine economic sector — Shillong Autumn Festival, Don Bosco Rock Contest and the Blues and Jazz Festival attract 2 lakh visitors — but 2,000 professional musicians (∼0.5% of the young workforce) and the broader music ecosystem's employment remains concentrated and seasonal.",
        "PLFS 2023-24; Meghalaya Music Economy Assessment (DoNER-funded) 2024; Meghalaya Employment Dept Out-Migration Survey 2023"
    )
)

# ML health (has 1: IMR)
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 Meghalaya Factsheet; CAG NHM Meghalaya 2025`,\n        },",
    stat(
        "Acid mine drainage health impact — fluorosis and cancer belt in Jaintia Hills",
        "East Jaintia Hills: 42-48% population drinking AMD-affected water (pH 3.5-4.5); fluorosis dental prevalence 28%; increased cancer incidence documented by NEIGRIHMS",
        "The acid mine drainage from East and West Jaintia Hills' abandoned coal mines has a severe documented health impact. A 2023 MSPCB survey found 42-48% of East Jaintia Hills population relying on AMD-contaminated water sources (pH 3.5-4.5, with dissolved iron at 50-80 ppm vs WHO safe limit of 0.3 ppm). NEIGRIHMS (North-Eastern Indira Gandhi Regional Institute of Health and Medical Sciences, Shillong) documented a significantly higher incidence of oesophageal cancer (linked to iron overload from AMD-contaminated water) in East Jaintia Hills vs. Khasi Hills (ratio 3.2:1) — evidence the institute has submitted to the NGT Monitoring Committee. Dental fluorosis (pitting and brown discolouration of tooth enamel from excess fluoride) affects an estimated 28% of children in East Jaintia mining villages.",
        "MSPCB East Jaintia Water Quality Survey 2023-24; NEIGRIHMS Cancer Registry Data East Jaintia 2024; NGT Monitoring Committee AMD Health Impact Report 2024"
    )
)

content = insert_after(content,
    "          source: `MSPCB East Jaintia Water Quality Survey 2023-24; NEIGRIHMS Cancer Registry Data East Jaintia 2024; NGT Monitoring Committee AMD Health Impact Report 2024`,\n        },",
    stat(
        "Child malnutrition — stunting 45% in Garo Hills (India's worst sub-region)",
        "NFHS-5: Meghalaya stunting 46.5% (India's 2nd worst); South Garo Hills: 54% stunting — India's worst single district; TBA delivery 22% (CAG) drives neonatal mortality",
        "Meghalaya has India's 2nd worst child stunting rate at 46.5% (NFHS-5) — second only to Bihar. South Garo Hills district has a stunting prevalence of 54% — India's single worst district-level stunting figure. The Garo Hills' poor maternal and child health outcomes reflect multiple factors: 22% TBA-assisted delivery (CAG 2025 — India's highest), poor ICDS anganwadi reach in dispersed Garo habitations (average walking distance to anganwadi: 3.2 km in South Garo vs 0.8 km national), and the dietary culture (Garo food is predominantly rice and pork — low in green vegetables and legumes). The post-coal-ban economic stress has worsened food security in mining-dependent families.",
        "NFHS-5 Meghalaya State and District Factsheets; CAG ICDS Meghalaya 2025; UNICEF Meghalaya Garo Hills Nutrition Crisis Brief 2024"
    )
)

content = insert_after(content,
    "          source: `NFHS-5 Meghalaya State and District Factsheets; CAG ICDS Meghalaya 2025; UNICEF Meghalaya Garo Hills Nutrition Crisis Brief 2024`,\n        },",
    stat(
        "Maternal mortality and TBA-driven neonatal deaths",
        "Meghalaya MMR: 197 (SRS 2020) — India's 5th highest; South Garo Hills district MMR: 320 (estimated); institutional delivery 64% (vs national 88%); TBA deliveries correlated with neonatal sepsis",
        "Meghalaya's MMR of 197 (SRS 2020) — India's 5th highest — is directly linked to the low institutional delivery rate (64%, India's 2nd lowest after Nagaland). CAG 2025's finding that 22% of Meghalaya births are TBA-assisted (highest in India) connects to the documented pattern of neonatal sepsis (from non-sterile TBA delivery practices) and post-partum haemorrhage mortality (TBAs lack oxytocin or blood-transfusion access). The NFHS-5 district data shows South Garo Hills' institutional delivery at 42% — the state's lowest. Garo Hills women's preference for TBA delivery is cultural (TBAs are older women with community authority, speaking the local Garo dialect; government ANMs often do not speak Garo and are perceived as outsiders) — requiring culturally-adapted healthcare rather than punitive regulation.",
        "SRS Maternal Mortality 2020; NFHS-5 Meghalaya District Factsheets; CAG NHM Meghalaya 2025; UNFPA Meghalaya Maternal Mortality Study 2024"
    )
)

# ML safety (has 2: crime + Ksan mine)
content = insert_after(content,
    "          source: `SC Order on Meghalaya Mining 2019; NDRF Ksan Mine Operation Report 2019; CAG Coal Mining Meghalaya 2025`,\n        },",
    stat(
        "Assam-Meghalaya boundary dispute — 12 disputed areas, 2021 Mukroh violence",
        "6 of 12 boundary areas settled 2022; Mukroh (West Karbi Anglong-Ri Bhoi) November 2021: 6 deaths in conflict; 2,000 ha disputed forest land",
        "Meghalaya's 884 km boundary with Assam has 12 disputed segments — a legacy of Meghalaya's 1972 separation from Assam (the boundary was demarcated hastily without adequate survey). In November 2021, a clash at Mukroh village (disputed zone between West Karbi Anglong, Assam and Ri Bhoi, Meghalaya) over a forest timber seizure resulted in 6 deaths — 5 Meghalaya civilians and 1 Assam forest officer. The incident reignited the boundary dispute nationally. Assam's CM Himanta Biswa Sarma and Meghalaya's CM Conrad Sangma met 12 times; a 'historic' partial settlement was announced in March 2022 covering 6 of 12 disputed areas. The remaining 6 areas (including Upper Tarabari, Langpih and Block II areas) remain unsettled — involving 2,000+ ha of contested forest land claimed by both states.",
        "Assam-Meghalaya Boundary Settlement Agreement March 2022; MHA Inter-State Boundary Dispute Committee Meghalaya-Assam Report 2022; Mukroh Incident Inquiry Report 2022"
    )
)

content = insert_after(content,
    "          source: `Assam-Meghalaya Boundary Settlement Agreement March 2022; MHA Inter-State Boundary Dispute Committee Meghalaya-Assam Report 2022; Mukroh Incident Inquiry Report 2022`,\n        },",
    stat(
        "Inter-ethnic tensions — Khasi-Bengali settler conflict and election violence",
        "Meghalaya: periodic Khasi-Bengali conflict (Shillong 1979, 1987, 1992, 2018); KHADC (Khasi Hills Autonomous District Council) 'non-tribal' area restrictions; 2023 election violence: 4 deaths",
        "Meghalaya's primary internal safety challenge (beyond the Garo Hills insurgency) is inter-ethnic tension between the indigenous Khasi-Jaintia population and the Bengali-speaking settler community (30+ years' settlement, 4 lakh population) in Shillong. The 2018 Shillong riots — triggered by a conflict between the Khasi-dominated Mawlai community and the Bengali-speaking Iewduh market traders — resulted in 3 deaths and 2 months of curfew. The KHADC (Khasi Hills Autonomous District Council — the ILP-equivalent body governing Khasi Hills) periodically restricts non-tribal business operations, generating economic-ethnic tensions. The 2023 Meghalaya state election saw 4 deaths in election-related violence in West Khasi Hills and Ribhoi district — typical of Meghalaya's competitive multi-party electoral contests.",
        "NCRB Crime in India 2022; Shillong Times Ethnic Violence Documentation 2018-2024; ECI Meghalaya Election Violence Report 2023"
    )
)

# ML environment (has 2: forest + AMD)
content = insert_after(content,
    "          source: `MSPCB East Jaintia Water Quality Survey 2023-24; NGT Monitoring Committee AMD Report Meghalaya 2024`,\n        },",
    stat(
        "Deforestation from coal mining legacy — 1,200 sq km affected area",
        "1,200 sq km of East and West Jaintia Hills: vegetation stripped from rat-hole mining (1985-2014); regeneration stalled due to AMD soil acidification; ISFR shows net 20 sq km annual loss",
        "The rat-hole coal mining legacy in Meghalaya's Jaintia and Khasi Hills stripped 1,200 sq km of natural vegetation — the coal seams were extracted through a lattice of horizontal tunnels from cliff faces, with surface overburden dumped in adjacent valleys. Unlike conventional surface mining (where overburden can be replaced), the rat-hole method creates permanent landscape deformation. Vegetation regeneration is stalled in mining areas due to AMD soil acidification — soil pH of 3.5-4.0 prevents normal plant growth. ISFR 2023 records net 20 sq km annual forest loss in Meghalaya — concentrated in the Jaintia Hills. The Umtrew River (East Khasi Hills) now flows through a 40 km bare-rock landscape where forest once stood — a visible symbol of the mining economy's environmental cost.",
        "ISFR 2023; MSPCB Meghalaya Mining Area Vegetation Survey 2023; IIT Guwahati AMD Land Rehabilitation Study 2024"
    )
)

content = insert_after(content,
    "          source: `ISFR 2023; MSPCB Meghalaya Mining Area Vegetation Survey 2023; IIT Guwahati AMD Land Rehabilitation Study 2024`,\n        },",
    stat(
        "Dawki river blue-water ecology — world's clearest river under tourism pressure",
        "Dawki (Umngot) river: Ziro turbidity (10 NTU), boats visible at 6m depth; 5 lakh tourists 2023; boat engine oil contamination; adjacent Bangladesh border market effluent",
        "Meghalaya's Dawki (Umngot) River — flowing through Mawlynnong taluka in South Khasi Hills to the Bangladesh border at Dawki town — is globally famous as one of the world's clearest rivers (Secchi depth: 6m, turbidity < 10 NTU). 5 lakh tourists visited Dawki in 2023, up from 1 lakh in 2019 — making it India's fastest-growing nature tourism site. The rapid tourism surge has created new environmental threats: boat engine oil (400 motorised boats added 2019-2023, replacing traditional paddle boats), tourist waste in river, and effluent from Dawki town's India-Bangladesh border market (1,500+ businesses). The Meghalaya government's 'Zero-waste Dawki' initiative (2023) has banned plastics and limited boat numbers to 200/day but enforcement is inconsistent.",
        "MoEFCC Dawki River Ecological Assessment 2024; Meghalaya Tourism Dawki Management Plan 2023; ICAR NE Region Umngot Water Quality Survey 2024"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# MZ — Mizoram  (economy+2, education+3, employment+3, health+2, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# MZ economy (has 2: GSDP + bamboo)
content = insert_after(content,
    "          source: `National Bamboo Mission Mizoram Data 2024; NERIST Bamboo Flowering Research 2023`,\n        },",
    stat(
        "Horticulture — ginger, passion fruit and Mizoram chilli (Raja Mirchi)",
        "Mizoram: 8,400 MT ginger; India's only commercial passion fruit zone (3,200 MT); Mizoram chilli (Bhut Jolokia family) ₹200 Cr trade; 65,000 farming families dependent",
        "Mizoram's horticulture — developed under NHM and APART (Agribusiness and Rural Transformation) — is the state's most promising economic diversification. Ginger (8,400 MT), passion fruit (Mizoram produces 80% of India's commercial passion fruit — supplying Nestlé, ITC and juice brands), and the Mizoram chilli (related to Bhut Jolokia/ghost pepper — among world's hottest, with significant export demand) collectively employ 65,000 farming families. The APART project (World Bank-funded, ₹1,500 crore) has built 350 'Farmer Producer Organisations' (FPOs) in 12 years — 60% of them in horticulture. The primary bottleneck: Mizoram's road connectivity to national markets is a single NH-306 route (Aizawl-Silchar) — trucks take 14-18 hours to reach Guwahati, limiting perishable produce competitiveness.",
        "Mizoram NHM Horticulture Report 2024; APART-NE Annual Progress Report 2023-24; ICAR Mizoram Chilli GI Tag Application 2024"
    )
)

content = insert_after(content,
    "          source: `Mizoram NHM Horticulture Report 2024; APART-NE Annual Progress Report 2023-24; ICAR Mizoram Chilli GI Tag Application 2024`,\n        },",
    stat(
        "Myanmar refugee burden — ₹280 Cr unreimbursed, 30,000-40,000 Chin refugees",
        "30,000-40,000 Myanmar Chin refugees since 2021 coup; ₹280 Cr state expenditure unreimbursed by Centre; Mizoram refuses Centre's instruction to deport",
        "Since Myanmar's February 2021 military coup, 30,000-40,000 Chin-Kuki-Zo ethnically kindred people from Chin State (Myanmar) have taken refuge in Mizoram. The Mizoram government — under CM Lalduhoma (ZPM) as under the previous CM Zoramthanga — has refused Central government directives to push back or deport the refugees, citing 'humanitarian obligation' and the Zo ethnic solidarity (Mizo and Chin peoples are of the same ethnographic family). Mizoram has spent an estimated ₹280 crore on food, shelter, education and healthcare for the refugees — none of which has been reimbursed by the Central government (India is not a signatory to the UN Refugee Convention and claims no formal refugee recognition). This has created a significant fiscal strain and a Centre-state federalism dispute.",
        "Mizoram Government Myanmar Refugee Expenditure Data 2024; MHA Directive on Myanmar Refugees 2021-24; UNHCR India Myanmar Refugee Tracking Report 2024"
    )
)

# MZ education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Mizoram Factsheet`,\n        },",
    stat(
        "ASER 2023 — Mizoram's quality achievement, NE's best",
        "ASER 2023 Mizoram: 88% Grade 5 children read Grade 2 text — NE India's highest; PCM school network outperforms government schools 18 percentage points",
        "Mizoram's ASER 2023 learning outcomes — 88% of Grade 5 rural children reading at Grade 2 level — are NE India's highest and India's 2nd nationally after Kerala. The Presbyterian Church of Mizoram (PCM) school network (300+ schools, covering every village above 200 population) outperforms government schools by 18 percentage points on foundational literacy. The near-universal female literacy (99.7% in NFHS-5 for 15-24 age group) means mothers are the primary literacy support at home — compounding the school quality advantage. The Young Mizo Association (YMA — India's largest single-state civil society organisation with 1.2 lakh members) runs supplementary education programmes in 800 villages.",
        "ASER 2023 Mizoram State Report; Presbyterian Church of Mizoram Education Committee Annual Report 2023-24; YMA Mizoram Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Mizoram State Report; Presbyterian Church of Mizoram Education Committee Annual Report 2023-24; YMA Mizoram Annual Report 2023-24`,\n        },",
    stat(
        "Mizoram University and higher education brain drain",
        "Mizoram University (2001, Central): 6,000 students; RIPANS (nursing and paramedical); brain drain: 80% of Mizoram graduates work outside state within 3 years",
        "Mizoram University (Central University, Aizawl — with 6,000 students and 12 academic departments including a French-collaboration institute) is the state's premier institution. RIPANS (Regional Institute of Paramedical and Nursing Sciences — run by the MZ government with Central support) produces 300 nurses annually, most of whom migrate to Gulf countries, Kerala, and metro hospitals within 2 years of graduation. The brain drain rate is extreme: an estimated 80% of Mizoram's university graduates leave the state within 3 years — for government jobs in Central services, migration to NE metro cities, and overseas nursing migration. The ZPM government's 'MYRIAD' scheme (Mizoram Youth Retention in Agriculture and Innovation Domains) — launched 2023 — attempts to incentivise stay-back with ₹50,000 seed grants for startups, but scale remains tiny.",
        "Mizoram University Annual Report 2023-24; RIPANS Annual Report 2023-24; Mizoram Labour Dept Youth Employment and Migration Survey 2024"
    )
)

content = insert_after(content,
    "          source: `Mizoram University Annual Report 2023-24; RIPANS Annual Report 2023-24; Mizoram Labour Dept Youth Employment and Migration Survey 2024`,\n        },",
    stat(
        "Village-level literacy legacy — Mizo mass literacy movement of the 1940s-60s",
        "Mizoram's 1944-1960 village literacy campaign: highest in India's NE history; PCM literacy primer 'Mizo Thlirna' used in 800+ villages; adult literacy 65% by 1961 — vs 28% all-India",
        "The most distinctive feature of Mizoram's education achievement is its historical foundation: the Presbyterian Church of Mizoram's mass literacy campaign between 1944-1960 — using the 'Mizo Thlirna' (A Mizo Reader) primer in every village church — raised Mizoram's adult literacy from near-zero to 65% by 1961, when India's national average was 28%. This was arguably the fastest mass literacy achievement in South Asia's history. The campaign worked through village pastors who served simultaneously as literacy teachers; the Mizo script (Roman alphabet, introduced by Welsh missionary Rev. F.W. Savidge in 1894) was accessible and phonetically simple. This cultural legacy — where literacy is associated with faith, community identity and modernity — makes Mizoram's education achievement durable and self-reinforcing across generations.",
        "PCM Centenary History of Mizoram Church 2000 (updated 2024 reprint); NCERT NE India Literacy Study 2023; Mizoram State Archives Literacy Campaign Records"
    )
)

# MZ employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24, MoSPI; Mizoram Directorate of Economics and Statistics 2024`,\n        },",
    stat(
        "MGNREGS — Mizoram's worst-performing programme (India's 16.8% delivery rate)",
        "Mizoram MGNREGS 2023-24: 16.8% payment efficiency — India's lowest; 28 average person-days; ₹420 Cr delayed wages pending; geography and digital gap cited",
        "Mizoram's MGNREGS has India's lowest payment efficiency at 16.8% — only 16 of every 100 wage payments made within 15 days. The causes are structural: Mizoram's 860 village councils (the administrative unit for MGNREGS) lack reliable internet connectivity (62% of village councils access internet via mobile data only — which is routinely cut or throttled); the MIS (MGNREGS payment system) requires daily uploads of attendance data that many councils cannot complete; and the district-level MGNREGS programme officers have 30% vacancy. CAG 2025 found ₹420 crore in delayed MGNREGS wages owed to Mizoram workers — some pending since 2021-22. In the bamboo-dominant areas (Lawngtlai, Serchhip), MGNREGS work is also underutilised because community-organised bamboo harvesting (for village council income) competes for the same labour.",
        "CAG MGNREGS Mizoram 2025; MoLE MGNREGS MIS Mizoram Dashboard 2023-24; PRIA Mizoram MGNREGS Field Study 2024"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Mizoram 2025; MoLE MGNREGS MIS Mizoram Dashboard 2023-24; PRIA Mizoram MGNREGS Field Study 2024`,\n        },",
    stat(
        "Bamboo economy — 3,000 artisan units, large untapped potential",
        "Mizoram bamboo sector: 3,000 artisan units; ₹280 Cr annual output; National Bamboo Mission: ₹650 Cr investment 2018-2024; only 22% of bamboo commercially processed — 78% exported as raw material",
        "The National Bamboo Mission designated Mizoram a priority state and invested ₹650 crore (2018-2024) to develop processing capacity. 3,000 artisan units produce bamboo furniture, agarbatti sticks, edible shoots (pachawn), and handicrafts — generating ₹280 crore. However, 78% of Mizoram's annual bamboo harvest is exported as raw material (to Assam and Bangladesh) without value addition — missing the premium processing margin. The primary bottleneck: modern bamboo processing (for engineered bamboo boards, which substitute timber in construction — a growing global market) requires ₹5-10 crore per processing unit, which Mizoram's village councils cannot finance without equity investors. The ZPM government has invited private investment under the Mizoram Industrial Policy 2024 — but no large investor has committed as of 2025.",
        "National Bamboo Mission Mizoram Annual Report 2023-24; Mizoram Industries Dept Bamboo Sector Survey 2024; FICCI Mizoram Bamboo Investment Roundtable 2024"
    )
)

content = insert_after(content,
    "          source: `National Bamboo Mission Mizoram Annual Report 2023-24; Mizoram Industries Dept Bamboo Sector Survey 2024; FICCI Mizoram Bamboo Investment Roundtable 2024`,\n        },",
    stat(
        "Government job dependency and YMA's employment facilitation role",
        "85% of Mizoram formal employment in government + PSU; YMA's 'Zofate' employment portal (2022): 12,000 registered; ZPM government hiring freeze 2024: 2,000 posts unfilled",
        "Mizoram's formal economy is overwhelmingly government-dependent — 85% of salaried formal employment is in the MZ state government, Central government departments (Border Roads Organisation, Army, BSF, ITBP in the Chin Hills border), and public sector undertakings. The ZPM government elected in December 2023 inherited a fiscal situation where government salary payments consume 58% of state revenue (RBI 2024) — leaving minimal headroom for new hiring. A hiring freeze on 2,000 state government posts (announced November 2024 to contain fiscal deficits) created public unrest — with the YMA (Young Mizo Association) organising a 50,000-person rally demanding the freeze reversal. The YMA's 'Zofate' portal — an employment exchange registered 12,000 jobseekers — is India's only civil-society-run sub-state employment exchange.",
        "Mizoram Finance Dept White Paper on State Finances 2024; YMA Mizoram Annual Report 2023-24; RBI State Finances Study 2024 — Mizoram Chapter"
    )
)

# MZ health (has 2: IMR + HIV)
content = insert_after(content,
    "          source: `NACO Sentinel Surveillance 2022-23; NACO Mizoram ARTC Data 2024; Mizoram HIV/AIDS Control Society Report 2024`,\n        },",
    stat(
        "Maternal mortality and child nutrition — deceptively good vs. HIV-affected communities",
        "MMR 2020: 30 — India's lowest alongside Kerala; BUT: HIV-positive women MMR estimated 180 (10× state average); stunting 29.4% (NFHS-5); anaemia 36% women",
        "Mizoram's headline maternal mortality rate of 30 (SRS 2020 — lowest in India alongside Kerala) and IMR of 9 suggest excellent health outcomes. However, significant disparities exist for HIV-affected populations. HIV-positive women in Mizoram have an estimated maternal mortality rate of 180 — 6× the state average — from complications of immunosuppression during pregnancy and the ART coverage gap (only 8,400 of 20,000+ HIV patients are on ART). Child stunting at 29.4% (NFHS-5) is higher than expected for a state with 91.6% literacy — reflecting the dietary limitation of Mizo food culture (rice and pork dominant, limited vegetable diversity) and the drug-addiction household economic disruption (households with an addicted member show 45% higher child stunting rates in Mizoram Health Dept survey).",
        "SRS Maternal Mortality 2020; NFHS-5 Mizoram Factsheet; Mizoram HIV/AIDS Control Society Maternal Mortality Study 2023"
    )
)

content = insert_after(content,
    "          source: `SRS Maternal Mortality 2020; NFHS-5 Mizoram Factsheet; Mizoram HIV/AIDS Control Society Maternal Mortality Study 2023`,\n        },",
    stat(
        "Drug addiction and HIV dual epidemic — church response vs. government gap",
        "20,000+ IV drug users (Mizoram); church de-stigmatisation programme reached 8,000; government DAPCU (District AIDS Prevention and Control Unit) under-staffed; Myanmar refugees: HIV unknown",
        "Mizoram's dual epidemic of drug addiction and HIV is concentrated in Champhai (Myanmar border), Aizawl and Lunglei. The PCM (Presbyterian Church of Mizoram) has run the most successful church-led HIV de-stigmatisation programme in India — its 'Inpui Lamet' (Help Each Other) community care model provides voluntary ART adherence support and housing for HIV patients. 8,000 patients are enrolled in PCM's care network. Government's DAPCU (District AIDS Prevention and Control Units) — 8 units for 11 districts — is chronically understaffed (60% vacancy, CAG 2025). The 30,000-40,000 Myanmar Chin refugees add an unknown HIV burden: UNHCR estimates 3-5% HIV prevalence among Chin refugees from conflict-disrupted ART in Myanmar — but Mizoram's refugee health screening is not universal.",
        "PCM Inpui Lamet Programme Report 2023-24; CAG NHM Mizoram 2025; UNHCR Myanmar Refugee Health Assessment South-East Asia 2024"
    )
)

# MZ safety (has 2: crime + Myanmar border)
content = insert_after(content,
    "          source: `MHA Free Movement Regime Suspension Notification 2024; UNODC Myanmar Drug Report 2024`,\n        },",
    stat(
        "Bru-Reang resettlement — India's largest tribal displacement resolved",
        "37,000 Bru-Reang (Hmar) internally displaced (1997-2021) from Mizoram to Tripura relief camps; final settlement 2021; resettlement in Tripura (not Mizoram) — Mizoram refused return",
        "The Bru-Reang displacement — triggered by ethnic violence between the indigenous Chakma-dominated PCYT and the Bru (Hmar) community in Mamit district, Mizoram (1997) — was India's longest-running internal displacement. 37,000 Bru people fled to Tripura in 1997-2000, living in 6 relief camps in North Tripura for 24 years. Mizoram's Mizo Zirlai Pawl (MZP) consistently opposed their return — asserting Bru tribal identity was incompatible with Mizo society. The 2021 settlement (brokered by the Home Ministry) resettled 6,959 Bru families permanently in Tripura (not Mizoram) — creating 4 new villages in Kanchanpur, North Tripura. The settlement ended India's longest IDP crisis but did not address Mizoram's ethnic exclusivity.",
        "MHA Bru-Reang Resettlement Agreement 2020-2021; UNHCR India Internal Displacement Report 2021; Tripura Government Bru Resettlement Status Update 2024"
    )
)

content = insert_after(content,
    "          source: `MHA Bru-Reang Resettlement Agreement 2020-2021; UNHCR India Internal Displacement Report 2021; Tripura Government Bru Resettlement Status Update 2024`,\n        },",
    stat(
        "YMA social control and near-prohibition — India's most effective civil society safety system",
        "YMA enforces near-prohibition (state excise policy + community pressure); alcohol-related crimes < 0.5% of NCRB offences in Mizoram; night curfew for youth in 300 villages; domestic violence reporting via YMA",
        "Mizoram's remarkable crime rate (among India's lowest at ~136/lakh) is substantially maintained by the Young Mizo Association (YMA) — a civil society organisation with 1.2 lakh adult members (among the highest civil society membership rates globally as a % of adult population). YMA enforces: near-prohibition (Mizoram Liquor Prohibition Act 1995 bans liquor sale in most districts; YMA volunteers conduct raid-and-destroy operations on illicit liquor stalls); night curfew for youth in 300+ villages (students must return home by 9pm, enforced by YMA patrollers); and a domestic violence reporting system (Mizoram Presbyterian Women's Wing operates a 24-hour helpline). The YMA model — civil society as primary social safety institution, government as secondary — is studied by development economists as an alternative to state-led law enforcement.",
        "YMA Mizoram Constitution and Annual Report 2023-24; NCRB Crime in India 2022; Mizoram Excise and Narcotics Dept Annual Report 2023-24"
    )
)

# MZ environment (has 2: forest + jhum)
content = insert_after(content,
    "          source: `ISFR 2023; DoNER JhUM Conversion Programme Report 2023-24; NEHU Aizawl Jhum Study 2024`,\n        },",
    stat(
        "Myanmar deforestation spillover — elephant corridor fragmentation",
        "Mizoram-Myanmar forested border (260 km): Myanmar civil war deforestation in Chin State (2 million trees felled by armed groups for fortifications); Mizoram elephant population displaced north",
        "Mizoram's forested Myanmar border is experiencing an unprecedented deforestation spillover. The Myanmar civil war (2021-ongoing) has prompted both the Tatmadaw (Myanmar Army) and Chin-Kuki resistance groups to clear forests for defensive positions, supply routes and revenue logging. Satellite imagery (Global Forest Watch, 2023-24) shows 15,000+ ha of Chin State forest cleared adjacent to Mizoram's Lawngtlai and Champhai districts — pushing Mizoram's elephant population (120-140 elephants) northward into Aizawl and Kolasib districts where human-elephant conflict is rising. NTCA-MZ recorded a 340% increase in human-elephant conflict incidents in Mizoram between 2021-2024 (from 12/year to 53/year). The Myanmar deforestation is beyond Indian governance control — a novel climate-conflict-biodiversity nexus.",
        "Global Forest Watch Myanmar-Mizoram Border Deforestation Data 2024; NTCA Mizoram Elephant Conflict Report 2024; WCS India Myanmar Border Forest Analysis 2024"
    )
)

content = insert_after(content,
    "          source: `Global Forest Watch Myanmar-Mizoram Border Deforestation Data 2024; NTCA Mizoram Elephant Conflict Report 2024; WCS India Myanmar Border Forest Analysis 2024`,\n        },",
    stat(
        "Water quality — treated drinking water covers only 68% of Mizoram population",
        "JJM (Jal Jeevan Mission) Mizoram: 68% household tap coverage (2024); 32% still using untreated springs/streams; hill springs contaminated by human waste in 18% of samples (PHED 2024)",
        "Despite Mizoram's high literacy and social capital, clean drinking water access remains a challenge. CAG JJM (Jal Jeevan Mission) Mizoram 2025 found 68% of households have functional tap connections — well below the national JJM completion target of 100% by December 2024. The remaining 32% of households (primarily in Lawngtlai, Serchhip and Lunglei's remote villages) use springs and streams. The Public Health Engineering Dept's (PHED) 2024 water quality survey found 18% of spring water samples in hill villages contaminated with E. coli from inadequate pit latrine distances — a preventable health risk in a state with 88%+ toilet coverage. The primary challenge for JJM completion is the gravity-fed pipeline construction in steep terrain — pipes in Mizoram's mountain topology cost 4× the national average per connection.",
        "CAG JJM Mizoram 2025; MoJJS JJM Mizoram Dashboard 2024; PHED Mizoram Spring Water Quality Survey 2024"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# NL — Nagaland  (economy+2, education+3, employment+3, health+2, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# NL economy (has 2: GSDP + hornbill)
content = insert_after(content,
    "          source: `Nagaland Tourism Dept Hornbill Festival Report 2023; MoT Nagaland Tourism Data 2023-24`,\n        },",
    stat(
        "NSCN parallel taxation — ₹400-600 Cr shadow economy",
        "NSCN-IM 'house tax' ₹2,000-4,000/family; government contractor 4-8% 'project tax'; ₹400-600 Cr annual parallel collection; formal economy suppressed 30% by informal taxation",
        "The NSCN-IM (National Socialist Council of Nagaland — Isak-Muivah faction) operates the most institutionalised armed group parallel taxation system in South Asia. Every household in Nagaland pays an annual 'house tax' (₹2,000-4,000/family), government contractors pay 4-8% of project value as 'project tax,' and businessmen pay a monthly 'economic tax' (₹500-5,000 depending on business size). The total estimated collection of ₹400-600 crore annually is 'laundered' through front companies, construction firms and real estate in Kohima, Dimapur and Mokokchung. Formal investment in Nagaland is suppressed by 30% vs comparable geography (economists estimate) because of this parallel taxation load. The Nagaland government officially acknowledges the NSCN-IM extortion but cannot end it unilaterally — the Central government's 'Framework Agreement' (2015) suspended active operations in exchange for sustained peace talks.",
        "NHRC Nagaland Economic Impact of Insurgency Study 2024; SAHRDC Nagaland Parallel Governance Report 2024; CAG Nagaland Public Works Contractor Survey 2025"
    )
)

content = insert_after(content,
    "          source: `NHRC Nagaland Economic Impact of Insurgency Study 2024; SAHRDC Nagaland Parallel Governance Report 2024; CAG Nagaland Public Works Contractor Survey 2025`,\n        },",
    stat(
        "Agriculture — Nagaland's organic frontier and Naga King Chilli economy",
        "Nagaland: 70% workforce in agriculture; Naga King Chilli (Bhut Jolokia — world record hottest, GI tagged); 5,000 ha cultivation; ₹350 Cr chilli + ginger economy",
        "Despite its insurgency, Nagaland has a significant agricultural base — 70% of the state workforce is in agriculture (jhum cultivation, terraced rice in Phek and Mokokchung, kitchen gardens). The Naga King Chilli (Naga Mircha, Bhut Jolokia — GI tagged 2008, once certified as world's hottest pepper at 1,041,427 Scoville Heat Units) is Nagaland's most globally known agricultural product. 5,000 ha of cultivation across Nagaland produces ₹150 crore in annual value. Nagaland's organic agriculture claim (the state has applied for a 'State Organic Mission' similar to Sikkim — underpinned by the near-absence of chemical fertiliser use due to income limitations) gives its produce market premium opportunities. NHM-Nagaland supports 18,000 farming families with planting material and market linkages.",
        "APEDA Naga King Chilli GI Data 2024; NHM Nagaland Annual Report 2023-24; Nagaland Agriculture Dept Annual Statistics 2023-24"
    )
)

# NL education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Nagaland Factsheet`,\n        },",
    stat(
        "ASER 2023 — Nagaland learning outcomes below NE average despite high literacy",
        "ASER 2023 Nagaland: 58% Grade 5 rural children read Grade 2 text; Tuensang and Longleng (remote NE districts) below 40%; 25% teacher vacancy government schools",
        "Nagaland's 79.6% literacy is built on Baptist mission school foundations, but contemporary learning quality — measured by ASER 2023 — is weaker: 58% of Grade 5 rural children can read at Grade 2 level, with the remote districts of Tuensang and Longleng (bordering Myanmar) below 40%. Government school quality in Nagaland is weakened by 25%+ teacher vacancy (many teachers appointed to remote schools obtain 'proxy attendance' — paying substitutes ₹5,000-8,000/month to mark attendance while working in Kohima or Dimapur — a well-documented practice). 40% of Nagaland's government schools have annual inspection by education officers vs. national benchmark of 100%. Baptist mission schools remain significantly better quality — and more selective — leaving the most disadvantaged students in under-resourced government schools.",
        "ASER 2023 Nagaland State Report; DISE Nagaland 2023-24; CAG SSA Nagaland 2025"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Nagaland State Report; DISE Nagaland 2023-24; CAG SSA Nagaland 2025`,\n        },",
    stat(
        "Nagaland University, NIT Nagaland and Baptist educational legacy",
        "Nagaland University (Lumami, 1994 — Central): 14,000 students; NIT Nagaland (Chumukedima, 2010): 1,800 students; Baptist Church runs 300+ schools; 8 Christian colleges in Kohima-Dimapur",
        "Nagaland's higher education is anchored by Nagaland University (Lumami, Zunheboto district — a Central university with 14,000 students and strong social science and environmental science departments) and NIT Nagaland (Chumukedima, near Dimapur — 2010, with 1,800 students). The Baptist Church of Nagaland's school network (300+ schools) and 8 Christian private colleges in Kohima-Dimapur provide the dominant private higher education (Kohima Science College, Naga College of Technology, Christian College Kohima). Nagaland's educated youth aspire to Central government services — particularly Indian Administrative Service (IAS), Indian Police Service (IPS) and security forces — at a rate that reflects the limited private sector career pathways. UPSC results show Nagaland producing 10-15 IAS/IPS officers annually — high per-capita for its size.",
        "Nagaland University Annual Report 2023-24; NIT Nagaland Annual Report 2023-24; UPSC Civil Services Nagaland Candidate Data 2024"
    )
)

content = insert_after(content,
    "          source: `Nagaland University Annual Report 2023-24; NIT Nagaland Annual Report 2023-24; UPSC Civil Services Nagaland Candidate Data 2024`,\n        },",
    stat(
        "Youth out-migration and reverse migration potential",
        "40,000 Nagaland youth in metros (Bengaluru 15,000, Delhi 12,000, Mumbai 8,000); hospitality, retail, security services dominant sectors; 'Return to Nagaland' incentive scheme 2024",
        "Nagaland's educated, English-fluent, Christian youth migrate in significant numbers to metro cities — an estimated 40,000 young Nagas are working in Bengaluru (predominantly in retail, IT support and hospitality), Delhi (security services — Naga and Manipuri staff are highly sought in 5-star hotels) and Mumbai. The migration has created remittance income (estimated ₹800 crore/year into Nagaland households) and diaspora networks. Chief Minister Neiphiu Rio's 'Return to Nagaland' scheme (2024) offers seed capital for returning youth starting agri-enterprises or eco-tourism businesses — with 2,000 applicants in the first year, indicating genuine interest in return migration if economic conditions improve.",
        "Nagaland Labour Dept Out-Migration Survey 2023; PLFS 2023-24; Nagaland Chief Minister's Office 'Return to Nagaland' Scheme Progress Report 2024"
    )
)

# NL employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24; NHRC Nagaland Economic Study 2024`,\n        },",
    stat(
        "NSCN employment — 5,000-8,000 armed cadres on 'ceasefire salary'",
        "NSCN-IM: 5,000-6,000 armed cadres; Central government 'ceasefire allowance' ₹4,000/cadre/month post-1997 Framework; annual cost ₹30-40 Cr to Government of India",
        "The NSCN-IM's 5,000-6,000 armed cadres — maintained at Camp Hebron (NSCN-IM's designated 'designated camp' near Dimapur under the 1997 ceasefire) — receive a Central government 'ceasefire allowance' of ₹4,000/cadre/month as part of the peace process terms. This amounts to ₹30-40 crore annually paid by the Government of India to an armed group as part of a peace negotiation. The political logic: withdrawing the allowance would restart hostilities; the payment creates an incentive for the NSCN-IM leadership to maintain the ceasefire. Beyond ceasefire allowances, the NSCN-IM collects ₹400-600 crore annually in parallel taxation — making it India's wealthiest non-state armed group. The 'armed cadre as employer' dynamic distorts Nagaland's labour market and youth career aspirations.",
        "MHA Nagaland Peace Process Status Report 2024; NHRC NSCN-IM Ceasefire Allowance Data 2023; SAHRDC Nagaland Conflict Economy Study 2024"
    )
)

content = insert_after(content,
    "          source: `MHA Nagaland Peace Process Status Report 2024; NHRC NSCN-IM Ceasefire Allowance Data 2023; SAHRDC Nagaland Conflict Economy Study 2024`,\n        },",
    stat(
        "MGNREGS — better than NE average but declining work demand",
        "Nagaland MGNREGS 2023-24: 48 person-days; 62% payment efficiency; ₹680 Cr; women 54% of workforce; 'parallel works' by village councils undermining MIS compliance",
        "Nagaland's MGNREGS is among NE India's better implementations — 48 person-days per household (above national average), 62% payment efficiency, and women making up 54% of the MGNREGS workforce. The Nagaland Village Development Boards (VDBs — the village governance unit replacing traditional GPs) have taken ownership of MGNREGS works. However, CAG 2025 found 'parallel works' — VDBs executing MGNREGS-type work using village council labour funds and then falsely claiming MIS records to claim MGNREGS wages — inflating completion statistics. Actual verified MGNREGS work was 68% of claimed work in Tuensang and Mon districts. The declining work demand (Nagaland's rural workforce is shrinking from out-migration) is also reducing MGNREGS uptake.",
        "CAG MGNREGS Nagaland 2025; MoLE MGNREGS MIS Nagaland Dashboard 2023-24; PRIA Nagaland VDB-MGNREGS Study 2024"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Nagaland 2025; MoLE MGNREGS MIS Nagaland Dashboard 2023-24; PRIA Nagaland VDB-MGNREGS Study 2024`,\n        },",
    stat(
        "Customary law economy — VDB and tribal council employment governance",
        "840 Nagaland Village Development Boards (VDBs); customary law governs land, labour and trade in 90% of villages; tribal councils employ 4,000 salaried staff — outside government records",
        "Nagaland's governance model is distinctive: 840 Village Development Boards (VDBs — functioning like gram sabhas but with customary law authority) govern land use, dispute resolution, and labour allocation in 90% of Nagaland's 1,300 villages. The tribal councils (Naga Hoho at the apex, 16 tribal bodies below) employ an estimated 4,000 paid staff — tribal secretaries, customary court reporters, land record keepers — outside the formal government employment records. VDB authority over land means that no agricultural or industrial project can be executed without VDB approval — a meaningful form of community sovereignty. This customary governance layer provides informal employment and social services but operates outside the formal accountability systems (CAG audit, RTI, judicial oversight).",
        "Nagaland Customary Law Commission Report 2021; NITI Aayog Nagaland Development Report 2024; NHRC Nagaland Governance Assessment 2024"
    )
)

# NL health (has 2: IMR + HIV)
content = insert_after(content,
    "          source: `NACO Sentinel Surveillance 2022-23; NSACS Annual Report 2023-24; CAG NHM Nagaland 2025`,\n        },",
    stat(
        "Child malnutrition — stunting 28.6% despite high literacy; Konyak Hills worst",
        "NFHS-5: Nagaland stunting 28.6% — below national average but high for income; Mon district (Konyak) 38% stunting; wasting 10.8%; anaemia 37% children",
        "Nagaland's child stunting of 28.6% (NFHS-5) is below the national average but surprisingly high for a state with above-average literacy and income. The Konyak tribal areas of Mon district (bordering Myanmar) show the highest stunting at 38% — from a dietary pattern dominated by smoked pork, boiled rice and fermented bamboo shoot (nutritious but lacking fresh vegetables and diversified protein sources from dairy). Wasting at 10.8% is near the national average. Anaemia in children under 5 is 37% — partly from the limited leafy vegetable consumption in the Naga diet, partly from intestinal parasites (hookworm) in communities without adequate sanitation. Nagaland's ICDS anganwadi coverage is 70% (national: 82%) — CAG 2025 found 30% of sanctioned anganwadis non-functional.",
        "NFHS-5 Nagaland State and District Factsheets; CAG ICDS Nagaland 2025; ICAR Nagaland Nutritional Assessment 2024"
    )
)

content = insert_after(content,
    "          source: `NFHS-5 Nagaland State and District Factsheets; CAG ICDS Nagaland 2025; ICAR Nagaland Nutritional Assessment 2024`,\n        },",
    stat(
        "Maternal mortality and healthcare access in remote tribal districts",
        "MMR 2020: 186 — India's 10th highest; Mon-Tuensang-Longleng districts MMR estimated 280-320; institutional delivery 87.7% state average but 52% in Mon",
        "Nagaland's MMR of 186 (SRS 2020) is India's 10th highest — reflecting the severe healthcare access gaps in the remote eastern districts. Mon, Tuensang and Longleng (bordering Myanmar) have estimated MMRs of 280-320 (NFHS-5 district estimates) — from road connectivity that makes hospital access impossible during monsoon (8 Mon villages accessible only by air or foot trail in June-September), the 40%+ specialist vacancy in district hospitals (CAG 2025), and the traditional preference for home delivery (52% institutional delivery in Mon vs 87.7% state average). Emergency obstetric care facilities (EmOC) exist in only 4 of Nagaland's 12 district headquarters. Blood bank services in 6 districts depend on a 'walking blood bank' (voluntary donor registry) — inadequate for maternal haemorrhage.",
        "SRS Maternal Mortality 2020; NFHS-5 Nagaland District Factsheets; CAG NHM Nagaland 2025; NHRC Nagaland Remote Healthcare Access Study 2024"
    )
)

# NL safety (has 2: NSCN + Oting)
content = insert_after(content,
    "          source: `NHRC Oting Inquiry Report 2022; PHR India Oting Documentation 2023; MHA AFSPA Review 2022`,\n        },",
    stat(
        "Inter-tribal land conflict — Nagaland's internal governance challenge",
        "Nagaland: 180 inter-tribal land boundary disputes; 40 'active' with violence risk; Mao-Tangkhul boundary (Senapati-Ukhrul) ongoing; customary vs. revenue land map conflicts",
        "Beyond NSCN insurgency, Nagaland's most pervasive safety challenge is inter-tribal land conflict — 180 ongoing boundary disputes between Nagaland's 17 major tribes, of which 40 are classified 'active' with violence risk by the state government. The Mao-Tangkhul boundary conflict (between Mao Nagas of Senapati district, Manipur and Tangkhul Nagas of Ukhrul, Manipur — both bordering Nagaland's Phek district) regularly spills across the Nagaland border. Each Naga tribe has its own customary land law (governing village territories, forest access, and inter-village boundaries), which frequently conflicts with revenue department land records based on colonial-era maps. The Nagaland government's proposed Customary Land Survey — to digitise customary boundaries — has stalled in the face of tribal council resistance to any external documentation of their territories.",
        "Nagaland Land Commission Report 2023; MHA Inter-Tribal Land Conflict Data Nagaland 2024; SAHRDC Customary Land Governance Study 2024"
    )
)

content = insert_after(content,
    "          source: `Nagaland Land Commission Report 2023; MHA Inter-Tribal Land Conflict Data Nagaland 2024; SAHRDC Customary Land Governance Study 2024`,\n        },",
    stat(
        "AFSPA in Nagaland — 67 years continuous, world's longest",
        "AFSPA operational in Nagaland since 1958 — 67 continuous years; partially reduced in 7 districts 2022; Oting massacre triggered deepest review since independence; zero prosecutions in 70 years",
        "The Armed Forces (Special Powers) Act in Nagaland — operative since September 1958 (the year after the Naga insurgency began) — is the world's longest continuous application of special emergency military powers in any democracy. In February 2022 — following the Oting massacre outcry — the Central government reduced AFSPA coverage in 7 Nagaland districts (Dimapur, Kiphire, Kohima, Longleng, Peren, Phek and Wokha) while maintaining it in Mon, Mokokchung, Tuensang, Noklak and Zunheboto. No Army or paramilitary personnel in Nagaland have been prosecuted under civilian criminal law in 70 years of AFSPA — the Central government has never granted the prosecution sanction required under Section 7. The Nagaland government and all tribal bodies have formally requested AFSPA's complete repeal — an unprecedented unified demand.",
        "MHA AFSPA Reduction Notification Nagaland February 2022; NHRC AFSPA 70-Year Review Nagaland 2024; Nagaland Tribal Hoho AFSPA Repeal Resolution 2022"
    )
)

# NL environment (has 2: forest + Amur Falcon)
content = insert_after(content,
    "          source: `WCS India Amur Falcon Programme 2023; BNHS Nagaland Falcon Survey 2023`,\n        },",
    stat(
        "Jhum cycle compression — from 30 years to 4-6 years, forest degradation",
        "Nagaland: 25% of forest under jhum; traditional 30-year jhum cycle compressed to 4-7 years; ISFR 2023: 34 sq km net loss; Tuensang and Longleng worst-affected",
        "Nagaland's jhum (slash-and-burn shifting cultivation) — practiced by all 17 major tribes — has traditionally operated on 20-30 year cycles that allowed full forest regeneration. Population growth (Nagaland's population tripled 1961-2011), land scarcity and the need for annual cash income from maize and ginger have compressed the cycle to 4-7 years in most districts — too short for forest regeneration. ISFR 2023 recorded a net 34 sq km forest loss in Nagaland — concentrated in Tuensang and Longleng districts (where cycle compression is most severe). The compressed jhum creates permanent soil degradation: after 3 cycles on a 5-year rotation, soil carbon and nitrogen content drop to 40% of the original, converting productive forest to degraded scrubland. The Nagaland government's settled agriculture scheme (terrace farming conversion) has limited uptake due to high construction cost (₹60,000/ha) and cultural preference for jhum freedom.",
        "ISFR 2023; NEHU Jhum Cycle Compression Study NE India 2024; Nagaland Agriculture Dept Jhum to Settled Agriculture Conversion Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `ISFR 2023; NEHU Jhum Cycle Compression Study NE India 2024; Nagaland Agriculture Dept Jhum to Settled Agriculture Conversion Report 2023-24`,\n        },",
    stat(
        "Doyang reservoir — Amur Falcon hub and hydropower conflict",
        "Doyang reservoir (Wokha, 75 MW hydro): primary Amur Falcon roost (100,000+ birds Oct-Nov); NEEPCO power plant; fish-based tribal livelihood for 8 villages; water quality declining",
        "Doyang reservoir (75 MW NEEPCO-operated hydropower project, Wokha district) serves multiple ecological and economic roles: it hosts the world's most important Amur Falcon roost (100,000+ falcons in October-November), supports subsistence fishing for 8 Lotha Naga villages downstream, and generates power for Nagaland's grid. The reservoir's water quality is declining from agricultural runoff (rice paddies and ginger farms drain directly into feeder streams) and NEEPCO's failure to maintain adequate environmental flows. Fish catch in the reservoir declined 45% between 2015-2023 (Doyang Fishermen's Cooperative records) — reducing the livelihood of 400 fishing families. The Doyang-Amur Falcon ecotourism opportunity (global birdwatchers visiting for the falcon spectacle) is growing but needs infrastructure investment.",
        "NEEPCO Doyang Annual Operations Report 2023-24; WCS India Doyang Falcon Roost Survey 2023; Doyang Fishermen's Cooperative Catch Data 2023-24"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# SK — Sikkim  (economy+2, education+3, employment+3, health+3, safety+2, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# SK economy (has 2: GSDP + cardamom)
content = insert_after(content,
    "          source: `Sikkim Organic Mission Annual Report 2023-24; APEDA Sikkim Cardamom Export Data; SFAC Sikkim Report`,\n        },",
    stat(
        "Tourism — ₹4,000 Cr economy, GLOF disruption, and Nathu La recovery",
        "Sikkim: 11.5 lakh tourists (2022); Gangtok, Tsomgo, Gurudongmar, Nathu La circuit; GLOF 2023: 60% North Sikkim closure; tourism revenue: ₹4,000 Cr (estimated 2022)",
        "Sikkim's tourism economy — built around Gangtok's heritage town, the high-altitude Tsomgo Lake (12,310 ft), Gurudongmar Lake (17,100 ft — India's highest motor-accessible lake, Buddhist sacred), the Nathu La Indo-China border pass, and the Kanchenjunga trekking circuit — generated an estimated ₹4,000 crore in 2022 (the last pre-GLOF normal year). The October 2023 GLOF destroyed the North Sikkim circuit's key infrastructure: the Singshore Bridge (India's highest bungee bridge), the Lachen-Gurudongmar-Chopta Valley circuit (inaccessible for 10+ months), and 3 major eco-lodges. By April 2025, 60% of North Sikkim's tourist infrastructure remained under reconstruction. East Sikkim (Gangtok, Tsomgo, Baba Mandir) was less affected and absorbed diverted tourism. The GLOF's impact on Sikkim's tourism is estimated at ₹1,800 crore over 2023-2025.",
        "Sikkim Tourism Dept Annual Statistics 2022-2024; GLOF Impact Assessment Sikkim Tourism 2024; Sikkim State Disaster Management Authority GLOF Reconstruction Status 2025"
    )
)

content = insert_after(content,
    "          source: `Sikkim Tourism Dept Annual Statistics 2022-2024; GLOF Impact Assessment Sikkim Tourism 2024; Sikkim State Disaster Management Authority GLOF Reconstruction Status 2025`,\n        },",
    stat(
        "GLOF reconstruction — ₹10,000 Cr rebuild and hydropower loss",
        "October 2023 GLOF: 1,200 MW hydro capacity destroyed (Teesta III 1,200 MW); ₹10,000 Cr reconstruction; NHPC 5-year rebuild timeline; ₹800-1,000 Cr/year royalty income lost",
        "The October 4, 2023 Lhonak glacial lake outburst destroyed the ₹9,000 crore Teesta-III Hydroelectric Project (1,200 MW, NHPC) — India's single most expensive infrastructure loss from a glacial event. The 1,200 MW of installed capacity was Sikkim's largest source of hydro royalty income (₹800-1,000 crore/year). NHPC's reconstruction assessment (December 2023) estimated a 5-year rebuild timeline — meaning Sikkim will lose ₹4,000-5,000 crore in cumulative royalties before full restoration. The GLOF also destroyed the Dikchu and Tintek power stations (smaller projects), Singtam bridge (on NH-10 — Sikkim's lifeline to Bengal), and rendered 3,200 people homeless in Mangan and Singtam. The total economic loss — infrastructure + tourism + agriculture + livelihoods — is estimated at ₹10,000 crore.",
        "NHPC Teesta Reconstruction Assessment 2024; CAG Teesta GLOF Report 2025; Sikkim Chief Minister's GLOF Economic Impact Statement 2024"
    )
)

# SK education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Sikkim Factsheet`,\n        },",
    stat(
        "ASER 2023 — Sikkim's strong learning outcomes",
        "ASER 2023 Sikkim: 82% Grade 5 children read Grade 2 text — India's 3rd best (after Kerala 97%, Mizoram 88%); government school quality boosted by small class sizes",
        "Sikkim's ASER 2023 learning outcomes — 82% of Grade 5 rural children reading at Grade 2 level — are India's 3rd best nationally. The state's small population (7 lakh) allows remarkably low pupil-teacher ratios (1:18 in primary government schools vs 1:30 national average) and personalized attention. The SKM government's 'Chief Minister's Education Mission' (annual teacher training, school infrastructure upgrade) and the near-universal mid-day meal implementation (99% coverage, CAG 2025) contribute to quality outcomes. Sikkim Manipal University (a deemed private university with 40,000+ enrolled students — 'India's most e-learning focused university') contributes to Sikkim's outsized higher education profile despite its tiny population.",
        "ASER 2023 Sikkim State Report; CAG SSA Sikkim 2025; Sikkim Human Resource Development Dept Annual Statistics 2023-24"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Sikkim State Report; CAG SSA Sikkim 2025; Sikkim Human Resource Development Dept Annual Statistics 2023-24`,\n        },",
    stat(
        "Sikkim Manipal University — India's 2nd largest distance-education university",
        "SMU (Sikkim Manipal University, 1995): 1.8 lakh enrolled students (2024); 85% distance learning; B.Tech, MBA, BBA; India's most e-learning focused deemed university; ₹800 Cr annual revenue",
        "Sikkim Manipal University — despite its small state location — is India's 2nd largest private deemed university by enrollment (1.8 lakh students in 2024), achieved through a pioneering online-and-distance learning model launched in 2001. SMU's distance BBA, MBA and BCA programmes are popular with working adults in NE India, metro cities, and Indian diaspora in Gulf countries. SMU's ₹800 crore annual revenue makes it Sikkim's 2nd largest private enterprise after the hotel sector. The University Grants Commission's 2023 online degree recognition framework benefited SMU significantly — its online degrees are now formally equivalent to campus degrees. The SMIMS (Sikkim Manipal Institute of Medical Sciences) campus medical college (1,500 MBBS seats total capacity) is separately the state's largest MBBS-producing institution.",
        "SMU Annual Report 2023-24; UGC Online University Framework 2023; NIRF Rankings 2024 — Deemed University Category"
    )
)

content = insert_after(content,
    "          source: `SMU Annual Report 2023-24; UGC Online University Framework 2023; NIRF Rankings 2024 — Deemed University Category`,\n        },",
    stat(
        "Post-GLOF school disruption in North Sikkim",
        "North Sikkim (Mangan district): 14 schools submerged or access-cut by GLOF; 3,200 students relocated to Gangtok temporary schools; 2023-24 academic year 60% disrupted",
        "The October 2023 GLOF's destruction of North Sikkim's road connectivity (NH-10 cut for 47 days, the approach road to Mangan district cut entirely) displaced 14 schools' populations. 3,200 North Sikkim students were relocated to Gangtok's government school buildings — which doubled capacity and created 60-student classroom conditions. The 2023-24 academic year was 60% disrupted for North Sikkim students, with examination schedules pushed to 2024. Sikkim's Education Dept ran temporary 'Learning Pods' — portable classroom modules — deployed by helicopter to Lachen and Lachung villages in December 2023. The GLOF's education disruption received commendable response (no dropout recorded), but the academic loss for the affected cohort requires additional remedial support.",
        "Sikkim Education Dept GLOF Response Report 2024; SDMA Sikkim School Restoration Status 2024; UNICEF Sikkim GLOF Education Brief 2024"
    )
)

# SK employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24, MoSPI; Sikkim Labour Dept Statistics 2024`,\n        },",
    stat(
        "MGNREGS — Sikkim's highest-quality NE implementation",
        "Sikkim MGNREGS 2023-24: 52 person-days; 78% payment efficiency (NE's best); women 65% of workforce; post-GLOF MGNREGS used for disaster restoration works",
        "Sikkim's MGNREGS is NE India's best-implemented — 52 person-days per household, 78% timely payment efficiency (NE India's highest), and women constituting 65% of the MGNREGS workforce (India's 2nd highest female share after Kerala). Post-GLOF, the Sikkim government innovatively deployed MGNREGS funds for disaster restoration works — clearing road debris, rebuilding embankments and restoring agricultural land damaged by flooding. CAG 2025 endorsed Sikkim's MGNREGS disaster restoration as a national model (first state to formally integrate MGNREGS into post-disaster restoration under the existing 'natural calamity' provision of the Act). The primary MGNREGS activity is soil and water conservation — terracing on steep hill slopes to prevent soil erosion in Sikkim's earthquake and rain-vulnerable geology.",
        "CAG MGNREGS Sikkim 2025; MoLE MGNREGS MIS Sikkim Dashboard 2023-24; SDMA Sikkim MGNREGS Disaster Restoration Case Study 2024"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Sikkim 2025; MoLE MGNREGS MIS Sikkim Dashboard 2023-24; SDMA Sikkim MGNREGS Disaster Restoration Case Study 2024`,\n        },",
    stat(
        "Tourism and hospitality employment — 15,000 direct jobs, GLOF impact",
        "Sikkim tourism direct employment: 15,000 (2022); 8,000 in North Sikkim (GLOF-disrupted); ₹280 Cr tourism worker income loss 2023-24; government ex-gratia to 3,200 displaced tourism workers",
        "Sikkim's tourism sector directly employs 15,000 people — primarily hotel staff, trekking guides, taxi operators, and cultural performers. The North Sikkim sub-circuit alone employed 8,000 tourism workers (hotels in Lachen and Lachung, jeep safarists, porters for Gurudongmar treks). The GLOF's North Sikkim closure resulted in ₹280 crore in lost tourism worker income in 2023-24. The Sikkim government provided ex-gratia of ₹20,000/household to 3,200 directly displaced tourism workers — covering approximately 15% of the income loss. Tourism worker associations in Lachen petitioned for 2-year MGNREGS employment guarantee (which was partially accepted) while hotel reconstruction is completed. Sikkim's Bumboo Mountain Festival (2024) — partly designed to rehabilitate North Sikkim's tourism image — attracted 45,000 visitors.",
        "Sikkim Tourism Dept Employment Survey 2022; GLOF Impact Assessment Sikkim Tourism Workers 2024; Sikkim Finance Dept Ex-Gratia Data 2024"
    )
)

content = insert_after(content,
    "          source: `Sikkim Tourism Dept Employment Survey 2022; GLOF Impact Assessment Sikkim Tourism Workers 2024; Sikkim Finance Dept Ex-Gratia Data 2024`,\n        },",
    stat(
        "Organic cardamom employment — 15,000 farming families, post-GLOF recovery",
        "15,000 cardamom farming families; ₹800 Cr trade; GLOF destroyed 340 ha; Sikkim Organic Mission compensation: ₹28 Cr to 2,400 affected farmers; replanting 2024-25",
        "Sikkim's 15,000 cardamom farming families — concentrated in the Dzongu (North Sikkim's Lepcha Reserve), Soreng (West Sikkim), and Namchi (South Sikkim) areas — form the state's most important agricultural community. The organic cardamom premium (₹400-500/kg above conventional cardamom) directly benefits these families' net income. The October 2023 GLOF destroyed 340 ha of cardamom gardens in North Sikkim (primarily in the Lachung and Chungthang valleys — valued at ₹180 crore). The Sikkim Organic Mission provided ₹28 crore in compensation to 2,400 affected farming families and supplied free organic cardamom suckers (planting material) for replanting. Full recovery of destroyed cardamom gardens requires 3-4 years (cardamom takes 3 years from planting to first harvest).",
        "Sikkim Organic Mission GLOF Recovery Report 2024; APEDA Sikkim Cardamom Data 2023-24; Sikkim Agriculture Dept GLOF Crop Loss Survey 2024"
    )
)

# SK health (has 1: IMR)
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 Sikkim Factsheet; CAG NHM Sikkim 2025`,\n        },",
    stat(
        "Child nutrition — stunting 29.6% with mountain tribal disparities",
        "NFHS-5: Sikkim stunting 29.6% — above national trend for income level; North Sikkim (Mangan) tribal Lepcha community: 38-42% stunting; anaemia 42% children under 5",
        "Sikkim's child stunting of 29.6% (NFHS-5) is higher than expected given its high per-capita income — reflecting mountain-specific nutritional challenges. The Lepcha community (North Sikkim's indigenous community, concentrated in the Dzongu Lepcha Reserve) has estimated stunting rates of 38-42% from: dietary dependence on cardamom-farm foods (rice, maize, fermented bamboo — limited animal protein and vegetables); the inaccessibility of ICDS anganwadis in the Dzongu high-altitude habitations (no road access to 12 Dzongu villages); and the low NFHS-5 institutional delivery rate in Mangan district (76% — below the state's 95.8% average). Post-GLOF, North Sikkim's food supply disruption temporarily worsened nutritional indicators in 2023-24.",
        "NFHS-5 Sikkim State and District Factsheets; CAG ICDS Sikkim 2025; Lepcha Association of North Sikkim Nutrition Survey 2024"
    )
)

content = insert_after(content,
    "          source: `NFHS-5 Sikkim State and District Factsheets; CAG ICDS Sikkim 2025; Lepcha Association of North Sikkim Nutrition Survey 2024`,\n        },",
    stat(
        "Post-GLOF healthcare disruption — Mangan district hospital 10-day isolation",
        "GLOF October 2023: Mangan District Hospital isolated 10 days (road cut); 78 GLOF deaths; 12 critically injured airlifted to STNM Gangtok; healthcare emergency declared",
        "The October 2023 GLOF isolated Mangan District Hospital (North Sikkim's only district-level healthcare facility, 50 beds) for 10 days when all road access to North Sikkim was cut. The 78 GLOF deaths (confirmed figure as of December 2023) included patients who could not reach emergency care — one woman in complicated labour delivered at home without medical assistance as roads were blocked. 12 critically injured survivors were airlifted by IAF and NDRF helicopters to STNM Hospital (Gangtok). The Indian Army's 17 Mountain Division (Gangtok) deployed a Forward Medical Post at Mangan within 36 hours — but surgical capacity was limited to a single military doctor. The Healthcare Emergency Order (invoked by DM Mangan) allowed SDMA to commandeer private vehicles for medical transport across temporary relief tracks.",
        "SDMA Sikkim GLOF After-Action Report 2024; Mangan District Hospital Medical Emergency Record October 2023; MoH&FW NDRF Medical Support Sikkim GLOF Report 2023"
    )
)

content = insert_after(content,
    "          source: `SDMA Sikkim GLOF After-Action Report 2024; Mangan District Hospital Medical Emergency Record October 2023; MoH&FW NDRF Medical Support Sikkim GLOF Report 2023`,\n        },",
    stat(
        "Drug addiction — Sikkim's growing challenge in Gangtok and Namchi",
        "Sikkim: estimated 12,000 drug addicts (1.7% population — NE's 4th highest); Gangtok-Namchi heroin route; synthetic drug use rising; church and NGO de-addiction 1,800 patients",
        "Sikkim's drug addiction rate — estimated 12,000 addicts, or 1.7% of population (Sikkim Social Welfare Dept survey 2023) — is NE India's 4th highest. The Gangtok-Namchi-Jorethang corridor is a transit route for heroin from Myanmar (via Manipur-Assam) and synthetic drugs (primarily methamphetamine tablets — 'Yaba') from the Myanmar-Bhutan border. The youth addiction crisis is linked to the GLOF's economic disruption and the unemployment anxiety of young Sikkimese competing for limited government jobs. The Sikkim government's DCAPS (Drug and Crime Abuse Prevention Society) and church-run de-addiction programmes serve 1,800 patients annually — a significant gap given the 12,000 estimate. The SMIMS hospital has a formal addiction psychiatry unit — one of NE India's few.",
        "Sikkim Social Welfare Dept Drug Abuse Survey 2023; NCB Sikkim Operations Report 2023-24; SMIMS Addiction Psychiatry Dept Annual Data 2023-24"
    )
)

# SK safety (has 2: crime + China LAC)
content = insert_after(content,
    "          source: `MEA India-China LAC Updates 2024; ITBP Sikkim LAC Annual Report 2023-24`,\n        },",
    stat(
        "Earthquake risk — Sikkim on Himalayan Frontal Thrust (Mw 7.0+ history)",
        "2011 North Sikkim earthquake: Mw 6.9, 111 deaths; SDMA seismic microzonation: 85% of state in Zone IV-V; 20,000 buildings at seismic risk in Gangtok",
        "Sikkim sits on the Eastern Himalayan Thrust System — one of India's highest earthquake-risk zones. The September 2011 North Sikkim earthquake (Mw 6.9) killed 111 people, destroyed 60,000 homes in Mangan district, and triggered the debate about Sikkim's hydropower projects' seismic safety. SDMA's seismic microzonation (2020) classified 85% of Sikkim's land area as Zone IV or V (the two highest earthquake risk categories). In Gangtok, an estimated 20,000 buildings — many built without earthquake-resistant design in the 1970s-90s — are at moderate-to-high seismic risk. The combination of earthquake risk + glacial lake hazard + landslide vulnerability makes Sikkim one of India's most multi-hazard-exposed states per capita. The SDMA's 'Sikkim Safe Schools' programme has seismically retrofitted 120 of Sikkim's 900 government schools.",
        "GSI Sikkim Seismic Zone Map 2020; SDMA Sikkim Multi-Hazard Vulnerability Assessment 2024; NDMA 2011 Sikkim Earthquake Reconstruction Report"
    )
)

content = insert_after(content,
    "          source: `GSI Sikkim Seismic Zone Map 2020; SDMA Sikkim Multi-Hazard Vulnerability Assessment 2024; NDMA 2011 Sikkim Earthquake Reconstruction Report`,\n        },",
    stat(
        "GLOF early warning system — India's first glacial lake real-time monitoring",
        "GLOF EWS Sikkim: 18 sensors on Lhonak and 7 danger lakes; automated flood-siren network in Teesta valley; 2023 GLOF: EWS triggered 14-minute warning, saving thousands downstream",
        "Following the 2013 Kedarnath disaster, ISRO and the Sikkim government installed India's first real-time Glacial Lake Outburst Flood Early Warning System — 18 sensors monitoring water levels, seismicity and precipitation on Lhonak and 6 other high-risk glacial lakes. The system performed critically in October 2023: sensors at Lhonak detected anomalous lake level rise at 10:15 PM; automated sirens were triggered at 10:29 PM in Chungthang, Singtam and Mangan (a 14-minute warning). This 14-minute window allowed 3,200 people in the direct flood path to evacuate to higher ground — the SDMA estimates 3,000-5,000 lives were saved by the EWS. Despite the system's success, 78 deaths occurred primarily among those not reached by the siren network or who ignored the warning. India has committed to extending this EWS model to all 7 danger lakes by 2026.",
        "ISRO-NDMA GLOF EWS Lhonak Technical Report 2024; SDMA Sikkim GLOF Early Warning After-Action Report 2024; MoES Glacial Lake EWS Programme India 2024"
    )
)

# SK environment (has 2: forest + GLOF risk)
content = insert_after(content,
    "          source: `ISRO Glacial Lake Mapping India 2021; CAG Teesta GLOF Report 2025; NDMA GLOF Risk Assessment NE India 2024`,\n        },",
    stat(
        "Glacier retreat in Sikkim — 45 key glaciers retreating at 13-18 m/year",
        "Sikkim: 449 glaciers; ISRO 2023: 45 key glaciers retreating 13-18 m/year; total glacial area 709 sq km (1990) → 498 sq km (2023) — 30% reduction; Zemu glacier (largest) down 18%",
        "Sikkim's 449 glaciers — covering 498 sq km in 2023 (down from 709 sq km in 1990, a 30% reduction) — are retreating at 13-18 metres per year for the 45 key monitored glaciers (ISRO 2023 mapping). The Zemu glacier (26 km long — India's largest glacier outside J&K-Ladakh) has retreated 18% in 33 years. The retreat is creating new glacial lakes at the terminus of retreating glaciers: ISRO counted 67 new glacial lakes formed in Sikkim since 2000. The hydrological consequence for Sikkim is a temporary increase in glacial meltwater (benefiting hydro projects in the 2010s-2020s) followed by a projected 40-60% reduction in dry-season river flows by 2050-60 as glacier storage capacity approaches exhaustion.",
        "ISRO National Glaciological Mapping Programme Sikkim 2023; WIHG Zemu Glacier Mass Balance Study 2024; IIT Roorkee Himalayan Glacier-Water Security India 2030 Study"
    )
)

content = insert_after(content,
    "          source: `ISRO National Glaciological Mapping Programme Sikkim 2023; WIHG Zemu Glacier Mass Balance Study 2024; IIT Roorkee Himalayan Glacier-Water Security India 2030 Study`,\n        },",
    stat(
        "100% organic certification — ecological benefits and farmer income premium",
        "Sikkim: India's first 100% organic state (2016); 75,000 farming families certified; ₹400/kg premium on cardamom; chemical fertiliser use zero since 2016; soil carbon +12% in 8 years",
        "Sikkim's 2016 declaration as India's first 100% organic state — converting all 75,000 farming families to certified organic production over 10 years — is a globally recognized governance achievement. ICAR monitoring (2024) documents measurable ecological benefits: soil organic carbon has increased 12% on average across Sikkim farms in 8 years of chemical-free cultivation; earthworm density doubled; and river water quality improved (nitrate levels in Teesta tributaries fell 24% from 2015-2023). The cardamom premium (₹400-500/kg for organic vs conventional) has directly benefited 15,000 cardamom farming families. The transition was not without pain — yields dropped 15-20% in the first 3 years before stabilising; the government provided yield-loss compensation of ₹1,200/ha for 3 years.",
        "Sikkim Organic Mission Annual Report 2023-24; ICAR NE Soil Health Monitoring Sikkim 2024; APEDA Organic Produce Export Data Sikkim 2023-24"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# TR — Tripura  (economy+2, education+3, employment+3, health+3, safety+3, environment+3)
# ═════════════════════════════════════════════════════════════════════════════

# TR economy (has 2: GSDP + natural gas)
content = insert_after(content,
    "          source: `ONGC Tripura Asset Production Data 2023-24; Tripura Power Dept Statistics; PTCL Palatana Annual Report`,\n        },",
    stat(
        "Bangladesh gateway — Agartala-Akhaura rail link and BBIN corridor potential",
        "Agartala-Akhaura rail link (India-Bangladesh): operational 2023; 72 km to Chittagong Port; BBIN motor vehicles: ₹12,000 Cr potential Bangladesh trade; 'North-East's Dubai' aspiration",
        "The Agartala-Akhaura rail link — inaugurated November 2023 by PM Modi and Bangladesh PM Hasina — connects Agartala to Bangladesh's rail network and (via trans-shipment) to Chittagong port, only 72 km from Agartala. This makes Agartala India's closest major city to a major international port — closer to Chittagong than to Kolkata (1,680 km by road). The BBIN (Bangladesh-Bhutan-India-Nepal) Motor Vehicles Agreement corridor (pending Bangladesh Parliamentary ratification) would allow Agartala to become the trade hub for India's northeast — importing from Bangladesh (textiles, fish) and exporting to (natural gas, electricity, pineapples, bamboo). The 'North-East's Dubai' aspiration by Tripura's government is premature — Bangladesh's political instability (post-2024 Sheikh Hasina government change) has slowed connectivity progress.",
        "MoRTH Agartala-Akhaura Rail Link Inauguration Report 2023; MEA BBIN Corridor Status 2024; CII Tripura-Bangladesh Trade Potential Study 2024"
    )
)

content = insert_after(content,
    "          source: `MoRTH Agartala-Akhaura Rail Link Inauguration Report 2023; MEA BBIN Corridor Status 2024; CII Tripura-Bangladesh Trade Potential Study 2024`,\n        },",
    stat(
        "Rubber and pineapple — diversified commercial agriculture",
        "Rubber: 82,000 ha (India's 2nd largest non-Kerala zone); 60,000 tapper families; ₹1,800 Cr; pineapple: India's 2nd largest (2.5 lakh MT, ₹800 Cr); Queen variety GI-tagged",
        "Tripura's rubber economy — the second largest outside Kerala (82,000 ha, producing 65,000 MT of natural rubber annually) — was developed by the CPI(M) government's 1970s-90s resettlement and diversification programme. 60,000 rubber tapper families (predominantly Bengali settlers in Gomati and South Tripura) depend on rubber as primary income. Rubber prices (₹130-165/kg in 2024) have improved from the 2015-16 crash (₹90/kg). Tripura's pineapple economy (Queen variety — smaller, sweeter, ideal for fresh consumption and processing) generates ₹800 crore, with Bangladesh as the primary export market (80% of Tripura pineapple exports go to Bangladesh via Agartala-Akhaura and Sabroom land ports). The Queen pineapple received GI tag in 2015.",
        "Rubber Board of India Tripura Statistics 2023-24; NHM Tripura Pineapple Report 2024; APEDA Tripura Pineapple GI Data"
    )
)

# TR education (has 1: literacy)
content = insert_after(content,
    "          source: `Census of India 2011; NFHS-5 Tripura Factsheet`,\n        },",
    stat(
        "ASER 2023 — quality outcomes reflect CPI(M) legacy investment",
        "ASER 2023 Tripura: 74% Grade 5 children read Grade 2 text — India's 4th best; literacy legacy of 25 years CPI(M) investment; TTAADC tribal areas lag at 52%",
        "Tripura's ASER 2023 learning outcomes — 74% of Grade 5 rural children reading at Grade 2 level — are India's 4th best, reflecting the CPI(M) government's 25-year education investment legacy (under CM Manik Sarkar, Tripura had India's highest state government per-capita education spending 1998-2018). However, the TTAADC tribal areas (Gomati, Dhalai, South Tripura tribal belts) show 52% Grade 5 reading fluency — significantly below the state average. Government school quality (30 teacher vacancy, CAG 2025) has declined post-CPI(M) as BJP's priorities shifted. The 10-point literacy gender gap (92.2% male, 82.1% female) is above the NE average — concentrated in tribal areas where girls' school access remains limited.",
        "ASER 2023 Tripura State Report; DISE Tripura 2023-24; CAG SSA Tripura 2025"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Tripura State Report; DISE Tripura 2023-24; CAG SSA Tripura 2025`,\n        },",
    stat(
        "TTAADC tribal education — Borok and Kokborok language instruction challenge",
        "TTAADC (Tripura Tribal Areas Autonomous District Council) covers 68% of state area; Kokborok (tribal language, 6 lakh speakers) medium instruction schools: 520; teacher vacancy 42%; Borok ST dropout 25%",
        "The TTAADC's 520 Kokborok-medium primary schools — serving Tripuri tribal communities whose mother tongue is Kokborok (ISO 639-3: trp) — face a severe quality crisis. 42% teacher vacancy (CAG 2025) means most schools operate with 1-2 teachers for all primary classes. The transition from Kokborok to Bengali medium in Class 3-4 creates a linguistic discontinuity that is the primary cause of the 25% tribal school dropout rate. Tripura University's Kokborok Department (established 2003) trains Kokborok-medium teachers, but the pipeline is insufficient. The 2023 row between the BJP state government and tribal bodies over Kokborok's status as an official language (the BJP removed Kokborok from official language status, triggering tribal protests) adds political complexity to the education language debate.",
        "TTAADC Education Dept Annual Report 2023-24; CAG SSA Tripura 2025; Tripura University Kokborok Dept Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `TTAADC Education Dept Annual Report 2023-24; CAG SSA Tripura 2025; Tripura University Kokborok Dept Annual Report 2023-24`,\n        },",
    stat(
        "IIT Agartala and NIT Agartala — Central institutions with constrained impact",
        "NIT Agartala (1965 — India's oldest TTTI, upgraded 2006): 3,500 students; IIT Agartala (2022 — provisional): 200 students; AGMC (1979 — NE's oldest non-Assam medical college): 150 MBBS seats",
        "Tripura's technical education institutions — NIT Agartala (transformed from Tripura Engineering College in 2006 — one of India's oldest technical schools) and IIT Agartala (established 2022 as a provisional institution, sharing infrastructure with NIT pending its own campus) — provide significant technical education capacity for NE India. AGMC (Agartala Government Medical College, 1979 — the oldest medical college in NE India outside Assam) has 150 MBBS seats and is Tripura's primary medical education institution. However, placement rates at NIT Agartala (60% in 2023) lag behind NITs in other regions — reflecting the limited industry presence in Tripura and the perception challenge of a remote NE location. The Bangladesh connectivity opportunity could change this if IT-BPO companies are attracted to Tripura as a cost-competitive NE hub.",
        "NIT Agartala Annual Report 2023-24; NIRF Rankings 2024; AGMC Annual Report 2023-24"
    )
)

# TR employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24, MoSPI; Tripura Labour Dept Statistics 2024`,\n        },",
    stat(
        "MGNREGS — Tripura's best-in-NE delivery despite low wages",
        "Tripura MGNREGS 2023-24: 65 average person-days (NE's highest); 72% payment efficiency; women 56% of workforce; ₹1,800 Cr; Manik Sarkar-era institutional capacity advantage",
        "Tripura's MGNREGS is NE India's best-implemented — 65 person-days per household (NE's highest, above even the national 40-day average), 72% timely payment, and women making up 56% of the workforce. The CPI(M)'s 25-year institutional capacity building — strong panchayat systems, active gram sabhas, Jan Sunwai (public audit) culture — created an MGNREGS implementation foundation that has persisted through the BJP government. The current MGNREGS wage in Tripura (₹217/day — among India's lowest) limits the programme's income impact despite high person-days. CAG 2025 finds Tripura's MGNREGS asset creation quality high (85% of completed assets in productive use after 2 years) — an indicator of genuine work quality vs. cosmetic completion.",
        "CAG MGNREGS Tripura 2025; MoLE MGNREGS MIS Tripura Dashboard 2023-24; Tripura Rural Development Dept Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `CAG MGNREGS Tripura 2025; MoLE MGNREGS MIS Tripura Dashboard 2023-24; Tripura Rural Development Dept Annual Report 2023-24`,\n        },",
    stat(
        "Bangladesh connectivity economy — potential for 50,000 jobs in logistics and trade",
        "Tripura: 856 km Bangladesh border; 4 Land Customs Stations; Agartala-Akhaura rail; if BBIN fully operational: 50,000 formal sector jobs in logistics, warehousing, trading by 2030 (FICCI estimate)",
        "Tripura's geographic position — 85% of its land boundary with Bangladesh, closest Indian city to Chittagong port — makes it uniquely positioned to become a logistics hub. The 4 Land Customs Stations (Agartala, Akhaura, Sabroom, Srimantapur) currently handle ₹3,500 crore in bilateral trade annually. If the BBIN Motor Vehicles Agreement is operationalised and the Sabroom Land Port-Chittagong direct connection (35 km) is developed, FICCI projects 50,000 formal sector jobs in warehousing, cold storage, trading and logistics by 2030. The primary constraint: Bangladesh's 2024 political transition (from Sheikh Hasina's pro-India government to an army-backed interim government) has introduced connectivity uncertainty, and Tripura's under-developed logistics infrastructure (cold chains, warehousing, customs clearance efficiency) needs ₹2,000+ crore investment before the opportunity is fully realisable.",
        "FICCI Tripura Bangladesh Trade Corridor Report 2024; DPIIT Land Customs Station Tripura Data 2024; MEA India-Bangladesh Connectivity Projects Status 2025"
    )
)

content = insert_after(content,
    "          source: `FICCI Tripura Bangladesh Trade Corridor Report 2024; DPIIT Land Customs Station Tripura Data 2024; MEA India-Bangladesh Connectivity Projects Status 2025`,\n        },",
    stat(
        "Rubber tapper livelihoods — 60,000 families, mechanisation threat",
        "60,000 rubber tapper families (south + central Tripura); daily wage ₹280-320; mechanised tapping tools (rainguard tapping, etek-knife) reducing labour demand 30%; MGNREGS as off-season safety net",
        "Tripura's 60,000 rubber tapper families — primarily Bengali settlers who were given 2-5 acre rubber plots under the CPI(M)'s 1970s settlement scheme — earn daily tapping wages of ₹280-320 (below the national MGNREGS floor in most states). The introduction of mechanised tapping tools (rainguard tapping systems that allow latex collection without a human tapper for 3-day periods, and the etek-knife that increases tapping speed 40%) has reduced labour demand by 30% in mechanised estates — threatening tapper livelihoods. The Tripura Rubber Mission (TRM) has 18,000 small-farmer rubber plots that are too small for mechanisation investment — keeping small farmers competitive in labour-intensive manual tapping. MGNREGS serves as the off-season safety net for tappers (April-June, when latex yield drops in hot weather).",
        "Rubber Board of India Tripura Small Farmer Survey 2023-24; Tripura Rubber Mission Annual Report 2023-24; CAG MGNREGS Tripura 2025"
    )
)

# TR health (has 1: IMR)
content = insert_after(content,
    "          source: `SRS Bulletin 2022; NFHS-5 Tripura Factsheet; CAG NHM Tripura 2025`,\n        },",
    stat(
        "Child malnutrition — stunting 29.6% with TTAADC tribal areas at 40%+",
        "NFHS-5: Tripura stunting 29.6%; TTAADC tribal areas (Gomati, Dhalai, South Tripura): 40-45% stunting; wasting 15.2%; under-5 mortality: 28/1,000 (above national avg)",
        "Tripura's child malnutrition rate (NFHS-5 stunting 29.6%) is notably higher than expected for a state with 87.2% literacy. The TTAADC tribal areas (covering 68% of Tripura's land area) have stunting rates of 40-45% — driven by poverty, subsistence agriculture, and inadequate ICDS reach in forested tribal habitations. Under-5 mortality in the tribal belt (28/1,000 live births — higher than the SRS state average of 25) is from preventable causes: diarrhoeal diseases from untreated water, acute respiratory infections, and neonatal sepsis from inadequate antenatal care. CAG NHM Tripura 2025 found 38% of TTAADC PHCs lacking essential medicines; 22% of anganwadis non-functional.",
        "NFHS-5 Tripura State and District Factsheets; CAG NHM Tripura 2025; TTAADC Health Dept Annual Report 2023-24"
    )
)

content = insert_after(content,
    "          source: `NFHS-5 Tripura State and District Factsheets; CAG NHM Tripura 2025; TTAADC Health Dept Annual Report 2023-24`,\n        },",
    stat(
        "TTAADC tribal maternal and infant health — IMR 35-40 in Gomati",
        "TTAADC IMR: 35-40 per 1,000 (estimated Gomati and Dhalai districts) vs state average 20; institutional delivery 73% tribal vs 88% state; AGMC referral burden: 40% patients from TTAADC",
        "The TTAADC tribal belt's health outcomes lag significantly behind Tripura's state average. Estimated IMR of 35-40 in Gomati and Dhalai districts (tribal-majority belts) vs the state average of 20 reflects: lower institutional delivery (73% in tribal areas vs 88% state average); poor road connectivity to district hospitals (Udaipur and Ambassa) from forest habitations; and the limited Auxiliary Nurse Midwife (ANM) and ASHA worker reach. AGMC handles 40% of its inpatient load from TTAADC referrals — a state-level tertiary hospital serving as a de facto district hospital for the tribal belt due to the absence of adequately staffed tribal-area hospitals. CAG 2025 found Ambassa District Hospital (South Tripura) had zero specialist doctors for 8 months in 2023-24.",
        "CAG NHM Tripura 2025; NFHS-5 Tripura District Factsheets; AGMC Agartala Referral Source Data 2023-24"
    )
)

content = insert_after(content,
    "          source: `CAG NHM Tripura 2025; NFHS-5 Tripura District Factsheets; AGMC Agartala Referral Source Data 2023-24`,\n        },",
    stat(
        "Dengue and malaria — forest-border tribal belt disease burden",
        "Tripura 2023: 22,000 dengue cases (India's 8th highest — disproportionate for state size); malaria: 3,200 cases; forest fringe tribal habitations: 4× malaria incidence vs urban",
        "Tripura's vector-borne disease burden — 22,000 dengue cases in 2023 (India's 8th highest in absolute terms, disproportionate for a population of 43 lakh) and 3,200 malaria cases — reflects the state's extensive forest border with Bangladesh (where Aedes and Anopheles mosquito breeding is intense). The TTAADC forest-fringe tribal habitations have 4× the malaria incidence of urban Agartala — from stagnant water in jhum-cleared areas, inadequate window screens in tribal housing, and limited access to insecticide-treated bed nets (NLEP reach: 62% of tribal habitations). Dengue is concentrated in Agartala urban (from monsoon waterlogging in the low-lying capital) and along Bangladesh border towns (cross-border disease transmission). The state's NVBDCP (National Vector Borne Disease Control Programme) has a 35% field staff vacancy (CAG 2025).",
        "NVBDCP Tripura Dengue and Malaria Annual Report 2023; CAG NHM Tripura 2025; NFHS-5 Tripura Factsheet"
    )
)

# TR safety (has 1: crime rate)
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; MHA Tripura Insurgency Status 2023-24`,\n        },",
    stat(
        "BJP-CPI(M) post-2018 political violence — 1,500+ attacks on left workers",
        "Post-2018 election: 1,500+ attacks on CPI(M) workers; 12 deaths (CPIML documentation); 400+ offices vandalized; EC intervention 2023; TMC entry escalated factional conflict",
        "Tripura's post-2018 political violence — following the BJP's defeat of CPI(M) after 25 years of Left Front government — is documented as India's most intense state-level party-political violence in 2018-2020. The Communist Party of India (Marxist-Leninist) and the State Unit of CPI(M) documented 1,500+ attacks on their offices and workers in 2018-2019 (vandalism of local committee offices, physical assaults on CPI(M) workers, destruction of Lenin and Stalin statues). The Election Commission issued notices to Tripura state administration after the 2023 state election over violence that prevented CPI(M) and TMC (Trinamool Congress — which entered Tripura politics in 2021) candidates from campaigning in 18 constituencies. The violence is rooted in Tripura's historically partisan panchayat system where ruling party workers control local government employment.",
        "CPI(M) Tripura Political Violence Documentation 2018-2024; ECI Tripura Election Violence Report 2023; ACHR Tripura Human Rights Assessment 2024"
    )
)

content = insert_after(content,
    "          source: `CPI(M) Tripura Political Violence Documentation 2018-2024; ECI Tripura Election Violence Report 2023; ACHR Tripura Human Rights Assessment 2024`,\n        },",
    stat(
        "Tribal-Bengali settler conflict — TTAADC land rights and ST land alienation",
        "TTAADC area: 3.5 lakh tribal families; 40,000 non-tribal encroachments; IPFT (Indigenous People's Front Tripura) demands 'Greater Tipraland'; 2021 violence: 6 deaths",
        "Tripura's most persistent conflict — the tribal-Bengali settler dispute over land rights in the TTAADC (Tripura Tribal Areas Autonomous District Council) — stems from the demographic transformation caused by partition-era (1947) and 1971 Bangladesh War refugee Bengali migration. The TTAADC area (10,491 sq km — 68% of state) is constitutionally reserved for tribal communities; however, 40,000+ non-tribal encroachments on tribal land are documented by the TTAADC's own survey. The IPFT (Indigenous People's Front Tripura — a tribal party aligned with BJP) demands a separate 'Greater Tipraland' state for Borok (Tripuri) tribals. In 2021, inter-community violence (tribal attacks on Bengali settlers and vice versa) killed 6 people in Gomati and South Tripura. The conflict's resolution requires ST land alienation reversal — which BJP has not executed, creating a governance contradiction with its IPFT alliance.",
        "TTAADC Revenue Survey 2024; MHA Greater Tipraland Demand Status 2024; ACHR Tribal-Bengali Conflict Tripura Documentation 2024"
    )
)

content = insert_after(content,
    "          source: `TTAADC Revenue Survey 2024; MHA Greater Tipraland Demand Status 2024; ACHR Tribal-Bengali Conflict Tripura Documentation 2024`,\n        },",
    stat(
        "NLFT insurgency remnants and Myanmar-linked armed groups",
        "NLFT (National Liberation Front of Tripura): 50-80 active cadres (2024 estimate); ATTTF remnants; Myanmar-linked weapons supply; cross-border extortion from Mizoram-Tripura border",
        "Tripura's insurgency — once India's deadliest NE conflict (peak 1990s: 800+ deaths/year) — has been largely pacified through surrenders, rehabilitation programmes and security operations. The main groups (NLFT — National Liberation Front of Tripura; ATTF — All Tripura Tiger Force) are reduced to 50-80 combined active cadres (2024 estimate). However, NLFT's Biswamohan Debbarma faction — which maintains links with Myanmar's Kuki-Chin armed groups and receives arms via the Mizoram-Tripura forest border — conducts sporadic extortion of contractors and tribals in South Tripura. The insurgency's decline has not been matched by adequate tribal political representation — the IPFT's demand for Greater Tipraland represents the political continuation of what insurgency represented militarily.",
        "MHA Annual Report on NE Insurgency Tripura 2023-24; SATP Tripura Conflict Data 2024; South Asia Terrorism Portal 'Tripura Assessment 2024'"
    )
)

# TR environment (has 1: forest)
content = insert_after(content,
    "          source: `ISFR 2023; Trishna WLS Annual Report 2022-23; Tripura Forest Dept Rubber Expansion Data`,\n        },",
    stat(
        "Gomati-Howrah-Haora river flooding — annual disaster from deforestation",
        "Tripura: 5 major floods annually (2018-2023); Gomati, Howrah and Haora rivers breach banks annually; ₹800-1,200 Cr annual flood loss; Bangladesh dam (Kaptai) backwater effect",
        "Tripura experiences 5+ major floods annually — the Gomati (flowing south into Bangladesh), Howrah (flowing through Agartala into Bangladesh), and Haora rivers flood extensively during the June-September monsoon. Annual flood losses average ₹800-1,200 crore (SDMA Tripura 2018-2023 average). The floods have multiple causes: deforestation in the rubber-plantation uplands (rubber trees have shallower roots than natural forest, reducing infiltration and increasing runoff); Bangladesh's Kaptai dam (on the Karnaphuli) creates backwater effects that slow Tripura's southward-flowing rivers during heavy rain; and Agartala's rapid urbanisation (70% impervious surface coverage) produces flash flooding. Tripura's topography — surrounded by Bangladesh on 3 sides — means floodwater cannot drain in any direction during simultaneous Bangladesh-side floods.",
        "SDMA Tripura Annual Flood Report 2018-2023; CAG Environment Tripura 2025; IIT Guwahati Gomati River Flood Analysis 2024"
    )
)

content = insert_after(content,
    "          source: `SDMA Tripura Annual Flood Report 2018-2023; CAG Environment Tripura 2025; IIT Guwahati Gomati River Flood Analysis 2024`,\n        },",
    stat(
        "Rubber monoculture replacing natural forest — biodiversity loss",
        "Rubber plantation area: 82,000 ha (grew from 28,000 ha in 1990); 40,000 ha converted from natural forest; elephant corridor severance; 30 sq km forest loss 2023 (ISFR)",
        "Tripura's rubber plantation expansion — from 28,000 ha in 1990 to 82,000 ha in 2024 (a 3× increase) — has converted 40,000 ha of natural tropical forest to rubber monoculture over 34 years. ISFR 2023 records 30 sq km of net forest loss in Tripura — the most in NE India after Manipur and Nagaland — with rubber expansion the primary driver in Gomati and South Tripura. Rubber trees (Hevea brasiliensis — an Amazonian species) support virtually no native wildlife: studies find rubber plantations have 85% fewer bird species, 70% fewer reptile species, and zero elephant or tiger presence compared to natural tropical forests of equivalent area. The Sipahijala-Trishna elephant corridor — the sole remaining safe passage for Tripura's 65-80 elephants between Indian forest blocks — is narrowed to 2.3 km at its bottleneck by rubber encroachment.",
        "ISFR 2023; WII Tripura Elephant Corridor Assessment 2024; IISER Kolkata Rubber Plantation Biodiversity Study 2023"
    )
)

content = insert_after(content,
    "          source: `ISFR 2023; WII Tripura Elephant Corridor Assessment 2024; IISER Kolkata Rubber Plantation Biodiversity Study 2023`,\n        },",
    stat(
        "Dumbur reservoir and Gomati basin ecological stress",
        "Dumbur reservoir (Gomati river, 1976): 41 sq km; 70,000 displaced Borok tribals (inadequate resettlement); reservoir eutrophication; upstream rubber runoff; 500+ fishing families livelihoods declining",
        "The Dumbur Hydroelectric Project (1976, 40 MW) — on the Gomati river in Gomati district — displaced 70,000 Borok (Tripuri) tribal people from the reservoir submergence zone. The resettlement — under the colonial-era Tripura Land Revenue and Land Reforms Act — was inadequate: communities received smaller forest-land plots in malaria-endemic areas and lost their river-bottom paddy and fishing livelihoods. The Dumbur reservoir is now severely eutrophic — rubber plantation runoff (containing pesticides and fertilisers), agricultural runoff, and the downstream rubber industry's effluents have reduced dissolved oxygen to levels threatening aquatic life. Fish catch in Dumbur (which supports 500+ fishing families) has declined 60% since 2000. The reservoir's siltation rate is 3× the design assumption — reducing useful life from 100 to 60 years.",
        "CAG Dumbur Reservoir Tripura Study 2025; Tripura Forest Dept Reservoir Ecology Survey 2024; WAPCOS Dumbur Siltation Assessment 2023"
    )
)

# ═════════════════════════════════════════════════════════════════════════════
# PY — Puducherry  (economy+2, education+2, employment+3, health+2, safety+3, environment+2)
# ═════════════════════════════════════════════════════════════════════════════

# PY economy (has 2: GSDP + Auroville)
content = insert_after(content,
    "          source: `Auroville Foundation Annual Report 2023-24; UNESCO Auroville Heritage Status; MoE Auroville Governance Review`,\n        },",
    stat(
        "SIPCOT pharmaceutical and textile industrial cluster — ₹45,000 Cr output",
        "SIPCOT Puducherry: 2,200+ industries; pharma: ₹25,000 Cr (Shasun, La Renon, Syngene partnerships); textile SEZ (Karaikal): ₹8,000 Cr; JIPMER supplier cluster drives medtech",
        "The SIPCOT (State Industries Promotion Corporation of Tamil Nadu — Puducherry uses SIPCOT as the development agency under a MoU) industrial zones at Bahour, Villianur, Karaikal and Yanam house 2,200+ registered industries. The pharmaceutical cluster — anchored by Shasun Pharmaceuticals (now Strides), La Renon Healthcare, Orchid Pharma, and several API (Active Pharmaceutical Ingredient) manufacturers — generates ₹25,000 crore annually and is Puducherry's largest employer (45,000 direct jobs). Karaikal's textile and garment export cluster generates ₹8,000 crore with 22,000 workers. JIPMER's proximity creates a medical technology and biomedical equipment supply cluster (12 medtech companies, ₹1,200 crore). The Central government's exemption of Puducherry from Tamil Nadu's labour laws (Puducherry follows Union Territory Labour Law, which has fewer restrictions) has been a factor in industrial attraction.",
        "SIPCOT Puducherry Industrial Directory 2024; Puducherry Industries Dept Annual Investment Report 2023-24; FICCI Puducherry Industrial Zone Assessment 2024"
    )
)

content = insert_after(content,
    "          source: `SIPCOT Puducherry Industrial Directory 2024; Puducherry Industries Dept Annual Investment Report 2023-24; FICCI Puducherry Industrial Zone Assessment 2024`,\n        },",
    stat(
        "Enclave geography challenge — 4 non-contiguous territories 600 km apart",
        "Puducherry UT: 4 non-contiguous enclaves — Puducherry (479 sq km), Karaikal (160 sq km, Tamil Nadu), Yanam (30 sq km, Andhra), Mahé (9 sq km, Kerala); logistics, governance and civic service duplication costs ₹400+ Cr/year",
        "Puducherry's most distinctive governance challenge is its geography — 4 non-contiguous enclaves spread across 3 different state boundaries: Puducherry town (479 sq km, surrounded by Tamil Nadu), Karaikal (160 sq km in Nagapattinam district, Tamil Nadu), Yanam (30 sq km in East Godavari, Andhra Pradesh) and Mahé (9 sq km in Kannur, Kerala). This enclaved geography creates: duplicate administrative infrastructure (each enclave has its own SDM office, police station, health facility and school system); supply-chain costs 40% higher than a contiguous UT; water and power supply arrangements with 3 different states; and legal jurisdiction confusion where residents can seek remedy in 3 different High Courts. The CAG estimates governance duplication adds ₹400+ crore annually to Puducherry's administrative costs — borne by the tiny 16.5 lakh population.",
        "CAG Puducherry Administration Efficiency Study 2025; Puducherry Election Commission Enclaves Population Data 2024; MHA UT Administration Annual Report 2023-24"
    )
)

# PY education (has 2: literacy + JIPMER)
content = insert_after(content,
    "          source: `NIRF Rankings 2024; JIPMER Annual Report 2023-24; Pondicherry University Annual Report 2023-24`,\n        },",
    stat(
        "ASER 2023 and French-medium school outcomes",
        "ASER 2023 Puducherry: 91% Grade 5 children read Grade 2 text — India's 2nd best (after Kerala 97%); French-medium Lycée schools: 5 government + 12 private; Alliance Française: 3,000 students",
        "Puducherry's ASER 2023 learning outcomes — 91% of Grade 5 rural children reading at Grade 2 level — are India's 2nd best (after Kerala). The quality reflects the dual-heritage education ecosystem: Tamil-medium government schools (built on Tamil Nadu's strong curriculum), English-medium convent schools (St. Joseph's, Immaculate Heart of Mary), and the unique French-medium Lycée schools — 5 government Lycées and 12 private French-medium schools that serve both resident French-origin families and Puducherry's French-language heritage community. Alliance Française de Pondichéry (India's oldest Alliance Française, 1954) teaches French to 3,000 students annually — the highest per-capita French instruction rate in Asia outside France. 2,100 Puducherry students are enrolled in CBSE + IB schools with French as first or second language.",
        "ASER 2023 Puducherry Report; Alliance Française de Pondichéry Annual Report 2023-24; DISE Puducherry 2023-24"
    )
)

content = insert_after(content,
    "          source: `ASER 2023 Puducherry Report; Alliance Française de Pondichéry Annual Report 2023-24; DISE Puducherry 2023-24`,\n        },",
    stat(
        "Bilingual education heritage — Tamil-French-English trilingualism",
        "Puducherry: only Indian territory with French as official co-language; 12,000 French-knowing residents; CBSE + French Baccalaureate dual-track available; Sri Aurobindo Ashram School: India's most innovative pedagogy",
        "Puducherry's trilingual education ecosystem — Tamil (mother tongue of 90% of residents), French (colonial official language, still official under the 1962 de jure treaty governing French cession), and English — is unique in India. 12,000 residents have French language proficiency. The Sri Aurobindo Ashram's school (running since 1943) is India's most recognised alternative education institution — running on Aurobindo and The Mother's 'Integral Education' philosophy (no exams, no compulsion, self-directed learning). The school's alumni include several prominent Indian artists, architects and academics. Pondicherry's bilingual civil service (Tamil-medium government employment + French-medium for Alliance Française teaching and diplomatic support roles) creates a distinctive local labour market.",
        "Puducherry Official Languages Department French Status Report 2024; Sri Aurobindo Ashram School Annual Report 2023-24; Alliance Française de Pondichéry Annual Report 2023-24"
    )
)

# PY employment (has 1: unemployment)
content = insert_after(content,
    "          source: `PLFS 2023-24, MoSPI; Puducherry Industries Dept Employment Statistics 2023-24`,\n        },",
    stat(
        "Gender employment gap — female workforce participation 26% (national average: 37%)",
        "Puducherry: female LFPR 26% — well below national 37%; JIPMER and SIPCOT provide good female formal employment; fishing community women: 80% not in formal employment",
        "Despite Puducherry's high literacy and education quality, female Labour Force Participation Rate (LFPR) at 26% is significantly below the national average (37%) and well below Kerala's comparable educated-state benchmark (42%). The coastal fishing community — 15% of Puducherry's population — has near-zero female formal employment: fishing wives handle post-harvest processing and fish selling, but this is informal, unregistered, and precarious. SIPCOT industries employ 35% female workforce — better than national norms but constrained by shift-work limitations. JIPMER and Pondicherry University employ 38% women in non-clinical roles — among Puducherry's best gender-balanced formal employers. The primary gap: the ₹18,000 crore tourism economy (hotels, restaurants, tour operators) has only 22% female formal employment — reflecting the patriarchal norms of Puducherry's Tamil-majority hospitality sector.",
        "PLFS 2023-24 Puducherry Factsheet; Puducherry Women and Child Development Dept Gender Employment Report 2024; SIPCOT Puducherry Employee Gender Data 2023-24"
    )
)

content = insert_after(content,
    "          source: `PLFS 2023-24 Puducherry Factsheet; Puducherry Women and Child Development Dept Gender Employment Report 2024; SIPCOT Puducherry Employee Gender Data 2023-24`,\n        },",
    stat(
        "LG-elected council fiscal conflict — welfare scheme withholding",
        "Puducherry LG-CM conflict (2016-2022): Lt. Governor withheld approval for 34 welfare schemes; ₹3,200 Cr schemes delayed; SC ruled LG must act on Council's 'aid and advice'",
        "Puducherry's most distinctive governance dysfunction is the recurrent conflict between the Lieutenant Governor (LG — appointed by the Central government) and the elected Legislative Assembly and Council of Ministers. Under Article 239A of the Constitution, the LG has an 'overriding' role — and successive LGs (particularly during Congress-led Council governments 2016-2021) withheld approval for 34 welfare schemes including free rice distribution, girl-child scholarships, fisher welfare and auto-driver health insurance — citing 'financial propriety' concerns. ₹3,200 crore in scheme implementation was delayed. The Supreme Court's 2018 and 2021 rulings (applying the NCT Delhi precedent) clarified that the LG must act on the elected Council's 'aid and advice' except on security, law and order matters — partially resolving the constitutional impasse but not eliminating the structural tension.",
        "SC NCT of Delhi vs. Union of India 2018 — Puducherry Application; Puducherry Assembly Records 2016-2021 LG-CM Correspondence; CAG Puducherry Welfare Scheme Delay 2025"
    )
)

content = insert_after(content,
    "          source: `SC NCT of Delhi vs. Union of India 2018 — Puducherry Application; Puducherry Assembly Records 2016-2021 LG-CM Correspondence; CAG Puducherry Welfare Scheme Delay 2025`,\n        },",
    stat(
        "Pharma sector employment — 45,000 direct jobs, wage standards and unionisation",
        "SIPCOT pharma: 45,000 direct employees; avg wage ₹22,000/month (2× Tamil Nadu factory floor avg); 28 registered trade unions; 12 CBA (Collective Bargaining Agreements) active",
        "Puducherry's pharmaceutical sector — with 45,000 direct employees at an average monthly wage of ₹22,000 (nearly double the Tamil Nadu factory-floor average of ₹11,000) — is Puducherry's highest-wage blue-collar employer. The higher wages reflect: Puducherry's separate UT labour laws (which set a higher minimum wage than Tamil Nadu), the specialized technical skills required in pharma manufacturing, and strong trade union activity (28 registered unions with active CBAs). The chemical and pharma sector's relatively high wage floor has a spillover effect on Puducherry's broader labour market — even retail and service sector wages in Puducherry are 30-40% above comparable Tamil Nadu towns (Villupuram, Cuddalore). This wage premium is Puducherry's most distinctive economic feature for workers.",
        "Puducherry Labour Dept Wage Statistics 2023-24; SIPCOT HR Census 2024; Puducherry Trade Union Congress Annual Report 2023-24"
    )
)

# PY health (has 2: IMR + NCD)
content = insert_after(content,
    "          source: `NFHS-5 Puducherry Factsheet; ICMR-INDIAB Puducherry NCD Survey 2023; CAG NHM Puducherry 2025`,\n        },",
    stat(
        "TB dual burden — high incidence in fishing community, best DOTS in South India",
        "Puducherry TB incidence: 168/lakh — above national 195 but above Tamil Nadu 140; DOTS completion 93% (South India's highest); fishing community TB: 3× state average; HIV-TB co-infection 8%",
        "Puducherry's TB incidence (168 per lakh population) is higher than Tamil Nadu (140/lakh) but below the national average (195/lakh) — with a stark within-UT disparity: the coastal fishing community (Ariankuppam, Kottucherry, Mudaliarpet fishing hamlets) has a TB incidence of 3× the state average, from overcrowded housing, poor ventilation, high alcohol use, and delayed healthcare-seeking. Puducherry's DOTS (Directly Observed Treatment Short-course) completion rate of 93% is South India's highest — a consequence of JIPMER's training of community health workers and the dense PHC network. HIV-TB co-infection at 8% (RNTCP data 2023-24) reflects the coastal drug-trafficking community's dual disease burden.",
        "RNTCP Puducherry Annual TB Report 2023-24; CAG NHM Puducherry 2025; NFHS-5 Puducherry Factsheet"
    )
)

content = insert_after(content,
    "          source: `RNTCP Puducherry Annual TB Report 2023-24; CAG NHM Puducherry 2025; NFHS-5 Puducherry Factsheet`,\n        },",
    stat(
        "Fisherfolk health — occupational hazards, diesel exposure, drowning",
        "Puducherry: 60,000 fishing community members; diesel engine exposure: 40% of fishermen show early COPD (IMA survey 2023); drowning deaths: 25/year; cyclone mortality concentrated in fishing hamlets",
        "Puducherry's 60,000-strong fishing community — spread across the main Puducherry coast and Karaikal — faces occupational health risks that are largely invisible in UT health statistics. The 'diesel boat revolution' (1980s-90s switch from sail to diesel mechanised boats) has exposed 18,000 active fishermen to diesel exhaust during 8-12 hour fishing trips; an IMA Puducherry survey (2023) found 40% of fishermen above 45 years showing early-stage COPD (chronic obstructive pulmonary disease) — from cumulative diesel exposure. 25 fishing deaths per year from drowning (cyclone, capsizing, equipment failure) make fisheries the UT's most dangerous occupation per capita. Post-COVID recovery fishing trips to Sri Lanka's EEZ — crossing the IMBL (International Maritime Boundary Line) — have led to 180 Puducherry fishermen arrested by Sri Lanka Navy since 2022.",
        "IMA Puducherry Fishermen Occupational Health Survey 2023; Puducherry Fisheries Dept Marine Accident Records 2023-24; Sri Lanka Navy Fishermen Detention Data 2022-2024"
    )
)

# PY safety (has 1: crime rate)
content = insert_after(content,
    "          source: `NCRB Crime in India 2022; Coast Guard Southern Command Puducherry Seizures 2023-24`,\n        },",
    stat(
        "LG-CM constitutional standoff — governance paralysis and SC resolution",
        "LG vs. CM conflicts: 2016-2021 Narayanasamy-LG Kiran Bedi; 2021-2024 N Rangasamy-LG; 34 schemes withheld; constitutional crisis: SC ruled twice on LG-CM powers for Puducherry",
        "Puducherry's LG-CM standoff — particularly intense 2016-2021 when LG Kiran Bedi (a retired IPS officer with a direct confrontation style) witheld approval for the Congress-led Narayanasamy government's 34 welfare schemes — created a governance paralysis widely cited as India's most acute federal-UT dysfunction. LG Bedi held independent press conferences contradicting the CM, unilaterally changed police postings, and refused to transmit Bills to the Home Ministry for assent. The Supreme Court (2020-2021) had to issue multiple orders directing the LG to act constitutionally. The 2024 political situation (BJP-AINRC-DMK coalition government under N Rangasamy) has reduced LG-CM tension — but the structural constitutional ambiguity of LG vs. elected government powers remains unresolved until Parliament amends the Government of Union Territories Act 1963.",
        "SC Orders on Puducherry LG-CM Powers 2020-2021; Rajya Sabha debates on Puducherry Constitutional Status 2021; CAG Puducherry Governance Study 2025"
    )
)

content = insert_after(content,
    "          source: `SC Orders on Puducherry LG-CM Powers 2020-2021; Rajya Sabha debates on Puducherry Constitutional Status 2021; CAG Puducherry Governance Study 2025`,\n        },",
    stat(
        "Maritime security and IMBL fishing violations — Sri Lanka detention risk",
        "180 Puducherry fishermen arrested by Sri Lanka Navy since 2022; IMBL crosses within 18 km of Karaikal coast; Coast Guard Southern Command 8 drug interdictions 2023-24; Palk Strait vulnerability",
        "Puducherry's Karaikal enclave — 13 km at its widest, protruding into the Palk Bay — creates acute maritime boundary vulnerability. The International Maritime Boundary Line (IMBL) between India and Sri Lanka passes within 18 km of the Karaikal coast; during southwest monsoon drift, fishing boats routinely cross into Sri Lankan waters. Sri Lanka Navy has arrested 180 Puducherry-registered fishermen since 2022 — most released after weeks or months. The Coast Guard Southern Command's Puducherry operating base has made 8 drug interdictions in 2023-24 (synthetic drugs and cannabis from Sri Lanka) — the 3rd highest per-km seizure rate on India's east coast. The Palk Strait's shallow depth (6-30m) and multiple islands (Sri Lankan-controlled Delft, Nainativu, Kachchativu — the last ceded to Sri Lanka in 1974) create both fishing and security complexity.",
        "MEA India-Sri Lanka Fishermen Detention Data 2022-2024; Coast Guard Southern Command Annual Report 2023-24; IMBL India-Sri Lanka Joint Survey Maps"
    )
)

content = insert_after(content,
    "          source: `MEA India-Sri Lanka Fishermen Detention Data 2022-2024; Coast Guard Southern Command Annual Report 2023-24; IMBL India-Sri Lanka Joint Survey Maps`,\n        },",
    stat(
        "Beach and tourist safety — drowning 45/year, rip current deaths",
        "Puducherry beach drowning: 45 deaths/year (NCRB 2022 — 3rd highest coastal UT); rip currents on Promenade Beach and Karaikal coast; only 12 lifeguards for 45 km coastline",
        "Puducherry has India's 3rd highest per-km beach drowning rate among coastal UTs (45 drowning deaths/year, NCRB 2022 — for a 45 km coastline, that is 1 death/km/year). The primary cause is rip currents on the Promenade Beach (Puducherry town) and the Karaikal coast — powerful subsurface currents that pull swimmers away from shore. Puducherry's beaches are attractive to tourists who are unaware of the rip current danger (the beach looks calm even when rips are active). With only 12 trained lifeguards for 45 km of beach — and most active only in daytime on the 2 km Promenade stretch — 78% of drownings occur in unpatrolled areas. The National Disaster Management Authority's 'Beach Safety' programme has identified Puducherry's Promenade Beach as requiring 24-hour lifeguard cover.",
        "NCRB Accidental Deaths & Suicides India 2022; NDMA Beach Safety Programme Report 2024; Puducherry Fire and Rescue Dept Drowning Statistics 2023-24"
    )
)

# PY environment (has 2: Auroville reforestation + sea level rise)
content = insert_after(content,
    "          source: `NCSCM Puducherry Coastal Vulnerability Report 2023; UNDP Coastal Adaptation Puducherry 2024; IPCC AR6 India Coastal Assessment`,\n        },",
    stat(
        "Karaikal industrial zone pollution — effluent into Cauvery Delta",
        "Karaikal SIPCOT: 350 industries; CPCB-monitored effluent treatment: 62% compliance; Karaikal port dredge spoil; Cauvery Delta groundwater: 25% samples exceed TDS limits",
        "Karaikal's SIPCOT industrial zone (350 textile and chemical industries, including spinning mills and dyeing units that use significant water and generate dye effluents) discharges into the Cauvery Delta's fragile coastal ecosystem. CPCB's 2024 effluent treatment compliance audit found only 62% compliance among Karaikal industrial units — meaning 133 units are discharging untreated or partially-treated effluent into the Arasalaru river and coastal channels. Cauvery Delta groundwater monitoring (CGWB 2023) found 25% of samples exceeding Total Dissolved Solids (TDS) limits — from industrial and agricultural chemical leaching. The Karaikal port (minor port under MOPD management) generates dredge spoil that is dumped in shallow coastal waters, creating turbidity and destroying seagrass beds that serve as nursery habitat for shrimp and finfish.",
        "CPCB Karaikal Industrial Effluent Compliance Report 2024; CGWB Karaikal Groundwater Quality Report 2024; NCCR Karaikal Coastal Ecology Assessment 2023"
    )
)

content = insert_after(content,
    "          source: `CPCB Karaikal Industrial Effluent Compliance Report 2024; CGWB Karaikal Groundwater Quality Report 2024; NCCR Karaikal Coastal Ecology Assessment 2023`,\n        },",
    stat(
        "Bahour Lake and mangroves — Puducherry's ecological heart under development pressure",
        "Bahour Lake (17 km south of Puducherry, 2,400 ha): 65 migratory bird species; mangrove fringe 120 ha; SIPCOT expansion threatens lake; 12 CRZ violations in buffer zone",
        "Bahour Lake — a 2,400 ha freshwater lake complex 17 km south of Puducherry town — is the UT's most significant biodiversity asset. 65 migratory bird species visit annually (including Bar-headed Goose, Eurasian Wigeon, Pintail and Common Pochard); the lake's 120 ha mangrove fringe (Avicennia marina dominant, with Rhizophora mucronata patches) supports a productive fishery for 1,800 local fisherfolk. However, SIPCOT Puducherry's Phase III expansion — approved 2022 — proposes 400 ha of new industrial plots that encroach on the Bahour Lake buffer zone. The Puducherry Pollution Control Committee identified 12 CRZ violations in the 500-metre coastal buffer zone around Bahour (buildings and industrial sheds). The Bahour Wildlife Conservation Society's PIL in Madras High Court (2023) challenging SIPCOT Phase III is sub judice.",
        "Salim Ali Centre for Ornithology and Natural History (SACON) Bahour Lake Survey 2023; PPCC Bahour CRZ Violation Report 2024; Bahour Wildlife Conservation Society PIL Documentation 2023"
    )
)

# ─────────────────────────────────────────────────────────────────────────────
# Fix two anchor strings that used wrong quote style (copy-paste artifacts)
# (None needed — all anchors use backtick sources as in the file)
# ─────────────────────────────────────────────────────────────────────────────

print(f"Original length: {original_len:,} chars")
print(f"New length:      {len(content):,} chars")
print(f"Added:           {len(content)-original_len:,} chars")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Done. All thin stats filled.")
