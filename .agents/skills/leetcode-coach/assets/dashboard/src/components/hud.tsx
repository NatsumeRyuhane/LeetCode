/**
 * HUD chrome — the shared vocabulary every panel is built from.
 *
 * One rule runs through all of it: structure is carried by 1px hairlines and
 * position on a strict grid, never by fills, radii, or shadows.
 */
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { INK_MUTED } from '../lib/palette.ts';

// ─────────────────────────────────────────────────────────── panel

/**
 * A panel with an optional table twin.
 *
 * The twin is a `table` prop rather than something the caller drops into
 * `actions`, because the toggle button lives in the header while the table
 * itself has to render in the body — passing one node for both is what keeps
 * the two from being wired up in the wrong place.
 */
export function Panel({
  label,
  meta,
  actions,
  table,
  children,
  className = '',
  bodyClassName = 'p-4',
}: {
  label: string;
  meta?: ReactNode;
  actions?: ReactNode;
  table?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();

  return (
    <section className={`hud-ticks border border-line bg-panel ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-line-muted px-3 py-2">
        <h2 className="hud-label shrink-0 text-ink">{label}</h2>
        <div className="flex min-w-0 items-center gap-3">
          {meta ? <span className="hud-label truncate whitespace-nowrap">{meta}</span> : null}
          {actions}
          {table ? (
            <button
              type="button"
              aria-expanded={showTable}
              aria-controls={tableId}
              onClick={() => setShowTable((v) => !v)}
              className="hud-label shrink-0 border border-line-muted px-1.5 py-1 whitespace-nowrap hover:border-line hover:text-ink"
            >
              {showTable ? 'Hide table' : 'Table'}
            </button>
          ) : null}
        </div>
      </header>
      <div className={bodyClassName}>{children}</div>
      {table && showTable ? (
        <div id={tableId} className="border-t border-line-muted px-4 pt-3 pb-4">
          {table}
        </div>
      ) : null}
    </section>
  );
}

/** Shown wherever the record has nothing to say yet. Never a blank box. */
export function Empty({ label = 'NO SIGNAL', hint }: { label?: string; hint?: string }) {
  return (
    <div className="flex min-h-[96px] flex-col items-center justify-center gap-2 border border-dashed border-line-muted py-6 text-center">
      <span className="hud-label text-ink-subtle">{label}</span>
      {hint ? <span className="max-w-[42ch] text-[11px] text-ink-subtle">{hint}</span> : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────── stat tiles

export function StatTile({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="hud-ticks relative border border-line bg-panel px-3 py-3">
      <div className="hud-label">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className="hud-value text-[26px] leading-none font-medium"
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </span>
        {unit ? <span className="hud-label !text-[10px]">{unit}</span> : null}
      </div>
      {sub ? <div className="mt-1.5 text-[11px] text-ink-subtle">{sub}</div> : null}
    </div>
  );
}

/** A single ratio against a limit — thin track, same-ramp fill. */
export function Meter({
  value,
  max,
  color,
  height = 3,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
}) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className="w-full bg-subtle" style={{ height }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: color }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────── labels

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line-muted py-1.5 last:border-0">
      <span className="hud-label shrink-0">{label}</span>
      <span className="hud-num text-right text-[12px] text-ink">{children}</span>
    </div>
  );
}

export function Chip({
  children,
  color = INK_MUTED,
  title,
}: {
  children: ReactNode;
  color?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="hud-num inline-flex items-center border px-1.5 py-px text-[10px] leading-[1.6]"
      style={{ borderColor: color, color }}
    >
      {children}
    </span>
  );
}

/** Legend row. Identity is never colour-alone — every swatch ships its label. */
export function Legend({
  items,
  className = '',
}: {
  items: { label: string; color: string; glyph?: string }[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.glyph ? (
            <span className="hud-num text-[11px] leading-none" style={{ color: it.color }}>
              {it.glyph}
            </span>
          ) : (
            <span
              aria-hidden
              className="inline-block h-2 w-2 shrink-0"
              style={{ background: it.color }}
            />
          )}
          <span className="hud-label !tracking-[0.12em]">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────── table twin

/**
 * Every chart ships a table view. Tooltips enhance; they never gate a value.
 */
export function TableView({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: (ReactNode[])[];
  caption?: string;
}) {
  return (
    <div className="max-h-64 overflow-auto border border-line-muted">
      <table className="w-full border-collapse text-[11px]">
        {caption ? <caption className="hud-label px-2 py-1.5 text-left">{caption}</caption> : null}
        <thead className="sticky top-0 bg-subtle">
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="hud-label border-b border-line-muted px-2 py-1.5 text-left font-normal whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line-muted last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="hud-num px-2 py-1 align-top text-ink-muted whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── tooltip

interface TipState {
  x: number;
  y: number;
  content: ReactNode;
}

const TooltipCtx = createContext<{
  show: (e: { clientX: number; clientY: number }, content: ReactNode) => void;
  hide: () => void;
}>({ show: () => {}, hide: () => {} });

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const show = useCallback(
    (e: { clientX: number; clientY: number }, content: ReactNode) =>
      setTip({ x: e.clientX, y: e.clientY, content }),
    [],
  );
  const hide = useCallback(() => setTip(null), []);
  const api = useMemo(() => ({ show, hide }), [show, hide]);

  // Flip near the viewport edges so the tip never leaves the screen.
  const style: CSSProperties | undefined = tip
    ? {
        left: Math.min(tip.x + 12, window.innerWidth - 260),
        top: Math.min(tip.y + 12, window.innerHeight - 120),
      }
    : undefined;

  return (
    <TooltipCtx.Provider value={api}>
      {children}
      {tip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 max-w-[240px] border border-line bg-canvas px-2 py-1.5 text-[11px] text-ink"
          style={style}
        >
          {tip.content}
        </div>
      ) : null}
    </TooltipCtx.Provider>
  );
}

export const useTooltip = () => useContext(TooltipCtx);

/** Small helper for consistent tooltip bodies. */
export function TipBody({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <div>
      <div className="hud-label mb-1 text-ink">{title}</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <span className="text-ink-subtle">{k}</span>
          <span className="hud-num text-ink">{v}</span>
        </div>
      ))}
    </div>
  );
}
