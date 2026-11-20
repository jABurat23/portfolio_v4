# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.1] - 2026-11-20

### Added

- `?shadows=0` and `?shadows=1` test query parameter (`src/config/quality.ts`, `src/lib/quality.ts`, `src/components/scene/SceneCanvas.tsx`, `src/components/scene/landscape/LandscapeScene.tsx`, `src/components/scene/landscape/DuneTerrain.tsx`, `src/components/scene/QualityController.tsx`, `README.md`) to toggle terrain shadow casting and receiving independently of quality tier and DPR.

### Changed

- Removed the dark backing plate behind the Hero blinking `TriangleIcon` (`src/components/ui/Hero.tsx`) and added a `1.5px` `#0A0A0A` outside SVG stroke painted behind the fill (`paintOrder: "stroke fill"`), keeping the centered position above the navbar, scroll fade-out, and reduced-motion static state.
- Removed all visible borders, rim overlay elements (`pill-nav__rim`), `--pn-edge` tokens, outlines, and box-shadows from the floating navbar (`src/components/ui/PillNav/PillNav.tsx`, `src/components/ui/PillNav/PillNav.css`), keeping only the `2px` `:focus-visible` keyboard ring and updating `AGENTS.md` and `README.md` accordingly.

## [0.13.0] - 2026-11-19

### Changed

- Removed the border from the intro `"SCROLL TO ENTER"` entry control (`src/components/ui/IntroOverlay.tsx`), keeping a `44px` minimum touch target, hover full-ink state, `2px` keyboard focus ring, and a centered blinking downward `TriangleIcon` (`weight="fill"`, rotated `180deg`) driven by `triangle-blink` (`src/app/globals.css`, static at full opacity under `prefers-reduced-motion`).
- Replaced the Hero scroll indicator (`src/components/ui/Hero.tsx`) with a borderless solid `#0A0A0A` backing plate containing the same blinking downward `TriangleIcon`.
- Flattened `PillNav` (`src/components/ui/PillNav/PillNav.tsx`, `PillNav.css`, `src/components/ui/SiteNavbar.tsx`, `src/config/nav.ts`) to sharp `0px` corners across the bar, items, hover fills, clip-paths, and `4px` square active dot (`nav` without logo bubble), centered cleanly down to `320px` wide.
- Renamed remaining Corridor frame layout configuration and focus helper terminology to `"stop"` (`stopSpacingZ`, `vhPerStop`, `CorridorStopFocus`, `getCorridorStopFocus`) in `src/config/works.ts`, `src/config/journey.ts`, `src/config/nav.ts`, and `src/components/ui/ProjectCard.tsx`.
- Recaptured `public/og.png` (`1200×630` PNG) showing `"AGUSTIN"` over the dithered landscape with no navbar or scroll indicator.
- Updated `AGENTS.md` and `README.md` for sharp corners with no exceptions, logo-free navigation, `TriangleIcon` scroll indicators, and `"stop"` corridor terminology.

### Removed

- Corridor 3D frame scenery (`src/components/scene/corridor/CorridorScene.tsx`, `CorridorFrame.tsx`, `placeholderTexture.ts`), its mount in `SceneCanvas.tsx`, and frame-only layout fields (`frameOffsetX`, `frameWidth`, `frameHeight`, `beamThickness`, `frameDepth`, `frameYaw`) in `src/config/works.ts`.
- Navigation logo slot, props, `next/image` rendering, spin/pop logic, and CSS rules from `SiteNavbar.tsx`, `PillNav.tsx`, `PillNav.css`, and `src/config/nav.ts`.
- `MouseScrollIcon` imports from `IntroOverlay.tsx` and `Hero.tsx` and unused `scroll-bob` animation from `src/app/globals.css`.

## [0.12.0] - 2026-11-19

### Added

