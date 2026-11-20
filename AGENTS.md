# AGENTS.md

Standing project rules for the **AGUSTIN** portfolio. All future work must follow these rules.

## 1. Dependencies

- Approved dependencies **ONLY**:
  - `next`
  - `react`
  - `react-dom`
  - `typescript`
  - `tailwindcss` (with `@tailwindcss/postcss`)
  - `three`
  - `@react-three/fiber`
  - `@react-three/drei`
  - `gsap` (includes `ScrollTrigger`)
  - `lenis`
  - `@phosphor-icons/react`
  - `eslint` (dev-only)
  - `eslint-config-next` (dev-only)
- Never add any other dependency. If another package would help, propose it in the report instead of installing it.

## 2. Code Standards

- Write clean, readable, small components with clear names and explicitly typed props.
- Keep zero dead code (no unused exports, files, variables, or commented-out blocks).
- Add comments only where intent is not obvious.
- All configuration lives under `src/config/`.

## 3. Design System

- Dark theme only (`#0A0A0A` background, `#F2F2F2` ink, `#7A7A7A` muted, `#2A2A2A` line, `#4A4A4A` strong line).
- Sharp corners everywhere (`border-radius: 0`, no exceptions, including navigation).
- `1px` hairline borders only (`#2A2A2A` inner dividers, `#4A4A4A` outer boundaries, except the navbar which has no border).
- No box shadows and no gradients.
- Typography: `JetBrains Mono` for ASCII headers, labels, and UI details; `Inter` for body text.
- Two-tone dithered aesthetic in 3D scenes.

## 4. Content Integrity

- Never invent personal information, biography details, projects, metrics, or external links.
- Use clearly marked placeholders until real data is provided.

## 5. Accessibility

- Use semantic HTML landmarks and elements (`main`, `section`, `header`, `button`, `a`).
- Ensure full keyboard navigability and visible focus indicators.
- Respect `prefers-reduced-motion` in both CSS and 3D/animation loops.

## 6. Versioning

- Follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
- Log every change in `CHANGELOG.md` under `[Unreleased]` or a versioned release heading.

## 7. Reporting Honesty

- In every report, explicitly state what was verified (e.g., build, typecheck, server response, headless browser checks) and what could not be verified (e.g., interactive inspection in a real user browser).
