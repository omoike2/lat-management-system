# LAT Management System — Design Spec

---

## Color Palette

### Brand

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand` | `#006633` | Primary action buttons, active nav, brand accent |
| `--color-brand-hover` | `#005229` | Button hover, pressed states |
| `--color-brand-light` | `#E6F2EC` | Active nav background, selected chip bg, success tint |
| `--color-brand-subtle` | `#F0F9F4` | Hover state on rows, empty-state bg |

### Neutral

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface` | `#FFFFFF` | Cards, panels, modals |
| `--color-bg` | `#F8FAFC` | Page background |
| `--color-border` | `#E2E8F0` | Dividers, card borders, input borders |
| `--color-border-strong` | `#CBD5E1` | Focused input, hovered card |
| `--color-text-primary` | `#0F172A` | Headings, body copy |
| `--color-text-secondary` | `#64748B` | Labels, meta, descriptions |
| `--color-text-muted` | `#94A3B8` | Placeholders, timestamps, empty state text |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-danger` | `#DC2626` | Destructive buttons, error messages, conflict badges |
| `--color-danger-light` | `#FEF2F2` | Error input bg, conflict cell bg |
| `--color-warning` | `#D97706` | Unresolved conflict count, pending badge |
| `--color-warning-light` | `#FFFBEB` | Warning banner bg |
| `--color-success` | `#16A34A` | Success toast, resolved badge |
| `--color-success-light` | `#F0FDF4` | Success banner bg |

### Timetable — Department Colors

Assigned to departments alphabetically on first render, persisted in localStorage.

| Slot | Background | Border | Text |
|------|-----------|--------|------|
| dept-1 | `#DBEAFE` | `#93C5FD` | `#1E40AF` |
| dept-2 | `#FCE7F3` | `#F9A8D4` | `#9D174D` |
| dept-3 | `#FEF3C7` | `#FCD34D` | `#92400E` |
| dept-4 | `#DCFCE7` | `#86EFAC` | `#166534` |
| dept-5 | `#EDE9FE` | `#C4B5FD` | `#5B21B6` |
| dept-6 | `#FFEDD5` | `#FDBA74` | `#9A3412` |
| dept-7 | `#E0F2FE` | `#7DD3FC` | `#075985` |
| dept-8 | `#F1F5F9` | `#CBD5E1` | `#334155` |

---

## Typography

Font stack: `Inter` (Google Fonts) with system fallback.

```css
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

| Role | Size | Weight | Line height | Token |
|------|------|--------|-------------|-------|
| Page title | 24px | 600 | 32px | `text-2xl font-semibold` |
| Section header | 18px | 600 | 28px | `text-lg font-semibold` |
| Card title | 15px | 500 | 24px | `text-[15px] font-medium` |
| Body / table cell | 14px | 400 | 20px | `text-sm` |
| Label / meta | 13px | 500 | 16px | `text-[13px] font-medium` |
| Caption / timestamp | 12px | 400 | 16px | `text-xs` |
| Timetable cell code | 13px | 600 | — | `text-[13px] font-semibold` |

---

## Spacing Scale

Base unit: 4px. Use Tailwind's default scale.

| Usage | Value |
|-------|-------|
| Page horizontal padding | `px-4 sm:px-6 lg:px-8` |
| Page vertical padding | `py-8` |
| Card padding | `p-6` |
| Section gap | `gap-6` |
| Form field gap | `gap-4` |
| Table row height | `h-12` (48px) |
| Timetable cell | `min-h-16` (64px), `p-2` |

---

## Layout

### Shell (Admin)

```
┌─────────────────────────────────────────────────┐
│  Sidebar (w-64, fixed)  │  Main content area     │
│                         │                        │
│  [Logo]                 │  [Page header]         │
│  ─────────────          │  [Content]             │
│  Dashboard              │                        │
│  Courses                │                        │
│  Lecturers              │                        │
│  Venues                 │                        │
│  Timetable              │                        │
│                         │                        │
│  ─────────────          │                        │
│  [Admin email]          │                        │
│  [Sign out]             │                        │
└─────────────────────────────────────────────────┘
```

- Sidebar: `w-64 bg-white border-r border-border h-screen fixed top-0 left-0`
- Main: `ml-64 min-h-screen bg-bg`
- Logo area: `h-16 flex items-center px-6 border-b border-border`
- Nav item (default): `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-brand-subtle`
- Nav item (active): `bg-brand-light text-brand font-medium`
- Nav icon: 18px, matches text color

### Shell (Student)

No sidebar. Centered single-column layout.

```
┌─────────────────────────────────────────────────┐
│  [Top bar: LAT logo + dept/level badge]          │
├─────────────────────────────────────────────────┤
│                                                  │
│         [Personal timetable grid]                │
│                                                  │
└─────────────────────────────────────────────────┘
```

Top bar: `h-14 bg-white border-b border-border flex items-center px-4 gap-3`

---

## Components

### Page Header

```
[Page title — text-2xl font-semibold text-text-primary]
[Description — text-sm text-text-secondary mt-1]
                                        [Primary action button]
