# Atlas 2.0 — verified shop accounts and independent community reviews

Status: **planning only**. No shop logins, public review submissions, database, image uploads or order functions exist yet. This document describes a possible future product; the October 2026 static website remains an independent editorial guide.

## Product concept

Make each coffeeshop's Atlas page a useful, mobile-friendly venue profile, while keeping shop-supplied facts and independent visitor experiences distinct.

**Visitor side**

- Visitors may create a review account, choose the exact branch/address, and submit a dated first-hand experience.
- Five optional 1–5 categories (not all visitors experience all five): **flower/hash quality**, **service**, **price/value**, **location/convenience**, and **chill/atmosphere**. An overall score is shown only where enough independent reviews exist.
- **Chill** can include seats, comfort, music, entertainment, cleanliness and overall ability to relax. It is **not applicable** when a shop is legitimately takeaway-only; do not automatically penalise a shop for lacking a lounge. Keep a separate sourced seating status: available / limited / takeaway-only / unverified.
- Visitors can add a brief factual comment, visit month/date, optional accessibility observations, and flag errors. No mandatory location tracking or proof of a cannabis purchase.
- Public cards show review count, distribution, freshness and confidence; separate reviewed ratings from editorial Atlas Score and historical Greenmeister ratings. Use dated reviews only with care; show no score for insufficient evidence.
- One active review per account per branch, with editing history and dispute reporting. Publishing can be delayed for moderation. Do not allow unreviewed accusations or personally identifying data to be broadcast.

**Shop side**

- A manager requests a shop claim and verifies control of that specific venue. Moderators approve claims; a chain's staff cannot manage every branch by default.
- A verified manager can request corrections to neutral venue data, post permitted facts (for example: seating, accessibility, current opening arrangements), and respond once to public reviews.
- Managers **cannot edit, delete, reorder or secretly downrank visitor reviews**. They can flag a review for a documented reason, request investigation, or post a signed response.
- Venue images and any public menu media require uploader rights attestation, moderator approval, expiry dates and applicable legal clearance.
- **Do not enable public cannabis menus, cannabis product prices, stock offers, reservations or e-commerce by default.** Dutch government guidance says coffeeshops must not advertise cannabis or offer it online. Have a Dutch lawyer review the proposed publishing model before any shop-controlled cannabis menu module goes live. No sales, payment or delivery workflow is proposed.

## Technical architecture (proposed, not configured)

Existing GitHub → Cloudflare Pages hosting can continue. Use Cloudflare Pages Functions for API handlers, D1 for structured records, R2 for **permission-cleared** venue media, and Turnstile plus rate limits on submissions. Use a managed authentication provider with secure email verification/passkeys for public users and shop staff. Separate roles and check access **server-side** for every write. A generic static JavaScript file cannot securely store account data or ratings.

Example logical tables:

- `users`: account ID, auth provider ID, roles, creation date, age-gate acknowledgement, status.
- `shops`: stable source shop ID, verified address, current/historic names.
- `shop_claims` and `shop_roles`: owner-verification evidence, reviewer/moderator audit, access scopes.
- `venue_updates`: claimed facts, source, publication status, revision history and expiry date.
- `reviews`: ID, shop ID, user ID, visit month, five nullable ratings, plain-text report, created/edited time, moderation status. Enforce one active review per shop/user.
- `review_reports`, `shop_responses`: dispute workflow, audit trail, moderation reason.
- `approved_media`: shop ID, R2 object key, owner permission and rights record, safety/moderation review, expiry date.
- `menu_versions`: **reserved** only; activation requires legal sign-off and uploader rights.

Possible read endpoints: `GET /api/shops/:id/ratings`, `GET /api/shops/:id/amenities`. Proposed write endpoints (not live): `POST /api/reviews`, `POST /api/claims`, `POST /api/venue-updates` with authentication, authorization, input validation, CSRF protection as appropriate, server-side Turnstile validation, rate limiting and audit logging.

## Scoring and trust principles

- Treat each of the five review dimensions separately. Ratings left blank are **not** zeroes.
- To rank, apply a recency-weighted robust average with sample-size confidence and visible count; minimum unique reviewers. Avoid a five-star label after one short enthusiastic review.
- For product quality, do not assume a user's rating describes the current inventory or future batches. No medical or purity/safety certification.
- Separate **popular**, **well reviewed**, **good product reports**, and **suitable to chill** filters. Don't have venue seating affect flower-quality score.
- Display shop-provided information as **Provided by the venue**, independent reviews as **Visitor reviews**, and Atlas interpretations as **Atlas Score**.
- Prevent review brigading through email verification, modest submission limits, distribution checks and moderation. Don't pretend automated tools can eliminate fake reviewers.

## Trust, law and privacy

- Mandatory preparation: independent Dutch legal assessment of advertising/online menu restrictions, GDPR/privacy notice and retention rules, acceptable-use rules for hosting providers, DSA/user-content moderation duties where applicable, accessibility review and age-appropriate access.
- Store minimum personal data. Provide account deletion, review editing/disputes, user block/report flows, moderator access audit, backups and disaster recovery.
- Require a rights/consent record before hosting third-party menu photos; **never scrape, mirror or hotlink protected images to bypass source restrictions**.
- Preserve source addresses, update timestamps and menu age notices; no inaccurate "live availability" claims.
- Start with a closed pilot of 3–5 willing venues and invited adult reviewers, then launch publicly after the content moderation and legal steps have passed.

## Proposed delivery sequence

1. **Now:** stable first-party `public/menu.html` reference page with original-source links; no cross-site image loading or broken viewer. `public/assets/owner-menus.js` is an empty reserved approved-content structure only.
2. **Next:** moderation policy, legal check, UX mockups and database schema; decide who can create accounts and verify a shop.
3. **Pilot:** authenticated visitor reviews and category ratings for limited shops; verified-venue corrections and seating updates. No promotional cannabis listings.
4. **After approval:** controlled, permission-cleared menu publication *if legal* and approved; only same-origin assets or native data from the agreed publishing model.
5. **Production:** review quality monitoring, transparency/audits, accessibility, rate limits, privacy controls and scalable hosting.

Related sources:
- Cloudflare Pages bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare Turnstile: https://developers.cloudflare.com/cloudflare-challenges/challenge-types/turnstile/
- Dutch business guidance: https://ondernemersplein.overheid.nl/wetten-en-regels/regels-voor-coffeeshops/
