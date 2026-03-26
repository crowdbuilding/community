# Clean Design System — Component Specifications

Version 1.0.0 · Inspired by Cultured Code's Clean

---

## Design Philosophy

Clean embodies **purposeful minimalism**: every pixel serves the user's goal. The interface disappears so you can focus on your tasks. Key principles:

1. **Shadows over borders** — Surfaces are defined by elevation, not outlines
2. **Color is earned** — Used only for meaningful elements (status, navigation, actions)
3. **Typography does the work** — Clear hierarchy through weight and size, not decoration
4. **Whitespace is structure** — Generous spacing creates visual grouping
5. **Every animation has purpose** — Motion confirms actions and maintains spatial context

---

## Sidebar Navigation

The sidebar is Clean's primary navigation. Each category has a **vivid icon color** applied directly to a Font Awesome icon — no background circle or container.

### Structure

| Element | Property | Value |
|---------|----------|-------|
| Sidebar container | Width | `260px` (expanded), `56px` (collapsed/slim) |
| | Background | `var(--bg-surface)` (#FFFFFF) |
| | Border-right | `1px solid var(--border-default)` |
| | Padding | `24px 16px` |

### Navigation Items

| State | Background | Text Color | Font Weight | Icon |
|-------|-----------|------------|-------------|------|
| Default | transparent | `var(--text-secondary)` | 500 | Category color at 80% opacity |
| Hover | `var(--bg-hover)` | `var(--text-secondary)` | 500 | Category color at 100% |
| Active | `var(--bg-active)` | `var(--text-primary)` | 600 | Category color at 100% |
| Selected | `var(--bg-selected)` | `var(--text-primary)` | 600 | Category color at 100% |

| Property | Value |
|----------|-------|
| Height | auto (padding-based) |
| Padding | `10px 14px` |
| Border-radius | `var(--radius-md)` (10px) |
| Gap (icon to label) | `12px` |
| Font size | `14px` |
| Icon size | `var(--icon-sidebar)` (20px) |
| Transition | `all 150ms var(--ease-default)` |

### Sidebar Icon Colors (Font Awesome, no background)

| Category | Icon | Color | FA Class |
|----------|------|-------|----------|
| Inbox | Tray | `var(--clean-inbox)` #4A90D9 | `fa-inbox` |
| Today | Star | `var(--clean-today)` #F4B400 | `fa-star` |
| Upcoming | Calendar | `var(--clean-upcoming)` #E74C3C | `fa-calendar` |
| Anytime | Layer group | `var(--clean-anytime)` #3BD269 | `fa-layer-group` |
| Someday | Couch | `var(--clean-someday)` #C9A96E | `fa-couch` |
| Logbook | Book | `var(--clean-logbook)` #8E929B | `fa-book` |

**Key detail**: Icons are rendered at `20px` with `font-weight: 900` (solid style) directly on the white sidebar. No circular background, no tinted container — just the icon in its vivid color on the card surface.

---

## Checkbox / Task Completion

The checkbox is Clean's most iconic micro-interaction. Completion triggers a spring-bounce animation with a satisfying visual arc.

### Checkbox States

| State | Appearance |
|-------|-----------|
| Unchecked | 20×20px rounded square (`border-radius: 4px`), 2px border in `var(--text-faint)`, transparent fill |
| Hover | Border color transitions to `var(--accent-primary)`, subtle scale(1.05) |
| Checked | Background fills with `var(--accent-primary)`, white checkmark fades in, spring bounce (scale 1.0 → 1.2 → 0.95 → 1.0) |
| Checked (complete) | Task text gets strikethrough with `var(--text-tertiary)` color, row fades to 60% opacity over 250ms |

### Animation Sequence (on check)

1. **0ms**: Background fills instantly with accent color
2. **0–150ms**: Checkmark draws in (SVG stroke-dashoffset animation)
3. **0–300ms**: Entire checkbox scales with spring: `cubic-bezier(0.34, 1.56, 0.64, 1)` from 1.0 → 1.2 → 1.0
4. **100–350ms**: Task text color transitions to tertiary, strikethrough line draws across
5. **300–600ms**: Row fades to 60% opacity, then after delay slides up and out of list

### CSS Values

```css
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-faint);
  border-radius: var(--radius-xs);
  transition: all 250ms var(--ease-bounce);
  cursor: pointer;
}
.checkbox:hover {
  border-color: var(--accent-primary);
  transform: scale(1.05);
}
.checkbox.checked {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  animation: checkbox-spring 300ms var(--ease-spring);
}
@keyframes checkbox-spring {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.2); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

---

## Cards

Cards are the primary container for content. They use shadows for elevation — never visible borders.

### Card Variants

| Variant | Use Case | Radius | Shadow | Padding |
|---------|----------|--------|--------|---------|
| Default | List containers, panels | `var(--radius-lg)` 16px | `var(--shadow-sm)` | `var(--card-padding)` 20px |
| Elevated | Stat cards, feature cards | `var(--radius-lg)` 16px | `var(--shadow-md)` | `var(--card-padding)` 20px |
| Modal | Expanded todo, sheets | `var(--radius-xl)` 20px | `var(--shadow-lg)` | `24px` |

### Card Hover Animation

| Property | Rest | Hover |
|----------|------|-------|
| Transform | `translateY(0)` | `translateY(-2px)` |
| Box-shadow | `var(--shadow-sm)` | `var(--shadow-md)` |
| Transition | — | `all 150ms var(--ease-default)` |

**Mobile**: No hover effects on touch devices. Use `@media (hover: hover)` guard.

```css
.card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-hover);
}
@media (hover: hover) {
  .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}
