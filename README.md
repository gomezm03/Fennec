# MSC Tools — Tooling Advisor

**Interactive flow demo · Powered by MSC · v10 · July 2026**

A working mock of a tooling-advisor application: guided tool selection, competitor
cross-reference, shop-crib inventory, CAM library exchange, and a staged commerce
flow — all in one interface. Built to show the eCommerce team the proposed
end-to-end flow, not to pilot it. Every SKU, part number, price, stock count,
account number, and document number is fictional, in realistic formats. A
persistent **SIMULATED DATA** badge sits in the application header.

---

## 1. The concept

MSC Tools is an *advisor first, store second*. A machinist or CAM programmer has a
job in front of them — a material, an operation, a size — and somewhere in a
multi-million-SKU catalog are the three tools that fit it. The application's job
is to collapse that search into a few confirmations, and to make switching from a
competitor's tooling effortless by showing the evidence: matched specs, price
deltas, lead times.

Everything in the app converges on two destinations:

- **The staging cart** (commerce) — a priced what-if that becomes an order or a
  quote only on explicit action. Nothing is purchased by browsing, matching,
  importing, or auditing.
- **My Library** (CAM data) — the single handoff point where selected tools, with
  geometry and material-matched feeds/speeds presets, export to a CAM system.

Each tab operates **semi-independently**: a Match-first user never has to visit
Find to set brand preferences; the Crib works without touching any other tab;
the Cart accepts items from every source. Shared settings (brand preferences)
are editable wherever they have an effect and stay in sync everywhere.

---

## 2. Application anatomy

