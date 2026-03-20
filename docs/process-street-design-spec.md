# Process Street — Complete Frontend Design Reference

> This document captures the visual design system, layout patterns, and component anatomy
> of Process Street's UI. Use this as a pixel-reference when building the onboarding platform
> frontend. This covers the **presentation layer only** — see `backend-requirements.md` for
> functional/backend parity requirements.

---

## 0. Global Design System

### 0.1 Framework & Component Library
- React (Chakra UI) + AngularJS 1.8.3 hybrid (legacy run view)
- Class names: `chakra-{component} css-{hash}`
- Icon library: FontAwesome Pro (`fa-*`, `data-icon` attributes, `data-prefix="far"`, 16px default)
- AG Grid for tables (My Work, Reports): `ag-theme-quartz` class

### 0.2 CSS Custom Properties
```css
:root {
  --ps-navbar-height: 62px;
  --ps-navbar-offset: 64px;
  --ps-colors-chakra-border-color: #DEE4E8;
}
```

### 0.3 Typography

**Font Stack:**
- Body: `Inter, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", system-ui, sans-serif`
- Heading: Same as body (Inter)
- Mono: `Menlo, Monaco, Consolas, "Courier New", monospace`

**Type Scale (observed computed values):**

| Role | Size | Weight | Color | Line Height |
|---|---|---|---|---|
| Page title / modal heading | 20px | 600 | #434F5C | ~30px |
| Section heading (h2) | 18px | 500 | #1E2B36 | ~27px |
| Task name in content area | 18px | 500 | #1E2B36 | ~27px |
| Body default | 16px | 400 | #434F5C | 24px |
| Body primary/dark | 16px | 400 | #151D23 | 24px |
| Form field label | 16px | 500 | #434F5C | 24px |
| Form input value | 16px | 400 | #1E2B36 | 24px |
| Button (primary, large) | 16px | 700 | #FFFFFF | — |
| Step name (task list) | 16px | 400 | #1E2B36 | — |
| Heading step name | 16px | 700 | #1E2B36 | — |
| Completed step name | 16px | 400 | #8E9EAC | — |
| Selected step name | 16px | 400 | #085F98 | — |
| Popover/modal heading | 14px | 500 | #1E2B36 | — |
| Small label / meta | 14px | 400 | #434F5C | — |
| Muted secondary text | 14px | 400 | #5F7482 | — |
| Task action button text | 12px | 700 | #5F7482 | — |
| Badge / count | 8px | 600 | #EEF0F2 | — |
| Section label in panels | 12px | 700 | #8E9EAC | — |
| Comment body | 14px | 600 | #434F5C | — |
| Activity feed text | 16px | 400 | #151D23 | 18px |
| Tab label | 14px | 400 | #000000 | — |
| Active tab label | 14px | 400 | #0079CA | — |
| Tag/badge label | 11px | 500 | #FFFFFF | — |

### 0.4 Color Palette

| Usage | Hex |
|---|---|
| Brand primary (links, active states, progress) | `#0079CA` |
| Brand blue (button bg) | `#006CB5` |
| Dark link / active icon | `#085F98` |
| Publish/success button | `#00A589` |
| Error / danger red | `#E83857` |
| Dark navy (topbar, tooltips) | `#1E2B36` |
| Page bg | `#F2F8FC` |
| Library nav bg / input bg | `#F9FAFB` |
| White / surface | `#FFFFFF` |
| Selected nav item bg | `#EBF4FB` |
| Task list selected bg | `#F5F5F5` |
| Border default | `#DEE4E8` |
| Border interactive | `#C2CDD6` |
| Row separator | `#EEF0F2` |
| Text primary | `#151D23` |
| Text secondary | `#434F5C` |
| Text muted | `#5F7482` |
| Text placeholder / audit | `#8E9EAC` |
| Avatar fallback bg | `#8E9EAC` |
| Modal overlay | `rgba(0,0,0,0.7)` |
| Task drawer bg | `rgba(255,255,255,0.84)` / `rgba(247,250,252,0.8)` |
| Logic side menu bg | `#F7FAFB` |
| Logic menu bg (dark) | `#1E2B36` |
| Draft badge bg | `#FFBE00` |

### 0.5 Button Styles

**Primary Button (e.g., "New", "Save"):**
- Background: `#0079CA`; Text: `#FFFFFF`; Font: 16px/700; Height: 40px; Padding: 0 16px; Border: none; Radius: 4px
- Hover: background lightens (opacity 90% effect)

