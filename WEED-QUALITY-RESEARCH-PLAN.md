# BudMap — 167-coffeeshop Weed Quality research and rollout plan

Created: 21 October 2026
Status: **Research groundwork only; not a complete weed-quality rating programme**.

## Goal

Develop meaningful /10 **Weed Quality** estimates for as many of the 167
address-matched Amsterdam coffeeshops as reliable evidence supports. The
target is 167 *researched* shops, but **never force 167 numeric scores**
by reusing general venue stars, a single old product rating, or guessed
quality. Keep the independent overall BudMap Score unchanged.

The live map currently lists all shops by default. The "Weed quality ·
Research underway" option is alphabetical, not a city-wide top-ten
ranking. Six existing dated-comment editorial estimates remain labelled
**early estimates** on cards. They are **not** third-party product ratings.

## Machine-readable inventory

[`research/weed-quality-tracker.json`](research/weed-quality-tracker.json)
contains exactly one shop record per published address ID (1–167), with:

- Shop ID, matched name and full address (so branches are not conflated).
- Count of distinct rating websites contributing to the **overall** score,
  strictly informational and not used as a weed-quality number.
- Existing quality-specific comment count and whether that selective
  editorial sample supports only an **early estimate**, is insufficient,
  or has no dated product reports.
- Product-level source-research status; initially "not_checked" for
  164 shops and "product_rating_listing_found" for three spot-checks.
- Null `eligibleProductRating` and `productScore` for all shops. These
  fields are **not permissions to invent data**.

Record a source's checked date separately from the actual **date of a
product review** and the **menu update date**. None are interchangeable.

## What the first source check showed

Three source pages were examined for **product-specific rating existence**,
without copying third-party product-level star averages into BudMap:

| Shop | Menu marked updated | Preliminary finding |
| --- | --- | --- |
| Family First | 28 Apr 2023 | Individually rated flower products exist; historical menu too old for current-batch claims. |
| 7th Heaven | 28 Feb 2026 | Some products rated; many zero-rating products; individual product-review ages still unverified. |
| Tweede Kamer | 10 Nov 2025 | Multiple product star ratings exist, but review recency and sample validity need a separate audit. |

Links and check dates are in the inventory's three checked entries.
A site's product star average is not proof that stock from a particular
shop, strain, grower, harvest or batch is still available or equivalent.

## Required research stages

**A. Verify source access and reuse rights first.** Check each provider's
terms, copyright, required attribution and whether its product-rating
dataset can be obtained through a permitted feed, API, licence or
partnership. Do not bulk scrape or republish another site's full
ratings catalogue. Source identifiers may be stored privately; public
attribution must be honoured where required. Never ingest Google Places
content outside its own licence and display conditions.

**B. Identify shop-specific product evidence.** For each address, verify
the exact venue identity, distinct flower/hash products, linked source,
sample size, product-review dates (or documented absence of dates),
menu freshness and likely time-varying stock. Never mix a brand-level
strain reputation with an actual shop's batch rating.

**C. Establish a clearly labelled quality model.** Candidate indicators
include a conservative, review-count-adjusted aggregation of genuine
product-level ratings, the variety of distinct products genuinely rated,
and recent dated qualitative flower/hash reports. Decide on exact
weights and minimum evidence thresholds **only after** a meaningful
data-quality audit. Existing small-sample editorial estimates should
remain separate from source-entered product-star ratings until the
method is formally versioned and documented.

**D. Validate city coverage.** Report how many of 167 shops have: a
verified shop/product listing, recently checked product ratings,
adequate numerical quality evidence, and no dependable data. Revisit
the menu and quality freshness limits. Never call 167 researched
shops "167 rated" if some legitimately lack enough evidence.

**E. Launch community quality reviews only with moderation.**
Authentic first-hand flower/hash reviews could improve coverage, but
an open anonymous unmoderated form would invite spam, fake reviews,
repeat votes and shop self-promotion. A real submission backend,
consent/privacy and retention notices, age restrictions, account
controls or other abuse prevention, moderators, correction/appeal
routes, and policies for disputed claims are needed. None of this
review-submission infrastructure is deployed now; do not imply it is.

## Coverage at kickoff

- Amsterdam addresses tracked: **167 / 167**.
- Existing overall BudMap scores: **156**.
- Quality-specific dated comments recorded: **22 shops**.
- Shops meeting the narrow **early editorial** weed-quality threshold: **6**.
- External product-rating pages spot-checked: **3**.
- Product-level data feeds confirmed authorised for redistribution: **0**.
- Shop-level Weed Quality ratings built from licensed product star
  averages: **0**.

The six *early estimates* are not evidence that a comprehensive
product-based city ranking is complete. Data scarcity is a research
finding, not a reason to manufacture scores.

## Publication gate

A prominently labelled **Best Weed** ranking should return only when a
usefully broad, reasonably balanced set of shops has quality-specific,
current and legally usable evidence. Before launch, document coverage,
freshness, source diversity, common missing-data biases, minimum sample
requirements, tie-breaking and reviewer anti-gaming. Always include
a searchable way to see the remainder as **Not rated for weed quality**.

This document is a planning and tracking guide, not a guarantee that
all 167 shops will become eligible for a numeric rating.