```

---

## Stat Card

Displays a single metric with accent-colored number, label, and optional change indicator.

| Element | Font Size | Weight | Color |
|---------|-----------|--------|-------|
| Number | `28px` | 700 | Per-stat accent color |
| Label | `13px` | 500 | `var(--text-tertiary)` |
| Change badge | `11px` | 500 | Green/red text on 14% tinted bg |

---

## Tags / Pills

Lightweight labels using tinted backgrounds at 14% opacity.

| Property | Value |
|----------|-------|
| Font size | `10–11px` |
| Font weight | `450–500` |
| Letter spacing | `0.3px` |
| Text transform | `uppercase` |
| Padding | `3px 8px` |
| Border radius | `var(--radius-sm)` (6px) |
| Background | Accent color at 14% opacity |
| Text color | Darker shade of accent |

---

## List Items

Standard task/todo row in a list context.

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center` |
| Padding | `14px 20px` |
| Border-bottom | `1px solid var(--border-default)` |
| Last child | No border-bottom |
| Hover background | `var(--bg-hover)` |
| Transition | `background 150ms var(--ease-default)` |
| Gap | `12px` (checkbox to text) |

---

## Buttons

### Primary Button

| Property | Value |
|----------|-------|
| Background | `var(--accent-primary)` |
| Color | `#FFFFFF` |
| Font size | `14px` |
| Font weight | `600` |
| Padding | `10px 20px` |
| Border radius | `var(--radius-md)` (10px) |
| Shadow | `var(--shadow-xs)` |
| Hover | Lighten 8%, `translateY(-1px)`, `var(--shadow-sm)` |
| Active | Darken 4%, `translateY(0)`, `var(--shadow-xs)` |
| Transition | `var(--transition-hover)` |

### Ghost Button

| Property | Value |
|----------|-------|
| Background | `transparent` |
| Color | `var(--accent-primary)` |
| Border | `1.5px solid var(--border-subtle)` |
| Hover | `var(--bg-hover)` background |

### FAB (Magic Plus Button)

| Property | Value |
|----------|-------|
| Size | `56px` |
| Background | `var(--accent-primary)` |
| Border radius | `var(--radius-full)` |
| Shadow | `var(--shadow-md)` |
| Icon | `fa-plus`, 20px, white |
| Hover | Scale 1.05, `var(--shadow-lg)` |
| Active | Scale 0.95, `var(--shadow-sm)` |

---

## Modal / Expanded Card

Clean's to-do expansion is its signature interaction: a card smoothly transforms into a full editing sheet.

### Backdrop

| Property | Value |
|----------|-------|
| Background | `rgba(26, 26, 46, 0.25)` |
| Backdrop-filter | `blur(8px)` |
| Transition | **None (instant)** — the backdrop appears immediately |

### Modal Card

| Property | Value |
|----------|-------|
| Background | `var(--bg-surface)` |
| Border radius | `var(--radius-xl)` (20px) |
| Shadow | `var(--shadow-lg)` |
| Max-width | `480px` |
| Entrance | Scale 0.95 → 1.0, opacity 0 → 1, `350ms var(--ease-spring)` |
| Exit | Scale 1.0 → 0.97, opacity 1 → 0, `200ms var(--ease-in)` |

**Critical**: The backdrop must appear instantly (0ms transition). Only the card animates with spring physics. This is how Clean does it — a fade-in backdrop feels sluggish.

---

## Form Inputs

