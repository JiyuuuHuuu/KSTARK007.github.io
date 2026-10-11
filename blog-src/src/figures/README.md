# Figures

Animated drawings for posts, one React component per file, grouped by post:
`src/figures/<slug>/<Name>.tsx`. They are meant to be written and maintained by
an agent; a human only places them in the post's `index.mdx`:

```mdx
import StaleRead from '@/figures/one-memory-many-machines/StaleRead';

<Figure title="The stale read, step by step" alt="…">
  <StaleRead client:visible />

  Caption in Markdown.
</Figure>
```

`client:visible` makes the figure interactive once it scrolls near the screen.
Without it the figure is rendered once at build time and never animates.

## Rules for a figure component

- **Default export, no required props.** Data comes from the post's `data.ts`
  (`import { X } from '@/content/posts/<slug>/data'`). Anything a reader might
  want to reword (step captions, tab labels, the numbers) belongs in `data.ts`,
  not in the component. Labels that are part of the drawing itself (axis labels,
  box names in a diagram) may stay in the component.
- **The figure draws; the page frames it.** Do not render a title, source line,
  caption, "Show the numbers" table or screen-reader description: `<Figure>`
  does all of that from `index.mdx`. Give the `<svg>` an `aria-label` (or use
  `Plot`, which takes `title`) and nothing longer.
- **Server-safe render.** The component is rendered to HTML at build time, so
  never touch `window`, `document`, `matchMedia` or `localStorage` during render;
  do it in `useEffect`, or use the hooks in `kit/`. The first render must be the
  "not yet shown" state (`shown === false`).
- **Respect reduced motion.** Use `useReducedMotion()` (or `useStepper`, which
  already does) so nothing autoplays for readers who asked for less motion. The
  global stylesheet also collapses CSS transitions for them.
- **Colours and type come from tokens**, never hex: `var(--color-ink)`,
  `var(--color-accent)`, chart series `var(--color-s1)` … `var(--color-s6)`, and
  Tailwind classes such as `fill-ink-faint`, `text-ink-muted`, `font-mono`.
  The tokens are defined in `src/styles/global.css`.
- **Analytics:** `track('event_name')` from `@/lib/analytics` on first manual use
  of a control, as the existing steppers do.

## The kit (`src/figures/kit/`)

| Module | Exports |
| --- | --- |
| `plot.tsx` | `usePlateReveal(amount?, fallbackWidth?)` → `{ ref, shown, width }` (attach `ref` to the root `<div>`); `makeFrame`, `Plot`, `AxisX`, `AxisY`, `Grid`, `Legend`, `DrawnPath`, `Annotation`; `scaleLinear`, `scaleLog`, `linearTicks`, `logTicks`, `logMinorTicks`, `linePath` |
| `stepper.tsx` | `useStepper({ count, holdMs, loop, autoplay, onFirstUse })` → `{ ref, step, go, togglePlay, playState, … }`; `StepperControls` (◀ / Play / ▶ and a scrubber) |
| `tip.tsx` | `useTip()` and `<Tip tip width height />` for hover tooltips |
| `motion.ts` | `useInView(ref, { amount, once })`, `useReducedMotion()` |

## Checking a figure

```sh
npx tsc --noEmit -p tsconfig.json   # errors about *.astro imports are expected; anything in your file is not
npm run dev                          # then open the post and watch it animate
```
