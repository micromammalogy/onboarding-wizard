# Zonos Onboarding Software — Build Stage Map

Architecture, scope, and phased build plan for integrating the onboarding platform into the existing Zonos Wizard application.

---

## Overview & Guiding Principles

This document maps the full build scope of the Zonos Onboarding Application — a platform that replicates Process Street-style project and task management, connects to Zonos' internal APIs to execute changes, and incorporates AI-powered recommendations derived from Gong call transcripts and email history.

The existing Wizard application is a production-grade Next.js 16 app with working auth, GraphQL integration across 5 Zonos API endpoints, and 5 fully functional CRUD pages. This is the foundation the onboarding layer will be built on top of — not a replacement.

### Core Design Principles

- Build incrementally — each stage is independently deployable and testable
- Supabase first, migrate to Zonos internal DB later — schema should be portable
- AI recommendations are advisory only — humans approve before any API action is taken
- Merchant-facing and OB-facing views are distinct — different UX needs, potentially different routes
- All Zonos API mutations go through the existing proxy pattern — no direct browser-to-API calls

### What Already Exists (Do Not Rebuild)

| Component | Details |
|---|---|
| Auth layer | Two-step AuthGate with token + org selection. Zustand-persisted. Fully working. |
| GraphQL proxy | `/api/graphql/[schema]/route.ts` — server-side header injection. 5 schemas wired. |
| Routing | `useNavStore` + `TaskRouter` with 17 page components. Sidebar nav fully working. |
| Rule Builder | Visual IF/THEN component. Reusable for task conditions/triggers in Stage 3. |
| 5 CRUD pages | General Settings, Fulfillment Locations, Tax IDs, Checkout Settings, Shipping Rules — real API integration. |
| Supabase config | Configured but unused. Ready to activate in Stage 1. |
| Design system | `@zonos/amino` v5.8.0 — all UI primitives available. Maintain consistency throughout. |

---

## Stage 1 — Database Foundation

**Activate Supabase, define schema, wire data layer — no visible UI changes**

### Goal

Establish the data persistence layer that every subsequent stage depends on. All tables should be designed with eventual migration to Zonos' internal DB in mind — use clean foreign key patterns, no Supabase-specific magic functions in business logic.

### Core Schema

- **projects** — One per merchant onboarding engagement. Links to a `merchant_id` (Zonos org ID).
  - Fields: `id`, `merchant_id`, `merchant_name`, `ae_id`, `ob_rep_id`, `start_date`, `projected_completion_date`, `status`, `days_in_onboarding` (computed), `created_at`

- **tasks** — Belongs to a project. Can be assigned to OB rep or merchant.
  - Fields: `id`, `project_id`, `title`, `description`, `assignee_type` (ob | merchant), `assignee_id`, `due_date_type` (fixed | relative), `due_date_offset_days`, `due_date_fixed`, `status` (pending | in_progress | merchant_complete | ob_verified | complete), `completed_at`, `verified_at`, `created_at`

- **users** — Internal OB reps and AEs. Separate from Zonos merchant credentials.
  - Fields: `id`, `email`, `name`, `role` (ob_rep | ae | admin), `zonos_credential_token`, `created_at`

- **templates** — Reusable onboarding checklists (like Process St templates).
  - Fields: `id`, `name`, `description`, `created_by`, `is_active`, `created_at`

- **template_tasks** — Task definitions within a template. Instantiated when a project is created from a template.

- **ingest_records** — Stores raw Gong transcripts and emails tied to a merchant.
  - Fields: `id`, `merchant_id`, `source` (gong | email), `external_id`, `content_text`, `metadata` (jsonb), `ingested_at`

- **ai_recommendations** — AI-generated suggestions tied to a merchant + a specific Zonos API action.
  - Fields: `id`, `merchant_id`, `ingest_record_ids` (array), `recommendation_type`, `suggested_value` (jsonb), `confidence_score`, `status` (pending | accepted | rejected | executed), `reviewed_by`, `created_at`