```

Always a flex row, `items-start justify-between`.

---

### Cards

```css
bg-white rounded-lg border border-border shadow-sm p-6
```

Hover state (clickable cards only): `hover:border-border-strong hover:shadow-md transition-shadow`

---

### Buttons

| Variant | Class |
|---------|-------|
| Primary | `bg-brand text-white hover:bg-brand-hover h-9 px-4 rounded-md text-sm font-medium` |
| Secondary | `bg-white text-text-primary border border-border hover:bg-bg h-9 px-4 rounded-md text-sm font-medium` |
| Destructive | `bg-danger text-white hover:bg-red-700 h-9 px-4 rounded-md text-sm font-medium` |
| Ghost | `text-text-secondary hover:bg-bg hover:text-text-primary h-9 px-4 rounded-md text-sm` |
| Icon | `h-8 w-8 rounded-md flex items-center justify-center hover:bg-bg` |

Loading state: replace label with spinner `animate-spin`, disable pointer events.

---

### Form Fields

```
[Label — text-[13px] font-medium text-text-primary]
[Input — h-9 rounded-md border border-border px-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand]
[Error — text-xs text-danger mt-1]
```

Select: same height/border as input. Use shadcn `Select` component.

Textarea: `min-h-[80px] resize-none`, same border rules.

---

### Data Table

```
┌─────────────────────────────────────────────────┐
│ [Search input]              [Add button]         │
├──────┬──────────┬────────┬────────┬─────────────┤
│ Col  │ Col      │ Col    │ Col    │ Actions      │
├──────┼──────────┼────────┼────────┼─────────────┤
│      │          │        │        │ Edit Delete  │
│      │          │        │        │ Edit Delete  │
└──────┴──────────┴────────┴────────┴─────────────┘
│ Showing X–Y of Z results                        │
```

- Header row: `bg-bg text-[13px] font-medium text-text-secondary uppercase tracking-wide h-10`
- Body row: `border-b border-border h-12 text-sm hover:bg-brand-subtle`
- Actions column: right-aligned, icon buttons (Edit = pencil, Delete = trash)
- Empty state: full-width centered, muted icon + `text-text-muted text-sm`
- Pagination: `text-xs text-text-secondary` + Prev/Next buttons

---

### Slide-over Panel (Add / Edit forms)

- Appears from the right: `fixed inset-y-0 right-0 w-[420px] bg-white shadow-xl border-l border-border`
- Header: `h-14 px-6 flex items-center justify-between border-b border-border`
- Body: `p-6 overflow-y-auto flex-1`
- Footer: `px-6 py-4 border-t border-border flex gap-3 justify-end`
- Backdrop: `fixed inset-0 bg-black/30`

---

### Timetable Grid

```
         Mon      Tue      Wed      Thu      Fri
