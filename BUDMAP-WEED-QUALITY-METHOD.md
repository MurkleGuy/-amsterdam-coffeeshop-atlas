# BudMap Weed Quality — early research indicator

Updated 21 October 2026. This is **separate from the official BudMap Overall
Score**; it does not replace any of the 156 overall review-based ratings.

## What visitors see — public weed ratings paused

The map opens with **All coffeeshops**. **Product research · 167 shops**
lists all shops alphabetically with research notes, dated menu/source
information and links, **but no numerical weed-quality ratings or Best Weed
leaderboard**. A shop shows its Product Research disclosure and a separate
**BudMap Overall** rating where one exists.

Eight draft editorial weed-quality estimates are retained in source for
future validation, but the map no longer loads or shows that score engine.
The 156 overall shop ratings do not serve as cannabis-quality proxies.

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

The first six selected-comment early estimates were for 7th Heaven, ProGram,
Abraxas, DrewIsSharing, Boerejongens West and Hunters (West). On
21 October 2026 the existing evidence-based category model was expanded
to include **Relax Zuid (7.8/10; 4 quality-focused source comments across
September–October 2025)** and **Sativa (7.7/10; 3 comments across
July 2025, January and August 2026)**. As of that update, **8 of 167**
have an early editorial weed-quality score. The other **159** remain
unrated for quality until enough individually dated product-specific
evidence exists.

Relax Zuid's comments are clustered near the September/October calendar
boundary and may not represent independent or representative sampling;
they pass the literal two-month / 60% test but are still a *low-confidence
early signal*, not proof of present-day stock. Sativa's third quality
observation describes the user's perceived price-to-quality balance;
the numerical quality value is an editorial interpretation. Neither
shop's overall star rating was reused to create a weed score. Family First has one dated product-quality report
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

The first research pass on all 167 shop records was completed on 21 October 2026. Earlier directly inspected pages included:
Family First (April 2023 menu), 7th Heaven (February 2026 menu),
Tweede Kamer (November 2025 menu), Boerejongens West and Centre,
Coffeeshop Amsterdam, ProGram, Abraxas and four separately matched
Hunters branches. Product stars were visible, but they
have **not been licensed, imported or converted into BudMap Weed Scores**.
The tracker also identifies 156 existing venue-rating website links as
research leads, of which 146 point to Greenmeister venue pages. These
are **not** verified product-rating feeds. After the first pass, **all
167 addresses have individual dated research attempts**; **142** have
inspected venue/product or quality-source pages, while **25** only have
menu-only, general review or unresolved-source findings. **114** shop
source pages display at least some product star ratings, but the menu
update date is not the date of each customer's review, and product
batches change. **15** source pages have no product listings and **5**
list products without votes. Identity conflicts and the refusal of a
permit application at Sarphatistraat 87G are explicitly flagged.
**None** of these product ratings has been imported or issued as an
official BudMap Weed Quality Score. No claimed 167-shop quality leaderboard
has been published.

The full scope, evidence gates, permissions considerations and visitor
review proposals are in [the research plan](WEED-QUALITY-RESEARCH-PLAN.md).

## Public display checklist

- **All coffeeshops** is the default view with all 167 entries.
- **Product research · 167 shops** lists shops alphabetically with linked
  research statuses, but no weed-quality rating number or ranking.
- Product Research appears on shop cards separately from **BudMap Overall**.
- **Best Overall · BudMap** still sorts 156 customer-satisfaction ratings.
- The eight draft quality estimates remain in research source but are not
  loaded or displayed on the public map.
- Menu dates and inspection dates never stand in for product-review dates.
