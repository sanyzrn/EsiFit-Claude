# EsiFit — CONTENT_STRATEGY.md

The blog/articles hub (built in Phase 1) exists to acquire organic search traffic and funnel it into sign-ups via the calculators and app — it is a lead-generation surface, not a side feature. This document governs how content is structured so that goal is actually served.

## Categories

Training, Nutrition, Recovery, Science/Research, Success Stories. Every article belongs to exactly one primary category (secondary tags allowed).

## SEO requirements (implements the metadata/JSON-LD rule from Phase 1)

- Every article: unique meta title (≤60 chars), meta description (≤155 chars), canonical URL, Open Graph + Twitter Card image.
- `Article` JSON-LD on every article page (headline, author, datePublished, dateModified, image).
- `BreadcrumbList` JSON-LD on the article index and category pages.
- `FAQPage` JSON-LD wherever an article contains an actual Q&A section.

## Slug & URL structure

`/blog/{category-slug}/{article-slug}` — lowercase, hyphenated, stable (never change a published slug without a permanent redirect).

## Author & trust signals

Every article has an author byline (name, short bio, avatar) — even placeholder authors should look like real fitness/nutrition professionals, not "Admin." Include a last-updated date for anything with time-sensitive claims (nutrition guidance, science claims).

## Reading time & structure

Auto-calculated reading time (based on word count) shown at the top of every article. Long articles get an auto-generated table of contents (from headings) with jump links.

## Related posts & internal linking

- Every article ends with a "Related Articles" module (same category or shared tags, 3 articles).
- **Calculator linking is mandatory where relevant**: any article discussing a metric with a matching calculator (e.g. an article about BMR discusses BMR) must link inline to that calculator — this is the primary conversion path from content to product.
- Internal links use descriptive anchor text (not "click here").

## CTA placement

- One contextual CTA per article, placed after the reader has gotten real value (roughly 40–60% through the article, not immediately at the top) — e.g. "Calculate your TDEE" or "Try the workout builder."
- The final CTA at the article's end can be slightly stronger (sign-up focused) since the reader has finished the content.
- Never more than 2 CTAs per article — more reads as spammy and hurts trust.

## Content-to-product funnel (the point of all of this)

Article → (inline calculator link, mid-article) → Calculator (Phase 3, works for anonymous visitors) → (soft sign-up prompt for saving/AI insight) → Account created → Dashboard (Phase 2). Every piece of this document should be evaluated against whether it strengthens or weakens that specific path.
