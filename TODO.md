# TODO - Multipage conversion (HOME / Menu / Kitchen / Admin)

- [x] Add React Router `BrowserRouter` in `src/main.tsx` and wire routes.
- [x] Refactor `src/app/App.tsx` to remove `currentPortal` conditional rendering and split into page components:
  - [x] `HomePage` (landing hero + stats + menu/booking sections) with required labels text changes.
  - [x] `MenuPage` (menu browsing) with same visuals as existing menu section.
  - [x] `KitchenPage` (existing `KitchenView`).
  - [x] `AdminPage` (existing `AdminView`).
- [x] Update header/sidebar buttons:
  - [x] Storefront nav label => `HOME`
  - [x] “Browse Gourmet Menu” => `Menu`
- [x] Ensure only one page’s content renders at a time (no stacking during scroll).
- [x] Ensure role-based redirects still work after login.
- [x] Run `npm run build` and `npm run dev` and verify routes.

