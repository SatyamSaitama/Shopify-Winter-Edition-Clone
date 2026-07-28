# Pixel- and animation-identical clone of Shopify Editions Winter '26 — detailed plan

## Context

`/Users/satyamkumar/projects/shopify-clone` recreates
`https://www.shopify.com/editions/winter2026`. The 3D layer is advanced (13 Theatre.js
scenes on original GLB/KTX2 assets, state evaluator, scrubbed GLTF clips, PMREM lighting,
production particle shaders). The DOM layer is not: **47 image tags vs the original's 345,
3 links vs 294, and 0 of its 200 product cards.**

Goal: pixel- and animation-identical at **1728px**, verified locally and deterministically.
pingfusi is excluded, so there is no human-judgment channel — every claim must be settled
by a number a script produces.

| Decision | Choice |
|---|---|
| Vehicle | Existing Next.js app (no capture-build, no pingfusi) |
| Width | 1728px |
| Fonts | Fetch the 3 original licensed `.woff2` |
| Rive | Full subsystem — 27 files + `@rive-app/canvas` |

Licensed fonts make this a **local study build**; do not deploy publicly.

### Why this is tractable

The page is **scroll-scrubbed**: Theatre time is a pure function of `scrollY`. "Same
animation" therefore reduces to pixel-diffing both pages at the same scroll offsets — no
timing races. Only four things break that purity (hero's 5s intro, particle
blink/butterflies, shader `uTime`, video/Rive playback); Phase 0 neutralizes all four with
a virtual clock.

---

## Verified facts (checked against the artifacts, not assumed)

| Fact | Evidence |
|---|---|
| Crossfade GLSL is **unminified with comments** | `Background-63vTryKN.js` @ byte 1024622 |
| Original page has exactly **one** `<canvas>` | hydrated HTML |
| Clone runs **one WebGLRenderer per section** (up to 13 contexts) | `RealScene.tsx:256` × `CategorySectionShell.tsx:99` |
| **200** products, declared via `data-component-name="product"` | hydrated HTML |
| Spacing scale is **1 unit = 1px** (`py-40` → `2.5rem`) | `tailwind.css` |
| `--spacing-grid-spacing: 12px` | `tailwind.css` |
| `.headline-1` ≥769px = `clamp(7.5rem, 35.7895px + 10.9649vw, 13.75rem)` → **220px @1728** | `tailwind.css` |
| Clone's `--text-display-lg` resolves to **193.6px @1728** — wrong by 26px | `globals.css:20` |
| `.headline-1` uses `text-box: trim-both cap alphabetic` | `tailwind.css` |
| All 4 `.woff2` **and** the `@font-face` CSS are in the HAR | `www.shopify.com.har` |
| `srcSet` attributes in the saved HTML are **corrupted** | overlapping text in `checkout` markup |

That last row matters: image URLs must come from the HAR or the `src` attribute, never
from `srcSet` in the saved HTML.

### The original's own component vocabulary

The DOM self-describes, so the extractor reads types rather than inferring them:

| `data-component-name` | n | | semantic class | n |
|---|---|---|---|---|
| `product` | 200 | | `bodycopy-1` | 416 |
| `cta-title-link` | 134 | | `rich-text` | 242 |
| `cta-link` | 67 | | `card-content-width` | 96 |
| `cta-inline-link` | 56 | | `media-wrapper` | 57 |
| `rive-container` | 21 | | `card-container` | 48 |
| `skill-tag` | 20 | | `grid-template-with-gaps` | 26 |
| `sidekick-skills-link` | 20 | | `headline-4` / `headline-6` | 18 / 17 |
| `sidekick-apps-card` | 10 | | `full-bleed` | 15 |
| `cta-open-video-modal` | 5 | | `narrative-1` / `drop-cap` | 16 / 12 |
| `product-modal`, `video-modal` | 1 each | | `safe-min-h-165-svh` (sticky) | 3 |

