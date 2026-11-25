# Sakeena’s — Tranquil Elegance

Clothing brand e-commerce, built with Next.js (App Router), Tailwind and Prisma. One repo, two apps:

| App | Path | Port | Purpose |
|---|---|---|---|
| Storefront | `apps/web` | 3000 | Customer website: shop, product pages, bag, checkout |
| Admin | `apps/admin` | 3001 | Products, prices, discounts, categories, coupons, orders, payment verification |
| Database | `packages/db` | – | Shared Prisma schema + helpers |

## Run locally

```bash
npm install
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env   # set ADMIN_EMAIL / ADMIN_PASSWORD / AUTH_SECRET
echo 'DATABASE_URL="file:./dev.db"' > packages/db/.env
npm run db:push && npm run db:seed
npm run dev:web      # http://localhost:3000
npm run dev:admin    # http://localhost:3001
```

## Payments (Pakistan)

Checkout supports **Cash on Delivery**, **JazzCash**, **Easypaisa** and **Bank transfer (IBAN)**. For wallet and bank payments the customer sends money to the account numbers set in `apps/web/.env`, enters the transaction ID, and the order is marked *Awaiting verification*. The admin confirms the payment in **Orders → Payment status → PAID** before dispatch.

Prices are always recalculated on the server at checkout. Coupons, shipping (Rs. 250, free over Rs. 5,000) and stock are handled server-side.

Automatic card/wallet gateways (PayFast, JazzCash Merchant, Easypaisa Merchant) need a merchant account; they can be added as another option in `PAYMENT_METHODS` (`packages/db/utils.ts`) plus a redirect/webhook route once credentials are available.

## Before going live

- Switch Prisma `provider` to `postgresql` and use a hosted DB (Neon / Supabase), then deploy both apps (e.g. Vercel) with the env vars.
- Use a strong `ADMIN_PASSWORD` and random `AUTH_SECRET`.
- Host product photos (Cloudinary etc.) and paste URLs in the admin product form.
