/**
 * GitHub Primer primitives — `light` and `dark`.
 *
 * Structured after `primer/github-vscode-theme`'s `getTheme`: numbered `scale`
 * ramps plus the semantic `color` roles built on top of them, named exactly as
 * Primer names them so any value can be traced back to its source.
 *
 * Values are picked in the order that theme documents:
 *
 *   1. Semantic role   — `color.fg.default`, `color.border.muted`   ← prefer
 *   2. Scale step      — `scale.blue[4]`                            ← when no role fits
 *   3. Literal hex     — exceptions only, and only with a comment saying why
 *
 * This module is the **source of truth**, but it is not what paints the page:
 * `styles/theme.css` mirrors these values as CSS custom properties per theme,
 * and `palette.ts` hands components `var(--token)` references so switching
 * themes is pure CSS. Change a value here and change it there.
 */

/** Numbered ramps, 0 (lightest) → 9 (darkest). */
export const scale = {
  light: {
    black: '#1f2328',
    white: '#ffffff',
    gray: ['#f6f8fa', '#eaeef2', '#d0d7de', '#afb8c1', '#8c959f', '#6e7781', '#57606a', '#424a53', '#32383f', '#24292f'],
    blue: ['#ddf4ff', '#b6e3ff', '#80ccff', '#54aeff', '#218bff', '#0969da', '#0550ae', '#033d8b', '#0a3069', '#002155'],
    green: ['#dafbe1', '#aceebb', '#6fdd8b', '#4ac26b', '#2da44e', '#1a7f37', '#116329', '#044f1e', '#003d16', '#002d11'],
    yellow: ['#fff8c5', '#fae17d', '#eac54f', '#d4a72c', '#bf8700', '#9a6700', '#7d4e00', '#633c01', '#4d2d00', '#3b2300'],
    orange: ['#fff1e5', '#ffd8b5', '#ffb77c', '#fb8f44', '#e16f24', '#bc4c00', '#953800', '#762c00', '#5c2200', '#471700'],
    red: ['#ffebe9', '#ffcecb', '#ffaba8', '#ff8182', '#fa4549', '#cf222e', '#a40e26', '#82071e', '#660018', '#4c0014'],
    purple: ['#fbefff', '#ecd8ff', '#d8b9ff', '#c297ff', '#a475f9', '#8250df', '#6639ba', '#512a97', '#3e1f79', '#2e1461'],
  },
  dark: {
    black: '#010409',
    white: '#ffffff',
    gray: ['#f0f6fc', '#c9d1d9', '#b1bac4', '#8b949e', '#6e7681', '#484f58', '#30363d', '#21262d', '#161b22', '#0d1117'],
    blue: ['#cae8ff', '#a5d6ff', '#79c0ff', '#58a6ff', '#388bfd', '#1f6feb', '#1158c7', '#0d419d', '#0c2d6b', '#051d4d'],
    green: ['#aff5b4', '#7ee787', '#56d364', '#3fb950', '#2ea043', '#238636', '#196c2e', '#0f5323', '#033a16', '#04260f'],
    yellow: ['#f8e3a1', '#f2cc60', '#e3b341', '#d29922', '#bb8009', '#9e6a03', '#845306', '#693e00', '#4b2900', '#341a00'],
    orange: ['#ffdfb6', '#ffc680', '#ffa657', '#f0883e', '#db6d28', '#bd561d', '#9b4215', '#762d0a', '#5a1e02', '#3d1300'],
    red: ['#ffdcd7', '#ffc1ba', '#ffa198', '#ff7b72', '#f85149', '#da3633', '#b62324', '#8e1519', '#67060c', '#490202'],
    purple: ['#eddeff', '#e2c5ff', '#d2a8ff', '#bc8cff', '#a371f7', '#8957e5', '#6e40c9', '#553098', '#3c1e70', '#271052'],
  },
} as const;

export type ThemeName = keyof typeof scale;

/** Semantic roles — what the VS Code theme reaches for first. */
export const color = {
  light: {
    canvas: {
      default: '#ffffff', // panels and every chart surface
      overlay: '#ffffff', // tooltips, popovers
      inset: '#f6f8fa', //   the page plane behind panels
      subtle: '#f6f8fa', //  inset rows, empty heat cells
    },
    fg: { default: '#1f2328', muted: '#656d76', subtle: '#6e7781', onEmphasis: '#ffffff' },
    border: { default: '#d0d7de', muted: '#d8dee4' },
    neutral: { emphasis: '#6e7781', muted: 'rgba(175,184,193,0.2)', subtle: 'rgba(234,238,242,0.5)' },
    accent: { fg: '#0969da', emphasis: '#0969da', muted: 'rgba(84,174,255,0.4)', subtle: '#ddf4ff' },
    success: { fg: '#1a7f37', emphasis: '#1f883d' },
    attention: { fg: '#9a6700', emphasis: '#bf8700' },
    severe: { fg: '#bc4c00' },
    danger: { fg: '#cf222e', emphasis: '#cf222e' },
    done: { fg: '#8250df' },
  },
  dark: {
    canvas: {
      default: '#0d1117',
      overlay: '#161b22',
      inset: '#010409',
      subtle: '#161b22',
    },
    fg: { default: '#e6edf3', muted: '#7d8590', subtle: '#6e7681', onEmphasis: '#ffffff' },
    border: { default: '#30363d', muted: '#21262d' },
    neutral: { emphasis: '#6e7681', muted: 'rgba(110,118,129,0.4)', subtle: 'rgba(110,118,129,0.1)' },
    accent: { fg: '#2f81f7', emphasis: '#1f6feb', muted: 'rgba(56,139,253,0.4)', subtle: 'rgba(56,139,253,0.15)' },
    success: { fg: '#3fb950', emphasis: '#238636' },
    attention: { fg: '#d29922', emphasis: '#9e6a03' },
    severe: { fg: '#db6d28' },
    danger: { fg: '#f85149', emphasis: '#da3633' },
    done: { fg: '#a371f7' },
  },
} as const;
