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

There is no Node install, backend, framework, or build step. `public/index.html` is the homepage. `public/assets/styles.css` is the stylesheet, `public/assets/shops.js` is the dataset, and `public/assets/app.js` implements the interactivity.

## Important data and image notes
Shop addresses are based on Amsterdam's 2026 published cannabis-tolerance reference, not a live guarantee of an operating coffeeshop. Name matches and older shop photos can be incorrect/outdated. Verify each shop before visiting. Images from Wikimedia Commons are licensed by their photographers; preserve their attribution on the credits page. No official logos have been copied into this project.

Pins are resolved by a third-party Dutch public geocoder as visitors browse and may be delayed or limited; shop addresses and Google Maps directions remain usable even when automatic geocoding is unavailable. For a larger public launch, pre-geocode and validate coordinates with a suitable permitted service.

## Repo scope
This is independent of the two existing Crispy Clean projects and must not share their Cloudflare deployment or GitHub repository.

## Public transport map and Google Maps destinations
- The map at `public/map.html` has Street / Transport modes, both using the key-free **OpenStreetMap Standard** raster basemap, softened with a CSS filter. Transport overlays thinner, semi-transparent **OpenRailwayMap standard** infrastructure for tram, metro and rail. This is not an official transit-service map or live timetable. Ferry and bus routes are not reliably displayed; use the Google Maps Transit link for actual service options.
- Do not reintroduce `basemaps.cartocdn.com/light_all` without a licensed API key; the service displayed an "API KEY REQUIRED" watermark in October 2026. Public OSM and OpenRailwayMap tile servers are donation-funded best-effort services with use limits and attribution requirements. Use a suitable commercial or self-hosted basemap if this project receives substantial traffic. Do not bulk-download tiles or remove visible attribution. External tiles need an internet connection.
- Google Maps buttons target the **business name plus the listed postal address** when a named coffeeshop is present. Unnamed entries use the street address as a fallback. These search links **do not guarantee** a specific business result.
- For an exact Google Business Profile destination, obtain and independently verify its official Google Maps **Place ID**, then populate that shop's `googlePlaceId` in the `official` array in `public/map.html`. The map automatically adds `query_place_id` for search links and `destination_place_id` for navigation. Never invent Place IDs or assume the municipality's address alone proves the Google listing.
- Both walking and transit directions are handed off to Google Maps, which chooses the route based on the visitor's origin, availability and timetable. This site does not calculate routes itself.