### Key Decisions for Migration Readiness

- Use UUIDs everywhere — Zonos' internal DB will likely need this
- No RLS policies in business logic — enforce at application layer instead
- Keep Supabase edge functions out of core flows — use Next.js API routes for all logic
- Export schema as SQL migrations from day one — makes porting trivial

### Deliverables

| Deliverable | Details |
|---|---|
| Supabase project | Activate existing config, create all tables with migrations |
| Seed data | Test merchants, projects, tasks, users for development |
| API route layer | Next.js `/api/db/*` routes wrapping Supabase client calls |
| Type generation | `supabase gen types typescript` → `src/types/database.ts` |
| Env config | `SUPABASE_URL` + `SUPABASE_ANON_KEY` in `.env.local` and Vercel |

---

## Stage 2 — Project & Task Dashboard

**The Process Street-style OB rep interface — view, manage, and track onboarding projects**

### Goal

Build the primary OB rep dashboard where they can see all active onboarding projects, drill into individual merchant projects, manage tasks, and track progress. This is the core daily-use interface for the onboarding team.

### Project List View

Top-level view showing all active onboarding engagements. Inspired by Process Street's project list but with Zonos-specific data columns.

- Columns: Merchant Name, Merchant ID, AE, OB Rep, Start Date, Projected Completion, Days in Onboarding, Tasks Completed (progress bar), Status
- Overdue tasks shown in red with a count badge
- User-editable column visibility — each OB rep can show/hide columns and save their view preference (stored in Supabase per user)
- Sort by any column. Filter by OB rep, AE, status.
- Click a row to drill into the project detail view

### Project Detail View

Per-merchant view showing all tasks in the onboarding checklist with status, assignee, due dates, and progress.

- Progress bar at top showing % of tasks complete
- Task list grouped by section (mirrors template structure)
- Each task shows: title, assignee, due date, status, overdue indicator
- OB rep can create tasks, edit tasks, mark tasks complete directly
- Tasks assigned to merchants show differently — OB can see if merchant has completed + verify
- Inline editing for task title, due date, assignee

### Task Due Date Logic

- **Fixed mode:** specific calendar date (date picker)
- **Relative mode:** number of days from project start date (e.g., +14 days)
- Toggle switch per task — when switching from relative to fixed, pre-populate with computed date
- Overdue = due date has passed and task is not complete → row turns red, notification triggered

### Draft Email Tasks

Tasks can have a type of `email_draft`. These tasks contain a pre-written email body (with template variables like `{{merchant_name}}`) and trigger an internal reminder to the OB rep to send it on a certain date.

- Email draft stored in task metadata (jsonb field)
- Reminder fires as an in-app notification (Stage 4 handles notification system fully)
- OB rep marks email as sent manually — task moves to complete

### Deliverables

| Deliverable | Details |
|---|---|
| Route | `/onboarding` — new top-level route alongside `/wizard` |
| ProjectListPage | Sortable, filterable table with saved column prefs |
| ProjectDetailPage | Task list with progress bar, inline editing, status management |
| Task components | TaskRow, TaskEditor, DueDateToggle, ProgressBar |
| Saved views | User column preferences stored in Supabase users table (jsonb prefs field) |

---

## Stage 3 — Merchant Wizard & Verification Flow

**Assign tasks to merchants, merchant-facing wizard, OB verification loop**

### Goal

Enable the two-sided workflow: OB reps assign tasks to merchants, merchants see a clean wizard interface to complete them, and OB reps are notified to verify before tasks are marked complete.

### Task Assignment

- OB rep can set `assignee_type = merchant` on any task
- Assigned merchant tasks are surfaced in the merchant-facing wizard view
- OB rep can see which tasks are pending merchant action vs completed by merchant vs verified

### Merchant Wizard View

A simplified, clean view (separate route or subdomain) that shows the merchant only their assigned tasks as a step-by-step wizard. No admin chrome — just their checklist.