| Property | Value |
|----------|-------|
| Height | `40px` |
| Background | `var(--bg-page)` |
| Border | `1.5px solid var(--border-default)` |
| Border radius | `var(--radius-md)` (10px) |
| Padding | `0 14px` |
| Font size | `var(--text-body)` (15px) |
| Focus border | `var(--border-focus)` (#4A90D9) |
| Focus shadow | `0 0 0 3px rgba(74, 144, 217, 0.15)` |
| Transition | `border-color 150ms, box-shadow 150ms` |

---

## Scrollbar

Clean uses minimal, unobtrusive scrollbars that hide on mobile.

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

@media (max-width: 768px) {
  ::-webkit-scrollbar { display: none; }
}
```

---

## Animation Catalog

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| Checkbox spring | 300ms | `var(--ease-spring)` | Task completion |
| Card hover lift | 150ms | `var(--ease-default)` | Card hover state |
| Modal entrance | 350ms | `var(--ease-spring)` | Sheet/modal open |
| Modal exit | 200ms | `var(--ease-in)` | Sheet/modal close |
| List item fade | 250ms | `var(--ease-smooth)` | Item appear/remove |
| Strikethrough draw | 200ms | `var(--ease-out)` | Text strike animation |
| FAB press | 100ms | `var(--ease-default)` | Button feedback |
| Nav item transition | 150ms | `var(--ease-default)` | Sidebar state change |
| Stagger delay | 30ms × index | — | List item cascade |
| Backdrop appear | 0ms | instant | Always instant |

---

## Responsive Breakpoints

| Name | Width | Layout Changes |
|------|-------|----------------|
| Mobile | `< 768px` | Sidebar stacks above content, flex-wrap nav items, full-width cards, no hover effects, 44px touch targets, `font-size: 16px` on inputs (prevents iOS zoom) |
| Small phone | `< 400px` | 2-col grids, tighter padding (12px page), smaller tags |
| Tablet | `768px – 1024px` | Collapsible sidebar (slim mode), 2-col card grid |
| Desktop | `> 1024px` | Persistent sidebar (260px), 3-4 col grid, hover effects |

### Mobile-Specific Adjustments

| Element | Desktop | Mobile |
|---------|---------|--------|
| Page padding | `48px 32px` | `32px 16px` (small: `24px 12px`) |
| Section gap | `64px` | `40px` |
| Section title | `28px` | `22px` |
| Hero title | `42px` | `28px` (small: `24px`) |
| Sidebar | `260px` fixed left column | Full-width, stacked above content, flex-wrap |
| Nav items | `14px`, `10px 14px` padding | `13px`, `8px 12px` padding |
| Card padding | `24px` | `16px` |
| Stat numbers | `32px` | `26px` |
| Type rows | Horizontal 3-col | Stacked vertical |
| Animation playground | Horizontal rows | Labels full-width above trigger/target |
| Checkbox touch target | `22×22px` visual | `22×22px` visual + `44×44px` invisible `::before` |
| Form inputs | `42px` height | `44px` height, `16px` font (iOS zoom prevention) |
| Scrollbar | `6px` thin custom | Hidden (`display: none`) |
| Modal | `max-width: 440px`, `radius-xl` | `94% width`, `radius-lg`, `20px` padding |

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for all text
- Focus states: 3px solid ring using `var(--border-focus)` with `focus-visible` (not `:focus`)
- Touch targets: minimum 44×44px on mobile (achieved via invisible `::before` pseudo-element on small controls)
- Reduced motion: all animations wrapped in `@media (prefers-reduced-motion: reduce)` with `0.01ms` fallback
- ARIA: all interactive icons need `aria-label`, checkboxes use `role="checkbox"` with `aria-checked`
- Safe areas: `viewport-fit=cover` with `env(safe-area-inset-*)` padding for notch devices
- Text scaling: `-webkit-text-size-adjust: 100%` prevents unwanted scaling
- Input zoom: `font-size: 16px` on mobile inputs prevents iOS Safari auto-zoom on focus

---

## Font Awesome Setup

This design system uses **self-hosted Font Awesome** fonts for maximum reliability. Icons render without any external network requests.

### Required Files

| File | Weight | Purpose |
|------|--------|---------|
| `fa-solid-900.woff2` | 260 KB | Solid icons (primary — all sidebar & UI icons) |
| `fa-regular-400.woff2` | 335 KB | Regular icons (outline variants like `fa-regular fa-calendar`) |
| `fontawesome.min.css` | 79 KB | Base classes + all icon unicode mappings |

### Integration Options

**Option A — Self-hosted files (recommended for production)**

```
project/
├── css/
│   └── tokens.css          ← includes @font-face with url(fonts/...)
├── fonts/
│   ├── fa-solid-900.woff2
│   └── fa-regular-400.woff2
└── css/
    └── fontawesome.min.css  ← icon unicode mappings
```

**Option B — Base64 embedded (used in styleguide.html)**

The styleguide.html has both woff2 fonts embedded as base64 data-URIs inside a `<style>` block plus the full fontawesome.min.css inline. This makes the file 931 KB but completely self-contained — works offline, in sandboxed iframes, and in any preview environment.

**Option C — Kit script (for environments that allow external JS)**

```html
<script src="https://kit.fontawesome.com/301be15f77.js" crossorigin="anonymous"></script>
```

### Icon Usage Pattern

Icons are placed **directly in their accent color** on the card/page background. No circular background, no tinted container.

```html
<!-- Sidebar nav icon — vivid color, no background -->
<i class="fa-solid fa-inbox" style="color: var(--clean-inbox); font-size: var(--icon-sidebar)"></i>

<!-- Tag with inline icon -->
<span class="tag tag-blue">
  <i class="fa-solid fa-tag"></i> Design
</span>

<!-- Stat card icon -->
<i class="fa-solid fa-check-double" style="color: var(--accent-green); font-size: 20px"></i>
```

---

## File Structure

```
clean-design-system/
├── tokens.css              Design tokens (CSS custom properties + @font-face)
├── components.md           This file — component specifications
├── styleguide.html         Interactive reference (self-contained, fonts embedded)
└── fonts/
    ├── fa-solid-900.woff2  Font Awesome Solid
    └── fa-regular-400.woff2 Font Awesome Regular
```
