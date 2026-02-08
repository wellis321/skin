# Skin Assessment

A simple skin assessment MVP: upload or take a photo and get feedback on wrinkles, lines and spots. British English only. High-end UI with clear instructions.

## Secrets

Never commit `.env` or real API keys. Use **Vercel Environment Variables** and **Supabase** (or your host) for production. Copy `.env.example` to `.env` and fill in placeholders locally only.

## Developing

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Flow: **Home** → **Assess** (instructions + capture) → **Results**.

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run check` – Svelte check + British English spell check
- `npm run check:british` – British English only (no US spellings in `src/` and `static/`)
- `npm run lint` – ESLint
- `npm run format` – Prettier
- `npm run test:unit` – Vitest (unit tests)
- `npm run test:e2e` – Playwright (E2E; requires browser)
- `npm run test` – unit then E2E
- `npm run seed:demo` – seed demo data for admin screenshots (bookings, group classes, product interest, optional users/assessments). Run after migrations; use `--force` to run when DB already has data (only empty tables are filled).

## Demo data and screenshots

- **Progress**: [/progress?demo=1](/progress?demo=1) – example assessments with an improving trend (no sign-in).
- **Results**: [/results?demo=1](/results?demo=1) – full example results page (scores, structure, recommendations, product suggestions, face details) without running an assessment.
- **Admin**: Run `npm run seed:demo` after migrations to populate the database with demo bookings, group classes, product interest and optional users/assessments so the admin dashboard and book page look populated for screenshots.

## Structure

- **Landing** (`/`) – value prop, “Assess my skin” CTA
- **Assess** (`/assess`) – instructions (remove glasses, lighting, face position), then upload or camera capture; POST to `/api/analyse`
- **Results** (`/results`) – “What’s working”, “What to focus on”, “How to improve”, product teasers

Skin analysis is **mock** in this MVP; the interface in `src/lib/server/skinAnalysis.ts` is ready to swap for a real API or model later.

## Testing

- **Unit**: `src/lib/server/skinAnalysis.ts` and API contract in `tests/unit/`
- **E2E**: `tests/e2e/flow.spec.ts` – landing → assess → upload fixture → results

Run `npm run test:unit` to run unit tests. E2E tests require Playwright browsers (`npx playwright install`) and may need to run outside restricted environments.
