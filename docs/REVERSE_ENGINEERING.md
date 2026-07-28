# Shopify Editions Winter ’26 reverse-engineering report

This report is based on the supplied hydrated HTML, HAR, DevTools performance
trace, minified production bundles, Theatre.js project states, extracted media,
and reference screenshots. Screenshots are used only as visual evidence; the
recreation is built from the supplied original GLB/KTX2/media assets and live
HTML content, not flattened screen captures.

## 1. System overview

The original page is a React/Tailwind application with four coordinated layers:

1. A fixed global navigation layer.
2. A fixed desktop side-navigation/title layer.
3. A single sticky, full-viewport React Three Fiber canvas.
4. A long DOM document that alternates transparent WebGL hero regions and
   opaque editorial/product regions.

The most important implementation detail is that the 3D scenes are not separate
full-page videos. Each collection has a Theatre.js project-state file. Scroll
progress is converted to Theatre sequence time, and the active/next scenes are
rendered into two framebuffers and crossfaded by a custom shader.

The source canvas wrapper is:

```text
div.canvas-wrapper
  position: sticky
  top: 0
  width: 100%
  height: 100vh
  margin-bottom: -100lvh
  overflow: clip
  canvas (React Three Fiber, frameloop="always")
```

At desktop widths (`>= 940px`) the content column occupies the right `80%` of
the page; the left `20%` is reserved for the fixed index rail. The main wrapper
is capped at `1680px`.

## 2. Global DOM hierarchy

```text
Root
├─ GlobalNavigationContainer
│  └─ header > nav
├─ Background
│  └─ sticky.canvas-wrapper
│     └─ R3F Canvas
│        ├─ scene framebuffer A
│        ├─ scene framebuffer B
│        ├─ crossfade/overlay/sobel pass
│        └─ bloom/SMAA output
├─ .main-wrapper (max-width: 1680px; pointer-events: none)
│  └─ main
│     ├─ [data-section-name="side-and-lines"]
│     │  ├─ fixed title treatment
│     │  └─ fixed side navigation
│     ├─ [data-section-id="hero"] (150svh; translated overlap)
│     └─ #main-content
│        ├─ section#sidekick
│        ├─ section#agentic
│        ├─ section#online
│        ├─ section#retail
│        ├─ section#marketing
│        ├─ section#checkout
│        ├─ section#operations
│        ├─ section#shop-app
│        ├─ section#b2b
│        ├─ section#finance
│        ├─ section#shipping
│        └─ section#developer
├─ Footer
├─ video/merch modal portals
└─ global loading/interaction helpers
```

## 3. Repeated section DOM

Every collection uses the same high-level hierarchy:

```text
section#[handle]
  data-section-id=[handle]
  data-section-index=[0..11]
  pointer-events: none
└─ div (100%; desktop width 80%)
   ├─ SectionHero [data-section-hero]
   │  ├─ h2.headline-1
   │  └─ rich-text.narrative-1.drop-cap
   ├─ optional XXL collection(s)
   │  └─ product/list layout variants
   ├─ div editorial body (paper background; pointer-events: auto)
   │  ├─ organized content
   │  └─ nested collections
   ├─ optional bottom XXL collection(s)
   └─ “Back to navigation” focus target
```

Hero sizing is `70svh` on small screens and `140svh` from tablet upward.
Section-specific title placement is encoded as viewport-relative padding:

| Section | Desktop title/description placement |
|---|---|
| Sidekick | title `padding-top: 11vh` |
| Agentic | title `14vh`; description `11vh` |
| Online | title `14vh`; description `11vh` |
| Retail | centered title; description `11vh` |
| Marketing | centered title; description `11vh` |
| Checkout | title bottom offset `11vh`; description top offset `19vh` |
| Operations | title bottom offset `11vh`; description top offset `19vh` |
| Shop app | title bottom padding `30vh` |
| B2B | title top padding `27vh` |
| Finance | title top padding `35vh` |
| Shipping | title bottom padding `30vh` |
| Developer | title top padding `20vh`; description `11vh` |

