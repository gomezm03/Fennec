# MSC Tools for Fusion 360 — Concept Prototype

A single-page GitHub Pages site presenting the MSC Tools add-in concept, with a fully
interactive mock of the docked panel (Find, Match, Crib, Library, Cart).

## Deploy to GitHub Pages

1. Create a new repository (e.g. `msc-tools-concept`) and add the three files,
   keeping the structure:

   ```
   index.html
   css/style.css
   js/app.js
   ```

2. Push to the `main` branch.
3. In the repo: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. The site publishes at `https://<username>.github.io/msc-tools-concept/`.

No build step, no dependencies beyond Google Fonts loaded at runtime. Markup lives in
`index.html`, all styling in `css/style.css`, and the interactive prototype logic
(wizard, match, crib, library audit, cart) in `js/app.js`.

## Simulated data

All commercially sensitive values from the internal spec were replaced with fictional
stand-ins in realistic formats:

- **Account**: `#0000-DEMO` with a demo crib connection
- **MSC SKUs**: fictional `0999xxxx` range
- **Competitor part numbers**: invented formats (`CM-2F340-0500-DEMO`, etc.) — the
  Match tab describes a "Sandvik-format" pattern match without using a real part number
- **PO / quote numbers**: `PO-2026-0708-DEMO`, `Q-2026-0708-DEMO`
- **Prices, stock counts, lead times**: representative only

A persistent "SIMULATED DATA" badge appears in the site header, and the order action
explicitly confirms nothing is purchased.
