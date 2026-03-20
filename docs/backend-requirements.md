# Backend Requirements — Core Process Street Parity

## 1. Template Engine

### 1.1 Template CRUD
- Create, read, update, delete templates
- Template versioning: draft vs published revisions (publish creates a new immutable revision; active runs stay on their revision)
- Template folders/organization (hierarchical folder tree)
- Template duplication (deep copy including all tasks, widgets, logic, due dates, assignments)
- Template archival (soft delete — can be restored)
- Cover image per template (upload + storage)

### 1.2 Task Definitions
- Ordered list of tasks within a template
- Task types: regular task, heading/section separator (non-completable, used for grouping)
- Task properties: name, description, position/order, hidden-by-default flag, stop-gate flag
- Drag-and-drop reordering (backend accepts new position array)
- Add/remove/rename tasks
- Each task has a unique stable ID (survives reordering)

### 1.3 Widget System (Form Fields + Content Blocks)
- Each task contains an ordered list of widgets
- Content widgets: Text (rich text), Image, File, Video, Page, Send Email, Subtasks, Embed
- Form field widgets: Short Text, Long Text, Email, Website/URL, File Upload, Date, Numbers, Dropdown (single select), Multi Choice (multi select), User (assignee picker), Table, Snippet (code/template variable), Hidden
- Widget properties: key (unique identifier), label, type, required flag, hidden-by-default flag, placeholder text, options (for select/multi-choice), default value
- Widget CRUD within a task, reordering via drag-and-drop
- Rich text stored as HTML or ProseMirror JSON

### 1.4 Template Variables / Merge Tags
- `{{form.FieldKey}}` syntax for referencing form field values across the template
- Used in: email templates, text content widgets, task names, due date rules
- Fallback syntax: `{{form.Field|fallback:'default value'}}`
- Cross-task variable resolution at runtime

---

## 2. Conditional Logic Engine

### 2.1 Rule Definitions
- Each rule: trigger field (widget key) + condition (operator + value) + action (SHOW/HIDE) + target (task ID or widget ID)
- Operators: Is, IsNot, Contains, HasNoValue, HasValue
- Targets can be: a single widget, multiple widgets, an entire task, multiple tasks
- A single trigger field can drive multiple rules
- Rules evaluated client-side on field change (instant UI) AND server-side for validation

### 2.2 Rule Storage
- Rules belong to a template revision (not a run)
- Stored as structured data: `{ triggerWidgetKey, operator, value, action, targets[] }`
- Rule CRUD in the template editor

### 2.3 Multi-Condition Rules
- Compound conditions (AND/OR logic) per rule
- Backend supports `conditions[]` array per rule with join operator

### 2.4 Cascading Logic
- Rule A shows a field → field triggers Rule B → Rule B shows another task
- Engine handles recursive evaluation without infinite loops

---

## 3. Run (Checklist Instance) Engine

### 3.1 Run Lifecycle
- Create a run from a template (instantiates all tasks + widgets from the published revision)
- Run states: Active, Completed, Archived
- Run naming: auto-generated or custom (editable)
- Run is pinned to a specific template revision (immutable)

### 3.2 Task Completion
- Per-task completion state: incomplete / complete
- Validation: required fields filled, field type checks, hidden required fields skipped
- Uncomplete (toggle back to incomplete)
- Stop gates: blocks all subsequent tasks until the stop task is completed
- Completion audit: timestamp + user

### 3.3 Form Field Values
- Each widget instance in a run stores its current value
- Auto-save on every change
- File uploads go to object storage, reference stored in value
- Hidden field values stored but not visible to user

### 3.4 Progress Tracking
- `completedTasks / totalVisibleTasks` (hidden tasks excluded)
- Real-time updates on task completion

### 3.5 Activity Feed
- Per-task: who changed what field, when
- Per-run: task completions, assignments, comments
- Per-widget audit trail: "Updated by {user} on {date}"

---

## 4. Due Date System

### 4.1 Due Date Rule Types
- Relative to checklist start date (N days/hours after run creation)
- Relative to form field value (N days/hours before/after a date field)
- Fixed date (manual date picker)

### 4.2 Due Date Calculation
- Offset: number + unit (days, hours)
- Direction: Before or After source date
- Workdays-only flag (skip weekends)
- Recalculate all dependent due dates when source date field changes

### 4.3 Overdue Detection
- Cron or real-time: flag tasks where `due_date < now` AND `status != complete`
- Surface in My Work, project detail, notifications
- Overdue count badge on run list rows

---

## 5. Task Assignment System

### 5.1 Assignment Rules
- Assign task to user whose email matches a form field value
- Cross-task reference (email field in task 2 assigns task 50)
- Multiple assignees per task
- Re-evaluate when source email field changes
- Manual assignment override

### 5.2 Assignment at Run Creation
- Pre-filled intake data triggers assignment rules immediately

### 5.3 User Resolution
- Email → user lookup
- Unmatched emails shown as "invited" / pending

---

## 6. Task Permissions System

### 6.1 Permission Rules
- Grant read + update permissions on a task to a user identified by email form field
- Default: creator and admins have full access
- Evaluated at runtime (form field value → user email → grant)

### 6.2 Visibility vs Editability
- Visible but not editable (read-only for some users)
- Visibility controlled by conditional logic; editability controlled by permissions

---

## 7. Email System