- Page description (`"Portfolio of Agustin, an IT student at Cebu Technological University who likes building things."`) and canonical `siteConfig.url` (`"https://agustinportfolio.vercel.app"`) in `src/config/site.ts`.
- Root Next.js `metadataBase`, Open Graph tags (`website`, `1200×630` image), Twitter `summary_large_image` card (`src/app/layout.tsx`), and a `1200×630` two-tone dithered landscape preview image at `public/og.png`, plus `"Agustin"`-branded page titles on fallback, `404`, and error pages.
- Deep-link hash routing (`#home`, `#works`, `#about`, `#contact`) via `getNavTargetProgressForHash` (`src/config/nav.ts`), instant scene/Lenis/camera snapping (`IntroOverlay`, `ScrollManager`, `InteractiveWorld`, `CameraRig`, `scrollProgress.ts`), `history.replaceState` hash synchronization on navbar/logo clicks (`SiteNavbar`), `?intro=1#...` sequencing, and matching section IDs on `FallbackView`.
- `--color-line-strong` (`#4A4A4A`) Tailwind theme token (`src/app/globals.css`) for outer component boundaries.

### Changed

- Updated page `<title>` to `"Agustin | IT student and builder"` (`src/config/site.ts`, `src/app/layout.tsx`).
- Converted the intro `"SCROLL TO ENTER"` entry trigger (`src/components/ui/IntroOverlay.tsx`) into a bordered `>= 44px` `OutlinedButton` containing the animated Phosphor `MouseScrollIcon` while preserving wheel, trackpad, touch, full-dialog click, keyboard, and reduced-motion `ENTER` inputs.
- Brightened outer component borders (`OutlinedButton`, `ProjectCard`, `AsciiFrame`, `PillNav` bar/logo rim, and `global-error.tsx`) to `#4A4A4A` (`line-strong`) while reserving `#2A2A2A` (`line`) for decorative dividers and inner rules, and removed unused `gentle-pulse` CSS keyframes.
- Raised all readable UI text across buttons, Contact rows, `ProjectCard` titles/captions/placeholders/descriptions, `FallbackView`, `global-error.tsx`, and `PillNav` `sm` nav labels to at least `13px`.

## [0.11.1] - 2026-11-19

### Fixed

- **Intro wheel, trackpad, touch, click, and keyboard entry (`src/components/ui/IntroOverlay.tsx`, `src/config/intro.ts`):** Added window-level capture `wheel` handling that normalizes `deltaMode` and accumulates small trackpad deltas (`>= 16px`, either direction) once the reveal completes, added touch tap/swipe handling (`touchend`/`touchmove`) without synthetic double-clicks, enabled full-dialog click/tap entry, handled `Enter`/`Space`/`ArrowDown`/`PageDown` with `preventDefault()`, added a single-fire entry guard, and added a `readyFailsafeMs` (`2000ms`) timer so stalled scene or font readiness never blocks entry indefinitely.
- **Single assistive-tech content exposure (`src/components/ui/InteractiveWorld.tsx`, `src/components/ui/ProjectCard.tsx`, `src/components/ui/VoidPanels.tsx`):** Removed `aria-hidden="true"` from focusable panel/card containers, gated inactive overlays with `inert` and `visibility: hidden`, omitted `sr-only` summaries during the intro, and omitted active Corridor works, About, or Contact summaries from the `sr-only` backup regions while visible overlays are active so every item appears once in the accessibility tree and Contact links remain keyboard- and screen-reader-accessible.
- **Duplicate `"COMING SOON"` in placeholder cards (`src/components/ui/ProjectCard.tsx`):** Suppressed the redundant caption line when a card has no image or description and its caption is `"COMING SOON"`, keeping the framed placeholder box as the single `"COMING SOON"` indicator without changing cards with real images or descriptions.
- **Corridor and Void overlay fade timing (`src/config/works.ts`, `src/config/void.ts`):** Tightened fade windows (`focusHalfWindowSegments: 0.48`, `plateauRatio: 0.75`, and `aboutFadeInStart: 0.06` .. `backButtonFadeInEnd: 0.7`) so `ProjectCard`, About, Contact, and `"BACK TO START"` reach `1.0` opacity quickly, hold across clean plateaus, fade cleanly within `< 150px` of scroll, and never overlap between About and Contact.
- **Keyboard focus indicators (`src/app/globals.css`, `src/lib/interactive.ts`, `src/components/ui/PillNav/PillNav.css`):** Upgraded `:focus-visible` outlines across buttons, links, Contact rows, the intro prompt button, and `PillNav` items/toggles/logo to `2px` `#F2F2F2` with `2px` offset and zero overflow clipping.

## [0.11.0] - 2026-11-19

### Added

