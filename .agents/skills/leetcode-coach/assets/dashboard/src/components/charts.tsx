/**
 * Chart primitives — hand-rolled SVG.
 *
 * No chart library: every default one ships (rounded thick marks, drop shadows,
 * cycled hues, dashed grids) is something the brief rules out, so the marks are
 * drawn directly. Shared rules across all of them — 1px hairline axes and grid,
 * thin marks, a 2px surface gap between adjacent fills, hover tooltips that
 * enhance rather than gate, and a table twin supplied by the caller.
 */
import { useMemo, type ReactNode } from 'react';

import { fmtClock, fmtDuration, type DayActivity } from '../lib/analytics.ts';
import {
  ACCENT,
  HEAT,
  INK_MUTED,
  INK_SUBTLE,
  LINE,
  LINE_MUTED,
  SURFACE,
  heatStep,
} from '../lib/palette.ts';
import { useMeasure } from '../lib/useMeasure.ts';
import { TipBody, useTooltip } from './hud.tsx';

/** 2px gap between adjacent fills, per the mark spec. */
const GAP = 2;

// ─────────────────────────────────────────────────── horizontal bars

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
  /** Extra rows for the tooltip. */
  meta?: [string, ReactNode][];
  onClick?: () => void;
}

/**
 * Ranked horizontal bars. Single hue by default — a per-row `color` is only for
 * genuinely categorical rows (tag namespaces), never a value ramp on nominal
 * categories.
 */
