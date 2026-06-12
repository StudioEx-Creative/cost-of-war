# Data Sources & Audit Trail

Every figure on the site, with its primary source. Last full verification: **12 June 2026**.
All figures live in `js/data.js`; this file is the why-and-where.

## Headline figures

| Figure | Value | Source | Published |
|---|---|---|---|
| World military expenditure 2025 | $2,887B (+2.9% real; 2.5% of GDP; 11th record year) | [SIPRI Trends in World Military Expenditure 2025](https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025) | Apr 2026 |
| Total economic impact of violence | $21.81T = 10.5% of global GDP (+3.2%) | [IEP Global Peace Index 2026](https://www.visionofhumanity.org/economic-impact-of-violence/) | Jun 2026 |
| Military spend per second | $91,546 ( = $2,887B / 31.536M s) | derived | — |
| Violence cost per second | $691,590 ( = $21.81T / 31.536M s) | derived | — |
| Nuclear weapons spending 2025 | $119B (+19%, record; $3,768/s; US $69.2B > all others combined) | [ICAN "Premeditated"](https://www.icanw.org/premeditated_2025_global_nuclear_weapons_spending) | Jun 2026 |
| Arms transfers 2021–25 | +9.2% vs 2016–20; US 42% of exports; Europe imports +210%; Ukraine top importer (9.7%) | [SIPRI Arms Transfers](https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-international-arms-transfers-2025) | Mar 2026 |

## Top spenders 2025 (SIPRI, $B)

USA 954 (−7.5%) · China 336 (+7.4%) · Russia 190 (+5.9%) · Germany 114 (+24%) · India 92.1 (+8.9%) · UK 89.0 (−2.0%) · Ukraine 84.1 (+20%, 40% of GDP) · Saudi Arabia 83.2 (+1.4%) · France 68.0 (+1.5%) · Japan 62.2 (+9.7%).
Regions: Europe $864B (+14%) · Asia & Oceania $681B (+8.1%) · Middle East $218B.
Source: [SIPRI press release, 27 Apr 2026](https://www.sipri.org/media/press-release/2026/global-military-spending-rise-continues-european-and-asian-expenditures-surge).
Countries outside the top 10 in `countryData` are SIPRI Military Expenditure Database estimates and should be refreshed against the database annually.

## Destruction

| Figure | Value | Source |
|---|---|---|
| Ukraine reconstruction | $588B over 10 years; $195B direct damage; transport $96B, energy $91B, housing $90B | [Ukraine RDNA5, World Bank/UN/EU, Feb 2026](https://www.worldbank.org/en/news/press-release/2026/02/23/updated-ukraine-recovery-and-reconstruction-needs-assessment-released) |
| Gaza reconstruction | $71.4B over a decade; $26.3B first 18 months; human development set back 77 years; 371,888 housing units; economy −84% | [Gaza RDNA, EU/UN/World Bank, Apr 2026](https://news.un.org/en/story/2026/04/1167336) |
| Post-9/11 wars | $8T+ spending; $2.2T future veterans' care; 4.5–4.7M deaths incl. indirect | [Brown University Costs of War](https://watson.brown.edu/costsofwar) |
| Military emissions | ~5.5% of global GHG | [SGR / CEOBS](https://www.sgr.org.uk/resources/hidden-carbon-cost-military) |

## Displacement & humanitarian

| Figure | Value | Source |
|---|---|---|
| Forcibly displaced | 117.8M end-2025 (1 in 70 people); 41.6M refugees; 9M asylum-seekers; 68.7M IDPs; 14.7M returns (first decline in 10 yrs) | [UNHCR Global Trends 2026](https://www.unhcr.org/global-trends) (Jun 2026) |
| People needing humanitarian aid | 240M+ | [OCHA GHO 2026](https://www.unocha.org/publications/report/world/global-humanitarian-overview-2026-enesfr) |
| 2026 UN appeal | $33B for 135M people | [OCHA, Dec 2025](https://news.un.org/en/story/2025/12/1166526) |
| 2025 appeal received | $12B — lowest in a decade | same |

## Human cost

| Figure | Value | Source |
|---|---|---|
| Conflict deaths (12 months) | ~244,700 (205,400+ violent events, Nov 2024–Nov 2025; record) | [ACLED Conflict Index](https://acleddata.com/series/acled-conflict-index) |
| GPI alternative count | 181,000+ conflict deaths 2025 (different methodology — we use ACLED, cited) | IEP GPI 2026 |
| Population exposed to conflict | 1 in 6 (17%) | ACLED Conflict Index 2025 |
| Children killed/maimed | 11,967 in 2024 — highest ever verified; 41,370 grave violations (+25%, 3rd record year) | [UN SG Children & Armed Conflict Report](https://news.un.org/en/story/2025/06/1164646) (Jun 2025) |
| Post-9/11 total deaths | 4.5M+ incl. indirect | Brown Costs of War |

## Issue investment gaps (Chapter 05)

| Issue | $B/yr | Source | Note |
|---|---|---|---|
| Zero Hunger | 90 | FAO [SOFI 2025](https://www.fao.org/publications/fao-flagship-publications/the-state-of-food-security-and-nutrition-in-the-world/en) + WFP | 673M hungry 2024 (638–720M range), declining globally, rising in Africa |
| Global Health | 371 | [WHO Stenberg et al.](https://www.who.int/publications/i/item/9789241513326) | ambitious UHC scenario |
| Quality Education | 100 | [UNESCO](https://www.unesco.org/en/articles/more-children-out-school-7th-year-row-273-million) | 272M out of school (2025, 7th year rising) |
| Gender Equality | 360 | UN Women Beijing+30 | |
| Clean Water | 114 | OECD/WHO GLAAS | |
| Clean Energy | 35 | IEA | universal access by 2030 |
| Decent Work | 50 | ILO | |
| Infrastructure | 150 | UNCTAD | |
| Reduce Inequality | 150 | Oxfam + World Bank | |
| End Homelessness | 200 | UN-Habitat | |
| Climate Action | 1000 | IPCC AR6 + [COP29 NCQG](https://www.wri.org/insights/ncqg-climate-finance-goals-explained) | $1.3T/yr external need by 2035 vs $116B delivered (2022); ~$1T public gap |
| Ocean Health | 50 | Ocean Panel | |
| Biodiversity | 200 | IPBES/IUCN | harmful subsidies $1.8T/yr |
| Peace & Justice | 80 | IEP + UN PBF | prevention 16× cheaper than response |

## Refresh calendar

- **March** — SIPRI arms transfers
- **April** — SIPRI military expenditure (the core `DEFENCE` constant)
- **June** — IEP Global Peace Index, UNHCR Global Trends, ICAN nuclear spending, UN Children & Armed Conflict
- **July** — FAO SOFI (hunger)
- **December** — OCHA Global Humanitarian Overview (next year's appeal)
