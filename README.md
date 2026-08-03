# The Human Experience Podcast Membership Homepage

A premium, cinematic homepage for The Human Experience Podcast membership platform.
Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui-style components, and Framer Motion.

## Homepage

- Nav bar
- Hero with mission and two CTAs
- Featured guests
- Latest episodes
- Membership teaser with monthly and yearly cards
- Learning paths preview
- Knowledge graph
- Newsletter
- Footer

## Additional Pages

- `/top-episodes` - curated all-time top HXP episodes with outbound watch links.
- `/universe` - interactive 192-episode knowledge graph.
- `/membership` - transparent membership value, roadmap, pricing, FAQ, and checkout states.
- `/community` - authenticated listener feed, topic rooms, people discovery, and episode discussions.
- `/community/messages` - private one-to-one conversations.
- `/community/settings` - profile, interests, location privacy, and account deletion.
- `/community/admin` - report review for community administrators.

## Community architecture

- Prisma models normalize users, posts, threaded comments, reactions, bookmarks, follows, blocks, private messages, notifications, and reports.
- Passwords use bcrypt hashing; sessions use signed JWTs in HTTP-only, same-site cookies.
- Server-side authorization protects writing, messaging, account settings, and moderation.
- The local development datasource is SQLite. Before multi-instance production deployment, move the Prisma datasource to managed PostgreSQL and set `DATABASE_URL`.
- Password-reset records are modeled, but production reset delivery requires an email provider and should not be activated until one is selected.
- Stripe remains the membership billing source. Synchronize successful Stripe webhook events into the `User.membership` field before enforcing paid-only rooms in production.

### Community setup

1. Copy `.env.example` values into a private `.env`.
2. Set a long random `AUTH_SECRET`.
3. Run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
4. The clearly labeled local demo login is `demo@thehumanxp.com` / `hxp-demo-2026`.

## Run the Next.js app

1. Install dependencies:
   - `npm install`
2. Configure Stripe Checkout:
   - `export STRIPE_SECRET_KEY=sk_test_your_key`
   - `export STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price`
   - `export STRIPE_YEARLY_PRICE_ID=price_your_yearly_price`
   - Optional: `export NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - Configure a Stripe customer billing portal or support cancellation workflow before production launch.
3. Configure newsletter capture with Kit:
   - `export KIT_API_KEY=your_private_kit_api_key`
   - `export KIT_FORM_ID=your_kit_form_id`
   - Keep `KIT_API_KEY` server-side. Never expose it through a `NEXT_PUBLIC_` variable.
4. Start the dev server:
   - `npm run dev`
5. Open `http://localhost:3000`

## Useful scripts

- `npm run dev` - start the Next.js development server.
- `npm run build` - create a production build.
- `npm run start` - run the production build.
- `npm run static:dev` - run the previous static-file dev server.
- `npm run api` - run the existing Express API server.
- `npm test` - run the existing Node tests.

## File tree

```txt
app/
  api/
    stripe/
      checkout/
        route.ts
  top-episodes/
    page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
    badge.tsx
    button.tsx
    card.tsx
    input.tsx
lib/
  utils.ts
next-env.d.ts
next.config.ts
postcss.config.mjs
tailwind.config.ts
tsconfig.json
```

## Membership API

- Start API server:
  - `npm run api`
- API base URL: `http://localhost:3000`
- PayPal subscription endpoint: `POST /api/paypal/subscription`
- Stripe checkout endpoint: `POST /api/stripe/checkout-session`
- Stripe webhook endpoint: `POST /api/stripe/webhook`
- Configure PayPal before running API:
  - `export PAYPAL_CLIENT_ID=your_paypal_client_id`
  - `export PAYPAL_CLIENT_SECRET=your_paypal_client_secret`
  - `export PAYPAL_ENVIRONMENT=sandbox`
- Configure Stripe before running API:
  - `export STRIPE_SECRET_KEY=sk_test_your_secret`
  - `export STRIPE_WEBHOOK_SECRET=whsec_your_secret`
  - `export PUBLIC_BASE_URL=https://thehumanxp.com`

Stripe Checkout uses Stripe Price IDs, so paid membership plans should be created with `stripePriceId`.
PayPal subscriptions use PayPal billing plan IDs, so paid membership plans should be created with `paypalPlanId`.

### Endpoints

- `GET /api/health`
- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items` with JSON body `{ "name": "Item name" }`
- `PUT /api/items/:id` with JSON body `{ "name": "Updated name" }`
- `DELETE /api/items/:id`
- `GET /api/membership/plans`
- `POST /api/membership/plans` with JSON body:
  - `{ "name": "Premium", "priceCents": 1000, "billingPeriod": "monthly", "benefits": ["Bonus episodes"], "stripePriceId": "price_123", "paypalPlanId": "P-123" }`
- `GET /api/membership/members`
- `POST /api/membership/members` with JSON body:
  - `{ "name": "Alex", "email": "alex@example.com", "planId": 1 }`
- `POST /api/membership/members/:id/cancel`
- `GET /api/membership/metrics`
- `GET /api/podcast/episodes`
- `POST /api/podcast/episodes` with JSON body:
  - `{ "title": "Premium Episode", "description": "Members only", "isPremium": true }`
- `GET /api/podcast/access?episodeId=2&memberId=1`
- `POST /api/stripe/checkout-session` with JSON body:
  - `{ "planId": 1, "email": "listener@example.com", "memberName": "Listener Name" }`
  - Returns `{ "data": { "checkoutSessionId": "...", "checkoutUrl": "https://checkout.stripe.com/..." } }`
- `POST /api/paypal/subscription` with JSON body:
  - `{ "planId": 1, "email": "listener@example.com", "memberName": "Listener Name" }`
  - Returns `{ "data": { "subscriptionId": "...", "approvalUrl": "https://www.paypal.com/..." } }`
- `POST /api/stripe/webhook`

## Test

- Run all tests: `npm test`

## Manual Verification Checklist

- API behavior:
  - `POST /api/items` returns `201` and created item payload.
  - `GET /api/items` returns created items.
  - `PUT /api/items/:id` updates existing item.
  - `DELETE /api/items/:id` returns `204` and item is no longer fetchable.
  - Invalid payloads return `400`; missing IDs return `404`.
  - Premium podcast access is denied without an active member (`403`) and allowed with an active member (`200`).
  - Membership metrics include active member count and recurring revenue in cents.
  - Stripe checkout session creation returns a Checkout URL for configured plans.
  - PayPal subscription creation returns an approval URL for configured plans.
  - Stripe webhook verifies signatures and updates membership status from subscription events.