Editorial product layouts resolve to these structural variants:

- Standard card/grid: image or video, eyebrow, title, description, CTA.
- Full bleed: mobile and desktop art sources cover the full container width.
- Sticky product: `165svh` wrapper with an inner `position: sticky; top: 110px;
  min-height: 100svh`.
- Rive product: lazy Rive canvas, state-machine driven, usually activated with
  a generous IntersectionObserver root margin.
- XXL layout: full container width, then an internal desktop `80%` grid.
- Text list: ruled rows, optionally textured.

## 4. Section-by-section breakdown

| Section | WebGL scene and authored movement | Editorial body |
|---|---|---|
| Hero | 10-unit sequence; four camera beats. Z travels `-18.57 → 10.34 → -2.29`, FOV `25 → 22`. Hero GLB, landscape texture, particles, bloom and scene props. | Central bordered Renaissance title/index card. |
| Sidekick | 12.48 units; camera rises into the armillary scene then pulls back (`z 2.48 → 4.81`, FOV `25 → 30`). Stars, foreground figure, particles and overlay transition. | Proactive insights, generated apps, Flow automation, analytics, segmentation, design/image tools, reusable Skills, multi-step work and voice. |
| Agentic | 10 units; extreme perspective transition (`z 1.25 → 2.72`, FOV `10 → 30`) with book/props/key animation and dither. | AI-chat storefront discovery and checkout experiences. |
| Online | 10 units; three camera beats, FOV `19 → 30`, code/white overlay and scene visibility switches. | Theme editor, search/filter, offers, metafields, WordPress and storefront updates. |
| Retail | 9.54 units; custom POS camera environment, FOV `11 → 66.59`, hub/device assets and environment lighting. | POS Hub story, wired connections, scanner/subscriptions/extensions and POS updates. |
| Marketing | 10 units; camera pullback (`z .73 → 4.2`) plus billboard frames, blur and darkening effects. | Email/SMS, forms, segmentation and campaign tooling. |
| Checkout | 10 units; camera pullback (`z 2.1 → 4.87`) plus animated checkout figure/hat. Hover creates a mask texture; click opens a merchandise modal with a Sobel transition. | Personalized Shop button, per-market checkout customization and payment updates. |
| Operations | 10 units; FOV `17 → 32`, camera `z 1.93 → 4.71`, animated people and operational props. | Inventory transfers/counting, fulfillment, packaging and admin operations. |
| Shop app | 10 units; camera `z 1.29 → 5.37`, multiple named body/arm/hand/phone animation tracks. | Shop app redesign and buyer-facing discovery features. |
| B2B | 10 units; large vertical crane move (`y 5.5 → -2.55`, `z .79 → 9.57`) with two animated assets. | Collective, ACH, retailer discovery, fulfillment payments and B2B feature grid. |
| Finance | 10 units; camera descends (`y 4.07 → -.87`) and pulls back (`z -1.48 → 6.12`). | Balance controls, transfers, cards and finance products. |
| Shipping | 10 units; camera `z 1.62 → 4.63`; shipping rig, key interaction and coin-rain behavior. | Labels, carriers, rates and shipping updates. |
| Developer | 10 units; camera `z 2.46 → 5.81`; developer rig, scan key and floating key transforms. | Catalog/MCP, Checkout Kit, Admin Intents, bulk imports, metafields, Tangle and API updates. |

## 5. Sticky, pinned and transformed elements

- Global header: fixed at the viewport top; theme switches between light/dark
  based on intersecting `data-nav-theme` and `data-nav-style` regions.
- Side index/title: fixed on desktop. It becomes visible after the hero and
  tracks `activeSection`. Source text colors switch at crossfade thresholds.
- WebGL canvas: sticky at top, full viewport, negative one-viewport bottom
  margin. This makes the DOM scroll over one persistent renderer.
- Collection heroes: flow through `140svh`; their background remains pinned
  because the global canvas is sticky.
