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
- The initial research pass has now been attempted for **all 167** shops.
  **142** have directly inspected venue/product or quality-source pages.
  **25** instead have dated menu-only evidence, venue-wide feedback or
  unresolved sources and need more specific product-quality checks.
  **114** shop source pages show at least some individual product ratings;
  this does **not** mean that product rating dates, batch identity,
  source licence, reuse rights or numerical scoring eligibility are established.
  Across the inventory, **15** sources list no products and **5**
  list products with no recorded ratings.
- 156 existing overall venue-rating website links as possible research
  starting points (146 Greenmeister pages and 10 other pages); a venue
  link does NOT establish the existence of a product rating.
- Null `eligibleProductRating` and `productScore` for all shops. These
  fields are **not permissions to invent data**.

Record a source's checked date separately from the actual **date of a
product review** and the **menu update date**. None are interchangeable.

## What the first source check showed

The initial research pass now covers **167 / 167** shops, with directly inspected venue/product or category-source pages for **142**. The first 12 are documented here, followed by selected findings from later passes. No third-party product star averages have been copied into BudMap:

| Shop | Menu marked updated | Preliminary finding |
| --- | --- | --- |
| Family First | 28 Apr 2023 | Individually rated flower products exist; historical menu too old for current-batch claims. |
| 7th Heaven | 28 Feb 2026 | Some products rated; many zero-rating products; individual product-review ages still unverified. |
| Tweede Kamer | 10 Nov 2025 | Multiple product star ratings exist, but review recency and sample validity need a separate audit. |
| Boerejongens West | 15 Sep 2025 | Flower and hash product stars visible; stock freshness unverified. |
| Boerejongens Centre | 11 Sep 2025 | Flower and hash product stars visible; stock freshness unverified. |
| Coffeeshop Amsterdam | 15 Sep 2025 | Some products rated, many unrated. |
| ProGram | 26 Sep 2026 | Recent menu, but many products have zero or very few votes. |
| Abraxas | 9 Apr 2023 | Historically rated products, but menu is over three years old. |
| Hunters (Orteliusstraat 193) | 7 Aug 2026 | Branch-specific flower ratings present; other products unrated. |
| Hunters (Utrechtsestraat 14H) | 7 Aug 2026 | Branch-specific flower ratings present; other products unrated. |
| Hunters Noord (Papaverweg 2) | 7 Aug 2026 | Branch-specific flower ratings present; other products unrated. |
| Hunters Bros (Waterlandplein 7) | 7 Aug 2026 | Branch-specific flower ratings present; other products unrated. |

The next 20 pages were inspected on 21 October. The sample includes DNA, The Old Church, Happy Days, Best Friends Oud-Zuid, The Border, Pacific, The Plug Westerdok, Babylon, Relax Centrum, Boerejongens BIJ, Risky Business, Siberië, Atlas (Noord), Massawa, The Bulldog Port 26, Nogal Wiedes, Happy People, Oost, Paradox and The Plug East. Pacific's page had **no products listed**. Paradox's source page reports **Eerste Bloemdwarsstraat 2R** while the tracked government address ends in **2H**; this entry is flagged for address verification. Many menus date to 2022–2025 and newer menus often contain products with just one rating. The complete per-shop source links, menu dates and caveats are in the tracker.

The **53 additional source pages in the preceding pass** were inspected on 21 October. Important issues include: Sensemillia's unrated products, D&L and Bronx having no products listed, Roots' 14 versus 14B address discrepancy, and two different Kadinsky venue pages claiming Langebrugsteeg 7A. Weeview's Yin Yang quality feedback dates only to 2020–2021. Even shops such as The Stud with triple-digit historic strain votes show an old October 2023 menu. Newer menus such as 1e Hulp's September 2026 page still require actual product-review ages and batch validation. Full per-shop sources, menu dates, notes and confidence statuses are saved in the tracker.

The final pass assessed the remaining **82** entries with source-page inspection where possible, published dated menu archives, or a clearly recorded unresolved result. All 167 entries have a research attempt date and individual notes in the tracker; not all have a directly inspected product-rating page. Significant new findings include: Central and De Kade display product ratings alongside 2026 menus, while several pages have no products (for example Crash Light and Super Skunk). Amsterdam's 9 June 2026 official permit decision refused the application associated with Sarphatistraat 87G; this is an identity/operating-status verification issue, not a cannabis-quality judgement. No product-specific stars have been imported or turned into BudMap Weed Quality Scores.

Sources and check dates for all **167 research attempts** are in the inventory.
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
- Existing venue-rating website URLs identified as candidate research leads: **156**.
- Initial research attempts: **167 / 167**; no shop left without a research note.
- Directly inspected venue/product or category source pages: **142 / 167**.
- Other shops (menu-only, review-only, or unresolved): **25 / 167**.
- Source pages with at least one individual product rating: **114**.
- Sources showing no products: **15**; sources with zero-vote product listings: **5**.
- These findings are only initial evidence availability. All 167 need deeper work on product-review dates, batch identity, sample validity and data-use permissions before verified scores can be issued. No product-star averages have been imported.
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
