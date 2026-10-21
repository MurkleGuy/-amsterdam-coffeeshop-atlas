# Amsterdam Coffeeshop Atlas

A mobile-friendly independent directory and map of Amsterdam cannabis coffeeshop addresses, hosted as a zero-build static website on Cloudflare Pages.

## Active BudMap rating system — updated 21 October 2026

**The live map uses [BudMap Score](BUDMAP-SCORE-METHOD.md)**:
each published venue average is first adjusted for its review count,
moving small samples towards 7/10 using five statistical prior reviews.
When several independent websites are available, their adjusted ratings
are averaged equally.

Every shop with a suitable source now has **one BudMap Score out of 10**.
Current coverage: **156 rated shops** (133 with one website, 23 with two);
**11 unrated**. The UI shows the number of websites and published review
counts rather than a "Preliminary" rating label. All rated shops appear in
the Best BudMap scores ranking, highest adjusted score first.

The original ratings and source links are retained separately for
verification. There are no Google Places rating imports. The historic
Atlas Score evidence pilot notes elsewhere in this README are superseded
and are not loaded on the active map.

## Weed-quality research — full-coverage project, 21 October 2026

**Our goal is evidence-backed weed-quality coverage for all 167 coffeeshops,
not an artificial 167/167 leaderboard.** The old "Best Weed" top-ten-style
ranking has been paused while the evidence is too sparse. The map opens with
**All coffeeshops**, and has an alphabetically ordered **Weed quality ·
Research underway** discovery view with no weed-quality rank numbers.

Six shops currently show clearly labelled **early editorial estimates**
from selected dated flower/hash comments; the other 161 remain unscored
for weed quality. Separately, **156 shops retain their BudMap Overall
Scores** and the Best Overall ranking. Both categories remain visible on
shop cards and do not feed into each other's formula.

**Research results now appear directly on all 167 shop profiles.** In the
Weed Quality expansion, each shop has a Product Research panel showing its
initial evidence status, dated source page/menu where available, editorial
research note and a source link. The directory also displays the research
status alongside the existing Weed Quality and BudMap Overall labels.
The public data file `public/assets/budmap-research.js` is generated from
`research/weed-quality-tracker.json` and contains no copied numerical
product ratings. Seeing that a source lists rated products is **not** itself
a numerical Weed Quality rating; only the six independently assessed early
quality estimates appear as numbers. The other 161 stay unrated for weed
quality pending enough attributable, recent and reusable evidence.

A full [167-shop research tracker](research/weed-quality-tracker.json) is maintained. An initial **research pass now covers all 167 addresses**. Of these, **142** have inspected venue/product or quality-source pages; for the other **25**, research found only a dated menu archive, general venue feedback, an unresolved identity, or insufficiently verifiable evidence. **114 shops** have source pages showing at least one individual product rating, but those source stars are not verified as recent or licensed for reuse. Across the complete tracker, **15 source pages list no products**, **5 have product listings without votes**, and other records have date, source-identity or product-evidence gaps. The 167/167 figure means initial research attempted, **not** 167 reliable or numerically rated shops. **All 167 still require the deeper rating-eligibility and rights checks** before a proper Best Weed ranking can launch.

There are **156 existing venue-rating page leads** (146 Greenmeister, 10 other sites), but these are not licences or product-specific scores. Flagged cases include the duplicate Kadinsky venue records and an operating-permit refusal at Sarphatistraat 87G, where the currently operating shop identity needs verification.
A source page displaying products is **not** proof of current product quality.
The original sources' product ratings have not been bulk-imported,
reproduced or converted into BudMap Weed Scores; data-use permission,
freshness, sample sizes and shop/strain matching must be checked first.

See [research and rollout plan](WEED-QUALITY-RESEARCH-PLAN.md) and the
[early estimate method](BUDMAP-WEED-QUALITY-METHOD.md).

## Features
- Searchable directory of 167 published Amsterdam 2026 tolerance-reference addresses (151 preliminary directory name matches).
- Interactive Leaflet / OpenStreetMap map with address lookups, map clusters and mobile list/map switching.
- Neighbourhood filters, on-device favourites, nearby sorting, directions, and CSV download.
- Featured archived storefront photographs credited on the [credits](public/credits.html) page.
- No official business logos or verified live opening hours in this version.

## Cloudflare Pages deployment
1. In Cloudflare, select **Workers & Pages → Create application → Pages → Connect to Git** (the wording may differ slightly).
2. Authorise the GitHub repository **MurkleGuy/-amsterdam-coffeeshop-atlas** and choose its **main** branch.
3. Select Framework preset **None**, leave **Build command blank**, and set **Build output directory** to `public`.
4. Deploy. Cloudflare will provide a `*.pages.dev` address. Future commits to main deploy automatically.

There is no Node install, external database, framework, or build step. Individual route graphics use a locally hosted static JSON file, so Pages Functions are not required for this feature. `public/index.html` is the homepage. `public/assets/styles.css` is the stylesheet, `public/assets/shops.js` is the dataset, and `public/assets/app.js` implements the interactivity.

## Important data and image notes
Shop addresses are based on Amsterdam's 2026 published cannabis-tolerance reference, not a live guarantee of an operating coffeeshop. Name matches and older shop photos can be incorrect/outdated. Verify each shop before visiting. Images from Wikimedia Commons are licensed by their photographers; preserve their attribution on the credits page. No official logos have been copied into this project.

Pins are resolved by a third-party Dutch public geocoder as visitors browse and may be delayed or limited; shop addresses and Google Maps directions remain usable even when automatic geocoding is unavailable. For a larger public launch, pre-geocode and validate coordinates with a suitable permitted service.

## Repo scope
This is independent of the two existing Crispy Clean projects and must not share their Cloudflare deployment or GitHub repository.

## Public transport map and Google Maps destinations

