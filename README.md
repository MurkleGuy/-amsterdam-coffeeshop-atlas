# Amsterdam Coffeeshop Atlas

A mobile-friendly independent directory and map of Amsterdam cannabis coffeeshop addresses, hosted as a zero-build static website on Cloudflare Pages.

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
