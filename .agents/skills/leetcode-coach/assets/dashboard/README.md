# Coach dashboard

A read-only HUD over a leetcode-coach practice repo. It reads `db/*.jsonl`,
`sessions/`, `NOTES.md` and `TAGS.md` and renders the training record —
activity, ability, sessions, tags, timing.

**It never writes to the repo.** No git, no `db/` mutation, no file creation.
Everything it shows already exists on disk; if a number looks wrong, the record
is what's wrong.

## Running it

```bash
cd <skill>/assets/dashboard
npm install                                   # first run only
COACH_REPO_ROOT=/path/to/practice-repo npm run dev
```

Then open the printed URL (default <http://localhost:5273>).

| Command | What it does |
|---|---|
| `npm run dev` | Dev server against a real repo. Live-refreshes on any change under `db/` or `sessions/`. |
| `npm run demo` | Serves the bundled synthetic fixture instead — useful before the first real session. Banner marks it clearly. |
| `npm run build` | Type-check + production bundle into `dist/`. |
| `npm run preview` | Serve the built bundle; the data API is mounted here too. |
| `npm run typecheck` | `tsc --noEmit`. |

### Finding the repo

`COACH_REPO_ROOT` wins if set. Otherwise the plugin walks up from the dashboard's
own directory looking for a directory containing both `TAGS.md` and
`tools/coachdb.py` — which works when the skill is vendored inside the practice
repo (`.claude/skills/leetcode-coach/assets/dashboard`), but *not* when the skill
is installed globally. **Pass `COACH_REPO_ROOT` explicitly** and it always works.

If no repo is found the app says so rather than rendering a convincing zero.

## Layout

```
plugins/coachData.ts     Vite plugin: repo → GET /api/snapshot, plus file watching
src/lib/types.ts         Wire format — mirrors the coachdb JSONL rows
src/lib/analytics.ts     Derived metrics (port of coachdb.py's cmd_stats)
src/lib/palette.ts       Validated data-viz palette, by role
src/components/hud.tsx   Panels, stat tiles, legends, table twins, tooltips
src/components/charts.tsx  Hand-rolled SVG marks
src/views/               Overview · Ability · Sessions · Tags · Timing
scripts/make-demo-fixture.mjs  Regenerates fixtures/demo-snapshot.json
```

### Why the analytics are a port, not a call

`src/lib/analytics.ts` recomputes wall/active time, time-in-state, hint latency
and pause pairing in TypeScript, duplicating `tools/coachdb.py`'s `cmd_stats`.
That duplication is deliberate — the dashboard stays a pure static reader with
no Python subprocess — but it means **the two must be changed together**. Same
`BREAK_S` (1800s), same "a gap accrues to the state we were in", same "a pause's
`gap_s` sits on the event that ends it". A dashboard that quietly disagrees with
the debrief numbers is worse than no dashboard.

## Design

GitHub Primer as the design system, flat 2D game-UI treatment: 1px line art,
strict grid, no radii, no shadows, no soft gradients.

**Light and dark.** Light is the default; the header toggle switches and the
choice persists in `localStorage`. `prefers-color-scheme` is deliberately *not*
consulted, so the record looks the same on every machine it is opened on;
`index.html` applies the stored choice before first paint to avoid a flash.

### How colour is wired

`src/lib/primer.ts` holds the Primer primitives for both themes — numbered
`scale` ramps plus the semantic `color` roles — structured after
`primer/github-vscode-theme`'s `getTheme`, with values picked in the order that
theme documents:

1. **Semantic role** — `color.fg.default`, `color.border.muted` ← prefer
2. **Scale step** — `scale.blue[4]` ← when no role fits
3. **Literal hex** — exceptions only, with a comment saying why

`src/styles/theme.css` mirrors those as CSS custom properties per theme (each
annotated with its source), and `src/lib/palette.ts` hands components
`var(--token)` references rather than hex — so switching themes is pure CSS with
no re-render. That works in SVG presentation attributes (`fill={ACCENT}`) as
well as inline styles, because presentation attributes resolve as CSS
declarations.

`primer.ts` is the source of truth but is not what paints the page. **Change a
value there and change it in `theme.css` too.**

### The validated sets

Colour is computed, not chosen by eye. Every set was run through the dataviz
skill's `validate_palette.js` against its own surface. The dark palette is a
separately selected set, never an automatic inversion:

| Role | Light (on `#ffffff`) | Dark (on `#0d1117`) |
|---|---|---|
| Categorical (tag namespaces) | `blue[5]` `green[6]` `yellow[4]` — CVD ΔE **17.4**, normal-vision 26.6 | `blue[4]` `green[5]` `yellow[2]` — CVD ΔE **19.2**, normal-vision 28.4 |
| Ordinal — hint ladder L0→L4 | `yellow[3…7]` — light end 2.24:1 | `yellow[7…3]` — light end 2.06:1 |
| Ordinal — magnitude | `blue[3…7]` — light end 2.37:1 | `blue[7…3]` — light end 2.04:1 |
| Ordinal — activity heat | `green[3…7]` — light end 2.28:1 | `green[7…3]` — light end 2.06:1 |
| Status (outcomes) | `success.fg` `attention.fg` `severe.fg` `danger.fg` | same roles, dark values |

Ordinal ramps are ordered by **magnitude, not lightness**: light→dark on the
light theme, dark→light on the dark one. In both, *more* is further from the
surface. The activity heat's zero step is `canvas.subtle` — "no activity" is a
surface, not a hue step, so an empty day never reads as a low value.

### Three things to know before editing `palette.ts`

- **Chart marks use scale steps, not `.fg` roles.** Primer's `.fg` values are
  tuned for text contrast: most sit outside the viz lightness band, and some
  pairs collapse under CVD simulation — dark `success.fg` vs `attention.fg`
  measures ΔE 5.1 (protan), below even the 6.0 floor.
- **Dark `scale.yellow[2]` breaks the lightness band on purpose** (L 0.79 vs a
  0.67 top). Every in-band all-Primer alternative lands in the 6–8 CVD warn
  band (best measured 6.3), legal only with mandatory secondary encoding —
  trading a consistency guideline for a hard accessibility gate is the right way
  round. It is `yellow[2]` and not `yellow[3]` because `yellow[3]` *is*
  `attention.fg`, and a series colour must never double as a status token.
- **There are only three categorical slots.** Past three, neither theme's trio
  clears the all-pairs floor, so a fourth tag namespace folds into a neutral
  `other` rather than getting a generated hue.

Every chart has a table twin behind the `Table` toggle, and tooltips only ever
enhance a value that is already reachable another way.