- Floating bottom-center `PillNav` navigation bar (`src/components/ui/PillNav/PillNav.tsx`, `PillNav.css`, `src/components/ui/SiteNavbar.tsx`) adapted from React Bits PillNav to TypeScript and flattened to solid `#0A0A0A` fills, `1px` `#2A2A2A` hairline borders, `#F2F2F2` active/hover indicators, and zero shadows or backdrop blur while retaining the `999px` pill silhouette.
- Navigation configuration (`src/config/nav.ts`) deriving scroll targets (`HOME`, `WORKS`, `ABOUT`, `CONTACT`) and active section lookup (`getActiveNavHref`) from `journeyConfig`, `worksConfig`, and `voidConfig`, backed by `getZoneProgressRange` in `src/config/journey.ts` and `scrollToProgress` in `src/lib/scrollProgress.ts` / `ScrollManager.tsx`.
- `@phosphor-icons/react` (`2.1.10`) regular dependency using direct Next.js RSC-safe per-icon imports (`MouseScrollIcon` for the animated `scroll-bob` scroll cues in `IntroOverlay` and `Hero`, and `ArrowUpRightIcon` for external links in `VoidPanels`, `ProjectCard`, and `FallbackView`).

### Changed

- Removed the `SKIP` button from `IntroOverlay` (`src/components/ui/IntroOverlay.tsx`, `src/config/intro.ts`); entry after the reveal works via wheel, touch swipe, click, or key, while the `prefers-reduced-motion` `ENTER` flow remains intact.
- Replaced the `"SCROLL"` text box in `Hero` (`src/components/ui/Hero.tsx`) with an animated hairline-framed `MouseScrollIcon` positioned above `SiteNavbar`.
- Replaced `"↗"` text glyphs on Contact rows and `"VIEW PROJECT"` links with `ArrowUpRightIcon`.
- Re-aimed Landscape camera waypoints (`src/config/journey.ts`) and Landscape directional lighting/shadow frustum (`src/config/landscape.ts`) to highlight dune silhouettes and corridor entry without monoliths.
- Raised `ProjectCard` mobile bottom clearance (`bottom-20`) and `VoidPanels` bottom padding (`pb-24 sm:pb-28`) so overlays clear the bottom floating navbar.
- Updated `AGENTS.md` approved dependencies list and `README.md` with navigation, icon, and React Bits license/credit documentation.

### Removed

- Monoliths component and configuration (`src/components/scene/landscape/Monoliths.tsx` and `monoliths` / `MonolithSpec` in `src/config/landscape.ts`).
- Legacy top-left zone label and bottom-left `SCROLL 000%` HUD (`src/components/ui/Hud.tsx`, `JourneyZone.label` in `src/config/journey.ts`, and `landscapeConfig.scrollHint` in `src/config/landscape.ts`).
- Intro `SKIP` button (`introConfig.skipLabel` and `handleSkip`).

## [0.10.0] - 2026-11-18

### Added

- Crisp HTML `ProjectCard` overlay (`src/components/ui/ProjectCard.tsx`) during corridor dwell on the opposite side of the active 3D frame on desktop and docked cleanly above the bottom HUD on narrow portrait screens, with local `/public/works/` image support, fixed aspect ratio, `"COMING SOON"` placeholder, `"VIEW PROJECT"` external link, and `inert`/`aria-hidden` focus gating.
- Optional `description` field and `card` focus/fade timing parameters (`focusHalfWindowSegments`, `plateauRatio`, `activeThreshold`) in `src/config/works.ts`.
- WebGL capability detection (`src/lib/webgl.ts`), error boundary (`src/components/ui/WebGLErrorBoundary.tsx`), `webglcontextlost`/`webglcontextcreationerror` handling in `SceneCanvas`, dynamic client-only loading of `InteractiveWorld` (`src/components/ui/InteractiveWorld.tsx`), and static zero-3D `FallbackView` (`src/components/ui/FallbackView.tsx`) testable via `?fallback=1`.
- Adaptive quality tier system (`src/config/quality.ts`, `src/lib/quality.ts`, `src/components/scene/QualityController.tsx`) monitoring post-intro/post-warmup rolling FPS, stepping down tiers (`0 -> 1 -> 2`) without Canvas remounts or React re-render storms while disposing shadow maps properly, persisting per-session in `sessionStorage`, and testable via `?quality=0|1|2`.
- Styled `404` (`src/app/not-found.tsx`), route error (`src/app/error.tsx`), and minimal inline-styled root `global-error.tsx` (`src/app/global-error.tsx`) pages.
- Consistent interactive hover, active/touch press, and `1px` `focus-visible` states (`>= 44px` tap height, full-row contact links with `↗` external indicator, reduced-motion instant transitions) centralized in `src/lib/interactive.ts` and `src/components/ui/OutlinedButton.tsx`.