715 distinct classes total.

---

## Phase 0 — Build the ruler first

`tests/visual/` is empty and there is no `playwright.config.ts`. Nothing downstream is
measurable until this exists.

**Install:** `npm i -D pixelmatch pngjs` (`@playwright/test` and `sharp` are already there).

**`playwright.config.ts`** — one project, `viewport: {width:1728, height:1080}`,
`deviceScaleFactor: 1`, `reducedMotion: 'no-preference'`, workers 1 (WebGL is
GPU-contended), 0 retries (a flaky visual gate is a broken gate).

**`tests/visual/determinism.ts`** — a single `addInitScript` applied to *both* sides so
they receive identical stimulus:

```ts
// seeded RNG — same sequence on both pages
let s = 0x9E3779B9;
Math.random = () => { s|=0; s=s+0x6D2B79F5|0;
  let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296; };

// virtual clock — makes particle blink, butterflies and shader uTime reproducible
let now = 0;
const cbs = new Map<number, FrameRequestCallback>(); let id = 0;
performance.now = () => now;
Date.now = () => 1700000000000 + now;
window.requestAnimationFrame = (cb) => { cbs.set(++id, cb); return id; };
window.cancelAnimationFrame = (h) => { cbs.delete(h); };
(window as any).__tick = (frames = 1) => {
  for (let i = 0; i < frames; i++) {
    now += 1000/60;
    const due = [...cbs]; cbs.clear();
    for (const [, cb] of due) cb(now);
  }
};
```

Plus: pause every `<video>` and seek to a fixed `currentTime`; pin `devicePixelRatio`.

**`tests/visual/live.ts`** — replay the original offline and variant-free:

```ts
await page.routeFromHAR('www.shopify.com.har', { url: '**', update: false });
```

This kills network variance and CDN A/B variants, and works with no connection.

**`tests/visual/stops.ts`** — two stop sets, both derived from measured page height:
- `keyframe` — per section: hero entry, mid, and the crossfade midpoint (the
  `0.2 * viewportHeight` early offset from Online onward). ~40 stops, the fast loop.
- `dense` — every 100px over the full page (~54k at 1440; re-measure at 1728). The gate.

**`tests/visual/diff.spec.ts`** — per stop: scroll → settle → `__tick(30)` → screenshot
both → `pixelmatch`. Writes `tests/visual/report/<stop>.json` (per-region mismatch ratio)
and a diff PNG. Regions come from the section bounding boxes so a failure names its
section.

**`tests/visual/geometry.spec.ts`** — for every element: `getBoundingClientRect` plus a
computed-style subset (`font-*`, `color`, `background-color`, `padding`, `margin`, `gap`,
`border-radius`, `z-index`, `position`, `transform`). Catches structural drift a pixel diff
can mask, and produces the ranked worklist that drives Phase 3.

**Self-test gate:** the harness must run green *live-vs-live* before it is trusted. A
harness that can't prove the original matches itself cannot prove anything about the clone.

## Phase 1 — Fonts

Unblocks every text measurement, so it precedes content.

1. Extract from the HAR (reuse `scripts/extract-har.mjs`) into `public/assets/fonts/`:
   - `389d4f8566b3b9cbe083b682c7fabf06.woff2`
   - `49a57a6e59f6a50f0627418abeb58fec.woff2`
   - `3ee238256136fcfdfca35decbd44d0d4.woff2`
   - `5949cd393a8375a896fd0a9b74307666.woff2` (Inter-Variable, used by some UI)
2. Also extract `oxygen-v2/.../assets/fonts-latin-CzfLCQn_.css` — it holds the real
   `@font-face` blocks mapping each hash to its family, weight, style and `unicode-range`.
   Do not guess the mapping; `tailwind.css` only declares Inter-Variable.
3. Port those `@font-face` blocks into [globals.css](src/app/globals.css) verbatim,
   rewriting `src:` to the local paths.
