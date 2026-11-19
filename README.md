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

## Adding a Journey Zone

All scroll zones, lengths, HUD labels, and camera waypoints live in `src/config/journey.ts`. To append a new zone (for example Corridor or Void):

1. Add a new object to `journeyConfig.zones` with a unique `id`, a mono HUD `label` (e.g. `"[ 02 / CORRIDOR ]"`), its scroll distance `scrollVh` (in `svh` units), and an ordered list of `{ position, target }` camera waypoints.
2. The scroll spacer height (`getTotalJourneyVh()`), active HUD zone lookup (`getZoneAtProgress()`), and continuous `CatmullRomCurve3` camera path in `CameraRig` update automatically from config.

## Adding a Project Frame

All Corridor project entries and frame layout parameters live in `src/config/works.ts`. To add or edit a frame:

1. Append an object to `worksConfig.items` with a unique `id`, a `title`, a `caption`, and optional `image` / `url` fields.
2. Corridor frame placements (`CorridorScene`), alternating left/right camera waypoints (`buildCorridorWaypoints()`), Corridor scroll length (`items.length * vhPerFrame`), terrain length (`DuneTerrain`), HUD caption chip updates, and the screen-reader works list update automatically from config.

## Editing About and Contact

All closing Void zone text, links, particle counts, and panel fade timings live in config:

- **About copy:** edit `aboutConfig` in `src/config/about.ts`.
- **Contact links & button text:** edit `contactConfig.items` (`label`, `text`, `href`, `external`) and `backToStartLabel` in `src/config/contact.ts`. External links automatically open in a new tab with `rel="noopener noreferrer"`.
- **Void density & timing:** edit `voidConfig` in `src/config/void.ts` (`scrollVh`, desktop/mobile dot and dotted-line counts, drift speed, and scroll-progress fade windows for About, Contact, and `"BACK TO START"`).

## Versioning

This project follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`). Every change is recorded in `CHANGELOG.md`.

- **MAJOR** (`1.0.0`): Incompatible architectural or visual overhaul, e.g. replacing the 4-scene scroll world with a multi-page layout.
- **MINOR** (`0.2.0`): Backward-compatible feature addition, e.g. adding the Intro and Landscape 3D scenes.
- **PATCH** (`0.1.1`): Bug fix or minor polish without new features, e.g. fixing a focus-ring contrast issue or shader uniform typo.