export function BarList({
  data,
  format = (v) => String(v),
  labelWidth = 148,
  barHeight = 10,
  max,
}: {
  data: BarDatum[];
  format?: (v: number) => string;
  labelWidth?: number;
  barHeight?: number;
  max?: number;
}) {
  const { show, hide } = useTooltip();
  const peak = max ?? Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex flex-col">
      {data.map((d) => {
        const pct = Math.max(0, d.value / peak);
        const color = d.color ?? ACCENT;
        return (
          <div
            key={d.label}
            className={`group flex items-center gap-3 border-b border-line-muted py-1.5 last:border-0 ${
              d.onClick ? 'cursor-pointer' : ''
            }`}
            onClick={d.onClick}
            onMouseMove={(e) =>
              show(
                e,
                <TipBody
                  title={d.label}
                  rows={[['value', format(d.value)], ...(d.meta ?? [])]}
                />,
              )
            }
            onMouseLeave={hide}
          >
            <span
              className="hud-num shrink-0 truncate text-[11px] text-ink-muted group-hover:text-ink"
              style={{ width: labelWidth }}
              title={d.label}
            >
              {d.label}
            </span>
            <span className="relative min-w-0 flex-1 bg-subtle" style={{ height: barHeight }}>
              <span
                className="absolute inset-y-0 left-0"
                style={{ width: `${pct * 100}%`, background: color }}
              />
            </span>
            <span className="hud-num w-16 shrink-0 text-right text-[11px] text-ink">
              {format(d.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────── activity heatmap

/**
 * Calendar heatmap over the last `weeks` weeks. Sequential single hue; the
 * empty step is a surface, not a colour, so "nothing happened" never reads as
 * a low value.
 */
export function HeatCalendar({
  days,
  weeks = 26,
  cell = 11,
  onSelectDay,
}: {
  days: Map<string, DayActivity>;
  weeks?: number;
  cell?: number;
  onSelectDay?: (day: string) => void;
}) {
  const { show, hide } = useTooltip();
  const dayMs = 86_400_000;

  const { columns, peak, monthTicks } = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    // Wind forward to the end of the current week (Sun-start grid).
    end.setTime(end.getTime() + (6 - end.getDay()) * dayMs);
    const start = new Date(end.getTime() - (weeks * 7 - 1) * dayMs);

    const cols: { day: string; date: Date; activity?: DayActivity }[][] = [];
    const ticks: { col: number; label: string }[] = [];
    let peakSecs = 0;

    for (let w = 0; w < weeks; w += 1) {
      const col: { day: string; date: Date; activity?: DayActivity }[] = [];
      for (let d = 0; d < 7; d += 1) {
        const date = new Date(start.getTime() + (w * 7 + d) * dayMs);
        const pad = (n: number) => String(n).padStart(2, '0');
        const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        const activity = days.get(key);
        if (activity) peakSecs = Math.max(peakSecs, activity.activeSeconds);
        col.push({ day: key, date, activity });
      }
      const first = col[0].date;
      if (first.getDate() <= 7) {
        ticks.push({
          col: w,
          label: first.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
        });
      }
      cols.push(col);
    }
    return { columns: cols, peak: peakSecs, monthTicks: ticks };
  }, [days, weeks, dayMs]);

  const width = weeks * (cell + GAP);
  const height = 7 * (cell + GAP);

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height + 16}
        viewBox={`0 0 ${width} ${height + 16}`}
        role="img"
        aria-label="Practice activity by day"
        style={{ display: 'block' }}
      >
        {monthTicks.map((t) => (
          <text
            key={`${t.col}-${t.label}`}
            x={t.col * (cell + GAP)}
            y={8}
            fill={INK_SUBTLE}
            fontSize={9}
            letterSpacing="0.12em"
            fontFamily="var(--font-mono)"
          >
            {t.label}
          </text>
        ))}
        {columns.map((col, ci) =>
          col.map((c, ri) => {
            const secs = c.activity?.activeSeconds ?? 0;
            const events = c.activity?.events ?? 0;
            const fill = events === 0 ? HEAT[0] : heatStep(peak > 0 ? secs / peak : 1);
            const future = c.date.getTime() > Date.now();
            return (
              <rect
                key={c.day}
                x={ci * (cell + GAP)}
                y={ri * (cell + GAP) + 14}
                width={cell}
                height={cell}
                fill={future ? 'transparent' : fill}
                stroke={future ? LINE_MUTED : 'none'}
                strokeWidth={future ? 1 : 0}
                style={{ cursor: events ? 'pointer' : 'default' }}
                onClick={() => events && onSelectDay?.(c.day)}
                onMouseMove={(e) =>
                  show(
                    e,
                    <TipBody
                      title={c.day}
                      rows={[
                        ['events', events],
                        ['active', fmtDuration(secs)],
                        ['sessions', c.activity?.sessions.length ?? 0],
                      ]}
                    />,
                  )
                }
                onMouseLeave={hide}
              />
            );
          }),
        )}
      </svg>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="hud-label">less</span>
        {HEAT.map((c) => (
          <span
            key={c}
            className="inline-block"
            style={{ width: cell, height: cell, background: c, outline: `1px solid ${LINE_MUTED}` }}
          />
        ))}
        <span className="hud-label">more</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────── ability radar

export interface RadarAxis {
  label: string;
  /** 1..5, or null when the dimension has never been assessed. */
  value: number | null;
}

/**
 * Ability profile on a fixed 6-axis hexagon, levels 1–5.
 *
 * A radar is legitimate here because the axis set is fixed, small, and ordered
 * the same way every time — the shape is the point. Every axis carries its
 * value as a direct label, so nothing is read from geometry or colour alone.
 */
export function AbilityRadar({
  axes,
  size = 260,
  levels = 5,
}: {
  axes: RadarAxis[];
  size?: number;
  levels?: number;
}) {
  const { show, hide } = useTooltip();
  const cx = size / 2;
  const cy = size / 2;
  // Leave room for the two-line axis labels sitting outside the outer ring —
  // the widest ("PATTERN") must not clip at the viewBox edge.
  const r = size / 2 - 62;
  const n = axes.length;

  const point = (i: number, frac: number): [number, number] => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * r * frac, cy + Math.sin(angle) * r * frac];
  };

  const ring = (frac: number): string =>
    axes.map((_, i) => point(i, frac).join(',')).join(' ');

  const assessed = axes.filter((a) => a.value !== null);
  const shape = assessed.length
    ? axes.map((a, i) => point(i, (a.value ?? 0) / levels).join(',')).join(' ')
    : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Ability profile across six dimensions, levels 1 to 5"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* Recessive hairline web — solid, never dashed. */}
      {Array.from({ length: levels }, (_, i) => (i + 1) / levels).map((frac) => (
        <polygon
          key={frac}
          points={ring(frac)}
          fill="none"
          stroke={frac === 1 ? LINE : LINE_MUTED}
          strokeWidth={1}
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1);
        return <line key={a.label} x1={cx} y1={cy} x2={x} y2={y} stroke={LINE_MUTED} strokeWidth={1} />;
      })}

      {shape ? (
        <polygon
          points={shape}
          fill={ACCENT}
          fillOpacity={0.14}
          stroke={ACCENT}
          strokeWidth={2}
          strokeLinejoin="miter"
        />
      ) : null}

      {axes.map((a, i) => {
        if (a.value === null) return null;
        const [x, y] = point(i, a.value / levels);
        return (
          <circle
            key={`${a.label}-dot`}
            cx={x}
            cy={y}
            r={4}
            fill={ACCENT}
            stroke={SURFACE}
            strokeWidth={2}
            onMouseMove={(e) => show(e, <TipBody title={a.label} rows={[['level', `${a.value} / ${levels}`]]} />)}
            onMouseLeave={hide}
          />
        );
      })}

      {/* Direct labels: dimension + its value, so identity never rides on shape. */}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1.24);
        const anchor = Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end';
        return (
          <g key={`${a.label}-label`}>
            <text
              x={x}
              y={y - 3}
              fill={INK_MUTED}
              fontSize={9}
              letterSpacing="0.1em"
              textAnchor={anchor}
              fontFamily="var(--font-mono)"
            >
              {a.label.toUpperCase()}
            </text>
            <text
              x={x}
              y={y + 8}
              fill={a.value === null ? INK_SUBTLE : ACCENT}
              fontSize={11}
              textAnchor={anchor}
              fontFamily="var(--font-mono)"
            >
              {a.value === null ? '—' : `L${a.value}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────── step line

export interface SeriesPoint {
  x: string;
  y: number;
  label?: string;
}

/**
 * Small-multiple trend line. One series per chart — the dimension named in the
 * panel title *is* the legend, so no legend box is needed.
 */
export function StepLine({
  points,
  width = 220,
  height = 56,
  min = 1,
  max = 5,
  color = ACCENT,
  formatY = (v: number) => `L${v}`,
}: {
  points: SeriesPoint[];
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  color?: string;
  formatY?: (v: number) => string;
}) {
  const { show, hide } = useTooltip();
  const padX = 6;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (points.length === 0) {
    return (
      <svg width={width} height={height} role="img" aria-label="No data">
        <line
          x1={padX}
          y1={height / 2}
          x2={width - padX}
          y2={height / 2}
          stroke={LINE_MUTED}
          strokeWidth={1}
        />
        <text x={width / 2} y={height / 2 - 6} fill={INK_SUBTLE} fontSize={9} textAnchor="middle" fontFamily="var(--font-mono)">
          NO DATA
        </text>
      </svg>
    );
  }

  const x = (i: number) =>
    points.length === 1 ? padX + innerW / 2 : padX + (i / (points.length - 1)) * innerW;
  const y = (v: number) => padY + innerH - ((v - min) / (max - min || 1)) * innerH;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.y)}`).join(' ');

  return (
    <svg width={width} height={height} role="img" aria-label="Level over time" style={{ display: 'block' }}>
      {[min, (min + max) / 2, max].map((v) => (
        <line key={v} x1={padX} y1={y(v)} x2={width - padX} y2={y(v)} stroke={LINE_MUTED} strokeWidth={1} />
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="miter" strokeLinecap="butt" />
      {points.map((p, i) => {
        const last = i === points.length - 1;
        // Past a dozen points the dots stop reading as marks and start reading
        // as noise — keep the endpoint, drop the rest, let hover carry them.
        const dense = points.length > 12;
        return (
          <g key={`${p.x}-${i}`}>
            {!dense || last ? (
              <circle cx={x(i)} cy={y(p.y)} r={last ? 4 : 3} fill={color} stroke={SURFACE} strokeWidth={2} />
            ) : null}
            <rect
              x={x(i) - 5}
              y={0}
              width={10}
              height={height}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseMove={(e) =>
                show(e, <TipBody title={p.label ?? p.x} rows={[['level', formatY(p.y)], ['when', p.x]]} />)
              }
              onMouseLeave={hide}
            />
          </g>
        );
      })}
      {/* Direct-label the endpoint only — never a number on every point. */}
      <text
        x={x(points.length - 1)}
        y={y(points[points.length - 1].y) - 8}
        fill={color}
        fontSize={10}
        textAnchor="end"
        fontFamily="var(--font-mono)"
      >
        {formatY(points[points.length - 1].y)}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────── stacked ratio bar

export interface StackSegment {
  label: string;
  value: number;
  color: string;
  glyph?: string;
}

/** Part-to-whole in one row. 2px surface gaps between segments, never borders. */
export function StackBar({
  segments,
  height = 14,
}: {
  segments: StackSegment[];
  height?: number;
}) {
  const { show, hide } = useTooltip();
  const total = segments.reduce((n, s) => n + s.value, 0);
  if (total === 0) return <div className="bg-subtle" style={{ height }} />;

  return (
    <div className="flex w-full" style={{ height, gap: GAP }}>
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.label}
            style={{ flexGrow: s.value, background: s.color, minWidth: 2 }}
            onMouseMove={(e) =>
              show(
                e,
                <TipBody
                  title={`${s.glyph ?? ''} ${s.label}`.trim()}
                  rows={[
                    ['count', s.value],
                    ['share', `${Math.round((s.value / total) * 100)}%`],
                  ]}
                />,
              )
            }
            onMouseLeave={hide}
          />
        ))}
    </div>
  );
}

// ─────────────────────────────────────────────────── session timeline

export interface TimelineMark {
  /** Cumulative active seconds from the session start. */
  at: number;
  type: string;
  state?: string;
  level?: string;
  note?: string;
  ts: string;
  gapS?: number;
  color: string;
  glyph: string;
}

/**
 * One session as a time ribbon: x is elapsed *active* time, marks are events.
 * Shape carries the event type (the glyph), so colour is never the only channel.
 */
export function SessionTimeline({
  marks,
  totalSeconds,
  height = 74,
}: {
  marks: TimelineMark[];
  totalSeconds: number;
  height?: number;
}) {
  const { show, hide } = useTooltip();
  const [ref, width] = useMeasure<HTMLDivElement>();
  const padX = 10;
  const axisY = height - 20;

  const span = Math.max(totalSeconds, 1);
  // Stagger the mark heights by type so dense sessions stay readable.
  const lift = (type: string) => (type === 'hint' ? 26 : type === 'state-change' ? 36 : 14);

  return (
    <div ref={ref}>
      {width > 0 && marks.length > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Session event timeline" style={{ display: 'block' }}>
          <line x1={padX} y1={axisY} x2={width - padX} y2={axisY} stroke={LINE} strokeWidth={1} />
          {marks.map((m, i) => {
            const x = padX + (m.at / span) * (width - padX * 2);
            const y = axisY - lift(m.type);
            return (
              <g key={`${m.ts}-${i}`}>
                <line x1={x} y1={axisY} x2={x} y2={y} stroke={m.color} strokeWidth={1} />
                <circle cx={x} cy={y} r={3} fill={m.color} stroke={SURFACE} strokeWidth={1} />
                {/* Generous invisible hit area — the mark itself is far too small. */}
                <rect
                  x={x - 9}
                  y={0}
                  width={18}
                  height={height}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseMove={(e) =>
                    show(
                      e,
                      <TipBody
                        title={`${m.glyph} ${m.type}${m.level ? ` ${m.level}` : ''}`}
                        rows={[
                          ['state', m.state ?? '—'],
                          ['at', fmtClock(m.at)],
                          ['pause before', m.gapS ? fmtDuration(m.gapS) : '—'],
                          ...(m.note ? ([['note', m.note]] as [string, ReactNode][]) : []),
                        ]}
                      />,
                    )
                  }
                  onMouseLeave={hide}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────── latency dots

/**
 * Response latency per hint — a strip plot, because the interesting thing is
 * the spread of a handful of values, not a trend.
 */
export function LatencyStrip({
  values,
  height = 52,
}: {
  values: { label: string; seconds: number; color: string }[];
  height?: number;
}) {
  const { show, hide } = useTooltip();
  const [ref, width] = useMeasure<HTMLDivElement>();
  if (values.length === 0) return null;

  const max = Math.max(...values.map((v) => v.seconds), 60);
  const padX = 8;
  const axisY = height - 16;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={ref}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Hint response latency" style={{ display: 'block' }}>
          <line x1={padX} y1={axisY} x2={width - padX} y2={axisY} stroke={LINE} strokeWidth={1} />
          {ticks.map((f) => {
            const x = padX + f * (width - padX * 2);
            return (
              <g key={f}>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 4} stroke={LINE_MUTED} strokeWidth={1} />
                <text
                  x={x}
                  y={height - 3}
                  fill={INK_SUBTLE}
                  fontSize={9}
                  textAnchor={f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}
                  fontFamily="var(--font-mono)"
                >
                  {fmtDuration(Math.round(max * f))}
                </text>
              </g>
            );
          })}
          {values.map((v, i) => {
            const x = padX + (v.seconds / max) * (width - padX * 2);
            return (
              <g key={`${v.label}-${i}`}>
                <circle cx={x} cy={axisY - 10} r={4} fill={v.color} stroke={SURFACE} strokeWidth={2} />
                <rect
                  x={x - 10}
                  y={0}
                  width={20}
                  height={axisY}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseMove={(e) => show(e, <TipBody title={v.label} rows={[['response', fmtDuration(v.seconds)]]} />)}
                  onMouseLeave={hide}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}
