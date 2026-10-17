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
