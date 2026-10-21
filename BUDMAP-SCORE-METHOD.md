# BudMap Score — active rating method (20 October 2026)

This file documents the **active** map rating method. Earlier Atlas Score pilot sections
in README.md are historical records and are no longer the rating algorithm loaded by
`public/map.html`.

The rating covered here is **BudMap Overall**, which reflects overall venue
reviews. The live map also has a separate, deliberately limited
[Weed Quality research indicator](BUDMAP-WEED-QUALITY-METHOD.md) based only
on dated product-specific comments. Neither calculation should be substituted
for the other.

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

## Display and ranking — updated 21 October 2026

**One BudMap Score out of 10 is shown for every coffeeshop with at least
one suitable published rating.** The same review-count adjustment is applied
whether the shop has one website or five.

- **Rated (1+ websites)**: display the adjusted BudMap Score, the number
  of independent websites, and the sum of the sites' published review counts.
  Summed review counts must not be represented as unique customers.
- **Unrated (0 websites)**: no numerical score is displayed.
- **Best BudMap scores**: rank all rated coffeeshops by unrounded adjusted
  score descending; break ties by more independent websites, followed by
  larger published review totals.
- **All coffeeshops**: list all 167 locations and their rating, if available.
- **Recent menus**: remains a separate filter.

The single-source label "Preliminary" has been retired. One website's score
is still confidence-adjusted, not independently corroborated. Website and
review counts therefore remain visible at all times. Five statistical prior
reviews at 7/10 are included in the calculation, but these are **not** actual
reviews.

Provider brand names are not presented in the main score or ranking display.
The source dataset maintains each original platform rating, review count and
URL for audit, and any provider's legally required attribution must still be
honoured.

**Coverage as of 21 October 2026:** 167 addresses; 156 BudMap Scores
(133 based on one website and 23 based on two), and 11 awaiting data.

## Historical scoring changes

The original experiment generated 21 misleading 10/10 ratings based on one
website; seven came from only one customer review. The same review-count
adjustment now applies across the board. For example a 5.0/5 source with
one review yields 7.5/10 rather than 10.0/10.

The former "preliminary" distinction is removed from presentation, while
all users can still see whether the score rests on one website or several.
The confidence-adjustment baseline is an editorial choice, not an empirically
proven prediction of current product quality.

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

- Verify all 167 shop records are handled without client JavaScript errors.
- Verify 156 rated coffeeshops show a BudMap Score out of ten and a visible
  count of contributing websites and published reviews.
- Verify 11 unrated shops show no invented score.
- Verify the "Best BudMap scores" filter includes all 156 scored shops,
  ranked by adjusted score, and excludes the 11 unrated shops.
- Verify The Plug Westerdok: 5.0/5, one review → **7.5/10**, one website.
- Verify DrewIsSharing: source ratings 4.3/5 (6) and 4.8/5 (5) →
  **8.1/10**, two websites, 11 published reviews total.
- Verify mobile cards, pin previews, hotel setup, favourites, directions
  and menu links after deployment.
