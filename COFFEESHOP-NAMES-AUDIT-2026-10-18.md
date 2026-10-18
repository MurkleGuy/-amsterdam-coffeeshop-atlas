# Amsterdam Coffeeshop Atlas — name and address audit
**Checked:** 18 October 2026  
**Main reference:** [Amsterdam's official tolerated-address list](https://lokaleregelgeving.overheid.nl/CVDR756282), effective 5 March 2026 and current as checked.

## Summary
- The city list contains **167 tolerance-list addresses**, and `public/map.html` plus `public/assets/shops.js` each include all 167 with sequential IDs and no repeated addresses.
- **166 / 167 addresses** now have a public-facing business name; **one remains unverified** (Sarphatistraat 87G).
- Previously **151 names** were supplied and 16 were blank. This update researched and added **15 names** and refreshed **seven established names** with documented renaming/branding evidence.
- The municipality's **address eligibility is not a live list of operating coffeeshops**. A named record is not proof of current opening, ownership, licensing or accessible entrance.
- The original 151 pre-existing name matches were preliminary; this audit identified several outdated matches and verified the 22 changes below, **not independent live verification of every other business**.
- Shop coordinates remain geocoded in visitors' browsers by the original geolocation process; this name audit did not change coordinates.

## 15 previously missing names
| Atlas ID | Municipal address | Added business name | Evidence |
|---|---|---|---|
| 2 | Admiraal de Ruijterweg 104 | Power Flower Amsterdam | [Municipal permission listing NCC Power Flower](https://zoek.officielebekendmakingen.nl/gmb-2025-148828.html) |
| 6 | Amstelstraat 35 | New Times 2 | [Municipal permit](https://zoek.officielebekendmakingen.nl/gmb-2024-453947.html) |
| 12 | Barentszstraat 130 | The Plug Westerdok | [June 2026 menus, previously Baba](https://www.coffeeshopmenus.org/cs-plugwesterdok.html) |
| 24 | Dapperstraat 2 | Happy People | [Coffeeshop menu archive](https://www.coffeeshopmenus.org/Happy%20People/Menus/Happy%20People.html) |
| 28 | Eerste Oosterparkstraat 47 | The Plug East | [Operator's locations](https://theplugcoffeeshops.com/our-locations/) |
| 32 | Frederik Hendrikstraat 123 | The Plug West | [Operator's locations](https://theplugcoffeeshops.com/our-locations/) |
| 33 | Geldersekade 54H | Het Gelderse | [Shop's own contact page](https://coffeeshophetgelderse.nl/bezoek-ons/) |
| 83 | Marnixstraat 333H | Tha Dogg House | [2026 menu archive](https://www.coffeeshopmenus.org/dogghouse/Menus/dogghouse.html) |
| 100 | Oudezijds Voorburgwal 250H | Rick's Coffeeshop | [Municipal application for Rick's Juice Bar BV](https://zoek.officielebekendmakingen.nl/gmb-2026-199014.html) plus local business listings |
| 105 | Oudezijds Voorburgwal 88H | The Bulldog The First | [Operator's locations](https://thebulldog.com/locations/) — **important:** operator places the coffeeshop entrance at **90**, and brand/merchandise store at **88**; official tolerated address remains 88H |
| 115 | Raadhuisstraat 8 | Rock-Land | [Municipal permit extension](https://zoek.officielebekendmakingen.nl/gmb-2025-534274.html) |
| 141 | Thorbeckeplein 28 | The Bushdoctor | [October 2026 listing](https://www.corner.inc/place/p1pakUoDmRj4) |
| 155 | Van Woustraat 193 | SuperFly Amsterdam | [Operator's own Amsterdam location](https://coffeeshopsuperfly.nl/location/amsterdam) — former/other directory labels include de Keeper |
| 156 | Van Woustraat 147 | Warda | [July 2026 menu](https://www.amsterdaments.com/shops/warda) |
| 164 | Woestduinstraat 76 | Bullwackie | [Shop directory listing](https://coffeeshopfinder.nl/en/coffeeshops/amsterdam/bullwackie-amsterdam) |

## Seven updated names
| Atlas ID | Previously shown | Now shown | Evidence |
|---|---|---|---|
| 17 | Coffeeshop 137 | 7th Heaven | [2026 menu archive](https://www.coffeeshopmenus.org/7thHeaven/Menus/7thHeaven.html) |
| 43 | Green Place | Green Place 2 | [2026 menu archive](https://www.coffeeshopmenus.org/Green%20Place/Menus/GreenPlace2.html) |
| 59 | Boerejongens Sloterdijk | Coffeeshop Sloterdijk | [Shop's website at Humberweg 2](https://coffeeshopsloterdijk.com/) |
| 91 | The Plug | The Plug Utopia | [Operator's locations](https://theplugcoffeeshops.com/our-locations/) |
| 98 | De Kroon | Tha Dogg House 2 | [1 October 2026 menu, formerly De Kroon](https://www.coffeeshopmenus.org/cs-dogghouse2.html) |
| 116 | Betty Boop | Easy Times II | [Shop directory detailing old name](https://coffeeshopsamsterdam.com/coffeeshop/betty-too/) |
| 166 | Noon | Terps Army 2 | [2026 listing, formerly Noon](https://audiokush.com/dispensary/coffeeshop-terps-army-2/) |

## Unresolved record: do not represent as confirmed trading
- **ID 128 — Sarphatistraat 87G, 1018 EZ** remains unnamed.
- The city's [9 June 2026 announcement](https://zoek.officielebekendmakingen.nl/gmb-2026-270745.html) records a **refused** operating-permit application for *Coffeeshop Sarphati* (decision 29 May 2026). This is **not proof the site is currently a functioning coffeeshop**. The address stays in the Atlas because it remains in the official tolerated-address register, but a clear explanatory warning appears in its card.
- Resolve only against new valid operating-permit decisions, current operator details, and/or a directly verified recent business presence.

## Destination caveats
- **ID 105:** The Bulldog The First's **visitor entrance at number 90** differs from the municipality's tolerated-address record **88H**. Google Maps directions use the operator entrance; Atlas record retains official address.
- **ID 104:** The Bulldog Energy operator gives the entrance at **Oudezijds Voorburgwal 218**; municipal list records **220**. Google Maps directions use 218 without altering the official record.
- **ID 155:** SuperFly Amsterdam is operator-confirmed; older de Keeper references persist online.
- Place IDs and Google ratings are not added or fabricated; Google Maps searches are best-effort until a verified Place ID can be used.

## Data consistency
- `public/map.html` (interactive map) and `public/assets/shops.js` (editorial/gallery) now share the same 167 IDs, addresses, names and available provenance/notes.
- `shops.js` retains 12 optional photo metadata entries not required by the map.
- Keep these arrays in sync whenever business names change; use the `nameSource`, `nameNote` and `mapsAddress` properties to document important exceptions.

## Remaining work
- Cross-check the other **144 inherited, not individually re-verified** shop-name matches against current trading names and exact Google Business Place IDs.
- Confirm on-site trading status, photos, accurate entry points and real opening hours before claiming a complete **live** directory.
- Re-check the municipality list if it is republished, because address count and eligibility may change.