- The map at `public/map.html` has **Street**, **Tracks**, and **Lines** modes. Street uses OpenStreetMap raster tiles. Tracks adds the OpenRailwayMap infrastructure overlay. Lines displays 18 colour-coded routes with a collapsible key for highlighting, showing and hiding routes.
- The Lines view is **reliably loaded from our own file**: `public/assets/gvb-routes-2025.json`, created from the Amsterdam municipality's **Tram- en metrolijnen 2025** geometry mirrored at https://github.com/simonscheider/ModelQuestions/blob/main/data_repository/data/MetroLines_Amsterdam.json. It contains 5 metro routes and 13 tram routes. This is **reference/historical geometry only**: it does not include all 2026 services (e.g. tram 6, tram 24 and tram 29), and some tram alignments changed during 2026. Route 3 was deliberately excluded because it was withdrawn in 2026. Neither ferry routes nor national train lines are included in the local Lines data.
- The earlier `functions/api/transport-routes.js` Overpass proxy is now **unused** by the Lines map. It proved unreliable in deployment; map display must not depend on it. The browser no longer makes Overpass requests to draw this mode. This remains an optional prototype and is not the source of the live visualisation.
- The user's selectable colours are Atlas colours, not the official GVB route colours. These route drawings are not live tracking, real-time diversions, or authoritative journey planning. Always use [GVB journey planning](https://gvb.nl/en/travel-information/journey-planner) or Google Maps transit directions before travelling.
- OpenStreetMap and OpenRailwayMap tile servers require attribution and are best-effort services with usage limits. Do not bulk-download their tiles or remove attribution. Do not reintroduce the CARTO basemap without a licensed API key; it produced an "API KEY REQUIRED" watermark.
- Google Maps links target the shop name plus published address when a name is available, falling back to the address where unnamed. Exact Google Business Profile destinations need separately verified Place IDs; never invent them. Walking and transit directions run in Google Maps, not on the Atlas server.

### Updating transport data
Regenerate `gvb-routes-2025.json` from newer, properly licensed **line-specific** route geometry as it becomes available. Check against official GVB route information, not just track infrastructure. If route numbers, geometry, or colours change, also increment the map query version in `public/index.html` to bypass mobile cached HTML.


## My Trip: hotel, GPS, buses and walking navigation (October 2026)
- The map's view selector now reads **Street / Metro / Bus**. **Metro** includes the locally bundled 2025 metro **and tram** line geometry and the colour key; the historic 2025 limitation remains. **Tracks** was removed from the selector. **Bus** displays MeMoMaps' OpenStreetMap public transport map; it is **not a bus-only or verified 2026 per-route layer** and may show metro/tram/ferry lines too. The Bus key links to GVB's current transport information. This must not be presented as full bus route coverage or live bus navigation.
- **My trip** is implemented in `public/assets/atlas-trip.js`: a user-requested Photon search can show selectable nearby hotels, or a user can choose any Amsterdam hotel position by tapping the map. The saved hotel name and coordinates remain **only in browser localStorage on that device** (key `atlas-my-hotel-v1`) and can be forgotten.
- **Live location** uses browser `watchPosition` only after an explicit permission interaction, and displays a blue location/accuracy marker. Position is not stored by the Atlas. The browser may throttle or stop updates in the background and location can be inaccurate, especially indoors.
- Tapping a coffeeshop offers **Walk on map**, **Hotel → Walk**, **Hotel → Transit**, and **From GPS**. The walking overlay requests a pedestrian route and manoeuvres from Valhalla's FOSSGIS-hosted public demo, a third-party, rate-limited service. It updates the displayed next instruction as GPS advances along the polyline. Users can opt in to **Start GPS guidance**, and stop it, but this is only **basic foreground walking guidance**, not a tested full turn-by-turn navigation system; there is no voice navigation or automatic rerouting. A Google Maps walking button is always available as fallback.
- Privacy: the hotel search request sends the hotel text and map-centre coordinates to Photon; a deliberate route request sends the start/destination coordinates to the walking route provider; Google Maps links open that service separately. Do not silently request GPS permission. Do not transmit/sync saved hotel or GPS to Cloudflare or analytics. Never claim the local route is live transit routing.
- Provider fair use: Photon and Valhalla are public shared services. Before launching to substantial public traffic, arrange an appropriate supported provider, rate limits, a backend proxy where appropriate, and validate production CORS and navigation behaviour on mobile. GVB or Google Maps should remain the primary source for up-to-date public transport advice.

## Full-screen map and walking safety

- On mobile, the map in `public/map.html` occupies the available viewport. The **Shops** button opens the searchable coffeeshop list in a dismissible bottom drawer. Street, Bus and Metro remain selectable. **My trip** opens the hotel/GPS planner. On the homepage, a visible **Open full-screen map** link opens the stand-alone map.
- The selected shop opens a compact panel with **Walk on map** and an optional **Other routes** section for hotel walking, hotel transit and GPS walking. **Save place** and **Find shop in Google Maps** sit in the final action row. The large yellow warning box and separate generic Walk/Transit links were removed. The address reference caveat remains as a small note. Duplicate Leaflet marker popups were removed.
- On-map walking uses Valhalla's `pedestrian` costing model, which excludes roads mapped as prohibiting pedestrian access and prefers paths/sidewalks. Our request now further favours footways and sidewalks and penalises alleys/driveways. **This does NOT establish that every crossing, pavement, bridge or route segment is safe, publicly accessible, or wheelchair-accessible.** OSM tags may be wrong or missing. Do not promise that motorways will never be suggested if underlying data is incorrect. This is a preview tool, not a certified road-safety navigation product.
- GPS following is foreground only. A geometric off-route alert uses nearest route segments and approximate GPS accuracy; it is an advisory rather than a live safety monitor. Do not automatically reroute in the background. The pedestrian route UI explicitly warns users to obey road signs, look for legal pedestrian crossings, avoid hazardous roads, and use a dedicated service such as Google Maps when unsure.

## First-visit hotel setup and simplified cards (October 2026)
- The mobile coffeeshop detail card now shows four always-visible actions: **Walk on map**, **Public transport from your hotel**, **Walk from hotel**, and **Walk from GPS**. The previous Other routes expander was removed. A star button beside the shop title toggles the visitor's **local** saved-shop list; the Save place text button was removed.
- A full-width **Check Google reviews** link appears at the bottom for named shops. It uses Google Maps search for the shop name plus published address, adding the verified `googlePlaceId` when one is available. This **does not guarantee the correct Google Business Profile**, so the card instructs visitors to confirm the matching listing. Unnamed shops instead link to their street address. Never label unverified links as certified exact Google profiles.
- On a visitor's first visit to the map when no hotel has been saved, **My hotel & routes** opens a skippable welcome and hotel search. The visitor can choose a hotel, pick a point on the map, or **Skip for now**. On completion or skip, only a local browser preference `atlas-first-hotel-prompt-v1` is stored; no user account, remote hotel storage or location transmission is added. A saved hotel remains on the same device under `atlas-my-hotel-v1`.
- Genuine public **shop rankings** are not yet displayed. Implement them only after independently matching individual Google Place IDs and arranging an appropriate Places API key/billing. Google `rating` and `userRatingCount` can be fetched subject to Places API field pricing, terms, attribution and storage restrictions. Do not invent star ratings, rankings, review counts or cache paid Places responses unlawfully. A reasonable future ranking uses both ratings and sample size and makes the source and freshness explicit. Google reviews belong to Google and may be more up to date than any local snapshot.

## Hotel-first welcome and site entry (October 2026)