- Selected product layouts: `165svh` outer wrapper with a `100svh` sticky
  inner content panel at `top: 110px`.
- Full-bleed artwork: width is `100cqw` and shifted left to escape the desktop
  `80%` content column.
- Modal: fixed at the viewport center on desktop and bottom/full-height on
  mobile, z-index `10000`.
- Sidekick cloud cards: transformed with WAAPI on entry and `translate3d` /
  scale on pointer movement.
- Scene assets and cameras: transformed from Theatre.js keyframes, not CSS.

## 6. Scroll and animation model

### Scroll coordinator

Desktop uses Lenis. The source probes high-frequency wheel input and chooses a
duration of `0.15s` for high-frequency devices or `0.85s` otherwise. Its default
easing is:

```js
t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
```

Mobile uses native scroll.

For section `i`, with top `A`, height `H`, viewport `V`, scroll `S`, and early
crossfade `E`:

```text
start = A - V - E
progress = clamp((S - start) / (H + V + E), 0, 1)
```

The next section is evaluated simultaneously. Sections from Online onward use
an early crossfade of `0.2 * viewportHeight`. The interactive section switches
from current to next when the next transition progress reaches `0.5`.

### Theatre timelines

- Sidekick: `12.48` timeline units.
- Retail: `9.54` units.
- Every other scene: `10` units.
- Scroll progress maps linearly to sequence time.
- Theatre’s stored cubic-bezier handles are applied per keyframe segment.
- Named GLTF animation clips use Theatre paths such as
  `animations.Scene.progress`; progress `0..1` maps to `0..clip.duration`.
- Static overrides establish every object’s initial position, rotation, scale,
  visibility, material/effect values and animation state.

### Scene transition timeline

The active and next scenes render to separate WebGL render targets. A
full-screen shader combines:

- `tCurrent` and `tNext`
- transition progress
- procedural four-octave noise
- a repeating mud-normal texture
- mouse position
- projection-view matrix
- per-scene fade center
- fallback/hero flags

An overlay pass, inverted-Sobel checkout pass, bloom, and SMAA are composed
after the scene crossfade. Mouse and overlay uniforms are smoothed by a frame
lerp of `0.15`.

### Pointer parallax

The source camera converts pointer coordinates to `[-1, 1]`.

- Base pan range: `[-0.1, 0.1]` radians.
- Base tilt range: `[-0.1, 0.1]` radians.
- Both are multiplied by Theatre camera `gaze` (commonly `0.5`), so the normal
  effective maximum is `±0.05 rad`.
- Per-frame smoothing: `current += (target - current) * 0.1`.
- The camera orbits its target; it does not translate in screen pixels.

Several Theatre files retain old `pointerInfluence`, `pan`, and `tilt` static
keys, but the live Camera component reconfigures around `gaze`; those stale
keys must not be used by the recreation.

Sidekick card cloud:

- Background/parallax cards: normalized pointer offset multiplied by `-15px`
  on both axes.
- Interactive cards: a `300px` influence radius, quadratic falloff
  `1 - (distance / 300)^2`, and `20px` repulsion strength.
- Entry: scale from `0.5 * baseScale`, opacity `0`, to authored scale/opacity
  over `1000ms`, random delay `0..800ms`,
  `cubic-bezier(.34, 1.56, .64, 1)`.

### Non-scroll timelines

- Header/side navigation: CSS keyframe entrance and theme transitions.
- Videos: source nodes are attached and playback starts only near the viewport;
  leaving unloads the source to release memory.
- Rive: lazy import, delayed activation (`300ms` desktop / `600ms` mobile),
  IntersectionObserver root margins up to `100%`, state-machine playback.
- Checkout hat: hover-in `300ms outQuad`, hover-out `200ms inQuad`; modal open
  shader timeline `800ms`, close `500ms`.
- Shipping key: hide `100ms easeInCubic`, restore `600ms outBack`; popup/WebRTC
  messages synchronize the key interaction.
