/**
 * The data-viz palette, as theme-agnostic CSS custom property references.
 *
 * Every export is a `var(--token)` string rather than a hex value, so both
 * themes are one CSS swap and no component re-renders to change colour. This
 * works in SVG presentation attributes (`fill={ACCENT}`) as well as inline
 * styles, because presentation attributes resolve as CSS declarations.
 *
 * The literal values behind these tokens live in `styles/theme.css`, sourced
 * from `primer.ts`. Both themes were validated independently — a dark palette
 * is never an automatic flip of the light one:
 *
 *                        light (on #ffffff)         dark (on #0d1117)
 *   categorical   blue[5]/green[6]/yellow[4]   blue[4]/green[5]/yellow[2]
 *                  CVD ΔE 17.4 · norm 26.6      CVD ΔE 19.2 · norm 28.4
 *   hint ladder          yellow[3…7]                  yellow[7…3]
 *   magnitude              blue[3…7]                    blue[7…3]
 *   activity heat         green[3…7]                   green[7…3]
 *
 * Ordinal ramps run light→dark on the light theme and dark→light on the dark
 * one: in both, *more* is further from the surface. The token names below are
 * ordered by magnitude, not by lightness.
 */

// ── surfaces & ink (semantic roles) ─────────────────────────────────────────
export const SURFACE = 'var(--color-panel)'; //     canvas.default
export const CANVAS = 'var(--color-canvas)'; //     canvas.inset
export const LINE = 'var(--color-line)'; //         border.default
export const LINE_MUTED = 'var(--color-line-muted)'; // border.muted
export const INK = 'var(--color-ink)'; //           fg.default
export const INK_MUTED = 'var(--color-ink-muted)'; // fg.muted
export const INK_SUBTLE = 'var(--color-ink-subtle)'; // fg.subtle

/**
 * Categorical — tag namespaces. Fixed order, never cycled.
 *
 * There is no fourth slot: past three, neither theme's trio clears the
 * all-pairs CVD floor, so a fourth namespace folds into `other`. Neither yellow
 * is its theme's `attention.fg` — a series colour must never double as a
 * status token.
 */
export const CATEGORICAL = {
  structure: 'var(--color-cat-structure)',
  technique: 'var(--color-cat-technique)',
  weakness: 'var(--color-cat-weakness)',
  other: INK_SUBTLE, // unnamespaced tags (e.g. #design) stay neutral
} as const;

export type Namespace = keyof typeof CATEGORICAL;

export const namespaceColor = (ns: string): string =>
  (CATEGORICAL as Record<string, string>)[ns] ?? CATEGORICAL.other;

/** Ordinal — hint ladder L0→L4, weakest nudge to full reveal. */
export const HINT_RAMP = [
  'var(--color-hint-0)',
  'var(--color-hint-1)',
  'var(--color-hint-2)',
  'var(--color-hint-3)',
  'var(--color-hint-4)',
] as const;

export const hintColor = (level?: string): string => {
  const i = level ? Number.parseInt(level.replace(/^L/i, ''), 10) : Number.NaN;
  return Number.isFinite(i) ? (HINT_RAMP[Math.min(Math.max(i, 0), 4)] ?? INK_SUBTLE) : INK_SUBTLE;
};

/** Ordinal — generic magnitude, low → high. */
export const SEQUENTIAL = [
  'var(--color-seq-1)',
  'var(--color-seq-2)',
  'var(--color-seq-3)',
  'var(--color-seq-4)',
  'var(--color-seq-5)',
] as const;

/** The single accent used when one series is the point. */
export const ACCENT = 'var(--color-accent)';

/**
 * Ordinal — activity heat, none → most.
 * Index 0 is `canvas.subtle`: "no activity" is a surface, not a hue step, so an
 * empty day never reads as a low value.
 */
export const HEAT = [
  'var(--color-heat-0)',
  'var(--color-heat-1)',
  'var(--color-heat-2)',
  'var(--color-heat-3)',
  'var(--color-heat-4)',
  'var(--color-heat-5)',
] as const;

/**
 * Status — reserved semantic roles, never a series colour. Always shipped with
 * a glyph + label so meaning never rides on hue alone.
 */
export const STATUS = {
  'solved-optimal': 'var(--color-ok)', //        success.fg
  'solved-suboptimal': 'var(--color-attention)', // attention.fg
  revealed: 'var(--color-severe)', //            severe.fg
  unsolved: 'var(--color-danger)', //            danger.fg
} as const;

/** Monochrome glyphs that carry outcome meaning without colour. */
export const OUTCOME_GLYPH: Record<string, string> = {
  'solved-optimal': '◆',
  'solved-suboptimal': '◇',
  revealed: '△',
  unsolved: '×',
};

export const outcomeColor = (outcome?: string): string =>
  (STATUS as Record<string, string>)[outcome ?? ''] ?? INK_SUBTLE;

/** Bucket a 0..1 intensity onto the heat ramp. 0 stays on the empty surface. */
export function heatStep(intensity: number): string {
  if (intensity <= 0) return HEAT[0];
  const i = Math.min(HEAT.length - 1, Math.max(1, Math.ceil(intensity * (HEAT.length - 1))));
  return HEAT[i];
}

/** Bucket a 0..1 intensity onto the sequential ramp. */
export function seqStep(intensity: number): string {
  const i = Math.min(
    SEQUENTIAL.length - 1,
    Math.max(0, Math.round(intensity * (SEQUENTIAL.length - 1))),
  );
  return SEQUENTIAL[i];
}