- The main site URL (`public/index.html`) is now the **visitor introduction**, not the embedded-map homepage. It explains the three-step flow: choose accommodation, browse the map, plan walks or transit. The previous photo-rich homepage has been preserved at `public/discover.html`, linked from the introduction so past design work and gallery remain accessible.
- First-time visitors select **Choose my accommodation** to move to the second onboarding step. Enter a hotel, hostel, apartment or Amsterdam-area street address; submitting sends the query to the third-party Photon/OSM search service. Tapping a returned place saves its name and coordinates **locally** to `atlas-my-hotel-v1`, sets the existing `atlas-first-hotel-prompt-v1=seen` preference, and immediately navigates to the full-screen `public/map.html`. Because the keys match the existing `public/assets/atlas-trip.js`, the hotel marker appears on the map automatically, and the old trip setup prompt does not repeat.
- Visitors may explicitly **continue without saving accommodation**. Returning visitors who already have a valid saved hotel see **Open my Amsterdam map** immediately; they can also change their accommodation. The introduction has no automatic GPS request and does not retain personal hotel data on the website server. The optional hotel/address Photon search is not a hotel-booking engine and users must verify the selected match.
- The marketing/gallery page `discover.html` remains for editorial content, but its old embedded map has been replaced with an entry button to the hotel-first introduction. Gallery shop searches pass a `shop` query parameter to the introduction; after accommodation selection, the full-screen map automatically shows matching shops in its directory. People with old direct `map.html` links can still use the existing map and may see the older skippable hotel prompt if they have no saved hotel.
- Onboarding assets are `public/assets/welcome.css` and `public/assets/welcome.js`. Validate mobile, keyboard and Photon search behaviour in a real browser after deployment. The static page can display explanatory content even if Photon is temporarily unavailable.

## Evidence-based ratings, ranked shops, recent menu links — 18 October 2026
- `public/assets/shop-intel.js` stores a **manually checked, traceable snapshot** of 146 source-labelled community ratings (145 Greenmeister, one Trustpilot) with their visible review counts and direct source links. **These are not Google ratings** and are not live API results. Nothing is fabricated for the other 21 address records. The October 18 expansions brought the original 14 shop ratings to 94, then added 45 more name-and-address-matched ratings to reach 139, and 7 further ratings to reach 146. Ratings are unverified user-contributed Greenmeister scores, not audited reviews.

- **Matching workflow**: search by the shop's trading name (including historical names), then require the exact street + house number before assigning an individual Greenmeister rating. Do not transfer ratings between branches. Greenmeister listings often note that owner details have not been verified by Greenmeister; the snapshot is a sourced community rating rather than a validated quality certification. For example, skip its 'Amnesia' entry at Bergstraat 11 when the Atlas address is Herengracht 133.
- The **Top rated (10+ reviews)** discover filter dynamically includes all qualifying shops and orders them by a conservative confidence-adjusted score: `(rating * reviewCount + 3.8 * 25) / (reviewCount + 25)`. The UI still displays the original one-decimal source rating and number of reviews. Shops with fewer than 10 reviews are displayed when selected but are excluded from the ranked shortlist to avoid treating a 5.0 from one review as equivalent to 4.9 from hundreds.
- `shop-intel.js` also stores **23 matched, dated menu links** to CoffeeshopMenus.org's **latest menu** pages. The Atlas displays at most **one latest-menu link per shop**, and only while the last verified menu-photo date is no older than **120 days**. Menus are sorted newest first in the `Recent menus` discover filter. The links always open the source's latest-menu page, rather than copying or rehosting menu photos and prices. If a newer menu is uploaded at the source, the link can show it even while the Atlas's last-checked date remains unchanged until the next review.
- Menu dates represent **photograph dates, not verified live stock or price validity**. No old menus are presented as current; when a menu date passes 120 days, it automatically disappears from the site's recent-menu filter and shop card until checked again. Shops with no validated recent menu show a neutral unavailable note. **Do not add prices to the Atlas as though they were live.**
- The rating sources are individual, name-and-address-matched Greenmeister pages (145 shops) and one Trustpilot business profile for Coffeeshop West (10 reviews, matching Balboastraat 19). Trustpilot uses a different TrustScore method and is excluded from the Greenmeister Top Rated ranking; this is a **manually checked October 2026 snapshot**, not a live refresh. Branches with old names were matched by address, and entries with sparse review counts remain visible without entering the ranked shortlist. Rating source: https://en.greenmeister.com/coffeeshops/amsterdam. Menu source/index: https://www.coffeeshopmenus.org/ams_index.html. The exact per-shop rating and menu links are in `shop-intel.js`. Sources may change and some directories contain outdated brand names; verify addresses carefully.
- Google business reviews remain a **separate link** from each shop card. Avoid claiming that Greenmeister community ratings are Google reviews. To use Google ratings instead would require individually matched Places IDs, Google API access, field pricing and compliance with Google display/attribution and caching policies.
- Add more ratings and menu matches **only when independently verified**. Update `checkedAt` for each rating/menu record and bump `shop-intel.js` cache query when the source data changes. Consider a periodic independent re-check process before public launch because the score snapshot is not automatically refreshed.

## Menu viewer and Google reviews feasibility (18 October 2026)
- **Updated 18 October 2026:** The cross-origin full-screen image viewer was removed after repeated mobile load failures. Selecting a currently listed menu now navigates to the **first-party `public/menu.html?shop=<id>` page**, which loads shop name, address, archive photo date and the archive's original page/photograph links **without requesting third-party image bytes inside Atlas**. The page itself loads independently; external photographs remain hosted at CoffeeshopMenus.org and open directly there. This is a deliberate reliability and permission tradeoff, **not** a claim of in-site image embedding. The same 120-day filter suppresses stale archive entries. No photographs have been copied or mirrored.
- Do not bulk-download, copy, or host contributor menu photographs on the Atlas server without appropriate permission/licensing. For a guaranteed native image gallery, request permission from the menu-photo copyright holders or obtain direct owner-authorised photographs, then host credited files in our own static assets, record the photo date and link, and show a menu lightbox for those authorized images.
- Using **Google Places ratings and selected written reviews** is technically feasible but requires: a user's Google Cloud project and enabled Places API/Places UI Kit with billing; verified stable Google Place IDs for each coffeeshop; appropriate usage limits and key restrictions; and compliant Google Maps/author attribution, terms and privacy notice. Google API content storage/caching is restricted; do not import Google's live rating data into the static GitHub file or silently label Greenmeister data as Google. Google's Places UI Kit is an option for rendering reviews inside the site and may be used independently of the existing OpenStreetMap tiles if implemented per Google's policies.
- No Google API key or billing account is configured for this repo in this change, so the current **Greenmeister community rating** snapshot remains the site's ranking source. Do not claim Google ratings are live until the user enables API access and verified place IDs are configured.

