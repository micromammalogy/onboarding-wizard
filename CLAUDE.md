# Zonos Onboarding Wizard — Claude Context

## Project Goal
Build a web app that recreates the Zonos dashboard UI to guide merchants through onboarding tasks (wizard-style). Not full dashboard functionality — focused on **frontend design fidelity** and step-by-step guidance.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript 5
- `@zonos/amino` v5.8 — Zonos design system (components, icons, tokens)
- Zustand for state management
- SCSS Modules for styling
- pnpm / npm

## Amino Component Usage
```tsx
import { Button } from '@zonos/amino/components/button/Button';
import { SearchIcon } from '@zonos/amino/icons/SearchIcon';
```
- CSS variables: `--amino-primary`, `--amino-gray-300`, `--amino-blue-500`, etc.
- Storybook: https://amino.zonos.com/

---

## Zonos Dashboard Reference

### Source Context Files
Full dashboard structure is documented in these files (in Downloads, should be copied to `docs/` if needed):
- `zonos_dashboard_context.txt` — All pages, routing, data models, nav structure
- `zonos_dashboard_context_part2_settings_styling.txt` — Settings pages, complete styling spec, design tokens

### Sidebar Structure (Shawn's Test Account #5782)

**Main nav (top to bottom) — icons verified from SidebarItemsContext.tsx:**
1. Orders (BagIcon)
2. Quoter (LandedCostIcon) — expandable: Create quote, Recent quotes
3. Products (TagIcon) — expandable: Catalog, Classify, Bulk classify, Manual classify, Restrict
4. Shipping (BoxesIcon) — expandable: Shipments, Batches, Screen, Rates
5. Invoices (ReceiptIcon)
6. Reports (ChartIcon)
7. *[visual gap — no border]*
8. Settings (SettingsIcon)
9. Analytics (ChartIcon + StarsIcon indicator)
10. Admin (LockIcon)
11. Contact support (HelpIcon)
12. Chat (StarsIcon)

**Behavior:** Only one expandable group open at a time (accordion). No chevron arrows on expandable items.

**Footer:** User avatar circle + full name ("Shawn Roah")

**Settings sidebar** (replaces main nav when Settings is active):
- ← Back to home
- Overview (DashboardIcon)
- **Account:** General (SettingsIcon), Team (UserIcon), Billing (MoneyIcon), Integrations (IntegrationIcon), Audit log (ClockIcon), Manage organization (WarningIcon color="red600")
- **Shipping:** Manage rates (TruckIcon) [Beta], Locations (LocationIcon), Cartonization (BoxesIcon), Labels (FileIcon)
- **Landed cost:** Classify (ClassifyIcon), Catalog (FolderListIcon), Tax IDs (GlobeIcon), Rules (ShoppingListIcon)
- **Checkout:** Checkout settings (CheckoutIcon), Custom messages (CommentIcon), Discounts (PercentBadgeIcon)
- **Branding:** Branding settings (PaletteIcon)
- **Hello:** Hello settings (HelloIcon), Custom messages (CommentIcon)

### Design Tokens
| Token | Value |
|-------|-------|
| Sidebar width | 232px (Amino default --amino-sidebar-width) |
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
| Section heading | 18-20px / 600 |
| Body text | 14px / 400 |
| Small/helper | 13px / 400 |
| Table header | 12px / 500, uppercase, gray-500 |
| Settings section label | 12px / 600, uppercase, gray-500 |

### Header Nav (Breadcrumbs + Actions)
- 64px height, sticky top, border-bottom amino-border-subtle, white bg, 32px horizontal padding
- Left: breadcrumbs "Section > Page" with ChevronRightIcon separator
- Right: action portals (buttons, toggles per page)
- Breadcrumb text: gray-500 for parent, gray-800 for current

### Key Patterns
- `noPaddingContent` on Amino Layout — dashboard manages its own padding
- No `headerContent` prop on Layout (comment in real dashboard: "DO NOT USE headerContent PROP")
- Org switcher: colored square avatar + org name (truncated) + org ID + up/down chevron arrows
- Quick search: full-width button with SearchIcon + "Quick search" + "/" shortcut pill
- Active nav item: light blue-50 background highlight
- Tables go full width, no outer border
- Slide-over modals from right (~500-600px wide)
- Status badges: Fulfilled/Paid=green, Open=gray outline, Processing=blue, Error/Cancelled=red

### Routing (key routes)
```
/orders/all                    — Orders list
/quotes/create                 — Create quote
/quotes                        — Recent quotes
/products/catalog              — Product catalog
/products/classify/create      — Classify item
/products/restrict             — Restrictions
/shipping/shipments            — Shipments
/shipping/batches              — Batch shipments
/shipping/screen               — Party screening
/shipping/rates                — Rate lookup
/billing/invoices              — Invoices
/reports                       — Reports
/analytics/cartonization       — Analytics
/admin                         — Admin tools
/chat                          — AI chat
/settings/dashboard/overview   — Settings overview
/settings/dashboard/general    — General settings
/settings/dashboard/team       — Team management
/settings/dashboard/billing    — Billing
/settings/dashboard/integrate  — Integrations/API keys
```

### Org Info
- **Shawn's Test Account:** #5782 (orange "S" avatar) — has Invoices, Reports, Settings, Create order button
- **Zonos:** #909 (green "Z" avatar) — has Manifests, announcement banner, no Create order
- Different orgs see different nav items based on plan/features

### Dashboard Layout Architecture (from real repo)
- Uses `<AminoLayout noPaddingContent sidebar={...} content={...} footer={...} />`
- **DO NOT USE `headerContent` prop** (comment in real code)
- Content = `.headerNav` (64px) + `.bodyWrapper` (padding) + `.pageWrapper` (max-width centered)
- Layout CSS vars: `--dashboard-layout-width: 1440px`, `--dashboard-layout-padding: 32px`, `--dashboard-layout-min-width: 700px`
- Per-page overrides via `Component.renderLayout` static method
- Sidebar uses Amino `NavigationGroup`/`NavigationItem` components
- Two sidebar modes (main/settings) animated with framer-motion AnimatePresence
- CSS import order: `amino.css → reset.css → theme.css → globals.css`
- Global overrides: thin scrollbars, `--amino-appbar-height: 55px`, font-family reset, transition animations

### Dashboard Coding Conventions (from CLAUDE.md)
- TypeScript: `I` prefix for types/interfaces, no `as` assertions
- Testing: `test()` not `it()`, no `data-testid`
- Translations: `translate()` / `<Translate>` component
- GraphQL: `useSWR` + `graphql-request`, queries in `src/hooks/`

---

## Project Structure
```
src/app/wizard/layout.tsx          — Main layout (Amino Layout + sidebar + breadcrumbs)
src/app/wizard/page.tsx            — Wizard step router
src/components/wizard/             — Sidebar, breadcrumbs, step content, navigation
src/components/steps/              — Step components (StepWelcome, StepBusinessInfo, StepReview)
src/hooks/useWizardStore.ts        — Zustand store (step index, form data, navigation)
src/types/wizard.ts                — Step config types
src/styles/globals.scss            — Global styles (scrollbar, font, selection)
```

## GitHub
- Repo: `micromammalogy/zonos-onboarding-wizard`
- User: Shawn Roah (@micromammalogy)
- 