- Auth: merchant logs in with their Zonos credential token (same AuthGate, scoped to merchant tasks only)
- Shows: task title, description, any input fields required, current step / total steps
- Merchant completes task → status moves to `merchant_complete`
- Merchant cannot mark OB-only tasks — those are filtered out of their view
- Mobile-friendly — merchants may complete this on their phone

### OB Verification Flow

- When merchant marks a task complete → OB rep receives in-app notification
- OB rep reviews merchant's submission, then clicks Verify to mark `ob_verified`
- Tasks marked complete directly by OB rep (`assignee_type = ob`) skip the verification step entirely
- Verified tasks update project progress bar and are locked from editing

### Notification System

- In-app notification center (bell icon in header)
- Notification types: `merchant_task_complete`, `task_overdue`, `project_milestone`
- Overdue tasks: daily check (cron via Vercel Cron or Supabase `pg_cron`) → flag tasks where `due_date < now` and `status != complete`
- Email notifications: optional per-user preference (use Resend or Postmark — lightweight, no infrastructure)

### Deliverables

| Deliverable | Details |
|---|---|
| Merchant route | `/merchant` or `/onboarding/merchant/[token]` — isolated wizard view |
| VerificationQueue | OB rep view of tasks awaiting verification |
| NotificationCenter | Bell icon + dropdown, unread count badge |
| Cron job | Vercel Cron at `/api/cron/overdue-check` — runs nightly |
| Email adapter | Pluggable email sender (Resend recommended) for OB + merchant alerts |

---

## Stage 4 — Gong & Email Ingestion

**Pull call transcripts and emails, store per merchant, prepare for AI layer**

### Goal

Ingest both call transcripts and emails from Gong — Gong captures emails via its native email sync, so everything flows through one API with one OAuth setup. Single integration, no second auth flow to maintain. This stage has no visible AI yet — it is purely the data pipeline that Stage 5 will consume.

### Gong as Unified Source

Gong captures both recorded calls and email threads via its native email sync. Everything comes through one API, which significantly reduces auth complexity and maintenance surface.

- Gong API setup: OAuth2 app registration, `client_id` + `client_secret` in env
- Calls: `GET /v2/calls` filtered by participant email. Transcripts via `GET /v2/calls/{id}/transcript`
- Emails: `GET /v2/emails` — pull email threads associated with the same Gong-tracked contacts
- Both stored in `ingest_records` with source field set to `gong_call` or `gong_email`
- Sync strategy: Gong webhook preferred (fires on call completion or email ingestion), scheduled 6-hour pull as fallback
- De-duplication: check `external_id` before inserting — idempotent syncs regardless of trigger method

### Merchant Matching

- Match Gong participants and email contacts to merchant records via contact email stored in the project record
- Gong's contact model links participants to companies — use company domain as secondary match signal
- Unmatched records go into a review queue — OB rep manually assigns them to a merchant
- Once matched, all `ingest_records` are queryable by `merchant_id`

### Deliverables

| Deliverable | Details |
|---|---|
| Gong OAuth flow | `/api/auth/gong` — authorization, token storage, refresh handling |
| Gong sync route | `/api/integrations/gong/sync` — pull calls + emails, store in `ingest_records` |
| Webhook receiver | `/api/webhooks/gong` — receives Gong push events on new calls/emails |
| Ingest viewer | Per-merchant timeline of calls + emails (read-only UI in project detail) |
| Matching queue | Admin view to assign unmatched Gong contacts to merchant records |
| Cron fallback | Scheduled pull if Gong webhooks are unavailable or lag |

---

## Stage 5 — AI Recommendation Engine

**Analyze ingested data, surface actionable recommendations, execute via Zonos API**

### Goal

The core AI layer: analyze Gong transcripts and emails per merchant, extract relevant configuration signals, map them to specific Zonos API mutations, and surface them as reviewable recommendations that OB reps can accept and execute with one click.

