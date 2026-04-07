# PitStop — Next.js

Vehicle maintenance tracker PWA built with Next.js 14, TypeScript, Zustand, and Tailwind.

## Project structure

```
pitstop/
├── app/                         # Pages (Next.js App Router)
│   ├── page.tsx                 # Home / garage
│   ├── add/page.tsx             # Add vehicle
│   ├── vehicle/[id]/
│   │   ├── page.tsx             # Vehicle detail
│   │   ├── maintenance/page.tsx # Maintenance schedule + log modal
│   │   ├── history/page.tsx     # Service history
│   │   ├── mechanic/page.tsx    # AI Mechanic chat
│   │   └── recalls/page.tsx     # NHTSA recall check
│   ├── settings/page.tsx        # Theme, accent, links
│   ├── connect/page.tsx         # SmartCar vehicle connection
│   ├── billing/page.tsx         # Stripe subscription management
│   ├── notifications/page.tsx
│   ├── documents/page.tsx
│   ├── export/page.tsx
│   └── api/
│       ├── mechanic/route.ts    # AI Mechanic (proxies Anthropic)
│       ├── smartcar/
│       │   ├── auth/route.ts    # SmartCar OAuth URL
│       │   ├── callback/route.ts# OAuth callback
│       │   └── sync/route.ts    # Pull live vehicle data
│       └── billing/
│           ├── checkout/route.ts# Stripe checkout session
│           ├── portal/route.ts  # Stripe customer portal
│           └── webhook/route.ts # Stripe event handler
├── components/
│   └── Shell.tsx                # Topbar, bottom nav, theme, toast
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── maintenance.ts           # MAINT schedule, getTracking, calcHealth
│   ├── store.ts                 # Zustand store + localStorage persistence
│   ├── defaultData.ts           # Demo vehicles for first launch
│   └── trims.ts                 # Trim dropdown data
└── public/
    ├── manifest.json            # PWA manifest
    └── icons/                   # App icons (add your own)
```

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Fill in your API keys in .env.local (see below)

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

## Environment variables

Open `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys |
| `SMARTCAR_CLIENT_ID` | https://dashboard.smartcar.com → Applications |
| `SMARTCAR_CLIENT_SECRET` | Same as above |
| `SMARTCAR_REDIRECT_URI` | Set to `https://your-app.vercel.app/api/smartcar/callback` |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `STRIPE_PRICE_ANNUAL` | Stripe Dashboard → Products → copy Price ID |
| `STRIPE_PRICE_MONTHLY` | Same as above |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL, e.g. `https://pitstop.vercel.app` |

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → import the repo
3. Add all environment variables in Vercel → Settings → Environment Variables
4. Deploy — done ✅

After first deploy, copy your Vercel URL and:
- Set `NEXT_PUBLIC_APP_URL` to it
- Set `SMARTCAR_REDIRECT_URI` to `https://your-url.vercel.app/api/smartcar/callback`
- Add the same callback URL in your SmartCar dashboard

## Stripe webhook setup

In Stripe Dashboard → Developers → Webhooks:
- Endpoint URL: `https://your-url.vercel.app/api/billing/webhook`
- Events to listen for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## iPhone home screen

Open your Vercel URL in Safari → Share → Add to Home Screen.

## Add your app icons

Replace the placeholder icons in `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-180.png` (180×180, used for Apple Touch Icon)
