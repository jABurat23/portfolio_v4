# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
