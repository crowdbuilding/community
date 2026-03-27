# Community Platform

## Design System: Clean DS
Alle styling MOET het Clean Design System volgen. Referentie: `CLEAN-DS-TOKENS.md` in project root.

Kernregels:
- **Shadows over borders** — cards worden gedefinieerd door shadow depth, NOOIT door zichtbare borders
- **Color is earned** — alleen voor status, data, actieve navigatie en CTAs. Nooit decoratief.
- **Max 3 accentkleuren per view**
- **Whitespace is intentioneel** — niet opvullen
- Gebruik altijd CSS variabelen (`var(--token-name)`) uit het DS, nooit hardcoded waarden
- Hover: `translateY(-1px)` + shadow lift, 150ms. Geen hover op mobile.
- Tags: 14% opacity achtergrond, donkerdere tekst (zie CLEAN-DS-TOKENS.md)

## Tech Stack
- React 19 + Vite 6
- Supabase (Frankfurt) — Auth, Database, Storage
- Font Awesome 6 icons
- CSS variabelen (geen CSS-in-JS)

## Conventies
- Herbruikbare componenten in `src/components/`
- Gedeelde constanten in `src/lib/constants.js`
- Hooks volgen het patroon van `useUpdates.js` (fetch, realtime, CRUD)
- Alle nieuwe views toevoegen aan de max-width lijst in `index.css`
