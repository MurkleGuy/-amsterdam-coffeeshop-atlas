# BudMap Weed Quality — early research indicator

Updated 21 October 2026. This is **separate from the official BudMap Overall
Score**; it does not replace any of the 156 overall review-based ratings.

## What visitors see

The map opens with **All coffeeshops**. The dedicated **Weed quality ·
Research underway** view lists all 167 shops **alphabetically**, with existing
quality-specific evidence disclosed but **no city-wide weed rank numbers**.
The earlier six-shop "Best Weed" leaderboard is paused as misleading until
wider independently supportable coverage has been obtained.

Each coffeeshop detail card presents **Weed Quality** first and **BudMap
Overall** second. Both use a /10 scale when a numeric value exists.
A missing weed-quality number stays **Not rated**, even when that same shop
has a high overall BudMap rating. No overall rating is used as a quality proxy.

## Evidence and scoring

The only inputs for the weed-quality score are dated comments under
`window.ATLAS_VERDICTS.evidence[id].observations` that the editorial team
previously interpreted as discussing **flower or hash quality**. This is
not a platform's user-entered flower-specific star rating and is not a
current laboratory or firsthand product test. The exact original comment
has not been independently verified beyond the source URL and recorded
review handle/date. Different handles may belong to the same person.

The quality module `public/assets/budmap-weed.js`:

1. Requires a valid, URL-linked review handle, a date within the previous
   540 days and an existing editorial quality interpretation from 1 to 5.
2. Uses the latest qualifying flower/hash comment per handle; caps at five
   dated accounts per shop per calendar month.
3. Requires **at least three quality-specific accounts**, spread across
   **at least two calendar months**, with no single month responsible for
   **more than 60%** of the eligible product-quality accounts.
4. Weights comments by recency: up to 90 days = 1, 180 = 0.8,
   365 = 0.6 and 540 = 0.3. Earlier comments expire automatically.
5. Shrinks the weighted average towards **3.5/5** using **2.5**
   statistical prior review-equivalents, then multiplies by two for a
   **/10 early estimate**.
6. Never substitutes overall, staff, seating, price or ambience scores
   when product-quality comments are absent.

**This formula is an editorial estimate from a selective sample**, and the
prior and thresholds are judgement calls, not statistical verification.
Fresh stock and batches can change significantly between visits.
Do not market the provisional list as the objectively best weed in
Amsterdam; use new, genuinely quality-specific evidence to expand it.

## Verified snapshot at implementation

After applying the stricter **product-only** date/concentration check,
**6 of 167 shops** have an eligible provisional quality number as of
21 October 2026. The previous archive's legacy category routine displayed
7, but counted non-quality reports towards its monthly cap, allowing
Tweede Kamer into the small eligible pool. The new weed-only logic
correctly withholds its rating due to clustered flower reports.

The existing selected-comment early estimates are for 7th Heaven, ProGram, Abraxas,
DrewIsSharing, Boerejongens West and Hunters (West). Other shops remain
unrated for weed quality until a sufficiently dated, topic-specific
sample is available. Family First has one dated product-quality report
in the stored research; it is **not** enough to assign a weed score,
and that one report must not be treated as a definitive assessment.

The underlying editorial interpretations are retained unchanged in
`public/assets/atlas-verdicts.js`. Do not promote the historic overall
Atlas Score model: it mixes service, venue experience and value, with
unverified neutral priors for missing categories, and is not suitable
as a weed-quality score.

## Full-city research tracker

The [weed-quality research tracker](research/weed-quality-tracker.json)
holds one record for each of the 167 source-shop IDs. It separately stores
the status of external product-page checks, the number of dated editorial
quality-specific accounts already on file, and a null product score until
a defensible, permitted scoring basis exists.

The first 3 product-page spot-checks were carried out on 21 October 2026:
Family First (April 2023 menu), 7th Heaven (February 2026 menu) and
Tweede Kamer (November 2025 menu). Product stars were visible, but they
have **not been licensed, imported or converted into BudMap Weed Scores**.
Most other shop-product pages are still unresearched.

The full scope, evidence gates, permissions considerations and visitor
review proposals are in [the research plan](WEED-QUALITY-RESEARCH-PLAN.md).

## Test checklist

- **All coffeeshops** is the first selected discovery option; the separate
  **Weed quality · Research underway** view lists shops alphabetically without
  quality rank numbers. All 167 remain accessible for searching, pins and directions.
- **Best Overall · BudMap** sorts the 156 existing adjusted overall ratings
  without altering them.
- **Weed Quality** is the first shop-card panel, **BudMap Overall** the
  second; both can be expanded independently.
- A shop without sufficient product reports displays no numerical weed
  score, even if its overall score is excellent.
- Ageing comments gradually expire after 540 days so the quality list may
  become shorter without a fresh research update.
- The list and detail panel never present platform names as a substitute
  for quality evidence and do not fabricate dates or scores.
