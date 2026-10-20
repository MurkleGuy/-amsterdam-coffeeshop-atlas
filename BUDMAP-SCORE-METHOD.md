# BudMap Score — active rating method (20 October 2026)

This file documents the **active** map rating method. Earlier Atlas Score pilot sections
in README.md are historical records and are no longer the rating algorithm loaded by
`public/map.html`.

## Calculation

For a single shop, collect independently published 1–5 star **venue-level**
ratings, each verified against the correct street address/trading identity.

**BudMap Score = 2 × (sum of eligible website ratings / number of eligible websites)**.

Each website has equal weight, exactly as requested. Show one decimal place out of
10. **A ten-point display does not add precision**: 4.23/5 becomes 8.5/10 when
rounded to one decimal.

Example: 4.6/5, 4.0/5, 4.1/5 → 8.466…/10 → **8.5/10**.

The script `public/assets/budmap-score.js` reads:
- `window.ATLAS_INTEL.ratings[id]` — existing primary venue rating.
- `window.ATLAS_INTEL.crossChecks[id]` — independently checked comparison.
- `window.ATLAS_INTEL.extraRatings[id]` — optional array of further
  independent providers to allow 3, 4, 5 or more provider ratings.

Validation requires provider identity, a 1–5 rating, a positive integer review
count, and an HTTPS venue-related source link. A provider is counted **only once**
per shop. Repeated pages or translated listings on the same review platform must
not be counted as independent ratings. Entries are not borrowed from other branches.

## Display and ranking

- **Combined** (2+ websites): show the ten-point score and include in the
  ranked "Best BudMap scores · compared" filter.
- **Preliminary** (1 website): show the converted source score but flag it as
  preliminary; do not place it in the compared ranking.
- **Unrated** (0 websites): show that a score is pending, never a numeric guess.
- "All rated coffeeshops" shows both combined and preliminary scores, with
  combined ones listed first.
- The map displays the BudMap name, ten-point score, and number of ratings used.
  Provider brand names are not displayed in the main score cards or rankings,
  but remain recorded with source URLs in the source dataset.

**Present coverage as of 20 October 2026**: 167 addresses; 23 with two-site
averages, 133 preliminary single-site scores, 11 unrated. The loaded datasets
do not currently contain a three-site average for any address. New qualified
providers may change those numbers.

## Limitations and required future checks

These are historical community averages, **not** product tests or a guarantee
of today's experience. The numbers cover review populations and periods that
may differ; the same person may post to multiple platforms. Very small samples
may generate unstable scores. The `checkedAt` field records **when we checked
a page**, NOT when its customers visited.

Original review-website names, rating counts, links and matching notes are
retained in the source dataset for verification. Correctness and permission
must be checked before using a new source.

**Google ratings are not currently combined into BudMap Score.** Google Places
requires approved API access, billing and compliance with restrictions on
retention, display, map use, and Google Maps attribution. The user's wish not
to mention other platform names in the score UI cannot override a provider's
required attribution. Do not scrape or store Google Places ratings in a static
file as a workaround, and do not silently imply Google has been included.

All numerical inputs must come from verified actual published averages,
not guesses from comments or text sentiment analysis.

## Testing checklist

- Open all 167 shop cards; no client JavaScript errors.
- Verify DrewIsSharing: (4.3 + 4.8) / 2 × 2 = **9.1/10** (two sites).
- Verify single-source scores are labelled preliminary.
- Verify the 11 missing-source shops show "Not rated yet".
- Verify the ranked filter excludes preliminary and unrated shops.
- Verify "All rated" includes 156 shops and "Recent menus" still works.
- Verify hotel setup, pinned preview, full card, favourites, directions and
  mobile map position after deployment.