- WebGL idle effects: particle blink/turbulence, butterflies, shader noise and
  render effects run on the render loop; authored character animation remains
  scroll-scrubbed.
- Reduced motion: DOM reveals and pointer motion should resolve immediately;
  key content remains visible.

## 7. Layering and z-index strategy

```text
z 10000  video/merch modals
z 50     global header/nav and focus-return controls
z 40     desktop index rail in the recreation
z 10     hero title/index card
z 2      XXL/editorial overlays that must paint above textured regions
z 1      decorative Sidekick cloud/Rive layers
z auto   section content and opaque paper panels
z back   sticky WebGL canvas
```

The source also relies on pointer-event partitioning:

- wrappers and transparent scene regions use `pointer-events: none`;
- links, cards, videos and opaque content restore `pointer-events: auto`;
- the WebGL canvas enables pointer input for scene objects;
- theme changes use attributes on `<html>` rather than duplicating nav markup.

## 8. GSAP recreation timelines

The original scene engine is Theatre.js, not GSAP. A clean GSAP recreation
should keep Theatre JSON as the source of truth and use ScrollTrigger only as
the scroll clock:

```ts
const sceneConfig = {
  hero:      { duration: 10,    early: 0.0 },
  sidekick:  { duration: 12.48, early: 0.0 },
  agentic:   { duration: 10,    early: 0.0 },
  online:    { duration: 10,    early: 0.2 },
  retail:    { duration: 9.54,  early: 0.2 },
  marketing: { duration: 10,    early: 0.2 },
  checkout:  { duration: 10,    early: 0.2 },
  operations:{ duration: 10,    early: 0.2 },
  shopApp:   { duration: 10,    early: 0.2 },
  b2b:       { duration: 10,    early: 0.2 },
  finance:   { duration: 10,    early: 0.2 },
  shipping:  { duration: 10,    early: 0.2 },
  developer: { duration: 10,    early: 0.2 },
};
```

For every section:

```ts
ScrollTrigger.create({
  trigger: section,
  start: () => `top ${100 + early * 100}%`,
  end: "bottom top",
  scrub: true,
  onUpdate: ({ progress }) => {
    applyTheatreState(scene, progress * duration);
    applyNamedClipProgress(scene, progress * duration);
  },
});
```

DOM timelines:

```ts
gsap.timeline({
  scrollTrigger: { trigger: hero, start: "top 70%", once: true }
})
.from(title, { autoAlpha: 0, y: 24, duration: .6, ease: "power2.out" })
.from(description, { autoAlpha: 0, y: 24, duration: .6 }, "-=.35");
```

Use this reveal timeline for all 12 collection heroes, substituting the
section-specific viewport placement from the table above. Product cards should
use grouped stagger timelines (`0.06–0.1s`) only where the original visibly
groups items; Rive/video products retain their own playback triggers.

## 9. React component architecture

```text
app/page
├─ GlobalHeader
├─ IndexRail
├─ SceneCompositor
│  ├─ SceneRegistry
│  ├─ TheatreScene (x13)
│  ├─ CrossfadePass
│  ├─ CheckoutSobelPass
│  └─ EffectsPipeline
├─ Hero
├─ CollectionSection (x12)
│  ├─ CollectionHero
│  ├─ OrganizedContent
│  │  ├─ ProductCard
│  │  ├─ StickyProduct
│  │  ├─ FullBleedProduct
│  │  ├─ RiveProduct
│  │  └─ TextList
│  └─ NestedCollection
├─ ModalLayer
└─ Footer
```

State stores:

- `scrollStore`: section measurements, active/next indices and progress.
- `sceneStore`: mounted scene window, quality, fallback and renderer readiness.
- `effectsStore`: bloom, overlay, fade center and crossfade.
- `modalStore`: checkout/video state.
- `navigationStore`: current theme and active index item.

## 10. React Three Fiber/WebGL requirements

