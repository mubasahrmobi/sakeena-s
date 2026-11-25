# Sakeena’s — Tranquil Elegance

Multi-brand clothing store built with Next.js (App Router), Tailwind and Prisma (PostgreSQL). One repo, two apps:

| App | Path | Port | Purpose |
|---|---|---|---|
| Storefront | `apps/web` | 3000 | Customer website: brands, shop, bag, checkout, order tracking |
| Admin | `apps/admin` | 3001 | Brands, products, stock, orders, sales, coupons |
| Database | `packages/db` | – | Shared Prisma schema + helpers |

## Run locally

1. Create a free Postgres database on [Neon](https://neon.tech) (use a separate **branch** for development).
2. Copy the env templates and fill them in (each needs the two Neon connection strings):
   ```bash
   cp packages/db/.env.example packages/db/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/admin/.env.example apps/admin/.env
   ```
3. ```bash
   npm install
   npm run db:push
   npm run db:seed      # optional: sample products
   npm run dev:web      # http://localhost:3000
   npm run dev:admin    # http://localhost:3001
   ```

## Deploy on Vercel

Create **two** Vercel projects from this same GitHub repo.

| | Storefront | Admin |
|---|---|---|
| Root Directory | `apps/web` | `apps/admin` |
| Framework | Next.js | Next.js |

Environment variables (Project → Settings → Environment Variables):

**Both projects:** `DATABASE_URL` (Neon *pooled* string), `DIRECT_URL` (Neon *direct* string)

**Storefront:** `NEXT_PUBLIC_WHATSAPP_NUMBER`, `JAZZCASH_TITLE`, `JAZZCASH_NUMBER`, `EASYPAISA_TITLE`, `EASYPAISA_NUMBER`, `BANK_NAME`, `BANK_TITLE`, `BANK_IBAN`

**Admin:** `ADMIN_EMAIL`, `ADMIN_PASSWORD` (strong!), `AUTH_SECRET` (long random string), `WEB_URL` (the live storefront address, used in WhatsApp tracking links)

Create the database tables once, from your computer, pointing at the production database:

```bash
npm run db:push
```

## Payments (Pakistan)

Checkout supports **Cash on Delivery**, **JazzCash**, **Easypaisa** and **Bank transfer (IBAN)**. For wallet and bank payments the customer sends money to the accounts set in the storefront env vars and enters the transaction ID; the order shows *Awaiting verification* until the admin marks it **PAID**. Automatic gateways (PayFast, JazzCash/Easypaisa merchant) need a merchant account and can be added later.

Prices, coupons, shipping and stock are always calculated on the server.
