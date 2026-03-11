# Zonos Onboarding Wizard — Claude Context

## What This App Is

This is a **production Next.js application** that does two things:

1. **Wizard (built)** — Connects to Zonos' internal GraphQL APIs and allows internal users to read and update merchant configuration settings across 5 fully functional CRUD pages (General Settings, Fulfillment Locations, Tax IDs, Checkout Settings, Shipping Rules), with 12 additional pages that have UI built but limited/no data integration.

2. **Onboarding Platform (in progress)** — A Process Street-style project and task management system for Zonos OB reps to manage merchant onboarding engagements. It will incorporate AI-powered recommendations from Gong call transcripts and emails, and execute configuration changes directly via the existing Zonos API layer. See `/docs/build-stages.md` for the full phased build plan.

These are **not two separate apps**. The onboarding platform is being built on top of the existing wizard — same codebase, same auth, same API proxy layer, same design system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| UI / Design System | `@zonos/amino` v5.8.0 — always use Amino components first |
| Styling | SCSS Modules + Emotion (no Tailwind, no raw CSS-in-JS) |
| State | Zustand v5 with persist middleware (localStorage) |
| Data fetching | SWR + graphql-request, proxied through Next.js API routes |
| Animation | framer-motion |
| Database | Supabase (configured, being activated in Stage 1 of build plan) |
| Hosting | Vercel (auto-deploy from main branch) |
| Package manager | pnpm |

---

## Authentication

Auth is fully working. Do not modify it without being asked.

- **Two-step AuthGate:** User pastes their Zonos credential token → searches for an org by name/store number → selects it
- **Three credential types** managed in Zustand (persisted to localStorage):
  - `credentialToken` — user's personal token (cross-org)
  - `merchantToken` — org's public credential (fetched via `getPublicCredential`)
  - `authCredential` — org-scoped session (fetched via `loginExternal`)
- Org switching works — changes `merchantToken`, SWR auto-refetches all queries
- All API calls are proxied — the browser never talks directly to Zonos APIs

---

## GraphQL Proxy Pattern

**This is the core architectural pattern. All new API calls must follow it.**

```
Browser → /api/graphql/[schema]/route.ts → Server injects auth headers → Zonos GraphQL endpoint
                                                                                    ↓
Browser ← JSON response ← Server strips internals ← GraphQL response
```

- Auth headers are injected server-side in `src/lib/graphql/headers.ts`
- The browser never receives or sends Zonos credentials directly
- 5 schemas are wired: `internal`, `auth`, `viewport`, `frontend`, `internal-ups`
- New API calls: add a route handler under `/api/graphql/[schema]/` following the existing pattern
- Never make direct browser-to-Zonos-API calls. Always go through the proxy.

---

## GraphQL Hooks

```ts
// Query (SWR-based, auto-refetches on org switch)
const { data, error } = useGraphQL(QUERY, variables);

// Mutation (imperative)
const { execute } = useGraphQLMutation(MUTATION);
await execute(variables);
```

- Query files: `src/graphql/queries/` (15 files)
- Mutation files: `src/graphql/mutations/` (15 files)
- Hook definitions: `src/hooks/useGraphQL.ts`, `src/hooks/useGraphQLMutation.ts`
- SWR cache key includes `merchantToken` — org switches automatically trigger refetches

---

## Routing & Navigation

- Single-page app under `/wizard` with client-side page switching via `useNavStore` (Zustand)
- `TaskRouter` maps page keys to 17 page components
- Sidebar uses Amino `NavigationGroup` / `NavigationItem` — 6 nav groups: Account, Shipping, Landed Cost, Checkout, Branding, Hello
- Breadcrumbs and org switcher are in the shared layout
- New onboarding routes go under `/onboarding` — do not modify the `/wizard` routing structure

---

## What Is Fully Built (Real CRUD Against Zonos APIs)

1. **General Settings** — business name, URL, platform, currency, address
2. **Fulfillment Locations** — add/edit/delete fulfillment centers with contact + address
3. **Tax IDs** — global tax IDs (7 countries) + US state tax IDs (all 50 states)
4. **Checkout Settings** — button style, notification emails, success behavior, allowed domains
5. **Shipping Rules** — full visual rule builder (conditions, actions, date ranges, 9 rule contexts, type-driven operators)

**Do not refactor or restyle these pages without being explicitly asked.**

---

## What Has UI But Limited/No Data Integration

Team, Billing, Cartonization, Labels, Packing Slips, Classify Settings, Catalog Settings, Custom Messages (Checkout + Hello), Discounts, Branding Settings, Hello Settings.

---

## What Is Not Built Yet