08–10  [CELL]   [CELL]   [CELL]   [CELL]   [CELL]
10–12  [CELL]   [CELL]   [CELL]   [CELL]   [CELL]
12–14   BREAK    BREAK    BREAK    BREAK    BREAK
14–16  [CELL]   [CELL]   [CELL]   [CELL]   [CELL]
16–18  [CELL]   [CELL]   [CELL]   [CELL]   [CELL]
```

**Grid implementation:** CSS Grid, not a table.

```css
grid-template-columns: 80px repeat(5, 1fr);
grid-template-rows: 40px repeat(5, minmax(64px, auto));
```

**Column headers (day labels):**
`bg-bg text-[13px] font-medium text-text-secondary text-center py-2 border-b border-r border-border`

**Row headers (time labels):**
`text-xs text-text-muted text-right pr-3 pt-2 border-r border-border`

**Occupied cell:**
```
rounded-md p-2 border-l-[3px] cursor-pointer
bg: dept color bg
border-left-color: dept color border
```
Contents:
- Line 1: `text-[13px] font-semibold` — course code
- Line 2: `text-xs text-text-secondary` — venue abbreviation
- Line 3: `text-xs text-text-muted` — lecturer surname

**Conflict cell:**
```
bg-danger-light border border-danger rounded-md p-2
```
Add `⚠` icon + `text-danger text-[13px] font-semibold` course code.

**Empty cell:**
```
border border-dashed border-border rounded-md min-h-16
hover:border-brand hover:bg-brand-subtle cursor-pointer
```
On hover: show `+` icon centered in `text-text-muted`.

**Break row:**
```
bg-bg text-center text-xs text-text-muted col-span-5 border-y border-border
```
Label: `LUNCH BREAK`

**Admin vs Student diff:**
- Admin: click any cell → edit slide-over. Conflict cells show warning.
- Student: no click, no conflict display, read-only.

---

### Conflict Badge

```
bg-warning-light text-warning border border-warning/30 rounded-full px-2.5 py-0.5 text-xs font-medium
```

Content: `⚠ 3 conflicts` — number updates live after generation.

Zero conflicts: swap to `bg-success-light text-success border-success/30` — `✓ No conflicts`.

---

### Toast / Snackbar

Appears bottom-right, `z-50 fixed bottom-4 right-4`.

| Type | Background | Icon |
|------|-----------|------|
| Success | `bg-success text-white` | `✓` |
| Error | `bg-danger text-white` | `✗` |
| Info | `bg-text-primary text-white` | `ℹ` |

Auto-dismiss: 4s. Manual dismiss: `×` button.

---

### Loading States

- Full page: centered `NiaLoadingWheel` equivalent — spinning `border-brand` ring, 32px
- Button: inline spinner replaces label, button disabled
- Table: skeleton rows (`animate-pulse bg-border rounded h-4`) — 5 rows, varying widths
- Timetable generation: full grid overlay, `bg-white/80 backdrop-blur-sm`, centered spinner + "Generating timetable…" label

---

## Responsive Behavior

| Breakpoint | Admin | Student |
|-----------|-------|---------|
| `< md` (< 768px) | Sidebar collapses to hamburger icon overlay | Timetable stacks: one card per day, courses listed vertically |
| `md` (768px+) | Sidebar always visible | Grid layout, 5-column |
| `lg` (1024px+) | Full layout, slide-overs at 420px | Same grid, larger cells |

Student timetable mobile card:
```
[Day label — text-sm font-semibold text-text-primary]
[Course chip × N — dept color bg, course code + venue]
```

---

## Icons

Use `lucide-react`. Consistent sizing: `size={16}` in tables/buttons, `size={18}` in nav, `size={20}` in empty states.

| Element | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Courses | `BookOpen` |
| Lecturers | `Users` |
| Venues | `Building2` |
| Timetable | `CalendarDays` |
| Generate | `Wand2` |
| Conflict | `AlertTriangle` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Add | `Plus` |
| Close | `X` |
| Success | `CheckCircle2` |
| Sign out | `LogOut` |

---

## Motion

Minimal. Only two transitions used:

1. Slide-over open/close: `translate-x-full → translate-x-0`, `duration-200 ease-out`
2. Toast in/out: `opacity-0 translate-y-2 → opacity-100 translate-y-0`, `duration-150`

No page transitions. No skeleton → content fade. Speed > polish for FYP scope.