## Additional name matching and score-source rules — 18 October 2026
- Names were updated to correspond to address-matched shop listings: Nieuw → New Amsterdam (Hoofdweg 226), Sensemillia → Sensemillia West (Meer en Vaart 177B), 420 Cafe → Strain Hunters (Singel 387), The Wow Shop → The Corner (Spaarndammerdijk 9). The original directory labels remain in `nameNote` for transparency. These are not claims of verified current trading status.
- The Coffeeshop West rating is a Trustpilot **TrustScore**, not a Greenmeister arithmetic mean; its source and review count display on cards, and `excludeFromRanking` keeps it out of the Greenmeister-only ranking. There are now 146 ratings and 21 unrated address records. Google ratings remain links only; no Google review content was copied.


## Atlas Score pilot

*Dated smoker-experience evidence — 18 October 2026*

Atlas Score is a **provisional, independent editorial estimate**, NOT a Google rating, a firsthand tasting, a laboratory-quality check or a guarantee of today's products. **BudMap** remains a working naming idea; the interface deliberately uses **Atlas Score** until branding is decided.

### Source and coverage
- Original source: name-and-address-matched, publicly dated Greenmeister comments. The original three pilot evidence sets were **7th Heaven / Coffeeshop 137** (Brouwersgracht 137), **ProGram** (Daniël Stalpertstraat 78) and **Tweede Kamer** (Heisteeg 6); additional shop records have since been added. Not all evidence sets qualify for a score after the newer review-cluster safeguards. Exact date/reviewer/category annotations and source URLs are in `public/assets/atlas-verdicts.js`. Each summary is our own short paraphrase of a public comment, not a republished review.
- On cards, the Atlas assessment appears first and the Greenmeister or Trustpilot **community stars** appear separately below. The old `Top rated` label is now `Community stars (10+)`: this is a source-only ranking and **not a recommendation**. The `Atlas Score · assessed shops` filter includes only shops meeting the conservative score threshold, while `Recent review evidence` includes dated notes that may still be insufficient. Every other shop displays its missing-evidence status. An unrated shop is not a bad shop, just insufficient evidence.
- Seating is shown only where a specific source supports it: **7th Heaven** (comfortable seating reported Sep 2026), **Tweede Kamer** (small cosy seating reported May 2026), **ProGram** (smoking area listed by source, but seating not independently confirmed). The data model also supports a clearly labelled **No seating** card tag when a named shop has up-to-date, individually verified evidence for takeaway-only operation. **Never infer no seating** from lack of evidence. All labels are source-linked, date-labelled and expire with stale evidence.

### Scoring methodology
- Weighting: flower/hash quality **50%**; staff/service **25%**; shop atmosphere **15%**; value **10%**. These sub-scores are editorial interpretations of explicit review-language, NOT categories that the original reviewer rated. Avoid making quality claims from an overall star score alone.
- A reviewer must have a dated, attributable, linked public comment less than **540 days** old. Repeated comments from one username only count as **one person**, and the newest relevant comment is used per topic; we cannot verify that different usernames are unique humans.
- Cap at **five reviewer accounts per calendar month** for any one shop to prevent a sudden cluster of praise from overwhelming the results; this is only a limited safeguard, not fraud detection. More recent evidence has larger weight: up to 90 days=1; 91–180 days=.8; 181–365 days=.6; 366–540 days=.3. Anything older than 540 days, or dated in the future, is excluded automatically by the browser.
- For each category, shrink the dated sample towards **3.5/5 with 2.5 pseudo-reviews** to avoid misleading five-star scores from tiny samples. Unknown categories stay 3.5 and say **Not verified**. The source's total historical rating count is displayed but **cannot rescue a shop with zero current flower/service evidence**.
- An overall score is only issued when a shop has at least **four distinct eligible usernames**, **three explicit product-quality mentions**, and **two explicit service mentions** after deduplication/month caps. All currently scored shops are still marked **provisional / early evidence**. Ten or more eligible usernames display `Growing evidence`, but do not imply independent verification.
- All sampled positive and negative remarks should be considered without selective exclusion. When a source is contradictory, ambiguous, spam-like, or mismatched to the branch, HOLD the Atlas assessment instead of pretending certainty. Do not call any shop definitively safe, good, bad or reliably stocked based on user comments. Prices, batches, service and seating may change.
- Unlike static historical community scores, Atlas Score automatically loses evidence as time passes. Until someone independently rechecks the source, the Atlas data remains a manually selected snapshot. For production, periodically inspect additional sources and audit the pilot sample, refine trust signals, add explicit negative evidence, then expand coverage **without publishing unsourced numbers**.
- Modules: `public/assets/atlas-verdicts.js` holds dated per-shop evidence and seating reports; `public/assets/atlas-score.js` computes and renders the provisional score. Both are versioned and loaded in `public/map.html` without API credentials or Google Maps scraping.

### Every-shop Atlas Score coverage — October 2026

The same conservative assessment mechanism is applied to **all 167 addresses**. This does **not** mean that 167 quality scores can be honestly calculated. The October 18 source inventory has **146** lifetime community ratings (145 Greenmeister, 1 Trustpilot) and **21** without a matched independent rating. Aggregate star averages are **never** imported into the Atlas Score calculation.

The expanded dated-evidence records now cover **32** specific shops, including 15 with at least one eligible dated personal account comment and 17 with a note documenting why older prominent reviews cannot support a 2026 assessment. These are *manually researched samples*, not a complete read of every historical comment or every review platform. Results are recalculated in the visitor's browser as comments age out.

For each shop card the Atlas now identifies whether (1) a **provisional Atlas Score** is justified by recent topic-specific evidence, (2) dated reports have been examined but are insufficient for a score, (3) a historic community aggregate exists but dated product/service comments **have not yet been individually audited**, or (4) no matched community rating source is available. These are distinct states; never say the shops lacking an editorial assessment are poor or unsafe. "Community stars (10+)" remains an explicitly separate and potentially historical comparison, not a reliable quality ranking. "Recent review evidence" is an additional filter that lists researched dated snippets, including criticism and unresolved cases. Original community ratings still have source links.

The stronger scoring threshold now also requires eligible observations spanning **at least three separate calendar months, with no month accounting for more than half** of the final per-shop accounts. This guards against clustered reviews (not proof of fake submissions). Users can inspect dated paraphrases and source links in the details panel. Current source-only pilot scores should **not** be described as firsthand taste tests or representative surveys. Greenmeister accounts cannot be independently verified or established as unbiased customers.

Sourced seating notes currently include 7th Heaven, Katsu, Tweede Kamer, Abraxas, The Dolphins and Sativa. The website does not infer "no seating" from absence of information. Verified current takeaway-only labels can be added later with a dated source. The February 2024 Balou seating complaint is too old and contradictory to support a definitive current "no seating" tag.