- Supabase integration (configured but unused — activation is Stage 1)
- Onboarding project/task management UI
- Merchant-facing wizard view
- Gong ingestion pipeline
- AI recommendation engine
- Zonuts support chatbot
- Salesforce CRM integration
- Export layer (CSV, webhooks)
- Admin panel and analytics

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── graphql/[schema]/route.ts   — Proxy route handlers (one per schema)
│   └── wizard/
│       ├── layout.tsx                  — Main layout (Amino Layout + sidebar + breadcrumbs)
│       └── page.tsx                    — Wizard step router (uses TaskRouter)
├── components/
│   ├── wizard/                         — Sidebar, breadcrumbs, org switcher, nav
│   └── steps/                          — 17 page components (one per wizard page)
├── graphql/
│   ├── queries/                        — 15 GraphQL query files
│   └── mutations/                      — 15 GraphQL mutation files
├── hooks/
│   ├── useGraphQL.ts                   — SWR-based query hook
│   ├── useGraphQLMutation.ts           — Imperative mutation hook
│   └── useNavStore.ts                  — Zustand navigation store
├── lib/
│   └── graphql/
│       └── headers.ts                  — Server-side auth header injection
├── stores/
│   └── useAuthStore.ts                 — Zustand auth store (persisted to localStorage)
├── styles/
│   └── globals.scss                    — Global styles
└── types/                              — TypeScript interfaces (I prefix convention)
```

---

## Amino Component Usage

Always use Amino components. Never use raw HTML inputs, buttons, or layout elements when an Amino equivalent exists.

```tsx
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { SearchIcon } from '@zonos/amino/icons/SearchIcon';
```

- CSS variables: `--amino-primary`, `--amino-gray-300`, `--amino-blue-500`, etc.
- Storybook reference: https://amino.zonos.com/
- Do not import from `@zonos/amino` barrel — always use the full component path

---

## Design Tokens

| Token | Value |
|---|---|
| Sidebar width | 232px (`--amino-sidebar-width`) |
| Font family | Inter (system sans-serif fallback) |
| Primary blue | #2563EB |
| App background | #F9FAFB |
| Sidebar/content bg | #FFFFFF |
| Default border | #E5E7EB |
| Input border | #D1D5DB |
| Primary text | #111827 |
| Secondary text | #6B7280 |
| Muted text | #9CA3AF |
| Nav text size | 14px (400 inactive, 500 active) |
| Page heading | 24px / 700 |
| Section heading | 18–20px / 600 |
| Body text | 14px / 400 |
| Small/helper | 13px / 400 |
| Table header | 12px / 500, uppercase, gray-500 |
| Settings section label | 12px / 600, uppercase, gray-500 |

---

## Layout Rules

- Uses `<AminoLayout noPaddingContent sidebar={...} content={...} footer={...} />`
- **DO NOT USE the `headerContent` prop** on AminoLayout — this matches the real Zonos dashboard behavior
- Content = `.headerNav` (64px sticky) + `.bodyWrapper` (padding) + `.pageWrapper` (max-width centered)
- Layout CSS vars: `--dashboard-layout-width: 1440px`, `--dashboard-layout-padding: 32px`
- CSS import order: `amino.css → reset.css → theme.css → globals.css`

---

## Coding Conventions

- **TypeScript:** `I` prefix for interfaces and types (e.g., `IFulfillmentLocation`). No `as` type assertions.
- **No `data-testid` attributes.** Tests use `test()` not `it()`.
- **Translations:** Use `translate()` / `<Translate>` component for any user-facing strings.
- **GraphQL:** Queries live in `src/graphql/queries/`, mutations in `src/graphql/mutations/`. Use the existing hooks — do not call `graphql-request` directly in components.
- **State:** Use Zustand stores. Do not use React context for global state.
- **Styling:** SCSS Modules scoped to the component. No inline styles except for dynamic values. No Tailwind.
- **File naming:** Components are PascalCase. Hooks are camelCase prefixed with `use`.

---

## Database (Supabase → Zonos Internal DB)

- Supabase is configured but currently unused. All state lives in Zonos' APIs + localStorage.
- Stage 1 of the build plan activates Supabase with the full onboarding schema.
- **Design for portability:** No Supabase-specific edge functions or RLS policies in business logic. Use Next.js API routes for all DB logic so migration to Zonos' internal DB (Stage 8) is a connection string swap.
- All new DB calls go through `/api/db/` route handlers. Never call Supabase client directly from components.
- Use UUIDs for all primary keys.
- Track all schema changes as SQL migration files from day one.

---

## New API Routes (Onboarding Platform)

As the onboarding platform is built, new route namespaces will be added. Follow this structure:

```
/api/graphql/[schema]/     — Existing Zonos API proxy (do not modify)
/api/db/                   — Supabase database operations
/api/integrations/gong/    — Gong call + email ingestion
/api/integrations/crm/     — CRM push (Salesforce now, internal CRM later)
/api/ai/                   — Claude API calls (recommendations + chatbot)
/api/export/               — CSV and data export
/api/webhooks/             — Inbound webhook receivers
/api/cron/                 — Scheduled jobs (overdue task checks, Gong sync)
```

---

## Zonos Dashboard Reference

Design reference for maintaining visual fidelity with the real Zonos dashboard. This section will evolve as the app grows.

### Sidebar Structure (Shawn's Test Account #5782)

**Main nav** — icons from `SidebarItemsContext.tsx`:
Orders (BagIcon), Quoter (LandedCostIcon) → Create quote / Recent quotes, Products (TagIcon) → Catalog / Classify / Bulk classify / Manual classify / Restrict, Shipping (BoxesIcon) → Shipments / Batches / Screen / Rates, Invoices (ReceiptIcon), Reports (ChartIcon), Settings (SettingsIcon), Analytics (ChartIcon + StarsIcon), Admin (LockIcon), Contact support (HelpIcon), Chat (StarsIcon)

**Settings sidebar** (replaces main nav): Back to home, Overview (DashboardIcon), then grouped sections — Account (General, Team, Billing, Integrations, Audit log, Manage organization), Shipping (Manage rates, Locations, Cartonization, Labels), Landed cost (Classify, Catalog, Tax IDs, Rules), Checkout (Checkout settings, Custom messages, Discounts), Branding (Branding settings), Hello (Hello settings, Custom messages)

### Header Nav

64px sticky, border-bottom, white bg, 32px horizontal padding. Left: breadcrumbs (gray-500 parent, gray-800 current, ChevronRightIcon separator). Right: action portals per page.

### Key UI Patterns

- Accordion nav: only one expandable group open at a time, no chevron arrows
- Org switcher: colored square avatar + org name (truncated) + org ID + up/down chevrons
- Quick search: full-width button with SearchIcon + "Quick search" + "/" shortcut pill
- Active nav: light blue-50 background highlight
- Tables: full width, no outer border
- Slide-over modals: from right, ~500-600px wide
- Status badges: Fulfilled/Paid = green, Open = gray outline, Processing = blue, Error/Cancelled = red

### Org Info

- **Shawn's Test Account:** #5782 (orange "S" avatar) — has Invoices, Reports, Settings, Create order button
- **Zonos:** #909 (green "Z" avatar) — has Manifests, announcement banner, no Create order
- Different orgs see different nav items based on plan/features

---

## Do Not

- Do not modify existing `/wizard` pages or components without being explicitly asked
- Do not change the auth flow or Zustand auth store structure
- Do not call Zonos APIs directly from the browser — always use the proxy pattern
- Do not use raw HTML form elements, inputs, or buttons — use Amino equivalents
- Do not use Tailwind classes
- Do not use the `headerContent` prop on AminoLayout
- Do not use `as` type assertions in TypeScript
- Do not add `data-testid` attributes
- Do not call Supabase client directly from components — use `/api/db/` routes
- Do not make Supabase-specific architectural decisions — keep the DB layer portable
- Do not restyle or refactor pages that already have real API integration unless asked

---

## Build Plan

The onboarding platform is being built in 8 stages. See `/docs/build-stages.md` for full detail.

| Stage | Name | Key Output |
|---|---|---|
| 1 | Database Foundation | Supabase schema, migrations, type generation |
| 2 | Project & Task Dashboard | OB rep project list + task management UI |
| 3 | Merchant Wizard & Verification | Merchant-facing tasks, OB verify flow, notifications |
| 4 | Gong & Email Ingestion | Data pipeline, merchant-matched transcripts + emails |
| 5 | AI Recommendation Engine | Claude-powered suggestions → Zonos API execution |
| 6 | Zonuts AI Chatbot | Context-aware OB rep assistant |
| 7 | Export & CRM Integration | CSV, webhooks, Salesforce adapter (swappable for internal CRM) |
| 8 | Polish & DB Migration | Admin panel, analytics, migrate to Zonos internal DB |

Always check which stage is currently active before starting new work. Do not build ahead of the current stage without being asked.

---

## GitHub

- Repo: `micromammalogy/zonos-onboarding-wizard`
- User: Shawn Roah (@micromammalogy)
- Deploy: Vercel auto-deploy from `main`
