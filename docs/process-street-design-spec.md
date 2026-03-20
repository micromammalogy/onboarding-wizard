# Process Street — Frontend Design Reference

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
- AG Grid for tables (My Work, Reports)

### 0.2 CSS Custom Properties
```css
:root {
  --ps-navbar-height: 62px;
  --ps-navbar-offset: 64px;
  --ps-colors-chakra-border-color: #DEE4E8;
}
```

### 0.3 Typography Scale

| Style | font-size | font-weight | color | line-height |
|---|---|---|---|---|
| Page title / Modal header | 28px | 600 | #151D23 | normal |
| Secondary heading | 20px | 400 | #5F7482 | normal |
| Body default | 16px | 400 | #151D23 | 24px |
| Task name (run view) | 18px | 500 | #1E2B36 | 30px |
| Run name (left panel) | 20px | 500 | #5F7482 | auto |
| Nav link | 16px | 500 | #5F7482 | auto |
| Active nav link | 16px | 500 | #0079CA | auto |
| Form field label (editor) | 14px | 600 | #434F5C | normal |
| Form field label (run) | 16px | 500 | #434F5C | auto |
| Input placeholder | 14px | 400 | #8E9EAC | auto |
| Table header | 12-14px | 500 | #5F7482 | auto |
| Table row text | 12px | 400 | #434F5C | auto |
| Badge/pill (Draft) | 12px | 700 | #8E9EAC | auto |
| Automation type button | 20px | 400 | #434F5C | auto |
| Section heading (drawer) | 10px | 700 | #8E9EAC | auto |
| Widget audit trail | 12px | 700 | #8E9EAC | auto |
| Activity feed | 12px | 400 | #8E9EAC | auto |

**Font family**: `Inter, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", system-ui, sans-serif`

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
| Task drawer bg | `rgba(255,255,255,0.84)` |
| Logic side menu bg | `#F7FAFB` |
| Logic menu bg (dark) | `#1E2B36` |

### 0.5 Spacing Rhythm
- Base unit: 4px. Increments: 4, 8, 12, 16, 20, 24, 32, 40
- Common padding: `8px 16px` (buttons), `16px 32px` (page headers), `0 30px` (run view content)
- Gap between elements: 8px (tight), 12px (medium), 16px (standard), 20px (section), 40px (large)

---

## 1. Global Top Navigation Bar

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

## 2. Button Variants

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

---

## 3. Form Input Styles

| State | bg | border | radius | font-size | color | padding |
|---|---|---|---|---|---|---|
| Default textarea | #F9FAFB | 1px solid #DEE4E8 | 6px | 14px | #000 | 8px 16px |
| Run view textarea | transparent | 1px solid #DEE4E8 | 6px | 16px | #1E2B36 | 8px 16px |
| Date input | #FFFFFF | 1px solid #C2CDD6 | 4px | 16px | #434F5C | 7px 12px |
| Disabled input | #EEF0F2 | 1px solid #C2CDD6 | 4px left | 16px | #1E2B36 | 7px 12px |
| Comment textarea | transparent | none | 0 | 16px | #1E2B36 | 4px |
| Search (global) | #FFFFFF | 2px solid #DEE4E8 | 4px | 14px | #8E9EAC | 0 16px |

---

## 4. Badge / Pill / Avatar Styles

- **Draft badge**: bg #F9FAFB, color #8E9EAC, 12px/700, padding 2px 4px, radius 2px, 22px tall
- **Run count pill**: color #085F98, 12px/700
- **User avatars**: 32x32px circular (9999px radius), S3-hosted; 24x24px in compact contexts
- **Avatar fallback**: bg #8E9EAC, white initials, 9.6px font

---

## 5. Dashboard / My Work View

**URL**: `/work?groupBy=DueDate&snoozeStatus=Active&includeCompleted=false&userIds={userId}`

### Layout
- Container: max-width 1440px, padding 24px 40px, flex-column
- Two parts: filter toolbar (40px) + AG Grid tasks table

