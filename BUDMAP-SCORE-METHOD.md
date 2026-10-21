# BudMap Score — active rating method (20 October 2026)

This file documents the **active** map rating method. Earlier Atlas Score pilot sections
in README.md are historical records and are no longer the rating algorithm loaded by
`public/map.html`.

## Calculation

For a single shop, collect independently published 1–5 star **venue-level**
ratings, each verified against the correct street address/trading identity.

**Confidence-adjusted source rating out of 10 = (2 × published rating × review count + 7 × 5) / (review count + 5).**

This uses a 7/10 baseline with **five statistical prior reviews**, not five actual reviews.
The effect is deliberately strongest for small review samples. It shrinks both
unusually high and unusually low ratings towards the neutral baseline, without
pretending to have new real user reviews.

**BudMap Score = arithmetic mean of the adjusted per-website ratings.**
Every independent website contributes equally, regardless of review count.
Review counts change the reliability adjustment *within each website*, but do
not give a big website more voting power than the smaller websites.

All displayed ratings use one decimal place and the same /10 scale. Converting
a rating to /10 does not make the input data more precise.

Perfect original ratings illustrate the rule:
- 1 review → (10 × 1 + 7 × 5) / 6 = **7.5/10**.
- 2 reviews → 7.9/10.
- 5 reviews → 8.5/10.
- 10 reviews → 9.0/10.
- 22 reviews → 9.4/10.
- 100 reviews → 9.9/10.

The 7/10 baseline and five-review strength are explicit editorial choices, not
an empirically calibrated prediction of customers' future visits.

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

- **Combined** (2+ websites): show the adjusted ten-point score and include
  in the ranked "Best BudMap scores · compared" filter.
- **Preliminary** (1 website): show the same **confidence-adjusted ten-point
  rating** but with a prominent "Preliminary · 1 site" label and its actual
  review count. This is *not* a corroborated BudMap Score and is excluded
  from the combined ranking.
- **Unrated** (0 websites): show that a score is pending, never a numeric guess.
- "All rated coffeeshops" shows both combined scores and preliminary single-site ratings, with
  combined ones listed first.
- All displayed numerical ratings on the map use the ten-point scale. Multi-site averages are labelled BudMap Scores and single-site conversions are labelled preliminary, with the site's review count.
  Provider brand names are not displayed in the main score cards or rankings,
  but remain recorded with source URLs in the source dataset.

**Present coverage as of 20 October 2026**: 167 addresses; 23 with two-site
averages, 133 preliminary single-site ratings (converted to /10 but not combined BudMap Scores), 11 unrated. The loaded datasets
do not currently contain a three-site average for any address. New qualified
providers may change those numbers.

## Perfect-score audit — 21 October 2026

All 21 displayed 10.0/10 ratings before the first correction were
based on a **single** source; 15 involved fewer than five reviews and seven
only one review. Single-source ratings remain clearly labelled preliminary and
are now review-count-adjusted. For example, the seven one-review originals
fall from 10.0/10 to 7.5/10. Older reviews remain a separate unresolved issue.

## Review-count adjustment — 21 October 2026

The confidence adjustment now applies to **every** scored coffeeshop, both
single-source preliminary ratings and multi-source combined BudMap Scores.
No original source star ratings, review counts or source links were overwritten.

## Limitations and required future checks

These are historical community averages, **not** product tests or a guarantee
of today's experience. The numbers cover review populations and periods that
may differ; the same person may post to multiple platforms. Very small samples
are adjusted towards 7/10, but the adjustment cannot establish current quality. The `checkedAt` field records **when we checked
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
- Verify DrewIsSharing (4.3/5 over 6 reviews and 4.8/5 over 5 reviews): **8.1/10** after per-site adjustment, averaging the resulting 7.87 and 8.30 values.
- Verify all 21 single-site 5.0/5 averages display as preliminary adjusted
  ratings below 10.0/10, with the actual review count and never in the combined ranking.
- Verify the 11 missing-source shops show "Not rated yet".
- Verify the ranked filter excludes preliminary and unrated shops, and the 23 combined shops are sorted correctly.
- Verify "All rated" includes 156 shops and "Recent menus" still works.
- Verify hotel setup, pinned preview, full card, favourites, directions and
  mobile map position after deployment.