**Operational caution:** This is an evidence-screening foundation, **not** a completed editorial audit of all 167 shops. To give the remaining shops a fair, current product/service rating, gather and independently cross-check sufficiently recent original customer reports or shop visits, revisit changed shop names/addresses, and update the manually curated source file. Do not bulk-scrape Google ratings or present model interpretations as verified cannabis quality tests.

### Full directory score audit — October 18, 2026

All 167 list entries now have a visible Atlas assessment-status label: provisional scored, dated evidence but unscored, historical ratings only, or needs a source-matched review. A separate sourced seating label appears if evidence exists, including limited and explicitly *unverified* listing descriptions. The score filter never turns unknown product/service quality into 3.5–5 stars automatically. The initial current count is **four** provisional scores (7th Heaven, Abraxas, Boerejongens West, Hunters Amsterdam West); 15 shops have individual dated review records, and 17 more shops have researched notes that their prominent comments do not support 2026 scoring. This is not a complete Google or Greenmeister review of all 167, and no Google rating data has been copied or persisted. The age/date screening is dynamic and scores can expire.

Official Google Places reviews could be shown later with user-enabled API access, accurate matched Place IDs, permitted display and attribution. Google content cannot be scraped into our static dataset as a way to fabricate fresh coverage. The accessible independent Greenmeister comments vary widely in dates and are not always shown in newest-first order; a missing recent visible review is *not proof* that no recent review exists.

### Further review and venue checks, 18 October 2026

Readily accessible individual Greenmeister pages were also inspected for Happy Days, Coffeeshop Oost, The Border, Voyagers, Original Dampkring, Green Place, The Bulldog Ex-Police Station, Solo, Family First and Relax Zuid. Source pages sometimes show featured or sorted older comments, not necessarily every newly submitted review. Happy Days' private smoking area claim comes from an October 2025 visitor report, and was intentionally marked **unverified now**; Oost's old 2023 complaint about seating was deliberately **not** used to say the branch has no seats in 2026. These reports extend editorial records to **32 addresses** (15 with individually dated observations, 17 with research/old-data cautions). The other 135 addresses still await shop-specific editorial assessment. All 167 are nonetheless governed by the same scoring and missing-evidence rules.

### High-profile shop correction and source audit (18 October 2026)
- Atlas shop #90 at Nieuwe Nieuwstraat 32HS has been renamed **Terps Army** from the stale **El Guapo** display name, keeping the old name searchable. The shop-specific Greenmeister rating was corrected to **4.3/5 (22 reviews)**; it must never inherit the original El Guapo rating or Terps Army 2's reviews. Terps Army 2 at Zieseniskade 22 remains its own shop #166 with its separate lifetime rating and dated review evidence. Easy Times II at Reguliersdwarsstraat 29 remains independent and was NOT renamed.
- Atlas shop #136 at Spuistraat 80 has been renamed **DrewIsSharing**, with historic **Mediterrané** retained as a searchable alias. Greenmeister still has the listing under Mediterrané; the dates and text of the 2025 after-rebrand comments verify the branch identity. Its lifetime **4.3/5 (6)** community score remains separate from the provisional editorial score and is not passed off as Google.
- Individually dated review notes added or revised for Family First, Terps Army main, Terps Army 2, Prix d'Ami and DrewIsSharing. Family First and Prix d'Ami have established venue reputations but not enough fresh firsthand flower/service observations for a strict numerical Atlas Score. Venue seating listings are clearly labelled as such; shop marketing is not independent product verification.
- DrewIsSharing's five separate 2025 user reports include four product remarks and a critical quality-control / refund allegation that is **unverified**. An Atlas Score, if issued by the existing confidence rules, must display source-linked critical as well as positive evidence. Neither Google Maps user-review data nor third-party Google rating snapshots have been copied into the static Atlas data.

## Atlas menu page migration and future venue accounts (October 2026)

- Menu links in `public/map.html` now lead to `public/menu.html?shop=<integer ID>`; the broken JavaScript viewer, navigation controls and stale image timers were removed. The new page uses first-party CSS and DOM elements and cannot stall while hotlinking menu photographs. The original source page and individual photo links open in separate browser tabs; the Atlas **does not display the archive image itself**.
- The menu page reads `assets/shops.js`, `assets/shop-intel.js` and `assets/owner-menus.js`. The last is intentionally empty: no venue accounts have been created and no shop-supplied menu images have been licensed or approved. It defines a future path for genuinely owner-authorised, same-origin images and native information once the publishing model is legally approved.
- Dutch government guidance restricts online cannabis advertisements and online offering. **Do not launch shop-supplied cannabis product menus, live availability, prices, orders or promotions before Dutch legal review.** Archive photographs are offered only as external citations; Atlas does not mirror them to sidestep hotlink policies.
- Future verified shop accounts and community reviews (weed/product quality, service, value, location and chill) are a **proposal**, not functionality launched by this code change. A detailed staged technical, legal, security and moderation plan is in `ATLAS-2-ROADMAP.md`. Authenticated reviews need a real backend, and shops must never control user ratings.

### Consistent menu navigation (October 2026)
- All 23 shop records with dated menus now follow the same path: shop card → Atlas menu page → individual direct photographs from CoffeeshopMenus.org (opened in a new browser tab). A menu with multiple photos lists them separately and puts the first photo first.
- The source archive page remains as a separate credited link on the menu page, rather than as the main menu action. Where no direct image URL is supplied in a future record, the archive link is an explicit fallback.
- The Atlas does not embed, copy or rehost external menu photos. This standardises navigation, but a third-party link may still be unavailable if its publisher changes it.

## Atlas rating coverage: two explicit confidence tiers (19 October 2026)

The directory now runs the *same transparent rating policy on all 167 addresses*, even where only sparse data is available. The display has **two separate numeric types**, not 167 first-hand cannabis quality evaluations:

1. **Atlas Score · dated reviews**: only five shops currently qualify for the strict, independently dated topic-specific report threshold. Flower/hash 50%, service 25%, atmosphere 15%, value 10%. These remain provisional, reviewed account identities are unverified, and scores expire as reports age.
2. **Atlas estimate · community data**: an additional 149 shops have independently sourced, address-matched lifetime community averages (Greenmeister, Leafly, Weedmaps and Weeview), but insufficient dated evidence for the independent score. We expose a smaller-sample-adjusted estimate, NOT an assessment of product quality. Formula: `(n × community_average + 12 × 3.5) / (n + 12)`, where `n` is the provider's lifetime review count. This is a reproducible editorial *adjustment*, not an actual set of 12 customer votes or independent quality reviews. Individual review ages, quality, and the underlying community platform's sampling are **not verified**. Confidence labels warn visitors about very small samples. Source credits and original links are displayed.
3. **No numerical score (13)**: 12 shops still lack an eligible address-matched independent review average, while one extra address has only a Trustpilot average, which is intentionally excluded from the shop-experience estimate to avoid merging unlike sources. Every unscored shop still receives an Atlas status and a source-research explanation where available. **Never assign these shops a default 3.5, five stars or a made-up cannabis score just to reach 167/167.**

