# log-pose-collection

**TCG collection manager** — binder grid, fast filters, wishlist and stats. Built with **Vue 3 + TypeScript + Vite + Tailwind + Pinia**.  
**Mock API first** (MSW), **Laravel API** planned for later.

> Status: **Pre-alpha (front-first, offline-friendly, mocked auth & data).**  
> Scope (Phase 1): **Collection (inventory) + Wishlist + Stats + Export/Import + Saved Views.**

---

## Why this exists

A clean, fast, mobile-friendly way to track a **One Piece TCG** (and other TCGs) collection without vendor lock-in. Start with a mocked backend to nail UX, then swap to a real **Laravel** API.

---

## Key features (Phase 1)

- **Collection manager**: add/edit quantities, mark foil/alt, notes/tags.
- **Search & filters**: by set, rarity, color, type, cost, power; fuzzy search.
- **Views**: **Binder grid** (like a physical binder), **Dense table**, **Card details**.
- **Stats**: set completion, rarity distribution, **playset completion**.
- **Wishlist**: track missing copies; “move to inventory” flow.
- **Import/Export**: JSON (CSV optional later).
- **Saved views**: store reusable filter combos.
- **Offline-friendly**: local persistence; mock API can simulate latency/errors.
- **Mocked auth**: demo personas, session/expiry, remember-me, 401 flows.

---

## Tech stack

- **Vue 3 + TypeScript + Vite**
- **Pinia** (state), **Vue Router**
- **Tailwind CSS** (+ Typography/animation utilities)
- **MSW (Mock Service Worker)** for API mocks (auth, cards, inventory, wishlist)
- **Storybook** (component docs), **VitePress** (project docs)
- **Vitest** (unit), **Cypress/Playwright** (e2e) — later
- **Laravel** API — planned (Sanctum, PostgreSQL, Redis)

---

## Mocked API & Auth (developer experience)

- **Endpoints mirrored** to future Laravel:
  - `POST /auth/login|register|logout|refresh`, `GET /me`
  - `GET /cards`, `GET /cards/:id`, `GET /sets`
  - `GET /inventory`, `PUT /inventory/:id`, `POST /inventory/batch`
  - `GET /stats`, `GET /views`, `POST /views`, …
- **Latency & failure** simulation:
  - Default latency **200–800ms**, error rate **1–3%** (configurable).
- **Personas** (for demos):
  - `guest` (read-only), `nami@demo` (~40% collected), `zoro@demo` (~90%), `luffy@demo` (fresh).
- **Session model**:
  - Access token with TTL; remember-me stores it in local storage.
  - 401 → auto refresh once → redirect to sign-in if still invalid.
- **Data isolation**:
  - Namespaced storage: `opc:{userId}:inventory|wishlist|views`.

> When switching to Laravel, keep the same contract and just change the client to `AUTH_MODE=api` + `API_BASE_URL`.

---

## Getting started

```bash
# Install deps
pnpm i   # or npm i / yarn

# Run the app (front dev server)
pnpm dev

# Start Storybook (UI docs)
pnpm storybook

# Run the docs site (VitePress)
pnpm docs:dev

# Optional: run with mocked API disabled (later, Laravel)
AUTH_MODE=api API_BASE_URL=http://localhost:8000 pnpm dev
```

**Environment variables (planned)**

```bash
# .env.example
AUTH_MODE=mock            # mock | api
API_BASE_URL=http://localhost:8000
MOCK_LATENCY_MS=200-800   # range
MOCK_ERROR_RATE=0.02      # 2% failures
```

---

## Conventions: Tooling & Versions

**Supported stack**
- **Node.js:** `>=22 <23` (LTS)  
- **Package manager:** **pnpm** `10.14.0` (canonical)  
- **Yarn (optional, labs only):** `4.x`

**Lockfile policy**
- Commit **`pnpm-lock.yaml`**.  
- **Do not** add `package-lock.json` or `yarn.lock`.  
- CI fails if another lockfile appears.

**Files to add**

`.nvmrc`
```
22
```

`package.json` (excerpt)
```json
{
  "packageManager": "pnpm@10.14.0",
  "engines": { "node": ">=22 <23" }
}
```

`.npmrc`
```
engine-strict=true
strict-peer-dependencies=true
```

(Optional) Volta pin
```json
{
  "volta": { "node": "22.0.0", "pnpm": "10.14.0" }
}
```

---

## Project structure (high-level)

```
src/
  domain/        # types, enums, mapping (cards, sets, rarities, colors)
  stores/        # pinia stores (catalog, collection, wishlist, auth, stats)
  pages/         # Collection, Wishlist, Stats, Settings, Auth
  components/    # CardTile, CardRow, FilterBar, StatsCard, Dialogs, Toasts
  mocks/         # MSW handlers, demo personas, seed data
  services/      # ApiClient, AuthService (switch mock/api via AUTH_MODE)
docs/            # VitePress site (Diátaxis: tutorials, how-to, reference, explain)
.storybook/      # Storybook config & stories
```

---

## Data model (minimal, Phase 1)

- **Catalog (read-only)**: `sets`, `cards` (id, setCode, number, name, type, colors[], rarity, cost, power, traits, variants[]).
- **Inventory (per user)**: `printingId`, `qty`, `foil?`, `condition?`, `notes?`, `tags?`.
- **Wishlist**: `printingId`, `targetQty`.
- **Saved views**: `name`, `filtersJSON`.
- **Stats** (derived): set completion, rarity counts, playset completion.

---

## Design system & UX

- **Tokens**: neutral gray + the six TCG colors (**Red, Green, Blue, Purple, Black, Yellow**).
- **Components**: headless primitives (Headless UI or Radix Vue) + **Floating UI** for popovers/tooltips.
- **Accessibility**: AA contrast, focus rings, keyboard flows (binder arrows, `+/-` to adjust qty).
- **Mobile-first**: large touch targets, sticky action bar, collapsible filters.
- **Micro-interactions**: subtle transitions, skeletons, toasts.

---

## Documentation hub (docs-as-code)

- **VitePress** site with **Diátaxis** structure:
  - **Tutorials** (onboarding, first run with mocks)
  - **How-to guides** (import/export, saved views, switching personas)
  - **Reference** (domain schema, API contract, events/errors)
  - **Explanations** (offline-first, IP/Legal choices, architecture)
- **Storybook** for live component docs & states.
- **OpenAPI** spec (mock first) rendered via Swagger UI / Redoc in docs.

---

## Roadmap (Phase 1 → Phase 1.5)

- **Week 1**: Shell pages, catalog mock, collection store, binder/table views, filters, basic stats.
- **Week 2**: Wishlist, saved views, export/import, empty/loading/error states, mock auth + personas.
- **Week 3**: Polishing (A11y, mobile), Storybook coverage, docs hub, QA checklist.
- **1.5**: CSV import, acquisitions log, PWA offline, conflict messaging.

---

## Contributing & workflow

- **Conventional Commits** + **Keep a Changelog**.
- PRs should update **docs** (VitePress) and **stories** (Storybook) if UI/UX changes.
- Add diagrams for non-trivial flows (Mermaid in docs).

---

## Legal & content

- **No official card images** are shipped. Users can attach their own images/links at their own discretion.
- This is a community project with no affiliation to Bandai/Toei/Shueisha/etc.

---

## License

MIT — see `LICENSE`.

---

## Credits

Built to practice **front-first product design**, solid mocks, and a clean path to a real **Laravel** backend.