**Secondary / Default Button:**
- Background: `#FFFFFF`; Text: `#434F5C`; Font: 16px/400; Height: 40px; Border: `1px solid #C2CDD6`; Radius: 4px

**Publish Button:**
- Background: `#00A589`; Text: `#FFFFFF`; Font: 14px/700; Height: 36-40px; Radius: 4px

**Task Action Bar Button:**
- Background: transparent; Border: `1px solid #C2CDD6`; Radius: 4px (grouped: first `4px 0 0 4px`, last `0 4px 4px 0`)
- Height: 32px; Padding: 0 6px; Text: 12px/700 `#5F7482`; Active: text `#0079CA`

**Danger/Destructive:** Text: `#E83857`; Border: `1px solid #E83857` or none

**Icon Button:** 32-40px square; Background: transparent; Color: `#085F98` or `#5F7482`; No border; Radius: 4px

**Pill Button (FocusBar):** Background: transparent; Border: `1px solid rgba(0,0,0,0)` (active: `1px solid #FFFFFF`); Radius: 15px; Height: 25px; Text: 12px/700 `#FFFFFF`

**Full variant table:**

| Variant | bg | color | border | radius | font-size | weight | height | padding |
|---|---|---|---|---|---|---|---|---|
| Primary (Publish) | #00A589 | #1E2B36 | none | 4px (split left) | 14px | 700 | 40px | 0 16px |
| Blue primary | #0079CA | #FFFFFF | none | 4px | 16px | 700 | 48px | 0 16px |
| Secondary | #FFFFFF | #434F5C | 1px solid #C2CDD6 | 4px | 14-16px | 400 | 40px | 7px 12px |
| Secondary outline | transparent | #5F7482 | 1px solid #C2CDD6 | 4px | 12px | 700 | 32px | 0 6px |
| Ghost / text | transparent | #151D23 | none | 4px | 16px | 400 | 40px | 0 16px |
| Success/confirm | #EEF0F2 | #1E2B36 | none | 4px | 14px | 700 | 40px | 0 16px |
| Danger icon | transparent | #E83857 | none | 0 | — | — | — | 8px 0 |
| Nav pill (active) | #EBF4FB | #0079CA | none | 24px | 16px | 500 | 40px | 8px 16px |
| Nav pill (inactive) | transparent | #434F5C | none | 24px | 16px | 500 | 40px | 8px 16px |
| Automation (selected) | #0079CA | #FFFFFF | none | 8px | 20px | 400 | 53px | 16px |
| Automation (unselected) | #FFFFFF | #434F5C | 1px solid #C2CDD6 | 8px | 20px | 400 | 55px | 16px |

### 0.6 Form Input Styles

**Standard Text Input:**
- Width: 498-640px; Height: 40px; Font: 14px/400
- Bg: `#FFFFFF` or `#F9FAFB` (inside modal); Border: `1px solid #C2CDD6` (default) / `1px solid #0079CA` (focused); Radius: 6px; Padding: 8px 12px

**Textarea (long text):**
- Full width; Min-height: 80-103px (auto-grows); Font: 16px/400; Bg: transparent; Border: `1px solid #DEE4E8`; Radius: 6px

**Select/Dropdown (blvd-select):**
- Control height: 40px; Border: `1px solid #C2CDD6`; Radius: 4px; Font: 16px; Placeholder: `#8E9EAC`

**Date Picker:** `react-datepicker` library; timeOption: "Optional" | "Required" | "Hidden"

**Checklist Run Name Input (MaskedInput):**
- Width: 592px; Height: 45px; Font: 20px/500 `#5F7482`; Bg: transparent; Border: invisible until focus; Padding: 8px 16px

**Full form styles table:**

| State | bg | border | radius | font-size | color | padding |
|---|---|---|---|---|---|---|
| Default textarea | #F9FAFB | 1px solid #DEE4E8 | 6px | 14px | #000 | 8px 16px |
| Run view textarea | transparent | 1px solid #DEE4E8 | 6px | 16px | #1E2B36 | 8px 16px |
| Date input | #FFFFFF | 1px solid #C2CDD6 | 4px | 16px | #434F5C | 7px 12px |
| Disabled input | #EEF0F2 | 1px solid #C2CDD6 | 4px left | 16px | #1E2B36 | 7px 12px |
| Comment textarea | transparent | none | 0 | 16px | #1E2B36 | 4px |
| Search (global) | #FFFFFF | 2px solid #DEE4E8 | 4px | 14px | #8E9EAC | 0 16px |