The map's **Atlas ratings** filter includes both numeric types, with detailed review-based shops first. **Detailed review assessments** limits the shortlist to the five stronger scores. **Recent review evidence** is for shops with individually dated notes, irrespective of whether they qualified. The ordinary community stars remain shown separately as historical, source-specific aggregates.

The original 21 missing Greenmeister records were audited on 19 October 2026; nine now have additional independently sourced ratings in `public/assets/atlas-verdicts.js`. Source notes document exact-address zero-review pages, older names and branches, conflicting unit numbers, renamed/closed providers, and external Google-based aggregates that cannot simply be copied. In particular, the Greenmeister Amnesia page currently returns Bergstraat 11, *not* the Atlas's Herengracht 133H. Likewise, a Black Star provider page says Rozengracht 1A versus municipal 1H; Rockland gives Raadhuisstraat 101 versus 8; and Rick's gives Nieuwe Hoogstraat 22 versus Oudezijds Voorburgwal 250H. None is silently mapped onto the wrong address.

**What remains**: To reach 167 genuinely meaningful ratings, independently audit the remaining names and street numbers, gain permitted access to up-to-date customer ratings where available, and ultimately build moderated first-party user reviews for weed, service, value, location and chill. Google review links remain available in each card but Google Maps review data is not scraped or stored. Numbers without reliable evidence stay visibly unrated.


### Rating coverage update — 19 October 2026

After a second full audit of the 21 missing Greenmeister entries, nine previously unrated addresses gained **address-matched source averages**, with the source clearly labelled. Current snapshot: **167 municipal addresses; 5 review-based detailed Atlas Scores; 149 historical/source-adjusted Atlas estimates; 13 numerically unrated (12 with no acceptable independent community average, plus one Trustpilot-only business-site rating excluded from shop scoring).** The 155 known third-party rating entries include 146 Greenmeister, 2 Leafly, 1 Weedmaps, 5 Weeview and 1 separately excluded Trustpilot. These aren't 155 independently verified 2026 cannabis quality assessments.

Newly covered IDs: #45 Balboa Family (Weeview 4.5/5, n=3), #52 Amnesia (Leafly 4.3/5, n=15; most visible reviews 2017–2019), #57 Aktama 2 / 156 (Greenmeister 5.0/5, n=2), #72 Yin Yang (Weeview 5.0/5, n=3; reports from 2020–2021), #74 Get Down To It / The Internet Café (Weedmaps 4.8/5, n=4; other sources differ), #98 Tha Dogg House 2 (Weeview Da Dogg House at Oudebrugsteeg 26, 4.9/5, n=3), #115 Rock-Land (Leafly Raadhuisstraat **8**, 4.4/5, n=5; historic), #126 The Hit / formerly Rusland (Weeview 4.3/5, n=3), #167 Kadinsky Zoutsteeg / Front Page (Weeview 3.6/5, n=1). All rating ages and name/branch caveats remain visible in each shop's expandable source details. The original community stars (10+) filter is now specifically **Greenmeister-only**, to avoid comparing unlike platforms inside one traditional provider ranking. The broader Atlas source estimates remain distinguishable from review-based assessments.

Source research: https://greenmeister.com/coffeeshop/aktama-2 ; https://www.leafly.com/dispensary-info/amnesia-coffeeshop ; https://www.leafly.com/dispensary-info/rockland-coffeeshop ; https://weedmaps.com/dispensaries/get-down-to-it-coffeeshop ; https://weeview.nl/location/amsterdam/ . All newly sourced figures are static, as checked on 19 October 2026, and can become outdated. Continue to exclude Google-attributed or scraped ratings from the Atlas source dataset, unconfirmed unit-letter matches, historical operator-specific ratings, and entries with zero reviews. Do not claim 167 complete numerical ratings or invent category subscores.

## Stage 2: separately supported category ratings (19 October 2026)

Every coffeeshop card now has an expandable **Ratings & facilities** section with four numerical categories and one factual facilities tile:
- **Weed quality:** specifically described flower and hash products.
- **Service:** firsthand staff friendliness, knowledge and helpfulness.
- **Value:** firsthand assessment of prices relative to products received.
- **Chill factor:** reported atmosphere and ability to relax; this does not prove seating, food or entertainment availability.
- **Facilities (not a star rating):** date-labelled, source-linked seating, smoking areas, outdoor tables, food and drinks when individually supported. Any absent amenity is *unknown*, not unavailable.

These are **editorially interpreted sub-scores** from individual comments, not star ratings those users directly supplied. They are intentionally distinct from the general Greenmeister/Leafly/Weedmaps/Weeview source-adjusted **overall Atlas estimates** and from the previous 50/25/15/10 **overall review-based Atlas Score**. Category estimates do *not* silently change the overall score weights. No one else's generic star rating is converted into weed/service/chill category data.

The category model reuses the existing **540-day rolling review window**, username deduplication, latest-per-category mentions, maximum five accounts/month for a shop, age-dependent evidence weight and Bayesian shrinkage toward 3.5/5 using 2.5 pseudo-observations. It then independently tests *each category* for **at least three distinct eligible accounts for weed, service and chill**, or **two for value**, in **at least two calendar months**, with *no month containing more than 60%* of that category's sampled accounts. Accounts are assumed distinct by username, not verified as genuine customers. If these criteria are unmet, the category shows its evidence count and **Not yet rated** / **Insufficient evidence**, never an invented 3.5/5 displayed score. Source links and the method remain expandable. Scores can disappear as comments expire. Similar posting patterns or source bias may still exist; numerical categories are *provisional*.

Directory **Weed quality, Service, Value, Chill** filters rank only shops clearing their specific category threshold. Location is handled by the existing map, hotel and walking routes, rather than a user star rating. Facilities are not ranked numerically.

As of the code and data update on 19 October 2026, independently eligible category coverage is: **7** weed-quality scores, **3** service scores, **2** value scores, **3** chill scores; Facilities has **17** shops with at least one source-linked note and **150** shops awaiting verified facility information. These are *not* citywide best-of rankings across 167 verified shop category surveys. Initial examples: 7th Heaven's weed score uses seven qualifying dated accounts; Katsu's chill score uses seven across four months; Sativa gains more recent customer service evidence. Qualifying counts are recomputed in the browser on each visit.