### Changed

- Reworked the `DitherText` intro reveal (`src/config/intro.ts`, `src/components/ui/DitherText.tsx`) to a calm 4-second halo-bounded deterministic Bayer speckle pattern that only turns on monotonically before condensing into crisp `"AGUSTIN"` text with zero shimmer outside the letter area.
- Removed the legacy bottom-center corridor caption chip from `src/components/ui/Hud.tsx` (replaced by `ProjectCard`).
- Updated `README.md` with project card / `/public/works/` instructions, intro & quality tuning guides, and `?intro=1`, `?fallback=1`, `?quality=0..2` query parameters.

## [0.9.0] - 2026-11-18

First deployable preview release.

### Added

- Phase 8 pre-deploy hygiene & Vercel readiness:
  - Cross-platform `scripts/build.mjs` Node wrapper (`NODE_ENV=production` + `next build`) so `npm run build` works across Linux, macOS, and Windows without `cross-env`.
  - `"engines": { "node": ">=20.9.0" }` in `package.json` matching installed Next.js and tooling requirements.
  - Dark two-tone SVG favicon at `src/app/icon.svg` (`#0A0A0A` / `#F2F2F2`) and explicit `viewport` metadata (`themeColor: "#0A0A0A"`, `colorScheme: "dark"`) in `src/app/layout.tsx`.
  - **Run Locally** (Windows/macOS/Linux + `?intro=1` replay tip) and **Deploy** (Vercel import) sections in `README.md`.
- Phase 7 Void zone with About and Contact panels:
  - Content and tuning configs in `src/config/about.ts`, `src/config/contact.ts`, and `src/config/void.ts` (single source of truth for About copy, Email/GitHub/Instagram links, `"BACK TO START"` label, desktop/mobile dot & dotted-line counts, drift parameters, and panel fade windows).
  - Void 3D scene (`src/components/scene/void/VoidScene.tsx`, `VoidField.tsx`) rendering an `InstancedMesh` field of floating dots and dotted-line chains of dither-cell-sized cubes so elements survive the Bayer dither pass, with lower density chosen once at mount on narrow viewports, gentle drift, static `prefers-reduced-motion` support, and full resource disposal.
  - Void zone (`"[ 03 / VOID ]"`, `220svh`) in `src/config/journey.ts` rising off the causeway end (`getTerrainBounds` / `hasTerrainAt` in `terrainMath.ts`) plus `getVoidPanelsState` scroll timing helper.
  - Hairline-framed HTML overlays (`src/components/ui/VoidPanels.tsx`) displaying the About box followed by the Contact box (real `<a>` links with `target="_blank" rel="noopener noreferrer"` on external URLs) and `"BACK TO START"` button at the end (via Lenis `scrollTo(0)` or instant jump under `prefers-reduced-motion`), driven via DOM refs with `inert` and `aria-hidden` synchronization and mobile-safe HUD clearance.
  - Screen-reader plain-text About and Contact summary in `src/components/ui/ExperienceShell.tsx` without duplicating focusable links.
- Phase 6 Corridor zone (Works) and HUD updates:
  - Works configuration (`src/config/works.ts`) holding 3 placeholder entries (`"PROJECT 01"`..`"PROJECT 03"`, caption `"COMING SOON"`, unused optional `image`/`url`) and tunable corridor layout/causeway parameters (`getCorridorEndZ`).
  - Corridor 3D module (`src/components/scene/corridor/CorridorScene.tsx`, `CorridorFrame.tsx`, `placeholderTexture.ts`) rendering tall rectangular thin-box portals on alternating sides with shared geometries/materials and a procedural `CanvasTexture` gradient placeholder inside each slot.
  - Corridor zone (`"[ 02 / CORRIDOR ]"`) in `src/config/journey.ts` with auto-generated waypoints, `vhPerFrame` scroll distance, monotonic soft dwell easing (`remapCorridorProgress`, `mapProgressToCurveT`), and active frame focus lookup (`getCorridorFrameFocus`).
  - Zero-rerender bottom-center project caption chip (`"[ 01 ] PROJECT 01 // COMING SOON"`) in `src/components/ui/Hud.tsx` with solid `#0A0A0A` backing and `1px` `#2A2A2A` border, positioned to avoid overlapping `SCROLL 000%` on narrow viewports.
  - Screen-reader accessible `<section aria-label="Works" className="sr-only">` project list in `src/components/ui/ExperienceShell.tsx`.
