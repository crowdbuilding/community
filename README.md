# Clean Design System

A calm, focused design system inspired by Things 3 by Cultured Code. Built for React + TypeScript projects that value clarity, whitespace, and purposeful micro-interactions.

## Quick Start

### 1. Extract de zip in je project root

```
my-project/
├── src/
│   ├── styles/
│   │   ├── clean-tokens.css       ← Design tokens
│   │   ├── clean-components.css   ← Component styles
│   │   └── fonts/
│   │       ├── fa-solid-900.woff2
│   │       ├── fa-regular-400.woff2
│   │       └── fontawesome.min.css
│   └── components/
│       └── clean/
│           └── index.tsx          ← React component library
```

### 2. Importeer in je entry point

```tsx
// main.tsx
import './styles/clean-tokens.css'
import './styles/clean-components.css'
import './styles/fonts/fontawesome.min.css'
```

### 3. Gebruik de componenten

```tsx
import {
  Sidebar, SidebarLabel, NavItem,
  Checkbox, TaskList, TaskItem,
  Card, StatCard, Tag,
  Button, FAB, Modal,
} from './components/clean'

function App() {
  return (
    <Sidebar>
      <SidebarLabel>Overzicht</SidebarLabel>
      <NavItem icon="fa-solid fa-inbox" color="inbox" label="Inbox" badge={3} active />
      <NavItem icon="fa-solid fa-star" color="today" label="Today" />
    </Sidebar>
  )
}
```

---

## Design Principes

| Principe | Betekenis |
|----------|-----------|
| **Shadows over borders** | Surfaces worden gedefinieerd door schaduwdiepte, niet door lijnen |
| **Color is earned** | Kleur alleen voor betekenisvolle elementen: status, navigatie, acties |
| **Typography does the work** | Hiërarchie via gewicht en grootte, niet via decoratie |
| **Whitespace is structure** | Genereuze spacing creëert visuele groepering |
| **Every animation has purpose** | Motion bevestigt acties en behoudt ruimtelijk context |

---

## Aanpassen

### Token wijzigen (kleur, spacing, shadow, etc.)

Edit `clean-tokens.css`. Eén plek, werkt overal door:

```css
/* Ander accent kleur? */
--accent-primary: #6366F1;  /* was #4A90D9 */

/* Meer spacing? */
--card-padding: 28px;       /* was 20px */

/* Andere schaduw? */
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
```

### Dark mode

Zet `data-theme="dark"` op je `<html>` element. Tokens switchen automatisch:

```tsx
document.documentElement.setAttribute('data-theme', 'dark')
```

### Component variant toevoegen

1. Voeg een CSS class toe in `clean-components.css`
2. Voeg een prop toe in het React component

### Animatie tweaken

Edit de `@keyframes` in `clean-components.css`. Alle timing tokens staan in `clean-tokens.css`.

---

## Componenten

| Component | Props | Beschrijving |
|-----------|-------|-------------|
| `Sidebar` | `className` | Container voor navigatie |
| `SidebarLabel` | `children` | Sectie-header in sidebar |
| `NavItem` | `icon`, `color`, `label`, `badge?`, `active?`, `isProject?`, `onClick?` | Navigatie-item met gekleurd icoon |
| `Checkbox` | `checked?`, `onChange?` | Animatied checkbox met spring bounce |
| `TaskList` | `className` | Container voor taak-items |
| `TaskItem` | `title`, `completed?`, `onToggle?`, `meta?` | Taak-rij met checkbox en metadata |
| `Card` | `variant?`, `hoverable?`, `children` | Surface container (`default` / `elevated` / `modal`) |
| `StatCard` | `icon`, `iconColor`, `value`, `label`, `change?` | Metric card met accent-gekleurd getal |
| `Tag` | `color`, `icon?`, `children`, `onClick?` | Tinted label/pill |
| `Button` | `variant?`, `size?`, `icon?`, `children` | Actie-button (`primary` / `ghost` / `danger`) |
| `FAB` | `icon?`, `onClick?` | Floating Action Button (Magic Plus) |
| `Modal` | `open`, `onClose`, `children` | Overlay met spring entrance, instant backdrop |

### NavItem kleuren

| Color prop | Hex | Gebruik |
|-----------|-----|---------|
| `inbox` | #4A90D9 | Inbox |
| `today` | #F4B400 | Today / star |
| `upcoming` | #E74C3C | Upcoming / calendar |
| `anytime` | #3BD269 | Anytime / layers |
| `someday` | #C9A96E | Someday / couch |
| `logbook` | #8E929B | Logbook / book |
| `blue` `green` `purple` `orange` `red` `pink` | accent kleuren | Projecten, custom items |

### Tag kleuren

`blue` · `yellow` · `red` · `green` · `pink` · `purple` · `orange`

Elke tag rendert als tekst op een 14% opacity achtergrond van die kleur.

---

## Font Awesome

Icons worden self-hosted meegeleverd (solid + regular). Ze werken zonder internetverbinding.

Alternatief: vervang de `fonts/` map + `fontawesome.min.css` door je eigen FA kit:

```html
<script src="https://kit.fontawesome.com/JOUW_KIT.js" crossorigin="anonymous"></script>
```

---

## Bestanden

| Bestand | Grootte | Beschrijving |
|---------|---------|-------------|
| `clean-tokens.css` | 17 KB | Alle design tokens als CSS custom properties |
| `clean-components.css` | 14 KB | Component styles met `cl-` prefix |
| `index.tsx` | 12 KB | React component library (TypeScript) |
| `ExampleApp.tsx` | 8 KB | Volledig werkend voorbeeld |
| `fontawesome.min.css` | 79 KB | FA icon unicode mappings |
| `fa-solid-900.woff2` | 260 KB | FA Solid font |
| `fa-regular-400.woff2` | 335 KB | FA Regular font |
| `styleguide.html` | 931 KB | Interactieve visuele reference (standalone) |

---

## Licentie

Design tokens en component code: vrij te gebruiken in je projecten.
Font Awesome fonts: onderhevig aan je eigen Font Awesome licentie.