### 0.7 Badge / Pill Styles

**Notification count badge:** 15x13px; Bg: `#8E9EAC`; Text: 8px/600 `#EEF0F2`; Radius: 4px; Padding: 3px 5px

**Avatar initials badge:** Circle/rounded-square; Font: 11px/500 `#FFFFFF`; Bg: varies by user

**Draft badge:** Pill shape; Bg: `#FFBE00`; Text: 12px/600 dark

**"Conditional logic applied" indicator:** Small icon, no label; Color: `#0079CA`

**"Dynamic due date" indicator:** Small calendar icon; No pill background

### 0.8 Avatar Styles
- Shape: circle (`border-radius: 9999px`)
- Sizes: 32x32px (nav), 20x20px (small), 24x24px (task list assignees)
- Initials: 2-letter monogram on colored background
- Photo: `<img>` with `border-radius: 9999px`
- Fallback: initials in colored circle

### 0.9 Popover / Panel Styles
- Background: `#FFFFFF`; Radius: 8px
- Shadow: `rgba(0,0,0,0.1) 0px 20px 25px -5px, rgba(0,0,0,0.04) 0px 10px 10px -5px`
- Header: title 14px/500 `#1E2B36`; Close button 24x24px `#5F7482`

### 0.10 Modal Styles
- Background: `#FFFFFF`
- Radius: 16px (large), 8px (medium), 6px (small menus)
- Shadow: `--ps-shadows-xl`
- Backdrop: semi-transparent dark overlay

### 0.11 Menu Styles
- Background: `#FFFFFF`; Radius: 6px; Shadow: `rgba(0,0,0,0.05) 0px 1px 2px 0px`
- Item: 14-16px/400 `#434F5C`; Hover: light gray bg; Width: 224-268px

### 0.12 Spacing Rhythm
- Base unit: 4px. Increments: 4, 8, 12, 16, 20, 24, 32, 40
- Common padding: `8px 16px` (buttons), `16px 32px` (page headers), `0 30px` (run view content)
- Gap between elements: 8px (tight), 12px (medium), 16px (standard), 20px (section), 40px (large)

---

## 1. Dashboard / My Work

### 1.1 URL
`/work?groupBy=DueDate&snoozeStatus=Active&includeCompleted=false&userIds={userId}`

### 1.2 Overall Layout
Renders inside the global nav. Below the nav (top: 64px) the page uses AG Grid for the task table. No separate left panel. Full width minus the global nav sidebar.

