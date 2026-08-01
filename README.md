# Sole Outlet Egypt 🇪🇬👟

أحذية أصلية بأقل من نص السعر — 3D shoe catalog with cart & checkout.

## Stack
- Next.js 15 App Router + TypeScript
- Supabase (products + orders)
- React Three Fiber (3D grid)
- Framer Motion (UI animations)
- Paymob Egypt (card/wallet payments)
- Vercel (deployment)

## Setup

### 1. Supabase
1. Create project at supabase.com
2. Run `schema.sql` in SQL editor
3. Run `seed.sql` to load initial 144 products
4. Upload shoe images to Supabase Storage or use your own CDN, update `image_url` in products table

### 2. Paymob
1. Register at accept.paymob.com
2. Create an integration (card payments)
3. Create an iframe
4. Set webhook URL: `https://yourdomain.com/api/paymob-webhook`

### 3. Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_PASSWORD=yourpassword
```

### 4. Run locally
```bash
npm install
npm run dev
```

### 5. Deploy to Vercel
```bash
npx vercel
```
Add all env vars in Vercel dashboard.

## Pages
- `/` — 3D catalog (drag to explore, click to select, add to cart)
- `/checkout` — Order form (delivery info + COD or Paymob)
- `/order/[number]` — Order confirmation
- `/admin` — Password-protected orders dashboard

## Adding products
Insert directly into Supabase `products` table or build an admin UI later.

Key fields:
- `original_price_egp` — the real market price (shown crossed out)
- `outlet_price_egp` — your outlet price (the main price shown in red)
- `sizes` — array of EU sizes e.g. `{40, 41, 42, 43, 44, 45}`
- `image_url` — full URL or Supabase storage path

## Shipping
Fixed 60 EGP shipping. Change in:
- `src/components/CartDrawer.tsx` (line: `const SHIPPING = 60`)
- `src/app/checkout/page.tsx` (line: `const SHIPPING = 60`)
