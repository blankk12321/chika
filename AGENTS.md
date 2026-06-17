# Chika / ACT B2B Foreign Trade Site Rules

## Product Direction

- This project is an English-first B2B foreign trade website for Chika / ACT Manufacturing.
- The site sells trust, capability, and RFQ conversion. It is not an ecommerce storefront.
- Main business pillars: injection molding, metal fabrication, automation equipment, tooling, assembly, testing, and export-ready manufacturing support.
- Use real source material first: company PDFs/PPTs, factory photos, workshop photos, testing room photos, showroom photos, and the Chika logo.
- Do not invent customers, certifications, production capacity, equipment counts, patents, addresses, or compliance claims.

## Explicitly Out Of Scope

- No WooCommerce Store API.
- No product add-to-cart.
- No cart, checkout, payment provider, online order status, coupons, inventory purchase flow, or ecommerce account area.
- No public pricing for custom manufacturing work unless the user provides exact approved pricing.

## Content Rules

- Write copy for overseas OEM buyers, sourcing managers, engineers, and importers.
- Prefer concrete proof over slogans: equipment counts, inspection capability, production flow, and factory evidence.
- Use English for the first version. Keep Chinese only when it is part of a source image or brand evidence.
- Contact details for first release:
  - Email: yunimentalworking@gmail.com
  - WhatsApp: +86 18938580209
- If a claim cannot be traced to source material, either omit it or phrase it as a capability category rather than a fact.

## Visual Rules

- Use real factory and workshop imagery before generated or stock-like visuals.
- Visual style: white, graphite, and Chika red. Industrial, precise, credible, and clean.
- Avoid beige/cream palettes, purple-blue gradients, decorative blobs, fake dashboards, and generic SaaS hero treatments.
- Avoid nested cards. Use full-width bands, media-led sections, lists, metrics, and restrained cards only for repeated items.
- Keep text legible on mobile and desktop; no overlapping UI or clipped buttons.

## Implementation Rules

- Frontend: Next.js static export for Cloudflare Pages.
- RFQ endpoint: Cloudflare Worker at `POST /api/rfq`.
- WordPress may be added later as a headless CMS for content, but it is not a first-release dependency.
- Keep environment secrets out of source control. Document required variables in `.env.example` or deployment docs.
- Prefer small focused components and data-driven content objects over one-off repeated markup.

## Verification Rules

- Run a production build before handoff.
- Verify the rendered homepage at desktop and mobile sizes.
- Verify the RFQ form validation and fallback contact copy.
- Check that no ecommerce language or checkout controls appear in the first release.