### Filter Toolbar (left to right)
1. Search box (240px, magnifying glass icon, border #DEE4E8)
2. Task type filter dropdown ("All types", ~93px)
3. User filter (current user, ~64px)
4. Workflow filter ("All workflows", ~124px)
5. Group by dropdown ("Group by: Due date", ~188px)
6. Snoozed count "(0)"
7. Show Completed toggle (icon, 16px)
8. Snoozed toggle button
9. Column configurator (icon button, 32x38px, border #C2CDD6)
10. **+ Task** button (bg #EEF0F2, 14px/700, 40px tall)

### AG Grid Table Columns

| Column | Width | Header style |
|---|---|---|
| Checkbox | 40px | — |
| Name | 490px | 12px/500, #1E2B36 |
| Due | 90px | 12px/500, #1E2B36 |
| Workflow Run | 290px | 12px/500, #1E2B36 |
| Workflow | 260px | 12px/500, #1E2B36 |
| Assignees | 100px | 12px/500, #1E2B36 |
| Comments | 100px | 12px/500, #1E2B36 |

- Header cell: padding 0 8px, inner renderer color #5F7482
- Group row (e.g. "Overdue (16)"): 56px tall, 16px/400
- Data row: 40px tall, cell border-bottom 1px solid #EEF0F2
- Cell text: 12px/400, color #434F5C

---

## 6. Template Editor

**URL**: `/workflows/v2/{templateId}/edit/tasks/{taskId}`

### Overall Layout
- Page bg: #F2F8FC
- Grid: `480px | flex | 156px` (task list | content | insert drawer)

### FocusBar (sticky topbar, 64px)
- Position: fixed, top 64px (below main nav), bg #1E2B36, z-index 10
- **Left**: template name (editable, 16px) + breadcrumbs (14px, `›` divider, #0079CA active)
- **Center**: mode pills — **Edit** | **Logic** | **Automations** | **View**
  - Active: border 1px solid #FFFFFF, transparent bg, white text, 12px/700, radius 15px
  - Inactive: border transparent
- **Right**: "Draft saved" (white, 16px) + Discard (x icon) + Actions + Settings + Preview + **Publish** split button (bg #00A589, 14px/700, split with chevron)

### Left Panel — Task List (480px)
- Fixed, top 128px, bg rgba(255,255,255,0.84), shadow 0 1px 2px rgba(0,0,0,0.05)
- Contains: cover image, trigger tags, task list `<ul>`, "Add new item" button
- **Task item**: 40px tall, drag handle (32px, cursor grab) + task row content
  - Selected: bg #0079CA, white text
  - Normal: bg #FFFFFF, step number 12px #5F7482
  - Heading (section separator): font-weight 700, no indent
- **Indicators per item**: avatar circles (16px), conditional logic icon, dynamic due date icon, stop indicator

### Center — Content Area
- White card: bg #FFFFFF, radius 8px, width 788px (inner 714px usable)
- Contains `WidgetListDropzone` with drag-and-drop reordering

### Task Actions Bar (sticky, 32px tall)
- Buttons (all 32px, 12px/700, border 1px solid #C2CDD6, radius 4px):
  1. Assign (`fa-user-plus`, #5F7482)
  2. View assignees (count badge, #006CB5)
  3. Due date (`fa-clock`, #5F7482)
  4. Permissions (`fa-lock`, #5F7482)
  5. Conditional logic (#006CB5 when active)
  6. Automations (`fa-bolt`, #151D23)
  7. Add Stop (`fa-stop-circle`, #006CB5)

### Task Name
- Inline editable, 28px/600, color #151D23, pencil icon (10px, 24px button)

### Content Widgets (editor)
- **TextContent**: 714px wide, ProseMirror rich text editor
- **FormField label**: 14px/600, #434F5C
- **Textarea field**: bg #F9FAFB, border 1px solid #DEE4E8, radius 6px, 14px, 80px tall
- **Select/dropdown**: bg #F9FAFB, react-select based (`blvd-select`)

### Rich Text Toolbar
- Floating on selection: bold, italic, underline, link, code, color picker
- Color picker popover: bg #1E2B36, 522x34px, radius 6px, z-index 1500
  - Text colors: Default, Gray, Red, Blue, Green
  - Highlights: Yellow, Orange, Green, Blue, Clear

### Context Menus
- Triggered by `...` on hover, dark bg #1E2B36, Chakra menu

---

## 7. Insert Widget Drawer (Right Panel, 156px)

- Fixed, top 128px, right edge, bg #FFFFFF, shadow
- Trigger: circular plus button (bg #1E2B36, white icon, radius 9999px, 40x40)

### Content Section (8 items)
| Label | Icon |
|---|---|
| Text | `fa-text` |
| Image | `fa-image` |
| File | `fa-file` |
| Video | `fa-video` |
| Page | `fa-file-lines` |
| Send Email | `fa-envelope` |
| Subtasks | `fa-list` |
| Embed | `fa-code` |

### Form Fields Section (13 items)
| Label | Icon |
|---|---|
| Short Text | `fa-rectangle-wide` |
| Long Text | `fa-rectangle` |
| Email | `fa-envelope` |
| Website | `fa-globe` |
| File Upload | `fa-file-arrow-up` |
| Date | `fa-calendar-days` |
| Numbers | `fa-tally` |
| Dropdown | `fa-square-chevron-down` |
| Multi Choice | `fa-list` |
| User | `fa-users` |
| Table | `fa-table` |
| Snippet | `fa-brackets-curly` |
| Hidden | `fa-eye-slash` |

- Each button: 155x40px, flex, padding 0 16px, 14px/400, #434F5C, icon 16px #5F7482
- Hover: bg #EBF4FB

---

## 8. Conditional Logic Modal

**Trigger**: Click "Logic" mode in FocusBar

### Modal
- ~90% viewport width, bg #FFFFFF, radius 16px, z-index 1400
- Header: "Conditional Logic" 28px/600 #151D23, subtitle (template name) 20px/400 #5F7482
- Two-column layout:
  - **Left sidebar** (452px): bg #F7FAFB, search input, task filter list
  - **Right panel**: tabs "Rules (N)" / "Hidden (N)"

### Tabs
- Active: color #0079CA, border-bottom 2px solid #0079CA, 16px/500
- Inactive: color #5F7482, transparent border

### Rule Cards
- Virtualized list, 340-790px tall per card (depending on conditions)
- Positioned absolutely within container

---

## 9. Active Run (Checklist) View

> The run view uses the same task list panel + content area layout as the editor,
> but fields are interactive (fillable) rather than editable (configurable).
> Run-specific differences:
> - Task name: 18px/500 #1E2B36 (vs 28px/600 in editor)
> - Form labels: 16px/500 (vs 14px/600 in editor)
> - Textarea inputs: transparent bg (vs #F9FAFB in editor)
> - Activity feed at bottom of each task (12px/400 #8E9EAC)
> - Audit trail per widget (12px/700 #8E9EAC)

---

## 10. Library View

> Template listing with folder navigation, search, and template cards.
> Left sidebar (folder tree, bg #F9FAFB) + main area (template list/grid).
> Each template row shows: name, Draft badge, run count pill, last edited date.

---

## Notes for Implementation

- **We use Amino, not Chakra UI.** Map Process Street's Chakra components to their Amino equivalents.
- **We use Amino icons, not FontAwesome.** Map `fa-*` icons to the closest Amino icon.
- **We use SCSS Modules, not Chakra's CSS-in-JS.** Translate inline styles and Chakra props to SCSS.
- **AG Grid is not in our stack.** Use Amino table components or a lightweight alternative.
- **Colors should map to Amino design tokens** where possible (`--amino-blue-500`, `--amino-gray-300`, etc.).
- **This is a visual reference, not a copy.** Match the UX patterns and information density, not the exact pixel values. Our app should feel like Zonos, not like Process Street.