### 1.3 Page Header / Filter Bar
- Page title: "My Work" (18px+)
- **Group by** control: segmented selector — "Due Date", "Workflow", "Workflow Run"
- **Filter** button: filter by task type, user, workflow, snoozed status, completed status
- **Search** input: searches task names (240px, magnifying glass, border #DEE4E8)
- **Column picker**: show/hide columns button
- **+ Task** button: bg #EEF0F2, 14px/700, 40px tall

### 1.4 AG Grid Table
Grid class: `ag-theme-quartz`

**Column definitions:**
1. Task name (primary, expandable/clickable)
2. Workflow (template name)
3. Assignees (avatar chips)
4. Activity (last activity timestamp)
5. Tasks Completed (e.g., "62/69")
6. Status (badge: Active / Completed / Archived)
7. Due (date, red if overdue)
8. Overdue Tasks (count)

**Row heights:** Group/header row: 56px; Data row: 40px (DueDate grouping), 56px (Reports)

**Row styling:** Border-bottom: `1px solid #EEF0F2`; Hover: light gray; Selected: blue highlight

**Group row:** Bg: `#F9FAFB`; Font: 14px/600 `#434F5C`; Chevron expand/collapse

### 1.5 Empty State
Centered illustration + text "No tasks assigned to you"

### 1.6 Standalone Tasks
Section for ad-hoc tasks not tied to a workflow run. Same columns. "Add task" row at bottom.

---

## 2. Template Editor

### 2.1 URL Pattern
`/workflows/v2/{templateId}/edit/tasks/{taskTemplateId}`

### 2.2 Overall Layout
Three-column CSS Grid:
- **Left panel (task list):** 480px
- **Center panel (content):** fills remaining
- **Right panel (widget drawer):** 156px

Grid sits below FocusBar at `top: 128px` (64px nav + 64px FocusBar).

### 2.3 FocusBar (Template Editor Topbar)
Second fixed bar below global nav, dark-themed.

- Position: `fixed; top: 64px; left: 0; right: 0`; Height: 64px; Bg: `#1E2B36`

**Left section:**
- Template cover thumbnail: 40x40px rounded
- Template name (editable inline textarea): 16px/500 `#FFFFFF`

**Center section — Mode pills:**
- **Edit** | **Logic** | **Automations** | **View**
- Active: underline or bg change; Text: `#FFFFFF`
- Pill: 12px/700, border `1px solid #FFFFFF` (active) / transparent (inactive), radius 15px

**Right section:**
- "Draft saved" text: 14px `#8E9EAC`
- Discard button: icon only (trash/X), transparent bg
- Actions button (three dots): opens rename, duplicate, archive menu
- Workflow Settings button (gear icon): opens Workflow Setup modal
- Preview button: opens run preview
- **Publish button group:** Main: "publish changes" bg `#00A589`, 36-40px, radius `4px 0 0 4px`; Caret: same green, radius `0 4px 4px 0`, opens "Publish and notify all members" dropdown

### 2.4 Left Panel — Task List Drawer
- Width: 480px; Position: fixed; Top: 128px; Bg: `#FFFFFF` with subtle right border; Overflow: auto

**Task List Item (40px tall):**
- **Left:** Drag handle (6-dot grip, `#C2CDD6`, visible on hover) + task number + checkbox
- **Middle:** Task name text
- **Right (flares):** Assignee avatar chips (24x24px, max 3 + overflow badge), conditional logic indicator (blue lightning bolt), dynamic due date indicator (calendar icon)

**States:**
- Selected: bg `#0079CA`, text `#FFFFFF`
- Heading: no checkbox, weight 700, `#1E2B36`, 40px in editor / 52px in run
- Normal: bg transparent, `#1E2B36`, 14px/400
- Completed: text `#8E9EAC`

**"Add new item" button:** Full width, dashed border, text "+ Add step", color `#0079CA`

### 2.5 Task Actions Bar
Horizontal bar above task content when selected. Height: 32px, width ~714px.

7 buttons in a row (grouped pairs with shared borders):
1. **Assign** (`fa-user-plus`, `#5F7482`)
2. **View assignees** (avatar icon, `#0079CA` when assignees exist)
3. **Due date** (shows text label of rule when set; icon only when not; `#5F7482`)
4. **Task permissions** (`fa-lock`, `#5F7482`)
5. **Conditional logic** (lightning bolt, `#0079CA` when logic exists)
6. **Automations** (`fa-bolt`, `#151D23`)
7. **Add Stop** (`#0079CA` when stop not set)

### 2.6 Task Name Field
- Inline text input (contenteditable/textarea); Font: 18px/500 `#1E2B36`; Bg: transparent; No border

### 2.7 Center Content Area
- Width: ~700px centered; Padding: 24px 30px; Bg: `#FFFFFF`
- Widgets rendered as `role=listitem` in a `role=list`
- Each widget: drag handle (left), content (center), widget menu button (three-dot, on hover)
  - Menu: Duplicate, Move up, Move down, Delete (red `#E83857`)

### 2.8 Rich Text Widget
ProseMirror/Quill-based editor. Floating toolbar on text selection:
- Undo / Redo
- Formats dropdown (paragraph, h1, h2, h3, blockquote, code)
- Bold / Italic / Underline / Strikethrough
- Color picker popover (bg `#1E2B36`, 522x34px, radius 6px)
  - Text colors: Default, Gray, Red, Blue, Green
  - Highlights: Yellow, Orange, Green, Blue, Clear
- Bulleted / Numbered List
- Justify dropdown (Left, Center, Right, Justify)
- Horizontal Line
- Link button
- Variables button (inserts `{{form.FieldKey}}` merge tags)
- Generate Content with AI button

### 2.9 Subtask Widget
- Checkbox list: 20x20px checkbox (`border: 1px solid #DEE4E8`, radius 2px) + text input
- Placeholder: "Type here or press enter to add another subtask"
- "+ Add subtask" button: 14px `#0079CA`
- Delete icon on hover per subtask

### 2.10 Form Field Widgets (Editor Mode)
Each shows:
- Field type label: 14px `#5F7482`
- Edit button (pencil icon, top-right) → opens config popover
- The editable field interface (options list for dropdowns, etc.)
- Widget menu button

**Config options:** Label, key, placeholder, required flag, hidden-by-default flag

### 2.11 Save / Publish Flow
- Changes auto-save as draft → "Draft saved" in FocusBar
- "Discard" discards unsaved draft
- "Publish changes" creates new immutable revision (status: "Finished", incremented revision number)
- Publish dropdown: "Publish and notify" option

### 2.12 Drag-and-Drop
- Task items in left panel: reorderable via drag handle
- Widgets within a task: reorderable via drag handle
- Backend accepts reordered `orderTree` values (dot-notation: e.g., "1.0.0.0.0.2.1.1.0.1")

---

## 3. Insert Widget Drawer (Right Panel)

Width: 156px. Triggered by "open widgets menu" button (+ icon). Renders as dialog beside content area.

**Header:** Close button (X), 24x24px, `#5F7482`

### Content Section (8 items)
Section heading: "Content" — 12px/700 `#5F7482`

| Label | Icon (FA) |
|---|---|
| Text | `fa-align-left` / `fa-text` |
| Image | `fa-image` |
| File | `fa-file` |
| Video | `fa-video` |
| Page | `fa-file-alt` / `fa-page` |
| Send Email | `fa-envelope` |
| Subtasks | `fa-list-check` |
| Embed | `fa-code` |

### Form Fields Section (13 items)
Section heading: "Form Fields" — 12px/700 `#5F7482`

| Label | Icon (FA) | fieldType |
|---|---|---|
| Short Text | `fa-font` | `Text` |
| Long Text | `fa-align-left` | `Textarea` |
| Email | `fa-envelope` | `Email` |
| Website | `fa-globe` | `Url` |
| File Upload | `fa-upload` | `File` |
| Date | `fa-calendar` | `Date` |
| Numbers | `fa-hashtag` | `Number` |
| Dropdown | `fa-chevron-down` | `Select` |
| Multi Choice | `fa-check-square` | `MultiChoice` |
| User | `fa-user` | `Member` |
| Table | `fa-table` | `Table` |
| Snippet | `fa-code` | `Snippet` |
| Hidden | `fa-eye-slash` | `Hidden` |

**Button styling:** ~130x40px; Bg: transparent; Text: 14px `#434F5C`; Icon: `#5F7482`; Hover: bg `#EBF4FB`, text `#0079CA`

---

## 4. Conditional Logic Modal

### 4.1 Trigger
Clicking "Logic" in FocusBar. URL does not change.

### 4.2 Modal
- Width: ~90% viewport (full-screen overlay); Bg: `#FFFFFF`; Radius: 16px; Shadow: `--ps-shadows-xl`

### 4.3 Header
- Title: "Conditional Logic" 20px/600 `#434F5C`
- Close button (X): top-right, 32x32px, `#5F7482`

### 4.4 Body — Two-Column Layout

**Left SideMenu (452px):**
- Task list navigator; Active: bg `#EBF4FB`, `border-left: 2px solid #0079CA`
- Inactive: plain text button
- "Triggers" button at top

**Right Panel — RulesManager:**
- Tab strip at top; Below: `VirtualizedRuleList`

### 4.5 Rule Card Anatomy

Card: border `1px solid #DEE4E8`, radius 12px, padding 20px 24px, bg `#FFFFFF`, margin-bottom 8px. Left accent strip.

1. **`if` label:** 12px/600 `#5F7482`
2. **Field selector:** react-select, 16px `#434F5C`, placeholder "Select a form field"
3. **Operator dropdown:** 14px `#434F5C`; Options: is, is not, contains, has no value, has any value
4. **Value selector:** 14px `#434F5C`; dropdown for select fields, text input for text fields
5. **And/Or combinators:** 12px/400 `#151D23`; pill toggle between AND/OR
6. **`then` section:** 12px/600 `#5F7482` label; action "show"/"hide" dropdown; target task name 14px/600 `#000`
7. **MeatballMenu:** ellipsis 40x40px `#085F98`; dropdown: Duplicate, Move up, Move down, Delete (`#E83857`)
8. **Note label** (optional): 14px/600 `#5F7482`

### 4.6 Add Rule Button
Text: "+ Add Rule"; Color: `#0079CA`; Font: 14px/600

### 4.7 Footer Buttons
- Cancel: transparent bg, 48px, text `#434F5C`
- Save: bg `#0079CA`, text `#FFFFFF`, 48px, radius 4px

---

## 5. Automations Modal

### 5.1 Trigger
Clicking "Automations" in FocusBar.

### 5.2 Modal
Width: 1152px; Radius: 16px; Bg: `#FFFFFF`; Shadow: `--ps-shadows-xl`

### 5.3 Two-Column Layout

**Left Nav (400px):**
- Heading: "Automations" 20px/600
- Three trigger sections:
  1. "Run a workflow when..." (workflow/run created)
  2. "When a task is checked then..." (task completion)
  3. "When a workflow run is complete then..." (run completion)
- Collapsible groups; existing automations listed under trigger type

**Right Editor (752px):**
- **Step 1 — Trigger config:** form fields vary by trigger type
- **Step 2 — App/Action selector:** grid of integration icons (DocuSign, Google Sheets, Jira, Process Street native, Salesforce, Slack, Make, Zapier, Power Automate)
- **Step 3 — Activation toggle:** "Activate automation" label + toggle switch + "Off"/"On" text

**Run Logs:** Below editor; Columns: Timestamp, Status (success/failed), Details

### 5.4 API
`GET /api/1/native-automations?templateRevisionId={id}`

---

## 6. Active Run / Checklist View

### 6.1 URL Pattern
`/runs/{checklistId}/tasks/{taskId}`

### 6.2 Layout

| Zone | Position | Width | Background |
|---|---|---|---|
| Global Nav | fixed; top 0 | full width | `#FFFFFF` |
| Left task list | fixed; top 64px; left 0 | 672px | `rgba(247,250,252,0.8)` |
| Content area | fixed; top 64px; left 672px | remaining | transparent (white card centered) |

### 6.3 Progress Bar
- Full width, below global nav; Height: 4px
- Container bg: `#F5F5F5`; Fill: `#0079CA`
- Angular component: `progress ng-isolate-scope`

### 6.4 Left Panel — Header
- Sticky, top: -1px, height: 61px, bg: transparent
- **Checklist name input (MaskedInput):** 592x45px, textarea with mask overlay, 20px/500 `#5F7482`, editable
- **Actions button:** 40x40px, ellipsis icon `#085F98`, dropdown with "Hide Completed"

### 6.5 Left Panel — Task List
Scrollable list (672px wide). Container: `.checklist-steps-scroller` → `ul.list-group` → `li.step` items.

**Run view differences from editor:**
- Task name: 18px/500 `#1E2B36` (vs 28px/600 in editor)
- Form labels: 16px/500 (vs 14px/600 in editor)
- Textarea inputs: transparent bg (vs #F9FAFB in editor)
- Activity feed at bottom of each task (12px/400 `#8E9EAC`)
- Audit trail per widget (12px/700 `#8E9EAC`)

---

## 7. Library View

Template listing with folder navigation, search, and template cards.
- Left sidebar (folder tree, bg `#F9FAFB`) + main area (template list/grid)
- Each template row: name, Draft badge (bg `#FFBE00`), run count pill (`#085F98` 12px/700), last edited date

---

## 8. Global Top Navigation Bar

- **Position**: fixed; height: 62px; width: 100%; bg: #FFFFFF; no border/shadow
- **Left**: org logo (32x32px) linking to `/reports?tab=table`
- **Center nav links** (each `<a>`, padding 8px 16px, 16px/500, color #5F7482):
  - My Work (`fa-square-check`) → `/work`
  - Library (`fa-book-open`) → `/library`
  - Reports (`fa-chart-line`) → `/reports?tab=table`
  - Data Sets (`fa-database`) → `/data-sets`
- **Right utilities**:
  1. Search button (icon-only 40x40, `fa-magnifying-glass`, color #085F98)
  2. Expanded search (180px, border 2px solid #DEE4E8, placeholder "Search or ⌘+K")
  3. **New** button (bg #0079CA, white text, 700 weight, `fa-plus` icon, 40px tall)
  4. Comments link (`fa-comment`, 40x40, color #085F98) → `/comments`
  5. User avatar (32x32 circular, border-radius 9999px)

---

## Notes for Implementation

- **We use Amino, not Chakra UI.** Map Process Street's Chakra components to their Amino equivalents.
- **We use Amino icons, not FontAwesome.** Map `fa-*` icons to the closest Amino icon.
- **We use SCSS Modules, not Chakra's CSS-in-JS.** Translate inline styles and Chakra props to SCSS.
- **AG Grid is not in our stack.** Use Amino table components or a lightweight alternative.
- **Colors should map to Amino design tokens** where possible (`--amino-blue-500`, `--amino-gray-300`, etc.).
- **This is a visual reference, not a copy.** Match the UX patterns and information density, not the exact pixel values. Our app should feel like Zonos, not like Process Street.