- Phase 5 scroll-driven camera and HUD system:
  - Journey configuration (`src/config/journey.ts`) defining zones, scroll lengths in `svh`, camera waypoints, smooth scroll tuning (`lerp`, `wheelMultiplier`, native touch `syncTouch: false`), and pure helpers (`getTotalJourneyVh`, `getZoneAtProgress`).
  - Zero-re-render module-level scroll progress store (`src/lib/scrollProgress.ts`).
  - Shared `THREE.CatmullRomCurve3` `CameraRig` (`src/components/scene/CameraRig.tsx`) interpolating along journey waypoints with terrain-clearance clamping, subtle drift/parallax, immediate progress restoration on reload, and reduced-motion direct scroll tracking (zero drift/parallax/extra smoothing).
  - Client-only `ScrollManager` (`src/components/ui/ScrollManager.tsx`) wiring `lenis` into `gsap.ticker` and `ScrollTrigger` inside `gsap.context` with intro gating, scroll-to-top after intro, strict-mode cleanup, and native scroll fallback under `prefers-reduced-motion`.
  - Mono hairline `Hud` (`src/components/ui/Hud.tsx`) displaying active zone top-left and direct-DOM `SCROLL 000%` readout bottom-left.
- Installed regular dependencies `gsap` (`^3.15.1`, includes `ScrollTrigger`) and `lenis` (`^1.3.27`), updated `AGENTS.md` approved list and `README.md` zone guide.
- Phase 4 Landscape zone (`src/components/scene/landscape/LandscapeScene.tsx`, `DuneTerrain.tsx`, `Monoliths.tsx`, `terrainMath.ts`) featuring one-time procedural fBm rolling dunes (`src/lib/noise.ts`), grounded monolithic boxes, low-angle shadow-casting directional lighting, distance fog fading cleanly into the dither background, and Hero overlay (`src/components/ui/Hero.tsx`).
- Landscape configuration (`src/config/landscape.ts`) for terrain resolution, dune amplitude/frequency, monolith specs, light angle, fog bounds, and camera drift/parallax base magnitudes.
- Phase 3 intro scene and loader (`src/components/ui/IntroOverlay.tsx`, `src/components/ui/DitherText.tsx`, `src/components/ui/ExperienceShell.tsx`) with 3-second Bayer dither reveal of `"AGUSTIN"`, font/scene readiness gating, pulsing `"SCROLL TO ENTER"` prompt, `1.5s` Bayer dissolve into the 3D world, always-visible `"SKIP"` button, scroll locking, session-once playback (`?intro=1` override), screen-reader description, and `prefers-reduced-motion` static mode with `"ENTER"` button.
- Intro timing, wording, and session settings in `src/config/intro.ts`, plus shared Bayer threshold helper in `src/lib/bayer.ts`.
- Reusable two-tone ordered Bayer (4x4 and 8x8) dither post-processing pass using `three/addons` (`EffectComposer`, `RenderPass`, `ShaderPass`) in `src/components/scene/DitherPass.tsx` and `src/components/scene/ditherShader.ts`.
- Tunable dither configuration in `src/config/dither.ts` (`matrixSize`, `pixelSize`, `thresholdBias`, `contrast`, `maxDpr`, `backgroundColor`, `inkColor`).
- Flat ESLint configuration (`eslint.config.mjs`) using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- `eslint` and `eslint-config-next` as `devDependencies`, documented as dev-only in `AGENTS.md`.
- Separate `typecheck` script (`tsc --noEmit`) in `package.json` and `README.md`.

### Changed

