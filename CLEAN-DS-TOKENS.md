# Clean Design System — Token Reference

Gebruik deze tokens in alle CSS. Nooit hardcoded waarden.

## Colors
```
--accent-primary: #4A90D9   (links, active states, primary actions)
--accent-green: #3BD269     (success, positive)
--accent-red: #E74C3C       (error, danger)
--accent-yellow: #F4B400    (warning, attention)
--accent-pink: #F23578      (highlight, special)
--accent-orange: #F09020    (secondary accent)
--accent-purple: #9B59B6    (tertiary accent)
```

## Backgrounds
```
--bg-page: #F7F8FA          (app background)
--bg-surface: #FFFFFF       (cards, modals, dropdowns)
--bg-hover: #F2F3F6         (hover state)
--bg-active: #EBEDF2        (pressed/active state)
--bg-selected: #E8EDF5      (selected item in list)
```

## Text
```
--text-primary: #1A1A2E     (headings, body)
--text-secondary: #5A5F72   (descriptions, meta)
--text-tertiary: #9BA1B0    (muted labels, placeholders)
--text-faint: #B0B5C3       (disabled, decorative)
--text-disabled: #CDD1DB    (truly disabled)
```

## Borders
```
--border-default: #F0F1F4   (cards, dividers — subtle)
--border-subtle: #E8E9EE    (slightly more visible)
--border-focus: #4A90D9     (focus rings)
```

## Shadows (over borders — cards defined by shadow, never visible border)
```
--shadow-xs: 0 1px 2px rgba(26,26,46,0.04)
--shadow-sm: 0 1px 3px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.03)
--shadow-md: 0 4px 12px rgba(26,26,46,0.08), 0 1px 3px rgba(26,26,46,0.04)
--shadow-lg: 0 12px 40px rgba(26,26,46,0.12), 0 4px 12px rgba(26,26,46,0.06)
```

## Radius
```
--radius-xs: 4px    (badges, small pills)
--radius-sm: 6px    (buttons, inputs, dropdown items)
--radius-md: 10px   (cards inside cards, dropdowns)
--radius-lg: 16px   (main cards, modals)
--radius-xl: 20px   (large surfaces)
--radius-full: 9999px (circles, full pills)
```

## Easing
```
--ease-default: cubic-bezier(0.25, 0.1, 0.25, 1.0)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1.0)
```

## Typography
```
Font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif
Page title: 26px / 700
Card title: 17-18px / 600
Body: 15px / 400 (color: --text-secondary)
Meta: 13px / 500 (color: --text-tertiary)
Tags: 10-11px / 450-600 uppercase, color on 14% opacity bg
```

## Tags (14% opacity backgrounds)
```
.tag-blue:    bg rgba(74,144,217,0.14), color #3A7BC8
.tag-green:   bg rgba(59,210,105,0.14), color #27A854
.tag-orange:  bg rgba(240,144,32,0.14), color #C47718
.tag-pink:    bg rgba(242,53,120,0.14), color #D42C6A
.tag-purple:  bg rgba(155,89,182,0.14), color #8544A3
.tag-yellow:  bg rgba(244,180,0,0.14),  color #B8870A
.tag-red:     bg rgba(231,76,60,0.14),  color #C0392B
```

## Modal Detail Actions (top-right corner)
```
Pattern: .modal-detail-actions
Position: absolute, top: 16px, right: 16px
Buttons: 32x32px, no border, transparent bg, --radius-sm
Color: --text-tertiary, hover: --text-primary + --bg-hover
Gap: 2px between buttons
Order: [action icons...] [✕ close] — close always rightmost
Danger variant: .modal-detail-actions__danger — hover red bg + red color
```
All detail modals (Event, Update, Post, Intake) use this unified pattern.
Edit, link-copy, pin, delete as direct icon buttons — never dropdown menus.

## Rules
- Shadows over borders — cards NEVER have visible borders, only shadow depth
- Color is earned — only for status, data, active nav, CTAs. Never decorative.
- Whitespace is intentional — don't fill it
- Hover: translateY(-1px) + shadow lift, 150ms. No hover on mobile.
- Modal shadow: --shadow-lg, backdrop instant (no fade)
- Max 3 accent colors per view