| Region | Contents |
|---|---|
| **Header** | MSC Tools wordmark with the red cursor-bar brand device · "Tooling advisor" sub-line · global catalog search (MSC # or keyword) · account and crib connection status · SIMULATED DATA badge |
| **Sidebar** (navy) | Five sections — Find, Match, Crib, Library, Cart — with icons and live count badges on Library and Cart. Collapses to icons on narrow screens. |
| **Content area** | The active tab's workspace, max readable width, thin styled scrollbar |
| **Status bar** (navy) | "POWERED BY MSC" lockup · live staging-cart item count and running total · Review button that jumps to the Cart tab. Pulses whenever the cart changes. |
| **Toasts** | Bottom-right confirmations for every add/import/export/save action; cart additions include an **Undo** |
| **Product detail (PDP)** | A modal detail page for any product — see §8 |

**Design system.** Blue-forward palette (deep navy chrome, vivid blue primary
actions, blue-tinted washes), soft geometry (8–12 px radii, pill badges),
elevation via shadows rather than borders, ~160 ms transitions, visible focus
rings. Red is reserved for the brand cursor-bar and genuine alerts (below-minimum
crib lines). Typography: Lexend Exa for the wordmark only, Inter for UI,
JetBrains Mono for part numbers, prices, and parameters.

---

## 3. Find — guided selection

**Purpose:** narrow the catalog to the right tools through four quick questions.

**Flow.** A four-step wizard with a clickable step rail showing selections as you
go. Every value is user-entered — the app never reads part geometry or CAD/CAM
features (a deliberate scope decision; see §11).

1. **Materials** — six ISO-group tiles in the industry-standard colors
   (P Steel · M Stainless · K Cast iron · N Non-ferrous · S Superalloys/Ti ·
   H Hardened). Multi-select; any combination.
2. **Process** — six visual operation tiles with pictograms: end milling,
   drilling, face milling, threading, slotting, chamfer.
3. **Preferred brands** — toggle chips (Accupro, Hertel, SGS, Niagara,
   Kennametal, OSG) or "No preference." This is a *shared* setting; see §7.
4. **Size & limits** — optional diameter, cut depth/LOC, corner radius, and
   holder fields.

**Results logic.**

- The result set is chosen per material using the **most conservative group
  selected** (priority H → S → K → M → P → N). Coatings in each set are
  metallurgically sensible — see §9.
- **"Top 3 of 127 — sorted by fit"** with a sort control (best fit · lowest
  price · fastest) and a Cards ↔ Compare view toggle. Compare renders a
  spec-by-spec table across the top three.
- Preferred brands are starred (★) and always ranked first, then the chosen sort
  applies within.
- **"See all 127 results"** expands compact rows in batches of six; when the
  demo's rows are exhausted, a refine prompt suggests tightening size or process.
- Every result — card, compare column, or compact row — offers **+ Library** and
  **+ Cart**, and its name/image opens the PDP.
- Each card shows the catalog-style essentials: shaded product render, spec line
  (Ø · flutes · LOC · coating), the ISO-group feeds/speeds preset, stock with
  lead time, crib on-hand badge when applicable, price with "ea." unit, and fit %.

**Header search** (available from any tab): entering an MSC # jumps to Find and
renders that product as an add-able result.

---

## 4. Match — alternatives explorer

**Purpose:** paste any competitor part number and explore MSC alternatives with
evidence — this is the switching-cost killer.

**Flow.**

1. A brand-preference chip bar sits directly above the input, so Match works
   standalone.
2. Paste a part number (pre-filled with a fictional Sandvik-format number) and
   hit **Match it**.
3. The identified part renders as a quiet **"Your part" reference card** — name,
   part number, spec line, price, lead time. No versus framing; the reference is
   context, not a contest.
4. **Four MSC alternatives, ranked by fit**, each a full product card: render,
   specs, lead time, a green **"Save $X · −N%"** chip (or an honest amber
   **"+N%"** when the match costs more), price, fit %, and three actions —
   **+ Compare**, **+ Library**, **+ Cart**.

**Compare.** Toggle Compare on any number of alternatives and a table builds
below: your part in the first column, each selection beside it, with price (and
savings), lead, diameter, flutes, LOC, coating, and fit. Spec cells are marked
✓ exact or ~ different against the reference part. Each column has a remove ✕
and its own Add to Cart.

**Compare another MSC #.** A dedicated field lets the user add *any* catalog SKU
as an extra comparison column — a favorite they already run, a colleague's
recommendation, or something found in Find. Manually added SKUs show "—" for fit
(fit only has meaning for algorithm-matched parts), and their specs are checked
against the reference the same way.

**Recent matches.** The session keeps the last several part numbers as one-click
re-runs.

---

## 5. Crib — virtual shop inventory

**Purpose:** model the shop's physical tool inventory — vending machines, cribs,
or per-machine kits — and drive replenishment.

**Flow & logic.**

- **Named profiles** (e.g., "Bay 2 — Haas VF-2", "Bay 1 — DMG Mori"); switch,
  rename, or create profiles from the header row. New SKUs can be added directly.
- A **summary strip** reads the profile at a glance: SKUs tracked, lines below
  minimum, and the dollar cost to replenish — plus a live filter box.
- Each line: SKU (clickable to its PDP for MSC items), name, on-hand quantity
  stepper, minimum level, and an **MSC / OTHER** source badge. Lines where
  on-hand < minimum flag red.
- **Generate PO — MSC SKUs only.** One click drafts a purchase order from
  below-minimum MSC lines, reordering each to 2× its minimum. Non-MSC
  below-minimum lines are **explicitly listed as excluded**, with a nudge to
  Match them into the program. The PO card shows number, date, account, profile,
  lines, and total, with **Send to purchasing** and **Add to staging cart**.
- Crib data surfaces elsewhere: Find results and PDPs show "N in your crib," and
  the Cart runs a crib check before ordering (§6).

---

## 6. Library — CAM exchange (My Library + Import & Match)

**Purpose:** the two-way bridge between MSC data and the CAM world.

**My Library (outbound).** Every "Add to Library" action across the app lands
here, each entry carrying its material-matched feeds/speeds preset. One
**Export to CAM** writes the whole set, with a format selector — Fusion 360
(.tools), Mastercam (.tooldb), or generic CSV. "Add all to cart" bridges the
other direction.

**Import & Match (inbound).** Bring your current tooling and price the whole set
as a theoretical cart. Two sources:

- **Load from Fusion library** — simulates reading the tool library already
  built inside a Fusion 360 document: six tools someone specced in with generic
  and supplier part numbers (T1 · GEN-EM-500-4F, T2 · SUP-BN-375, …), five
  matchable plus one custom form tool.
- **Load sample tool list** — simulates a file import (.csv/.tools); the drop
  zone and file browser route here too.

**Audit logic.**

- Every matched line offers radio-selectable alternatives, each with brand, fit
  %, price, and a **±% price-delta chip** against the tool it replaces — green
  when cheaper, honest amber when more expensive (the Fusion set deliberately
  includes one +8% match to keep the audit credible).
- Per-line checkboxes include/exclude lines; the **roll-up band** recomputes
  live: "N of M matched · X selected · $A vs $B current brands · save $C (−N%)."
- Unmatched customs route to **Request quote**.
- **Add selected to Library + cart** stages everything at once — and the copy is
  explicit that *nothing is ordered by importing*.

---

## 7. Shared systems

**Brand preferences.** One setting, three doors: Find's wizard step, a chip bar
on Match, and a chip bar on Library's Import & Match. Changing it anywhere
re-ranks and re-stars every ranked surface currently on screen (Find results,
Match alternatives, audit options) and syncs the other bars.

**Staging cart.** Line items carry a product render, quantity steppers, per-line
totals, and remove buttons. Below them:

- **Crib check** — if the cart contains a SKU with crib stock on hand, a callout
  offers "use crib stock first" and reduces the order quantity on click.
- **Order summary** — subtotal, FREE next-day shipping (order by 8 p.m. ET),
  tax-at-order note, and estimated total.
- **Three exits:** *Add all to Library* · **Checkout** · *Save quote*.

**Quotes & orders (simulated).** *Save quote* creates a numbered quote
(Q-2026-04xx) listed in a **Saved quotes** section on the Cart tab; each reopens
into the cart with one click, so the save → order → reopen rhythm can be
demonstrated. **Checkout** renders a confirmation screen — order number
(SO-2026-07xx), item count, ship-to on file, next-day delivery, total, clearly
marked simulated — and clears the cart. Quotes survive checkout.

**Toasts & feedback.** Every add/import/export/save confirms bottom-right; cart
additions carry an **Undo**; the status-bar cart pulses on change.

---

## 8. Product registry & PDP

A registry of **24 fictional products** backs the entire app — the Match
alternatives, all Find results and expanded rows, and every crib and audit SKU.
Each product carries: brand, title, description, tool type (square end mill,
ball nose, drill, chamfer mill), coating, price, stock, lead time, and full
cutting geometry (cut diameter in fraction and decimal, flutes, length of cut in
fraction and decimal, shank diameter, overall length, helix or point angle).

**Product detail page (PDP).** Clicking any product's name or image — in Find
cards, compare columns, expanded rows, Match alternatives, Library items, cart
lines, or Crib SKU cells — opens a modal PDP modeled on the mscdirect.com
product page:

- **Header block:** brand eyebrow, title, descriptive sub-line, MSC # / Mfr #.
- **Buy panel:** price "/each," quantity stepper, Add to cart, Add to Library,
  ✓ in-stock count, lead time, "in your crib" badge, free next-day note.
- **Specifications:** the two-column bordered table — diameter (inch + decimal),
  flutes, material, LOC (inch + decimal), shank, OAL, coating/finish, helix or
  point angle, centercutting, cutting direction.
- **Feeds & speeds presets:** SFM, spindle RPM, chip load, and feed for ISO N
  (aluminum) and ISO P (steel), computed from the tool's own geometry (§9) and
  labeled as the starting parameters that export with the tool.
- **Tool geometry & CAM data:** a simulated .tools download.

Closes via ✕, Escape, or clicking the backdrop.

**Product renders.** No real photography is used. Tools render as shaded SVG
pseudo-renders with metallic shanks and coating-accurate flute colors — AlTiN
violet-grey, TiAlN dark, TiN gold, TiCN blue-grey, ZrN pale gold, bright
polished carbide — with correct silhouettes per tool type.

---

## 9. Material & parameter logic

**Coating correctness.** Result sets are chosen so the coatings make
metallurgical sense for the workpiece:

| ISO group | Workpiece | Coatings offered |
|---|---|---|
| N | Aluminum / non-ferrous | ZrN, polished uncoated — never AlTiN (aluminum affinity → built-up edge) |
| P | Steel | AlTiN, TiAlN, TiCN |
| M | Stainless | AlTiN, TiAlN |
| K | Cast iron | TiCN, AlTiN, uncoated roughers |
| S | Superalloys / Ti | AlTiN, TiAlN |
| H | Hardened (45–65 HRC) | AlTiN, TiAlN |

**Governing group.** With multiple materials selected, presets and coatings
follow the most conservative group, priority **H → S → K → M → P → N**. The
results header states which group is governing.

**Feeds & speeds.** Simplified but directionally honest, computed per tool:

```
RPM       = SFM × 3.82 ÷ cut diameter          (rounded to 10s)
chip load = 0.0008 + diameter × 0.0028          (inches/tooth)
feed IPM  = RPM × flutes × chip load
SFM table = N 900 · K 300 · P 350 · M 240 · H 150 · S 120  (drills lower)
```

So the same ½" 4-flute tool shows ~6,880 RPM against steel and ~1,150 RPM against
a superalloy — the demo's numbers move the way a machinist expects, without
claiming to be a real speeds-and-feeds engine.

---

## 10. Simulated-data policy

All commercially sensitive values are fictional stand-ins in realistic formats:

- **Account:** `#0000-DEMO`, "Bay 2 crib ✓ connected"
- **MSC SKUs:** fictional `0999xxxx` range (24 products)
- **Competitor / document part numbers:** invented formats
  (`CM-2F340-0500-DEMO`, `GEN-EM-500-4F`, `SUP-BN-375`, `CUSTOM-FORM-12`)
- **Document numbers:** `PO-2026-0708-DEMO`, `Q-2026-04xx`, `SO-2026-07xx`
- **Prices, stock, lead times, fit percentages:** representative only
- Checkout and quote flows state "simulated" on-screen; imports state that
  nothing is ordered.

Brand names (Accupro, Hertel, SGS, Niagara, Kennametal, OSG) are retained for
realism as MSC-carried brands.

---

## 11. Deliberate scope decisions

- **No part/feature reading.** The app never reads CAD geometry, CAM setups, or
  selected features. The only inbound data paths are explicit imports: a tool
  file (.csv/.tools) or the Fusion document's tool library.
- **No persistence.** State resets on refresh — appropriate for a flow demo, and
  it doubles as the reset between walkthroughs.
- **Simulated integrations.** Catalog/pricing/inventory APIs, CAM writes, file
  parsing, PO transmission, and checkout are all mocked with realistic behavior.
- **Parked for later:** authentication, multi-user crib sync,
  punchout/e-procurement, quantity price breaks, tool-assembly builder
  (cutter + collet + holder).

---

## 12. Repository & deployment

```
index.html        markup only — application shell, tab views, PDP modal
css/style.css     the full design system (~1,000 lines)
js/app.js         all data + behavior (~800 lines, vanilla JS, no dependencies)
README.md         this file
```

No build step. The only runtime dependency is Google Fonts (with system
fallbacks that preserve the design if it fails to load).

**GitHub Pages:** push all files and both folders to the repo root on `main`;
Settings → Pages → deploy from `main` / root. Open the site root URL — never a
URL ending in `.js` or `.css`. Hard-refresh (Ctrl/Cmd+Shift+R) after pushing;
Pages caches aggressively. The folder names `css` and `js` (lowercase) must
arrive intact next to `index.html`.

---

## 13. Suggested walkthrough

1. **Find** — select Aluminum, note the ZrN/uncoated results; add Steel and
   watch the coatings and RPMs change to the governing group. Flip
   Cards ↔ Compare, sort by price, expand "See all," open a PDP.
2. **Match** — run the pre-filled part number, point out the reference card and
   the −41% chip, toggle two alternatives into Compare, then add your own MSC #
   as a third column.
3. **Library** — **Load from Fusion library**, flip an alternative and watch the
   roll-up recompute, note the honest +8% line, add selected to Library + cart,
   then Export to CAM with a format chosen.
4. **Crib** — switch profiles, filter, note the below-min reds and the summary
   strip, Generate PO and show the excluded non-MSC lines.
5. **Cart** — honor the crib check, Save quote, then Checkout to the
   confirmation screen; reopen the saved quote to close the loop.

That sequence shows the full advisor-to-order flow — the part most companies
don't have — in about four minutes.