- One `<Canvas frameloop="always">`, not one WebGL context per collection.
- R3F scene portals or detached `THREE.Scene` instances for each collection.
- Mount active scene, previous scene, next scene, and optionally one preload
  neighbor; dispose everything else.
- GLTFLoader with Draco and KTX2/Basis transcoding.
- PMREM environment texture support.
- Theatre project state evaluator, including static overrides and exact stored
  cubic-bezier handles.
- Named GLTF clip progress mapping.
- Two RGBA render targets with depth.
- Crossfade, overlay and inverted-Sobel passes.
- Bloom at half resolution and SMAA.
- Particle and butterfly systems.
- Object-level pointer raycasting for checkout/shipping interactions.
- Fallback poster/scene images for low capability and reduced-motion paths.

## 11. Performance findings

HAR:

- `596` requests.
- DOMContentLoaded `1419ms`; load `1454ms`.
- Response content represented in the HAR: about `91.17 MiB`.
- GLB: `72` responses / `27.0 MiB`.
- MP4: `7` / `21.7 MiB`.
- WebP: `230` / `8.6 MiB`.
- JavaScript: `41` responses / about `3.17 MiB`.
- WASM: `3` / `2.99 MiB`.

The performance trace spans `36.39s`, includes `1,268,658` events and `450`
screenshots. It records continuous animation/render activity:

- `11,969` animation-frame callbacks.
- `4,090` compositor draw frames.
- `21,082` GPU tasks (`3468ms` total).
- `13,045` raster tasks.
- `3,538` style updates (`1821ms` total).
- `392` layouts (`48ms` total).
- `27` major and `17` minor GCs.

Several `200–658ms` main/compositor tasks coincide with large scene commits and
asset activation. The production code responds by:

- capping DPR to `2` and additionally capping the render dimension by quality
  (`1280`, `1920`, or `3840`);
- dropping high quality after sustained FPS below `45`;
- using 30 FPS for low quality and 60 FPS otherwise;
- rendering bloom at half resolution;
- lazy mounting neighboring scenes;
- lazy attaching and unloading video/Rive sources;
- reusing textures and disposing removed scene resources;
- avoiding antialiasing in the WebGL renderer and applying SMAA as a pass.

Recommended clone optimizations:

1. Replace per-section WebGL renderers with the single compositor described
   above. This is the largest remaining architectural improvement.
2. Bundle Draco/Basis decoders locally; do not depend on Google/jsDelivr at
   runtime.
3. Preload only hero + next scene, then maintain a three-scene window.
4. Cache GLTF/KTX2 promises and clone scene graphs rather than re-fetching.
5. Pause the render loop while the document is hidden.
6. Gate bloom/particles by quality and `prefers-reduced-motion`.
7. Use video posters and attach `<source>` only near the viewport.
8. Use `content-visibility: auto` and intrinsic sizes for deep editorial
   content.
9. Keep scroll handlers passive and perform all visual writes in one RAF.
10. Monitor long tasks, WebGL contexts, GPU memory and layout shifts in CI.

## 12. Recreation status in this repository

The Next.js implementation already uses the supplied original media, GLB,
Theatre and KTX2 assets. The reverse-engineering pass corrected these important
mechanisms:

- Theatre static overrides are now applied before dynamic tracks.
- Named GLTF clips are scrubbed from authored
  `animations.<clip>.progress` tracks rather than free-running by time.
- Clips marked `loop: true` (eyes, idle characters and similar secondary
  motion) remain real-time animations while explicit progress tracks stay
  scroll-scrubbed. Clip names are normalized across spaces, dots, hyphens and
  Theatre's underscore identifiers.
- Empty Theatre tracks are ignored instead of being interpreted as zero;
  placeholder `visibility` tracks therefore no longer hide whole characters.
- Section scroll progress is measured across the whole collection section.
- Scene backdrops use sticky viewport geometry.
- Pointer motion orbits the target at the source camera’s angular scale.
- Named-camera scenes now apply the source local position offset and
  quaternion pan/tilt, rather than translating the camera without rotating it.
