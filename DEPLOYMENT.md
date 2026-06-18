# Chika / ACT Independent Site Deployment

This site is now a Next.js static export for Cloudflare Pages with a separate Cloudflare Worker RFQ endpoint.

## Target

- Domain: `chikatech.com`
- WWW: enabled, `www.chikatech.com`
- Frontend hosting: Cloudflare Pages
- RFQ API: Cloudflare Worker route at `/api/rfq`

## Build

```powershell
npm run build
```

Output:

```text
dist/cloudflare-pages
```

## Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist/cloudflare-pages`
- Node.js version: `18` or newer

## RFQ Worker

Deploy `workers/rfq-worker.js` and route:

```text
www.chikatech.com/api/rfq*
chikatech.com/api/rfq*
```

Set Worker variables/secrets:

```text
ALLOWED_ORIGIN=https://www.chikatech.com
RFQ_TO_EMAIL=yunimentalworking@gmail.com,blankk12321@gmail.com
RFQ_FROM_EMAIL=Chika ACT RFQ <rfq@chikatech.com>
RESEND_API_KEY=<secret if email notifications are enabled>
RFQ_LOG_URL=<optional>
RFQ_KV=<KV binding for stored RFQ records>
```

## DNS

Add or update Cloudflare DNS according to Pages custom-domain setup:

- `chikatech.com`
- `www.chikatech.com`

## Legacy VPS Path

The old Node.js `server.js` and VPS deployment templates can remain for reference, but the first-release path is Cloudflare Pages + Worker.
