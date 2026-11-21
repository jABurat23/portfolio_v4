# AGUSTIN

Minimal 3D scroll-driven portfolio foundation built with Next.js App Router, TypeScript, Tailwind CSS v4, and React Three Fiber.

## Folder Structure

```text
src/
├── app/                # Next.js App Router entry, layout, global styles, pages
├── components/
│   ├── scene/          # Client-only 3D canvas and Three.js / R3F components
│   └── ui/             # Reusable dark mono UI primitives
├── config/             # Site and scene configuration
└── lib/                # Shared TypeScript helpers
```

## Scripts

- `npm run dev` — Start the Next.js development server on port `3000` (`0.0.0.0`).
- `npm run build` — Build the production Next.js bundle (`node scripts/build.mjs`, sets `NODE_ENV=production` across Windows, macOS, and Linux).
- `npm run start` — Serve the production build on port `3000` (`0.0.0.0`).
- `npm run lint` — Run ESLint across the project (`eslint .`).
- `npm run typecheck` — Run TypeScript typechecking (`tsc --noEmit`).

## Run Locally

Requires **Node.js `>=20.9.0`** and `npm` (the same commands work in Windows PowerShell/Command Prompt, macOS Terminal, and Linux shells):

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000` in your browser.

To run the production build locally:

```bash
npm run build
npm run start
```

The intro plays once per browser session; append `?intro=1` (e.g. `http://localhost:3000/?intro=1`) to replay it at any time.

## Deploy

The site is a static-capable Next.js App Router portfolio with zero required runtime environment variables.