### How It Works

- Trigger: manual (OB rep clicks Analyze) or automatic on new `ingest_record`
- AI model reads all `ingest_records` for a merchant + current Zonos settings (fetched via existing GraphQL queries)
- Model outputs structured recommendations: what to change, what value to set, which API to call, confidence level
- Recommendations stored in `ai_recommendations` table, `status = pending`
- OB rep sees recommendations in a review panel — can accept, reject, or edit the suggested value
- On accept → executes the mapped Zonos GraphQL mutation via existing proxy pattern
- Execution result stored back on the recommendation record (success/error)

### Recommendation Types (Initial Set)

| Type | Signal |
|---|---|
| `fulfillment_location` | Merchant mentions shipping from a specific address → suggest creating/updating fulfillment location |
| `tax_id` | Merchant mentions VAT or tax registration → suggest adding tax ID for that country |
| `shipping_rule` | Merchant mentions carrier preference or exclusion → suggest shipping rule |
| `checkout_setting` | Merchant mentions notification email or button preference → suggest checkout setting update |
| `currency` | Merchant mentions primary operating currency → suggest currency setting |

### AI Prompt Architecture

- System prompt: defines Zonos context, available API actions, expected JSON output schema
- User prompt: merchant's full transcript + email history + current settings snapshot
- Output: JSON array of recommendations with type, suggested_value, reasoning, confidence
- Use Claude API (claude-sonnet) via Anthropic SDK — already available in the tech stack context
- Parse and validate output before storing — malformed responses go to error queue

### OB Review UI

- Recommendation card: shows reasoning (what the AI read), suggested value, confidence score
- OB can edit the suggested value before executing (e.g., correct a misheard address)
- One-click Execute → fires GraphQL mutation, shows success/error inline
- Reject with optional note (feeds back into future prompt tuning)

### Deliverables

| Deliverable | Details |
|---|---|
| AI analysis route | `/api/ai/analyze` — accepts `merchant_id`, calls Claude, stores results |
| RecommendationPanel | Per-merchant panel showing pending/accepted/rejected recommendations |
| RecommendationCard | Individual card with reasoning, editable value, execute button |
| Mutation mapper | Map from `recommendation_type` → GraphQL mutation + variable builder |
| Feedback loop | Store rejected recommendations for future prompt tuning |

---

## Stage 6 — Zonuts AI Chatbot

**Internal AI assistant for OB reps — merchant context-aware Q&A and guidance**

### Goal

A conversational AI assistant embedded in the onboarding app for internal Zonos users — OB reps, AEs, and support staff — to ask questions about a merchant's project, troubleshoot integration issues, and get guidance on Zonos configuration. It is merchant-context-aware: when you are inside a project, the bot knows who the merchant is and can reference their calls, emails, and current settings.

### Primary Use Cases

- Support triage: "Merchant X says their checkout is showing the wrong currency — what do their current settings show?"
- Integration troubleshooting: "Their shipping rules aren't firing — can you review their rule config and tell me what might be wrong?"
- Call/email lookup: "What did we discuss about their fulfillment setup on the last Gong call?"
- Onboarding guidance: "What tasks are still open for this merchant and what's blocking them?"
- Zonos product knowledge: "What's the difference between DDP and DAP and when should I recommend each?"

### Context Architecture

- When opened inside a merchant project: injects merchant's current Zonos settings (from existing GraphQL queries), recent `ingest_records` (calls + emails), and open task list into the system prompt
- When opened globally (no project context): operates as a Zonos product knowledge assistant only
- Context is assembled server-side at `/api/ai/chat` — never raw data in the browser
- Large transcript history is chunked and summarized before injection to stay within context limits

### Implementation

- Streaming responses via Anthropic API (claude-sonnet) with server-sent events — responses appear word-by-word
- Conversation history stored in Supabase `chat_sessions` table, persisted across sessions per user + merchant
- Floating chat widget in bottom-right corner — does not interrupt the main workflow
- Support staff can share a chat session link to a specific conversation for escalation handoffs