4. Remove the `next/font` Google substitutes from [layout.tsx](src/app/layout.tsx) and the
   substitution table from [design-tokens.md](reference/design-tokens.md).

Check: `geometry.spec.ts` text-box deltas should collapse immediately.

## Phase 2 — Editorial content (largest gap: 200 products)

Do **not** hand-type this.

**`scripts/extract-content.mjs`** — parse the hydrated HTML and emit typed data:

- Walk each `section[data-section-id]`.
- Hero: `h2.headline-1` text + `.rich-text.narrative-1.drop-cap` paragraph.
- Products: each `article[data-component-name="product"]`, keyed by
  `data-component-extra-handle` (stable, matches the original's anchor ids).
- Classify layout variant from what the article contains — the DOM declares it:
  `rive-container` → Rive; `.full-bleed` → full-bleed; `.safe-min-h-165-svh` + `.sticky`
  → sticky; `.grid-template-with-gaps` → XXL grid; ruled rows → text list; else card.
- CTAs by `data-component-name`: `cta-link`, `cta-title-link`, `cta-inline-link`,
  `cta-open-video-modal` — each with `href`, label, and new-window flag.
- Media: resolve every `src` **through the HAR**, not `srcSet` (corrupted in the save).
  Emit intrinsic width/height and the `aspect-ratio` inline style the original sets.

Output → `src/data/content/<section>.ts` against a schema in `src/data/content/types.ts`:

```ts
type Product = {
  handle: string; variant: 'card'|'fullBleed'|'sticky'|'rive'|'xxl'|'textList';
  eyebrow?: string; title: string; body?: string;
  media?: { src: string; w: number; h: number; aspect: string; alt: string }[];
  rive?: { file: string; stateMachine: string };
  ctas?: { kind: string; href: string; label: string; newWindow: boolean }[];
  span: { base: number; smTablet: number; md: number };  // col-span-2 / 1 / 6
};
```

**Layout variants** → `src/components/products/`: `ProductCard`, `FullBleedProduct`,
`StickyProduct` (165svh wrapper, inner `sticky top-110px min-h-100svh`), `RiveProduct`,
`XXLProduct`, `TextList`.

**Collapse the section files.** The twelve bespoke `src/components/sections/*Section.tsx`
become one data-driven renderer behind
[CategorySectionShell.tsx](src/components/sections/CategorySectionShell.tsx) — whose
per-section viewport padding table (lines 41-91) is already correct and should be kept
as-is.

**Sidekick is its own budget item**: 257 images and the pointer-reactive card cloud
(`sidekick-apps-card` ×10, `skill-tag` ×20, `sidekick-skills-link` ×20).
[PromptCloud.tsx](src/components/ui/PromptCloud.tsx) is the seed; it needs the real card
set plus the documented physics — 300px influence radius, quadratic falloff
`1-(d/300)²`, 20px repulsion, background cards at `-15px` normalized pointer offset, entry
scale `0.5×` → authored over 1000ms with random 0–800ms delay on
`cubic-bezier(.34,1.56,.64,1)`.

Missing binaries (~300 images, 12 videos) come out of the HAR via the existing
`scripts/extract-har.mjs` / `scripts/download-assets.mjs`.

## Phase 3 — CSS fidelity

Adopt the original's system rather than approximating it:

1. **Spacing scale → 1 unit = 1px.** Configure Tailwind v4 so `py-40` = 40px, `size-13` =
   13px, `rounded-3` = 3px. This makes every class name in the captured markup transfer
   directly, and is the single highest-leverage change in this phase.
2. **`--spacing-grid-spacing: 12px`**, with `.grid-template-with-gaps`, `.grid-padding`
   and `.full-bleed` (`margin-left: calc(var(--spacing-grid-spacing) * -1); width: calc(100% + var(--spacing-grid-spacing)*2)`)
   ported verbatim.
3. **Typography classes** ported from `tailwind.css`, not re-derived — `.headline-1`,
   `.headline-3/4/6`, `.bodycopy-1/2`, `.narrative-1..4`, `.rich-text`, `.drop-cap`,
   `.card-content-width` (`max-width:75%`).
   - Fix the known bug: `.headline-1` ≥769px is `clamp(7.5rem, 35.7895px + 10.9649vw, 13.75rem)`
     = **220px at 1728**, where [globals.css:20](src/app/globals.css#L20) currently yields
     193.6px.
   - Keep `text-box: trim-both cap alphabetic` — it removes half-leading and shifts every
     heading's vertical position; omitting it throws off every downstream box.
4. Then run `geometry.spec.ts` and work the ranked delta list to zero.
   `reference/design-tokens-raw.json` and `tailwind.css` are the lookup sources.

## Phase 4 — Single-context compositor (animation identity)

The core architectural gap. [RealScene.tsx:256](src/components/ui/RealScene.tsx#L256)
builds `new THREE.WebGLRenderer(...)` per scene and
[CategorySectionShell.tsx:99](src/components/sections/CategorySectionShell.tsx#L99) mounts
one `<RealScene>` per section — up to 13 contexts with `forceContextLoss` churn. The
original uses one context, two render targets, and a GLSL crossfade.

**New `src/components/ui/SceneCompositor.tsx`:**

1. One `THREE.WebGLRenderer` + one `<canvas>`, mounted once at the page root — the
   `#scene-portal` div in [page.tsx](src/app/page.tsx#L22) is already the right hook.
   Sticky, `top:0`, `100vh`, `margin-bottom:-100lvh`, `overflow:clip`.
2. Two RGBA render targets with depth: active → `tCurrent`, next → `tNext`.
3. **Port the shader verbatim.** Extract with:
   ```bash
   python3 -c "s=open('reference/bundle-full/Background-63vTryKN.js',encoding='utf-8',errors='ignore').read();i=s.find('uniform sampler2D tCurrent');print(s[s.rfind(chr(96),0,i)+1:s.find(chr(96),i)])"
   ```
   Uniforms: `tCurrent, tNext, tMudNormal, tNoise, uProgress, uAspect, uTime, uResolution,
   uMouse, uIsHero, uIsFallback, uProjectionView, uFadeCenterPoint, uDarken`.
   Its mechanics, all of which must survive the port: hero vs simple progress smoothing
   (`smoothstep(0,1.5,p)` vs raw); fade centre projected through `uProjectionView` (fallback
   pins `vec2(0.5,0.65)`); ±10% counter-zoom on the two UV sets in hero mode; `fwidth`
   luma-derivative edges mixed in during transition; mud-normal offset modulated by
   `sin(uTime - uv.x*10)`; noise-texture threshold; aspect-corrected circular reveal in hero
   vs `uv.y→uv.x` wipe otherwise; `smoothstep(-aa, aa, edge)` antialiased blend; and the
   final glow multiply.
4. Port the neighbouring **4-octave noise-texture generator** (functions `oI`/`lI` in the
   same file) rather than substituting different noise — the threshold depends on its exact
   distribution. `mud_normal.webp` is already extracted.
5. Pass order after the crossfade: overlay → inverted-Sobel (checkout) → bloom at half
   resolution → SMAA. Mouse/overlay uniforms smoothed at frame lerp `0.15`.
6. Three-scene mounted window (prev/active/next); dispose the rest.
7. **Preserve what §12 already got right** — don't regress these during the rewrite:
   Theatre static overrides applied before dynamic tracks; empty tracks ignored (not read as
   zero); `loop:true` clips real-time while progress tracks stay scrubbed; the
   `0.2 * viewportHeight` early crossfade from Online onward; Lenis exponential easing
   `t => Math.min(1, 1.001 - 2**(-10*t))`; pointer parallax orbiting the target at
   ±0.1 rad × `gaze`; and the scene order in [scenes.ts](src/data/scenes.ts).

Per-scene timeline durations stay: Sidekick 12.48, Retail 9.54, all others 10.

## Phase 5 — Rive

`npm i @rive-app/canvas`. Download the 27 `.riv` files (paths in the hydrated HTML under
`cdn.shopify.com/s/files/1/0951/3130/4218/files/`, also in the HAR) to
`public/assets/rive/`. Build `RiveProduct` per the original's 21 `rive-container` nodes:
lazy import, activation delay 300ms desktop / 600ms mobile, IntersectionObserver root
margins up to 100%, state-machine playback, poster fallback from the existing
`compressed-*poster*.webp` files already in `public/assets/content/`.

Drive state machines from the Phase 0 virtual clock so they land deterministically in the
diff.

## Phase 6 — Remaining interactions

- **Checkout**: hover builds a mask texture (in 300ms outQuad, out 200ms inQuad); click
  opens the merch modal with the Sobel transition (open 800ms, close 500ms). Needs
  object-level pointer raycasting.
- **Shipping**: key interaction (hide 100ms easeInCubic, restore 600ms outBack) + coin rain
  — [FallingCoins.tsx](src/components/ui/FallingCoins.tsx) is the seed.
- **Header theming**: `data-nav-theme` / `data-nav-style` regions (present throughout the
  captured markup) drive an attribute on `<html>`; no duplicated nav markup.
- **Modals** at z-10000; `<source>` attached only near viewport, unloaded on exit.
- **Z-index ladder**: 10000 modals / 50 header / 40 index rail / 10 hero card / 2 editorial
  overlays / 1 decorative / auto content / canvas behind.
- **Pointer-event partitioning**: wrappers and transparent scene regions `none`; links,
  cards, videos, opaque content `auto`.

## Verification

```bash
npm run build && npm start
npx playwright test tests/visual/geometry.spec.ts            # box + computed-style parity
npx playwright test tests/visual/diff.spec.ts                # keyframe stops — fast loop
npx playwright test tests/visual/diff.spec.ts --grep @dense  # full-page gate
node scripts/check-console-errors.mjs
```

Gates, all of which must hold before a phase is called done:

| Gate | Target |
|---|---|
| Geometry | no element-box delta > 0.5px; zero deltas in the tracked style subset |
| Pixels | dense-stop mean mismatch < 0.1%; no single stop > 0.5% |
| WebGL contexts | exactly **1** (assert in-page — guards the Phase 4 regression) |
| Console | no errors, no `webglcontextlost` across a full scroll |
| Content parity | 345 imgs / 294 links / 200 product handles present |

Record each run in `docs/REVERSE_ENGINEERING.md` §12 so the known-gaps list stays the
single source of truth.

## Sequencing

0 → 1 → 3 → 2 → 4 → 5 → 6. Phase 3 moves ahead of Phase 2: fixing the spacing scale and
type classes *first* means the 200 extracted products land into correct geometry instead of
needing a second pass. Phases 4 and 2 are independent and can interleave.

## Risks

- **Sidekick's card cloud** — 257 images plus pixel-visible pointer physics. Budget it
  apart from the other 11 sections.
- **`Trace-20260725T090737.json` is 1.2GB** — only for timing questions; never load it in a
  diff loop.
- **Dense diff cost** — ~540 stops × 2 pages × WebGL. Keep the keyframe set as the
  iteration loop and run dense as a gate, not per-change.
- **`text-box: trim-both`** has limited browser support; if the Playwright Chromium build
  lacks it, both sides must be captured in a build that has it, or the metric must be
  emulated identically on both.
- **No human-judgment channel.** With pingfusi excluded, anything numbers can't see — a
  wrong easing that still hits the same scroll-stop frames, colour-profile drift, subjective
  "feel" — will not be caught. The dense diff plus virtual clock narrows this substantially
  but does not close it.