1. Push this repository to GitHub (keep `package-lock.json` as the single lockfile).
2. Import the repository into [Vercel](https://vercel.com/).
3. Keep the automatically detected **Next.js** framework settings (Build Command `npm run build`, Output Directory `.next`, Install Command `npm ci` / `npm install`).
4. Leave Environment Variables empty and click **Deploy** to publish a preview deployment.

## Test Query Parameters

- `?intro=1` — Replay the Bayer intro sequence even if it has already played in the current browser session.
- `?fallback=1` — Force the static zero-3D fallback page (skips downloading Three.js, React Three Fiber, GSAP, and Lenis bundles).
- `?quality=0`, `?quality=1`, or `?quality=2` — Force a specific rendering quality tier (disables automatic FPS step-down for the load).
- `?shadows=0` or `?shadows=1` — Force terrain shadow casting and receiving off (`0`) or on (`1`) without changing DPR, pixel size, or any other setting (works together with `?quality=`).
- `?stars=0` or `?stars=1` — Force distant sky stars off (`0`) or on (`1`, default) for comparison (works together with `?quality=`).
- `?nav=idle` or `?nav=awake` — Pin the floating navbar in its resting (`idle`) or expanded (`awake`) state for side-by-side comparison.

## Intro & Adaptive Quality Settings

- **Intro inputs & tuning:** once the 4-second Bayer reveal completes, any of the following enters the 3D scene: mouse wheel or small trackpad scroll deltas (in either direction), touch swipe or tap, clicking or tapping anywhere on the intro dialog, or pressing `Enter`, `Space`, `ArrowDown`, or `PageDown` (with `prefers-reduced-motion`, click/activate the static `ENTER` button). Tune timing and thresholds in `src/config/intro.ts` (`revealDurationMs`, `revealHaloRadiusCells`, `startSpeckleDensity`, `maxSpeckleDensity`, `dissolveDurationMs`, `wheelThresholdPx`, `readyFailsafeMs`).
- **Quality tiers:** edit `src/config/quality.ts` (`tiers` for DPR cap, shadow map size/toggle, and `starCountMultiplier`, plus `warmupMs`, `sampleWindowMs`, `fpsThreshold`, `consecutiveLowSamplesRequired`, and `cooldownMs`). The chosen tier persists per browser session in `sessionStorage`.

## Adding a Journey Zone

All scroll zones, lengths, and camera waypoints live in `src/config/journey.ts`. To append a new zone:

1. Add a new object to `journeyConfig.zones` with a unique `id`, its scroll distance `scrollVh` (in `svh` units), and an ordered list of `{ position, target }` camera waypoints.
2. The scroll spacer height (`getTotalJourneyVh()`), progress ranges (`getZoneProgressRange()`), active zone lookup (`getZoneAtProgress()`), and continuous `CatmullRomCurve3` camera path in `CameraRig` update automatically from config.

## Navigation & Icons

- **Floating Navbar & Deep Links (`src/config/nav.ts`, `src/components/ui/SiteNavbar.tsx`):**
  - `navConfig.items` (`HOME`, `WORKS`, `ABOUT`, `CONTACT`) computes each item's `targetProgress` directly from `getZoneProgressRange()` (`src/config/journey.ts`), `worksConfig.items.length`, and `voidConfig.panels`.
  - `getActiveNavHref(progress)` highlights the matching item with a `4px` square dot as the user scrolls; clicking any item calls `scrollToProgress()` (`src/lib/scrollProgress.ts`) and updates the URL hash via `history.replaceState` without adding browser history entries.
  - Opening the site with `#home`, `#works`, `#about`, or `#contact` skips the intro once the 3D scene is ready and jumps directly to the matching section (reusing `getNavTargetProgressForHash()`). Unknown hashes fall back to the normal intro; combining `?intro=1` with a valid hash plays the intro first before jumping to that hash target. Matching section IDs (`#home`, `#about`, `#works`, `#contact`) are also wired on `FallbackView`.
  - `SiteNavbar` renders a sharp (`border-radius: 0`), logo-free bar that switches cleanly between `sm` (`< 768px`, sized to fit narrow viewports down to `320px` with `13px` labels) and `md` (`>= 768px`) without collapsing to a menu button (`collapse="never"`).
  - **Idle & awake behavior (`navConfig.idle` in `src/config/nav.ts`):** after the intro finishes and the navbar mounts, it stays awake for `introHintMs` (`2500ms`), then settles to an anchored bottom-center idle state (`scale: 0.82` on fine pointers, `touchScale: 0.9` on `pointer: coarse` screens, `labelOpacity: 0.45`, solid `#0A0A0A` bar opacity untouched while `fadeSurface: false`) with `transitionMs: 260` ease-out transitions. Hovering inside the bar or its `hitPaddingPx: 12` transparent hit padding (`hoverLeaveDelayMs: 350`), tabbing into it with keyboard focus (`focusLeaveDelayMs: 150`), or tapping on touch (`pointerdown` wakes before `click`, settling after `touchRestDelayMs: 2500`) restores full `1.0` scale and label contrast immediately. Under `prefers-reduced-motion`, transitions are disabled and idle dims labels without scaling. Tune all timing/visual keys (`scale`, `touchScale`, `labelOpacity`, `fadeSurface`, `transitionMs`, `introHintMs`, `hoverLeaveDelayMs`, `focusLeaveDelayMs`, `touchRestDelayMs`, `hitPaddingPx`, `queryParam`) in `src/config/nav.ts`.
- **Phosphor Icons (`@phosphor-icons/react`):**
  - `TriangleIcon` (`@phosphor-icons/react/dist/ssr/Triangle`, `fill` weight, rotated `180deg`, `12px` in `IntroOverlay` entry button subtitle and directly over the canvas in `Hero` with a `#0A0A0A` outside SVG stroke) — animated with `triangle-blink` (`src/app/globals.css`, static at full opacity under `prefers-reduced-motion`).
  - `ArrowUpRightIcon` (`@phosphor-icons/react/dist/ssr/ArrowUpRight`, `regular` weight, `14px`) — external link indicator on Contact rows (`VoidPanels`, `FallbackView`) and `"VIEW PROJECT"` buttons (`ProjectCard`, `FallbackView`).

## Adding a Project

All Corridor project entries, card focus timing, and stop layout parameters live in `src/config/works.ts`. To add or edit a project:

1. Append or update an object in `worksConfig.items` with:
   - `id` (unique string) and `title` (required)
   - `caption` (short uppercase status/tagline shown when `description` is omitted)
   - `description` (optional body copy shown in the HTML card and fallback view)
   - `image` (optional local path under `/public/works/`, written as `"/works/filename.png"`; external image URLs are ignored)
   - `url` (optional external link rendering the `"VIEW PROJECT"` outlined button)
2. Alternating left/right camera waypoints (`buildCorridorWaypoints()`), Corridor scroll length (`items.length * vhPerStop`), flattened causeway terrain (`DuneTerrain`), crisp HTML cards (`ProjectCard`), static fallback works list (`FallbackView`), and the screen-reader works list update automatically from config.

## Editing About and Contact

All closing Void zone text, links, particle counts, and panel fade timings live in config:

- **About copy:** edit `aboutConfig` in `src/config/about.ts`.
- **Contact links & button text:** edit `contactConfig.items` (`label`, `text`, `href`, `external`) and `backToStartLabel` in `src/config/contact.ts`. External links automatically open in a new tab with `rel="noopener noreferrer"`.
- **Void density & timing:** edit `voidConfig` in `src/config/void.ts` (`scrollVh`, desktop/mobile dot and dotted-line counts, drift speed, and scroll-progress fade windows for About, Contact, and `"BACK TO START"`).
- **Sky stars (`src/config/sky.ts`, `src/components/scene/sky/SkyStars.tsx`):** distant sky-only stars follow `camera.position` (zero parallax) across the Hero, Landscape, Corridor, and Void behind `VoidField`. Vertex snapping locks `1×1` (`85%`) and `2×2` (`15%`) star quads onto `DitherPass`'s Bayer sample grid at `ditherConfig.pixelSize * dpr`. Edit `src/config/sky.ts` for `seed`, `domeRadius` (`135`), `cameraFar` (`220`), `minElevationDeg` (`-10`), `maxElevationDeg` (`42`), `twoCellRatio` (`0.15`), `narrowBreakpointPx` (`768`), `narrowCountScale` (`0.55`), `driftRadiansPerSec` (`0.0025`), `queryParam` (`"stars"`), and per-zone `keyframes` (`140` Landscape start → `320` Corridor start → `620` Void start → `820` Void end on desktop). Star counts scale by `qualityConfig.tiers[tier].starCountMultiplier` (`1`, `0.6`, `0.35`), and rotation stops completely under `prefers-reduced-motion`.

## Metadata, Preview Image & Theme Tokens

- **Site Title, Description & URL (`src/config/site.ts`, `src/app/layout.tsx`):** update `siteConfig.title`, `siteConfig.description`, `siteConfig.url` (used as `metadataBase` and Open Graph canonical URL), and `siteConfig.ogImage`.
- **Social Preview Image (`public/og.png`):** replace `public/og.png` (`1200×630` PNG) to update Open Graph and `summary_large_image` Twitter link previews.
- **Border Tokens (`src/app/globals.css`):** `--color-line-strong` (`#4A4A4A`, `border-line-strong`) styles outer component boundaries (`OutlinedButton`, `ProjectCard`, `AsciiFrame`), while `--color-line` (`#2A2A2A`, `border-line`) is reserved for decorative dividers and inner rules. The floating navbar (`SiteNavbar`) intentionally has no border.

## Credits

- **PillNav (`src/components/ui/PillNav/`):** Adapted from **React Bits** `PillNav` (converted to TypeScript and flattened to the AGUSTIN dark hairline palette). Please check **React Bits'** current license terms before publishing or redistributing this component.

## Versioning

This project follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`). Every change is recorded in `CHANGELOG.md`.

- **MAJOR** (`1.0.0`): Incompatible architectural or visual overhaul, e.g. replacing the 4-scene scroll world with a multi-page layout.
- **MINOR** (`0.2.0`): Backward-compatible feature addition, e.g. adding the Intro and Landscape 3D scenes.
- **PATCH** (`0.1.1`): Bug fix or minor polish without new features, e.g. fixing a focus-ring contrast issue or shader uniform typo.