- Scene lighting uses the source PMREM environment and Theatre-controlled
  red/blue point lights. A neutral ambient/key safety rig remains because the
  standalone composer otherwise renders several PBR figures nearly black,
  unlike the source HDR compositor.
- Particle geometry now uses the production shader model: per-particle
  velocity, wraparound motion, noise turbulence, size variation, radial alpha
  falloff and blinking. Authored particle count, color, scale and position are
  applied per scene.
- Bloom and full-frame darkening are driven from each scene’s `effects`
  Theatre object. The old always-on black gradients were removed.
- Scene canvases are mounted into one fixed viewport portal, so incoming and
  outgoing scenes cover the same frame instead of producing a horizontal seam.
  Incoming scenes use the exact `0.2 * viewportHeight` early-crossfade offset
  from Online onward.
- The Hero-to-Sidekick dust bridge is a fixed, scroll-linked 520-particle burst
  rather than a short strip of drifting DOM dots. The supplied
  `mud_normal.webp` has been extracted for the future single-context shader;
  an experimental CSS mud mask was removed because it could hide valid scenes
  during scrubbed transitions.
- The index rail switches at the midpoint of the same incoming transition
  used by the scene system, including the Online-onward early offset.
- Lenis uses the production exponential easing and one-second duration.
- Lenis/GSAP ticker cleanup removes the correct callback.
- Scene assembly now comes from one typed registry
  (`src/data/scenes.ts`) whose array order is the hydrated page's exact
  `backgroundAssets` order. A texture or video consumes a Theatre asset slot
  just like a GLB.
- KTX2 backdrops are now double-sided mesh planes with their intrinsic aspect
  ratio, authored `asset-N` position/rotation/scale, and source
  `responsive: cover|contain` multiplier. They are no longer assigned to
  `scene.background`.
- The Agentic order is corrected to foreground, background, book, props. This
  removes the viewport-sized book caused by applying the book transform to the
  props model and vice versa.
- Retail is corrected to environment, hub, midground, dome-video and uses the
  embedded `posxxlcamera` node.
- The HAR-only Online code, Retail dome and Marketing billboard manifests were
  extracted along with their WebM/fallback KTX2 assets. Their `frame` Theatre
  tracks now seek the corresponding video at 30 FPS.
- Hero now restores the production non-scroll intro: Theatre positions `0 → 1`
  animate over five seconds with a `power3.out` curve before scroll contributes
  the rest of the sequence. Camera roll and the title card remain in the same
  sticky composition.
- Direct hash navigation now lands on the correct scene assembly; for example,
  `/#sidekick` opens on the star field rather than leaving the Hero figures
  pinned over the section.

The current implementation still uses separate lazily mounted Three.js render
contexts inside the shared fixed portal. The source instead renders both scenes
into two targets owned by one context and runs the complete GLSL crossfade
(projected fade center, scene zoom, derivative edges and four-octave noise).
A smooth full-frame crossfade is used until the single dual-render-target
compositor can reproduce the mud-normal transition without masking away a
separate browser canvas. That compositor remains necessary for shader-identical
pixels and lower WebGL context pressure.

## Evidence map

- Hydrated DOM: `www.shopify.com/editions/winter2026.html`
- HAR: `www.shopify.com.har`
- Performance trace: `Trace-20260725T090737.json`
- Main route bundle:
  `reference/bundle-full/(_locale).editions.winter2026-DoG6UCXE.js`
- Renderer/effects bundle: `reference/bundle-full/Background-63vTryKN.js`
- Camera/asset bundle: `reference/bundle-full/Butterflies-BqVLbn8p.js`
- Per-scene bundles: `reference/bundle-full/*Scene*.js`
- Theatre states: `public/assets/3d/theatre/*.json`
- Original models/textures: `public/assets/3d/`
- Original editorial media: `public/assets/content/` and `public/assets/video/`
- Visual evidence: `reference/screenshots/`
