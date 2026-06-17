# Chika / ACT Foreign Trade Site Spec

## Goal

Create an English B2B manufacturing website that converts overseas RFQs for injection molding, metal fabrication, automation equipment, tooling, assembly, and testing services.

## Positioning

Chika / ACT Manufacturing is presented as a Dongguan manufacturing partner with combined capability across plastic parts, metal parts, automated equipment, finished assemblies, and quality testing.

## Source Facts

- Dongguan Advance Card Information Technology Co., Ltd. was founded in 2018.
- Chika has a self-built manufacturing campus of about 12,000 m² land area and nearly 40,000 m² building area.
- Chika source material lists 15 plastic molding machines, 2 sheet-metal laser machines, 100+ inspection devices, 21 production/assembly lines, 100,000+ units annual comprehensive capacity, 200 employees, and about 40% technical support/R&D staff.
- Chika source material lists ISO9001:2015, National High-Tech Enterprise, Specialized and Innovative SME, Innovative SME, production license, patents, and software copyrights.
- Chika source material lists injection molding, metal mold development, plastic mold development, sheet metal/stamping, coating, assembly, testing, ERP, SRM, MES, WMS, and project/logistics systems.
- Teayee source material lists precision mold design/manufacturing, injection molding, ISO9001, ISO14001, ISO45001, 160+ staff, 45 mold technicians, 10 molding technicians, 25 quality staff, 51 molding machines, 7 CNC machines, 8 EDM machines, and 30 measuring devices.

## Homepage Structure

1. Header
   - Brand: Chika / ACT Manufacturing
   - Navigation: Capabilities, Factory, Quality, Applications, RFQ
   - CTA: Send RFQ

2. Hero
   - H1: Injection molding, metal fabrication and automation equipment from one Dongguan manufacturing partner.
   - Primary CTA: Send an RFQ
   - Secondary CTA: View factory capability
   - Use a real injection molding machine image first.

3. Proof Metrics
   - 2018 founded
   - Nearly 40,000 m² building area
   - 15 molding machines
   - 21 production and assembly lines
   - 100+ inspection devices

4. Capabilities
   - Injection Molding & Tooling
   - Metal Fabrication & Stamping
   - Automation Equipment & Assembly

5. Factory Evidence
   - First image priority: injection molding machines.
   - Second image priority: laboratory / inspection room.
   - Product display must have its own separate section or column, not be mixed into the capability copy.
   - Emphasize real factory visibility for audit-minded buyers.

6. RFQ Process
   - Drawing/sample review
   - DFM and tooling plan
   - Pilot run and inspection
   - Controlled production
   - Assembly, testing, and export preparation

7. Quality
   - RoHS, environmental tests, salt spray, coating adhesion, plating thickness, hardness, electrical safety, vibration, shock, tensile/pull force, dimensional measurement.

8. Applications
   - Consumer electronics
   - Audio and wearable components
   - Automotive parts
   - Optical components
   - Self-service terminals
   - Non-standard automation equipment

9. RFQ
   - Required fields: name, email, company, country, project type, message.
   - Optional fields: annual volume, material, surface finish.
   - Contact fallback: yunimentalworking@gmail.com and WhatsApp +86 18938580209.

## Public Interfaces

- `/`
- `/capabilities/injection-molding`
- `/capabilities/metal-fabrication`
- `/capabilities/automation-equipment`
- `/quality`
- `/contact`
- `POST /api/rfq`

## RFQ API Shape

Request JSON:

```json
{
  "name": "Buyer name",
  "email": "buyer@example.com",
  "company": "Company",
  "country": "United States",
  "projectType": "Injection molded components",
  "annualVolume": "50000 pcs/year",
  "material": "ABS",
  "surfaceFinish": "Texture + black",
  "message": "Requirement details",
  "pageUrl": "https://www.chikatech.com/"
}
```

Response JSON:

```json
{ "ok": true, "message": "Thank you. Your RFQ was received." }
```

## First Release Defaults

- No ecommerce.
- No WordPress dependency.
- No generated hero image as primary proof.
- Cloudflare Pages for frontend static export.
- Cloudflare Worker for RFQ.