- Bumped `package.json` version to `0.9.0`, switched `build` script to `node scripts/build.mjs`, standardized single lockfile on `package-lock.json`, and updated `.gitignore` for `out/`, `Thumbs.db`, `Desktop.ini`, `*.tsbuildinfo`, `.vercel`, `.turbo/`, `.aistudio/`, and `.playwright-cli/`.
- Updated `src/app/layout.tsx` to omit `<meta name="description">` while `siteConfig.description` is empty.
- Updated `terrainMath.ts` and `DuneTerrain.tsx` so the procedural terrain smoothly flattens beyond the far monoliths into a level corridor causeway spanning the full configured `worksConfig` length without modifying Landscape heights.
- Updated `LandscapeScene.tsx` directional light to track `camera.position.z` along the journey while keeping a single shadow-casting light, and adjusted `landscapeConfig.light.position` for readable portal face lighting.
- Updated `CameraRig.tsx` to use `mapProgressToCurveT` and `getPoint` for continuous Landscape-to-Corridor transition and corridor soft dwell easing (disabled under `prefers-reduced-motion`), and mounted `CorridorScene` in `SceneCanvas.tsx`.
- Documented adding project frames in `README.md`.
- Updated `Hero.tsx` to move the zone label into `Hud.tsx` and drive title upward drift, fade-out, and first-scroll hint dismissal straight from `scrollProgress` without React state re-renders.
- Updated `ExperienceShell.tsx` and `src/app/page.tsx` to wrap a fixed `h-dvh` canvas alongside an `svh` scroll spacer derived from `journeyConfig`, and updated `IntroOverlay.tsx` to expose `onStart` while preserving scroll position on same-session reloads.
- Updated `SceneCanvas.tsx` to mount `CameraRig` alongside `LandscapeScene` with `PCFShadowMap` shadows and `aria-hidden="true"`.
- Updated `DitherPass.tsx`, `SceneCanvas.tsx`, and `SceneLoader.tsx` to support `onReady` callbacks and `thresholdBiasRef` for zero-rerender dissolve transitions into the 3D world.
- Updated `SceneCanvas.tsx` to cap DPR (`dpr={[1, ditherConfig.maxDpr]}`), pause rendering when the browser tab is hidden (`visibilitychange`), and apply `DitherPass`.
- Hardened `DitherPass.tsx` and `ditherShader.ts` for hardware GPUs (`UnsignedByteType` render target, `sqrt` gamma conversion replacing `pow(0.0, ...)`, and per-frame drawing-buffer size sync).
- Updated `lint` script in `package.json` to run `eslint .`.
- Aligned `typescript` version to `^6.0.3` for compatibility with `eslint-config-next` (`typescript-eslint`).

### Removed

- Removed `bun.lock` so only `package-lock.json` tracks installed dependencies.
- Removed `src/components/scene/landscape/LandscapeCamera.tsx` (replaced by shared `src/components/scene/CameraRig.tsx`).
- Removed temporary Phase 2 `src/components/scene/DitherDemoSculpture.tsx` demo object and temporary Phase 1 style-check UI sections in `src/app/page.tsx` (preserving `AsciiFrame` and `OutlinedButton` for later phases).

## [0.1.0] - 2026-11-17

### Added

- Standing project rules in `AGENTS.md`.
- Project directory layout under `src/` (`app/`, `components/scene/`, `components/ui/`, `config/`, `lib/`).
- Tailwind v4 `@theme` design tokens (`#0A0A0A` background, `#F2F2F2` ink, `#7A7A7A` muted, `#2A2A2A` line) and global zero border-radius in `src/app/globals.css`.
- `JetBrains Mono` and `Inter` font configuration via `next/font/google` in `src/app/layout.tsx`.
- Global `prefers-reduced-motion` CSS rule and reduced-motion support in `RotatingCube`.
- Minimal `src/config/site.ts` configuration with site name `"AGUSTIN"` and empty/null placeholders.
- Reusable sharp-cornered mono UI primitives (`AsciiFrame`, `OutlinedButton`) and `cn` class helper.
- Temporary Phase 1 style-check page displaying color swatches, font specimens, ASCII frame, outlined button, and the 3D scene canvas.
- Project `README.md` with structure, scripts, and Semantic Versioning rules.

### Changed

- Moved R3F test components (`RotatingCube`, `SceneCanvas`, `SceneLoader`) into `src/components/scene/`.
- Updated `package.json` `build` script to enforce `NODE_ENV=production` so `npm run build` succeeds in environments defaulting to `NODE_ENV=development`.