### Deliverables

| Deliverable | Details |
|---|---|
| Chat API route | `/api/ai/chat` — streaming endpoint, context injection, session management |
| ChatWidget | Floating panel, message history, streaming renderer, copy/share session |
| `chat_sessions` table | Supabase table storing conversation history per user + optional `merchant_id` |
| Context builder | Server utility: assembles merchant settings snapshot + recent ingest summary for system prompt |
| Knowledge base | System prompt seeded with Zonos product docs, API reference, and common troubleshooting patterns |

---

## Stage 7 — Export & CRM Integration

**CSV exports, webhooks, Zapier, and outbound data API**

### Goal

Give OB reps and admins the ability to export project and task data in multiple formats, push data to Salesforce (current CRM), and expose outbound integration hooks for external tools. Critically, the CRM integration is built with an abstraction layer from day one so that swapping Salesforce for Zonos' internal CRM later is a configuration change, not a rewrite.

### CRM Integration — Abstracted Layer

The CRM adapter pattern: all CRM-bound data goes through a single `crm_adapter.ts` module that maps internal Zonos data shapes to the target CRM's fields. Today that target is Salesforce. When Zonos' internal CRM is ready, only the adapter implementation changes — no other code touches CRM logic.

- `crm_adapter` interface: `pushProject(project)`, `pushTask(task)`, `pushMerchant(merchant)`, `syncStatus(merchant_id)`
- `SalesforceAdapter`: implements the interface using Salesforce REST API (OAuth2, connected app in SF org)
- `InternalCRMAdapter`: stubbed out now, implemented when internal CRM is ready — same interface
- Active adapter selected via env var: `CRM_PROVIDER=salesforce | internal`
- Push triggers: project created, project status changed, task verified complete, recommendation executed
- Field mapping config stored in `crm_field_map.ts` — easy to update when SF object schema changes

### Salesforce Specifics (Initial Implementation)

- Objects written to: Opportunity or custom Onboarding object (confirm with SF admin), Contact, Activity/Task
- Auth: OAuth2 connected app — `client_credentials` flow for server-to-server (no user login required)
- Sync log: `crm_sync_log` table in Supabase tracks every push attempt, SF record ID, success/error
- Retry: 3 attempts on failure, then manual retry from admin panel
- Bi-directional is out of scope for now — this is Zonos pushing to SF, not SF pulling back

### CSV Export

- Export project list as CSV: all columns, current filters applied
- Export task list per merchant as CSV
- Export AI recommendations log as CSV
- Generated server-side at `/api/export/[type]` — streamed as file download

### Webhooks

- Outbound webhooks fired on: `task_complete`, `project_complete`, `recommendation_executed`, `task_overdue`
- Admin configures webhook endpoints in settings (URL + HMAC secret)
- Stored in `webhook_configs` table, delivery attempts logged in `webhook_deliveries`
- Retry logic: 3 attempts with exponential backoff on non-2xx responses

### Zapier

Use webhooks (above) for Zapier — OB rep pastes Zapier webhook URL into settings. Zero additional dev work, connects to 6,000+ Zapier apps immediately. A custom Zapier app can be a future enhancement if needed.

### Deliverables

| Deliverable | Details |
|---|---|
| CRM adapter | `src/lib/crm/crm_adapter.ts` — interface + SalesforceAdapter implementation |
| SF OAuth flow | `/api/auth/salesforce` — connected app auth, token storage |
| CRM sync routes | `/api/integrations/crm/push` — push project/task/merchant data |
| `crm_sync_log` table | Supabase table tracking every push attempt and SF record ID |
| Export routes | `/api/export/projects`, `/api/export/tasks`, `/api/export/recommendations` |
| WebhookManager | Admin UI to configure webhook endpoints + view delivery log |
| Event dispatcher | Server-side utility firing webhooks and CRM pushes on tracked events |