Additional reviewed source evidence: [August 2026 visitor discussion of Sativa, Katsu, Family First, Bluebird and Original Dampkring](https://www.reddit.com/r/AmsterdamEnts/comments/1vm9msx/visit_next_week/) and [March 2026 DrewIsSharing hash/service discussion](https://www.reddit.com/r/AmsterdamEnts/comments/1s8q5ui/a_day_out_in_amsterdam/). The visitor report of Katsu's outdoor table is dated and labelled as a report, *not* a promise of available seating. The DrewIsSharing data still retains the contradictory critical 2025 product report. The new category breakdown and filters have been validated through static JS checks and all 167 shop card renderers, **not** a live Cloudflare-browser/mobile test.

**Next evidence work:** Seek independently attributable, recent, branch-matched reports for popular shops like Family First, Terps Army and Prix d'Ami; avoid padding category scores with anonymous hype, unrelated shop branches, Google content copied without permission, stale historic ratings, or official shop marketing presented as unbiased visitor experience. Further dated, shop-specific facility evidence could be contributed through a future moderated shop/account workflow, but no accounts have been introduced.

### Facilities replacement — 19 October 2026

The mobile five-tile layout is now **Weed quality, Service, Value, Chill factor, Facilities**. Facilities is a **full-width factual information tile**, not a fifth numerical score. The other four provisional category scores, provider aggregate estimates, filter order, menus and walking route actions are unchanged.

Facilities status logic:
- **Reported:** a dated individual visitor account describes the feature; current availability is not guaranteed.
- **Listed:** a venue website or directory claims the feature; it is not necessarily independently confirmed.
- **Not yet verified:** we have no qualifying dated source. This does **not** mean the shop has no seats, food, drinks or entertainment.

The card can expand **View facility sources** for dates, direct links and qualifiers. The existing seating banner remains. Historic seat reports are screened using the same rolling 540-day window. Examples: Katsu's indoor seating and August 2026 outdoor-table report; Prix d'Ami's venue-listed multi-room lounge, food and drinks; and Hunters Utrechtsestraat's listed indoor seating and terrace. Sources were already in the curated atlas-verdicts record and have been organised into independently attributed features; they do **not** imply live availability. No food, music or entertainment claim is inferred from a generic positive chill review.

Static JavaScript validation checked all 167 shop cards, the 17 evidence-backed facility records, the absence of invented facility data on the other 150 records, unchanged numerical category coverage, menu links and route handlers. Live mobile layout remains to be verified after Cloudflare deploy.


### October 2026 — welcome buttons and mobile trip-panel UX

- The welcome page adds a **14px separation** between the saved hotel's two actions. **Open my Amsterdam map** stays the primary solid-green action; **Change my accommodation** becomes secondary when a hotel has already been saved. Both styles track the existing saved hotel without changing local storage.
- The map's **My Amsterdam trip** panel shows the saved hotel first, with a small **×** remove control **inside the hotel card** and confirmation before removal. The removed hotel marker disappears, and pending or active walking routes are cancelled when a starting point changes.
- Hotel/address search, nearby hotel search pins and **Pick on map** are grouped under a collapsed **Change accommodation** disclosure whenever an accommodation is already saved. The disclosure is open when no accommodation has been saved.
- Only the live location toggle remains exposed in the planner. The old **Centre** and **Forget hotel** buttons were removed. **⌖ Centre map** now appears on the mobile map, centring on an active GPS fix, otherwise the saved hotel, otherwise central Amsterdam. It does **not** start GPS permission requests.
- The long privacy/help text is tucked into **Privacy & navigation info**; the mobile map temporarily hides an already-open coffeeshop detail card while the trip panel is open and restores it when closed.
- Mobile/touch controls are spaced for accessibility; the existing menu, route and community-rating sections are unchanged. Static JS checks and a simulated saved-hotel/remove-hotel interaction passed; live Cloudflare/browser rendering still needs checking on a phone.


### Map marker quick previews (October 2026)

To keep the mobile map visible while browsing, tapping an individual coffeeshop **pin** now displays a compact Leaflet popup containing the shop name, area and an accessible right-chevron button. Tapping the chevron opens the existing full coffeeshop detail card (Atlas ratings, facilities, sourced community scores, menu-photo link, route controls and Google review link). The popup itself does **not** open copyrighted external menu photographs automatically.

Shop choices from the **directory** and return links from `menu.html?shop=<id>` still open the complete detail card directly. Selecting a marker while the full card is open closes the card and replaces it with the new small preview. A different marker replaces the first popup. Closing a preview clears its highlighted selection. Marker previews intentionally **do not call `renderList()`**, since that clears and rebuilds Leaflet cluster layers, which would instantly dismiss the popup. Directory opening can still re-render because it intentionally closes the popup first.

Pin popups use `bindPopup` with automatic map panning, `keepInView` and source-safe HTML escaping. The right-arrow has a 44px touch target and an accessible label. Dynamic evidence, favourites, menus and the route planner were not otherwise changed. A mocked DOM/Leaflet interaction test covered 8 preview and selection cases; live smartphone/browser confirmation remains outstanding.


### Mobile shop-card interaction (October 2026)

Tapping a coffeeshop **map marker** now opens the full detail card directly in a larger, vertically scrollable mobile sheet (~81% of the available viewport, with room for map controls). The small name-only preview and chevron were removed after mobile feedback; no extra tap is needed. Selecting a shop from the directory or returning from its dated menu page also opens this same full card. The close X restores the map. Atlas ratings, facilities, dated menu links, favourites, reviews, and hotel/GPS/transport route actions are unchanged. The mobile trip panel continues to hide an already-open shop card temporarily while the trip planner is displayed.

Source-level tests passed. Actual deployed Cloudflare mobile appearance remains a separate user-device check.


### Pin-anchored coffeeshop name popup (20 October 2026)

**Latest interaction (supersedes the two earlier preview experiments):** Tapping an individual map pin opens a **small name popup immediately above that exact icon**, with a subtle pointer, a close X and the existing **View full shop** button. The shop name is also tappable. This is a persistent, non-Leaflet-DOM popup so the action controls survive map marker redraws; its placement uses `map.latLngToContainerPoint`, updates on map movements, pans the map down if a tapped pin is too high to display the popup, and clamps horizontal placement on narrow screens. Tapping the full-shop button opens the same full ratings/menu/routes card as before, while directory selections and returning from a menu page still go straight to the full card. Background map taps dismiss the small popup.

The previous fixed-bottom small card and direct-full-card-on-marker behaviours are superseded by this pin-anchored design. All existing shop data, menus, favourites and walking directions are unchanged. Syntax and eight mocked marker/preview interactions were checked; verify live mobile behaviour after Cloudflare deployment.



## October 2026: compact full shop modal from marker preview

- Tapping a pinned coffeeshop opens the persistent small name-and-chevron preview. Both the shop name and 44px chevron open a **centred, scrollable full shop window**; tapping the directory continues to open the full view directly. The small preview avoids relying on disposable Leaflet popup nodes.
- The full shop view is compact by default: name/address, a single collapsible Atlas rating summary, a dated menu link when available, two travel actions (**Walk on map**, **Public transport**), and a text-sized Google review link. It no longer includes duplicate Greenmeister star cards or the redundant Walk from hotel and Walk from GPS buttons.
- Expanding the Atlas rating summary immediately reveals the existing five-section **Ratings & facilities** panel, with underlying report sources and the adjustment methodology still accessible in their independent disclosures. Source labels are not removed from the model.
- On mobile the full view is a centred modal above a dimmed map backdrop, scrolls at limited screen height, closes via X, backdrop or Escape, and preserves the favourite toggle. Open-accordion state survives favouriting the same shop. Menu navigation and fallback walking route behaviour remain unchanged.
- Verified with static JS parsing and simulated name-preview-to-card, rated/unrated, menu and overlay interactions. The deployed Android layout is **not** claimed as tested until checked on-device.


### One expanding popup attached to the selected shop pin (October 20, 2026)

- Clicking a cannabis shop marker opens the existing small, pin-attached **name + chevron** preview. The name and chevron open the full shop details.
- The full details are now rendered **inside that same `#shopQuickPreview` element**. It increases in width/height while keeping its triangular pointer anchored over the selected shop marker; the contents scroll in the expanded card. There is no separate centre-screen modal for shops with located pins.
- The enlarged card has a new **‹ Back to small preview** control, plus the existing favourite, close, Atlas rating/Facilities disclosure, dated menu page, walking-route and transit actions. The outer wrapper stays connected to the marker during map moves and zooming.
- Expanding repositions the map so the marker stays just below the card, while the card's maximum scrollable height respects the available map viewport. Small screens and tall review sections scroll rather than overflowing the map.
- Shops with **no verified coordinate** continue to use the full centred card. Selecting from the directory or returning from a dated menu still opens full details directly. Closing a card, switching shops and opening route planning reset the popup cleanly.
- Code syntax and simulated open/expand/collapse/close/other-shop/no-pin flows passed; actual Android/Cloudflare visual and gesture testing remains necessary.


### Mobile single-row map controls (20 October 2026)

The mobile map now uses one responsive top toolbar containing the hotel shortcut, coffeeshop directory button, Street/Bus/Metro view switcher, and transport Key button. The shop count remains available inside the directory but is hidden from the top button on phones to preserve space; for <=345px, the directory button becomes an accessible icon-only control. The three map-mode buttons retain at least 44px-high touch targets. Wider desktop layouts remain unchanged. The hotel trip panel opens underneath its shortcut; route Key opens beneath the row. This is a CSS/DOM arrangement change only: existing buttons retain their IDs and event handlers, route planning, pinned shop cards, menu links, and on-device hotel state are not changed. Source-level JS checks and a narrow-width Chromium layout fixture were run; live Cloudflare mobile appearance still requires verification.


## 20 October 2026 — ratings accuracy audit and remaining coverage

**Latest numeric coverage: 155/167**. Five review-based Atlas Scores qualify under the rolling dated-review threshold; 150 other shops have **source-adjusted historical community estimates**; 12 lack a reliable, applicable numeric aggregate. The names, addresses and reasons for all 12 missing values live in `public/assets/atlas-verdicts.js`. Never assign an arbitrary 3.5/5, infer flower quality from a company's overall Trustpilot score, merge a different branch/operator, or copy a third-party Google rating into Atlas just to make the total 167/167.

**New venue match**: The African Blackstar, official published location Rozengracht 1H, is listed by Weeview as Black star, Rozengracht 1, postcode 1016LP, with **4.1/5 from only 3 users**. Amsterdam's own *Terrassenplan Rozengracht* names The African Blackstar and its public frontage at Rozengracht **1A** (2021, Section 2.2.2: `https://assets.amsterdam.nl/publish/pages/1038217/20211221_concept_terrassenplan_rozengracht.pdf`). These address references identify the same venue but not a confirmed shared municipal unit suffix. We therefore add a **tiny-sample source estimate** for its shop identity and leave the official published address unchanged. Reviewer age is unverified; this is *not* proof of current product quality.

**Independent cross-checks**: A second-source directory (`https://weeview.nl/location/amsterdam/`) was checked against **23** specifically name-and-street-matched shops already having an eligible historical source rating. Its ratings are stored as `crossChecks` in `public/assets/shop-intel.js`, with independent source attribution, separate sample size and no assumed date verification. They are **not merged or counted twice** in Atlas's primary score; cross-source audiences and time periods may overlap. Abraxas, Het Gelderse and Green Place show at least a 0.6-star disagreement with at least five Weeview users, so their Atlas evidence panel warns that community sites disagree. Smaller differences are shown as a comparison but not labelled a conflict. The rating summary now displays its source-review count immediately.

**Review age and limitations**: `checkedAt` is the date *we inspected the listing*, **not the date visitors left reviews**. `sourceEstimate` now explicitly marks source-based numbers as a tiny/small/moderate/larger **historical sample, with review ages unverified**, or as **old review evidence** where individually visible source material is exclusively old. The five known older-only sources (IDs 45, 52, 72, 115 and 167) have source-specific explanations. Their numeric historical estimates remain viewable with warnings, but must not be presented as a current flower/service recommendation.

**Next work for the 12 genuinely unrated shops**: Power Flower Amsterdam, New Times 2, Coffeeshop West (Trustpilot separate), Cheech & Chong, Flash Back, Shop 96, Rick's Coffeeshop, The Saint, the Sarphatistraat 87G permit-refusal address, De Prijs, El Marssa and The Dream. Many have individually published comments or Google-derived aggregates, but lack either a trustworthy branch match, original independent rating count, applicable business continuity, recent dated reporting, or permissible content reuse. The permit-refusal address should not be scored as an active shop without new operating-status evidence.

**Future truly comparable scores across all 167** require new, consent-based original customer reviews (ideally shop, visit date, flower quality, staff, value and chill separately), controlled for spam, repeat reports, brand changes and insufficient samples. A factual verified facilities list is not a fifth numeric score. Any first-party collection and moderation system should be addressed in a separately approved phase, after the mobile map and menu workflow stabilises.

**Verification**: Repository JavaScript compiles and per-shop rendering has been checked offline. That does not prove Cloudflare deployment or mobile pin behaviour is correct.

