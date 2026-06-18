# Cloudflare Pages Static Deployment

This project is a Next.js static export for Cloudflare Pages. The RFQ endpoint is a separate Cloudflare Worker.

## Project Type

- Static export: yes
- React: yes
- Next.js: yes
- Ecommerce: no

The source files are `app/`, `components/`, `lib/`, and `public/assets/site/`.

## Build

```powershell
npm run build
```

The production-ready static output is created at:

```text
dist/cloudflare-pages
```

## Cloudflare Pages Settings

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist/cloudflare-pages`
- Node.js version: `18` or newer

## RFQ Worker

The website posts RFQs to:

```text
POST /api/rfq
```

Deploy `workers/rfq-worker.js` as a Cloudflare Worker and route it before the Pages static site for:

```text
www.chikatech.com/api/rfq*
chikatech.com/api/rfq*
```

Required/optional Worker settings:

```text
ALLOWED_ORIGIN=https://www.chikatech.com
RFQ_TO_EMAIL=yunimentalworking@gmail.com,blankk12321@gmail.com
RFQ_FROM_EMAIL=Chika ACT RFQ <rfq@chikatech.com>
RESEND_API_KEY=<secret, optional until email sending is ready>
RFQ_LOG_URL=<optional external logging endpoint>
RFQ_KV=<KV namespace binding for stored RFQ records>
```

Without `RESEND_API_KEY`, the Worker still validates and accepts RFQs but only logs the request. The frontend also provides direct email and WhatsApp fallback details.

Cloudflare Pages static hosting cannot run the legacy Node.js `server.js` Feishu webhook endpoint. Keep `server.js` only as a legacy local helper unless the VPS deployment path is used again.