### 7.1 Email Template Engine
- Email widgets embedded in tasks with: subject, to, cc, bcc, body (rich text or plain text)
- All fields support `{{form.FieldKey}}` variables with fallback syntax
- Variable resolution at send time

### 7.2 Email Sending
- User clicks "Send" on email widget → backend resolves variables, validates addresses, sends
- Pluggable email provider (Resend, Postmark, SES)
- Send log: timestamp, recipient, subject, body snapshot, sender
- Delivery status tracking if provider supports webhooks

---

## 8. My Work / Dashboard

### 8.1 Task Aggregation
- All tasks assigned to current user across all active runs
- Group by: Due Date, Workflow, Workflow Run
- Filter by: task type, user, workflow, snoozed status, completed status
- Sort by any column, search by task name

### 8.2 Task Snoozing
- Hide task from My Work until a specified date
- Snoozed count + toggle view

### 8.3 Standalone Tasks
- Ad-hoc tasks not tied to any template/run
- Same properties: name, due date, assignee, notes

### 8.4 Column Configuration
- User can show/hide/reorder columns, saved per user

---

## 9. Library / Template Management

- Template list with name, folder, draft/published status, run count, last edited
- Nested folder hierarchy with CRUD
- Move templates between folders
- Duplicate, archive/restore, export/import templates
- Search and sort

---

## 10. Reports / Data Sets

### 10.1 Reports
- Cross-run table: run name, template, status, progress, assignees, dates, custom field columns
- Filter by template, status, date range, assignee
- CSV export

### 10.2 Data Sets
- Reusable option lists that populate dropdowns across templates
- Data set CRUD, link to specific widgets

---

## 11. Automations

### 11.1 Triggers
- Task completed/uncompleted, run created/completed, form field changed, due date reached, scheduled

### 11.2 Actions
- Create a new run, send email, send webhook, update form field, assign task, complete task

### 11.3 Configuration
- Per-template automation setup (trigger + conditions + action)
- Enable/disable individual automations
- Execution log

---

## 12. Comments

- Comment thread per task in a run
- Rich text, @mentions, notifications
- Edit/delete own comments
- Global `/comments` view: filter by unread/mentioned/all, mark as read

---

## 13. Global Search

- ⌘+K shortcut
- Search across templates, runs, tasks, form field values
- Instant results with type indicators
- Recent searches

---

## 14. User & Org Management

- User: name, email, avatar, role (Admin, Member), status
- Org: name, logo, billing, member management
- Invitation flow (email → accept → account)
- API key management

---

## 15. Notifications

- In-app: task assigned, completed, overdue, comment mention, run created, automation fired
- Bell icon + unread count, notification dropdown, click-to-navigate
- Email: per-user preference per notification type, digest option, unsubscribe

---

## 16. File Storage

- File upload widget, cover images, image content blocks
- S3-compatible object storage
- File metadata: name, size, type, uploaded_by, uploaded_at
- Configurable size limits and type restrictions

---

## 17. Webhooks & API

- Outbound webhooks on configurable events
- Webhook management: URL + HMAC secret, delivery log, retry with backoff
- Public API for templates, runs, tasks, field values, users
- API key auth, rate limiting

---

## 18. Database Schema (Core Tables)

| Table | Purpose |
|---|---|
| `organizations` | Org accounts |
| `users` | User accounts with roles |
| `org_memberships` | User ↔ org join |
| `folders` | Template folder hierarchy |
| `templates` | Template metadata |
| `template_revisions` | Immutable published snapshots |
| `tasks` | Task definitions within a revision |
| `widgets` | Widget definitions within a task |
| `widget_options` | Options for select/multi-choice |
| `conditional_rules` | Logic rules per revision |
| `due_date_rules` | Due date rules per revision |
| `assignment_rules` | Assignment rules per revision |
| `permission_rules` | Permission rules per revision |
| `automations` | Trigger/action configs per template |
| `runs` | Live checklist instances |
| `run_tasks` | Task instances (completion state) |
| `run_widget_values` | Form field values per run |
| `run_files` | Uploaded files |
| `comments` | Task comments |
| `notifications` | In-app notifications |
| `standalone_tasks` | Ad-hoc tasks |
| `data_sets` | Reusable option lists |
| `data_set_items` | Items in data sets |
| `user_preferences` | Column configs, notification prefs |
| `email_sends` | Email send log |
| `webhook_configs` | Outbound webhook endpoints |
| `webhook_deliveries` | Delivery attempt logs |
| `automation_logs` | Automation execution history |
| `activity_log` | Global audit trail |

---

## 19. Build Priority Order

1. Template Engine (§1) — everything depends on templates
2. Widget System (§1.3) — templates need form fields
3. Run Engine (§3) — can't onboard without runs
4. Conditional Logic (§2) — makes templates functional
5. Due Date System (§4) — drives onboarding timeline
6. Assignment System (§5) — OB reps need their tasks
7. My Work View (§8) — daily-use dashboard
8. Email System (§7) — critical merchant communications
9. Permissions (§6) — access control
10. Comments (§12) — collaboration
11. Notifications (§15) — keep users informed
12. File Storage (§16) — upload widgets
13. Automations (§11) — workflow automation
14. Reports (§10) — data visibility
15. Search (§13) — convenience
16. Library Management (§9) — template organization
17. Webhooks & API (§17) — integrations
