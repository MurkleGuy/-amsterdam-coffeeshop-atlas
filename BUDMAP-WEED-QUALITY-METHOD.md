# BudMap Weed Quality — early research indicator

Updated 21 October 2026. This is **separate from the official BudMap Overall
Score**; it does not replace any of the 156 overall review-based ratings.

## What visitors see

The map's **Best Weed · early evidence** view is shown first. It continues
to list and map all 167 coffeeshops, sorting the shops with qualifying
quality-specific evidence above those without a weed rating. The count
and label explicitly say **early estimate**, not a city-wide definitive top ten.

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

The available early estimates are for 7th Heaven, ProGram, Abraxas,
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

## Test checklist

- **Best Weed · early evidence** is the first selected discovery option;
  six early-assessed shops appear first, then the remaining shops, with
  all 167 available for search, map pins and directions.
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
