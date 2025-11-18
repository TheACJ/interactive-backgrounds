# interactive-backgrounds

A small collection of lightweight, zero-dependency React + TypeScript canvas backgrounds and micro-scenes intended for use as decorative, interactive full-viewport backgrounds in web apps and sites.

This repository exposes multiple ready-to-use background components that are easy to drop into a React app, configurable via props, responsive to light/dark theme, and designed for good runtime performance.

NOTE: All components are client-only and perform rendering inside useEffect. They are SSR-safe (won't access window on the server), but should be dynamically imported with SSR disabled when used in server-side rendering frameworks if you want to avoid shipping canvas markup on the server.

---

- Website: (your-site-here)
- Package: interactive-backgrounds
- License: MIT

---

Quick links
- API reference (included below)
- Theming & colors
- Performance & optimization
- Packaging & publishing to npm


## Install

When published, the package will be distributed as an npm package. During development you can import anything directly from the `src/` files.

Example (after publishing):

npm
```
npm install interactive-backgrounds
```

yarn
```
yarn add interactive-backgrounds
```

Peer dependencies
- react >= 17
- react-dom >= 17


## Usage

Basic usage — drop a background into your app root so it renders behind your content.

```tsx
import React from 'react';
import { AuroraBackground } from 'interactive-backgrounds';

export default function App() {
  return (
    <div>
      <AuroraBackground />
      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* app content */}
      </main>
    </div>
  );
}
```

All components are designed to be decorative. They render a full-viewport canvas and set pointer-events: none so UI interactions pass through to your app. To place content over the background set your content container to a higher z-index.


## Components (overview)

The library currently contains the following backgrounds (each implemented as a default-exported React component under `src/`):

- AuroraBackground — soft multicolor aurora-like waves with mouse distortion and click ripples.
- BinaryMatrixBackground — matrix-style falling glyph streams with flicker, trails and ripple interactions.
- ConstellationFieldBackground — particle field with connection lines, shooting stars and ephemeral constellation names.
- DNASparkBackground (2D) — stylized DNA strand spark lines (2D canvas version).
- DNASparkBackground3D — 3D DNA / spark visual implemented with three.js (kept optional as a heavier dependency).
- DreamyHaloBackground — soft radial halos and color bloom.
- FluidSmokeFlowBackground — flowing particle-based smoke trails.
- NebulaBackground — blended, soft nebula blobs and color gradients.
- OrbitClusterBackground — orbiting cluster nodes with parallax and gravity warp.
- ParticlesBackground — generic particles with connection lines and ripple interactions.
- QuantumWebBackground — particle web with entanglement-like glow and connection lines.
- TextParticlesBackground — animated particles that assemble into short glyphs/words.


## Theming & colors

All components integrate with the library's lightweight theme helper (`useColorMode`) to provide sensible light/dark defaults. If you do not pass color props, components will automatically choose colors appropriate for the current page theme.

If you want to control colors explicitly, pass standard CSS color strings (hex, rgb/rgba, hsl) to the color props on a component. When you omit color props the components call `useColorMode()` and pick theme-aware defaults.


## API reference — component props (summary)

Below are condensed prop references for the primary components. Each background accepts a number of optional props; all props have reasonable defaults and are fully optional.

Note: This README lists the most commonly used props. For full, up-to-date TypeScript types consult the source files in `src/`.


### AuroraBackground

Props (high level)
- mouseRadius?: number — radius of mouse distortion (default: 150)
- rippleColor?: string — color for click ripples
- layers?: number — number of aurora waveform layers
- waveSpeed?: number — global speed multiplier for waves
- className?: string — additional classes to apply to canvas

Description: Draws multiple sinusoidal layers with soft color blending. Mouse moves distort the waves and clicks create ripples.


### BinaryMatrixBackground

Props (high level)
- fontSize?: number — character pixel size (default: 18)
- fontFamily?: string — font for glyphs
- color?: string — base color for glyphs
- density?: number — controls number of columns (default: 0.05)
- trailLength?: number — trail length for columns
- flickerSpeed?: number — flicker modulation speed
- rippleColor?: string — color for click ripples

Description: Vertical streams of glyphs cascade down columns. Mouse proximity increases local activity and clicking emits ripples.


### ConstellationFieldBackground

Props (high level)
- particleCount?: number — number of particles (default: 120)
- particleColor?: string — color for particles
- connectionColor?: string — default color used for connection lines
- maxDistance?: number — maximum distance to draw a connection line
- shootingStarChance?: number — chance per frame to spawn a shooting star
- className?: string

Description: A star-field of particles that connect when nearby, with occasional shooting stars and ephemeral constellation labels.


### DNASparkBackground & DNASparkBackground3D

Props (high level)
- basePairCount?: number — number of base pairs across the helix
- helixRadius?: number — radius of DNA helix
- helixHeight?: number — vertical span of the helix
- particleCount?: number — count of spark/particle effects
- particleSize?: number | [min, max] — size or size range for sparks
- particleSpeed?: number | [min, max] — movement speed or range
- glowMultiplier?: number — glow radius multiplier for sparklers
- cameraOrbitRadius / cameraOrbitSpeed (3D only)

Note: The 3D background uses three.js; keep that in mind if you plan to bundle/import three.js conditionally.


### ParticlesBackground

Props (high level)
- particleCount?: number
- particleSizeMin?: number
- particleSizeMax?: number
- particleSpeedMultiplier?: number
- connectionDistance?: number
- connectionOpacityMultiplier?: number
- rippleMaxRadius?: number

Description: General-purpose particle system with connection lines and interaction ripples.


### QuantumWebBackground

Props (high level)
- quantumColor?: string
- normalColor?: string
- densityDivisor?: number — controls particle density (derived from viewport area)
- velocityMultiplier?: number
- speedRange?: [min,max]
- phaseNoise?: number
- velocityDamping?: number
- connectionDistance?: number
- connectionBaseOpacity?: number
- connectionPulseRate?: number
- connectionStrengthRange?: [min,max]
- glowMultiplier?: number

Description: A particle web with entanglement-style glow on select "quantum" particles and pulsing connection lines. Uses theme-aware color defaults when colors are omitted.


### DreamyHaloBackground, FluidSmokeFlowBackground, NebulaBackground, OrbitClusterBackground, TextParticlesBackground

Each of these components exposes a set of props to control counts, sizes, speeds, color ranges and interaction parameters. See the source in `src/` for exact TypeScript interfaces.


## Accessibility & SSR

Accessibility
- These backgrounds are decorative. Mark canvases as `aria-hidden="true"` or `role="presentation"` where appropriate.
- Keep pointer-events: none on the canvas so it does not intercept clicks or focus.
- Consider exposing a `paused` / `reducedMotion` prop (recommended enhancement) to let users pause animations or reduce complexity for motion-sensitive users.

Server-side rendering
- Components do their rendering inside `useEffect` and will not run on the server. If you prefer not to include the canvas markup in server-rendered HTML, import components dynamically with SSR disabled (Next.js dynamic import with { ssr: false }).


## Performance & best practices

- Device pixel ratio: For sharp rendering on high-DPI screens multiply logical canvas size by devicePixelRatio and scale the 2D context appropriately. This increases pixel work and GPU/CPU cost so make it optional.
- Provide a `reducedMotion` or `performanceMode` control for low-power devices. When enabled reduce particle counts, disable heavy effects (glows, trails) and lower frame rates.
- Avoid extremely high particle counts (n > 200) for components that perform O(n^2) neighbor checks; implement a spatial grid/quadtree before increasing counts beyond ~200.
- Throttle or sample input events — the current implementation stores the latest mouse position in a ref and reads it each animation frame which is efficient.
- Consider lazy-mounting backgrounds (render only after first paint) to avoid competing for CPU while the page loads.


## Packaging & publishing

A minimal publish pipeline is included in the repository documentation and examples.

1. Build output: produce `cjs` and `esm` bundles and TypeScript declarations (`.d.ts`). Prefer `tsup` or `rollup`.
2. Mark `react` and `react-dom` as `peerDependencies` in package.json.
3. Keep build output in `dist/` and include `types` field in package.json.
4. Add a license and README (this file). Add a minimal CHANGELOG.
5. Publish: `npm publish --access public` (after `npm login`).

Suggested scripts in package.json

```json
"scripts": {
  "build": "tsup src/index.ts --format cjs,esm --dts --out-dir dist --clean",
  "typecheck": "tsc --noEmit"
}
```


## Quickstart — copy/paste package.json & scripts

If you want a minimal, copy-paste starting point for packaging and Storybook, add the following to your project's `package.json` (merge with existing fields):

```json
{
  "name": "interactive-backgrounds",
  "version": "0.1.0",
  "private": false,
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --out-dir dist --clean",
    "typecheck": "tsc --noEmit",
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build",
    "prepare": "husky install"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "devDependencies": {
    "tsup": "^6.0.0",
    "typescript": "^4.0.0",
    "storybook": "^7.0.0",
    "@storybook/react-vite": "^7.0.0"
  }
}
```

Notes:
- `tsup` is recommended for simple bundling + declaration generation. Replace with `rollup` if you need fine-grained control.
- The `storybook` script assumes Storybook 7+ CLI is installed as `storybook` (preferred) — if using the older CLI name `start-storybook`, replace accordingly.
- Add `react` and `react-dom` as peerDependencies so consumers provide them.


## Development

- Build locally and run a small demo to visually validate each background.
- Use Storybook to produce interactive stories and prop knobs to test visual permutations.
- Add `jest-canvas-mock` when adding automated tests that mount components.


## Examples

Example: theme-aware QuantumWebBackground

```tsx
import React from 'react';
import QuantumWebBackground from 'interactive-backgrounds/QuantumWebBackground';

export default function Demo() {
  return (
    <div>
      <QuantumWebBackground densityDivisor={4000} glowMultiplier={4} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* app UI */}
      </div>
    </div>
  );
}
```

Example: reduce complexity for mobile

```tsx
<ParticlesBackground particleCount={40} connectionDistance={80} />
```


## Contributing

Contributions are welcome. Recommended workflow:

1. Fork and create a branch for your change.
2. Add or update tests and Storybook stories for visual changes.
3. Keep changes small and focused; large visual edits should be reviewed with screenshots or GIFs.
4. Open a PR with a clear explanation and screenshots.


## License

MIT — see LICENSE file.


## Where to get help

Open an issue on the repository describing the problem with steps to reproduce and include browser/version information when relevant.


---