---

## Stage 8 — Polish, Admin & DB Migration

**Analytics, admin panel, performance hardening, and Zonos internal DB migration**

### Goal

Productionize the application — admin tools, usage analytics, performance optimization, and the migration from Supabase to Zonos' internal database once the core system is proven in production.

### Admin Panel

- User management: create/deactivate OB reps and AEs, assign roles
- Template management: create/edit/archive onboarding templates
- System health: webhook delivery success rates, AI recommendation acceptance rates, Gong sync status
- Audit log: who changed what, when (stored in `audit_events` table)

### Analytics Dashboard

- Average days in onboarding by AE, by OB rep, by merchant size
- Task completion rates, most common bottlenecks (tasks that frequently go overdue)
- AI recommendation acceptance rate by type
- Use recharts (already in the tech stack) for all charts

### DB Migration Plan

- Schema is portable — all migrations tracked as SQL files from Stage 1
- Migration steps: spin up Zonos internal DB instance → run migrations → dual-write period (write to both, read from Supabase) → cut over reads → decommission Supabase
- Auth tokens and Zustand state unaffected — migration is purely persistence layer
- No Supabase-specific features used in application logic — migration is a connection string swap + schema re-apply

---

## Open Questions & Dependencies

These items need answers before or during specific stages. They are flagged here to avoid blocking work unnecessarily.

### Before Stage 4 (Ingestion)

- **Gong account access:** Who manages the Gong org? Need admin access to create the OAuth app and enable API access.
- **Merchant contact mapping:** How are merchant email addresses stored today? The Gong matching logic depends on a reliable email or domain per merchant record. If this isn't in the current data model, it needs to be added in Stage 1.
- **Gong email sync:** Confirm that Gong email integration is active in your org — it requires connecting Gmail/Outlook inside Gong settings. Without it, only call transcripts are available.

### Before Stage 5 (AI)

- **Anthropic API key:** Does Zonos have an org account, or will this use a personal key initially?
- **Recommendation guardrails:** Are there Zonos API mutations that should be blocked from AI execution? (e.g., billing changes, account deletion, anything irreversible without manual review)

### Before Stage 6 (Chatbot)

- **Zonos documentation:** Is there an internal knowledge base, API reference, or support playbook that can be used to seed the chatbot system prompt?
- **Access scope:** Should all internal Zonos users see the chatbot, or only OB reps and AEs? Support staff access level?

### Before Stage 7 (CRM / Exports)

- **Salesforce object mapping:** Which SF object should onboarding projects map to — Opportunity, a custom object, or something else? Need confirmation from your SF admin.
- **SF connected app:** Needs to be created in the Salesforce org by an SF admin. Client ID + secret come from this setup.
- **Internal CRM timeline:** Even a rough estimate helps scope the adapter stub — if it's 6+ months out, keep the stub minimal for now.

---

## Stage Summary

| Stage | Name | Key Output | Depends On |
|---|---|---|---|
| 1 | Database Foundation | Supabase schema, migrations, type generation | — |
| 2 | Project & Task Dashboard | OB rep project list + task management UI | Stage 1 |
| 3 | Merchant Wizard & Verification | Merchant-facing tasks, OB verify flow, notifications | Stages 1–2 |
| 4 | Gong & Email Ingestion | Data pipeline, merchant-matched transcripts + emails | Stage 1 |
| 5 | AI Recommendation Engine | Claude-powered suggestions → Zonos API execution | Stages 1, 4 |
| 6 | Zonuts AI Chatbot | Context-aware OB rep assistant | Stages 1, 4, 5 |
| 7 | Export & CRM Integration | CSV, webhooks, Salesforce adapter (swappable for internal CRM) | Stages 1–2 |
| 8 | Polish & DB Migration | Admin panel, analytics, migrate to Zonos internal DB | All stages |
