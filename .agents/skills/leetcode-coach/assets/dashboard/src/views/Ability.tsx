/**
 * ABILITY — the six rubric dimensions.
 *
 * The radar carries the shape; the small multiples carry the history; the
 * evidence log carries the *why*, which is the part that actually guides
 * practice. Levels move slowly by design, so a flat line is information.
 */
import { useState } from 'react';

import { fmtDate, type Derived, type DimensionTrend } from '../lib/analytics.ts';
import { Markdown } from '../lib/markdown.tsx';
import { ACCENT, INK_SUBTLE, SEQUENTIAL } from '../lib/palette.ts';
import { DIMENSIONS, LEVEL_NAMES, type Snapshot } from '../lib/types.ts';
import { AbilityRadar, StepLine } from '../components/charts.tsx';
import { Empty, Legend, Meter, Panel, TableView } from '../components/hud.tsx';

const DIM_SHORT: Record<string, string> = {
  decomposition: 'DECOMP',
  'pattern-recognition': 'PATTERN',
  'complexity-analysis': 'CPLXTY',
  'implementation-correctness': 'IMPL',
  'edge-case-handling': 'EDGE',
  optimization: 'OPTIM',
};

const ARROW: Record<DimensionTrend['direction'], string> = {
  up: '↑',
  flat: '→',
  down: '↓',
  none: '·',
};

const arrowColor = (d: DimensionTrend['direction']): string =>
  d === 'up' ? 'var(--color-ok)' : d === 'down' ? 'var(--color-danger)' : INK_SUBTLE;

const title = (s: string) => s.replace(/-/g, ' ');

export function Ability({ snapshot, derived }: { snapshot: Snapshot; derived: Derived }) {
  const [selected, setSelected] = useState<string | null>(null);
  const trends = derived.dimensionTrends;
  const assessed = trends.filter((t) => t.latest);

  const radarAxes = DIMENSIONS.map((d) => {
    const t = trends.find((x) => x.dimension === d);
    return { label: DIM_SHORT[d] ?? d, value: t?.latest ? t.latest.level : null };
  });

  const evidence = snapshot.assessments
    .filter((a) => !selected || a.dimension === selected)
    .slice()
    .sort((a, b) => b.ts.localeCompare(a.ts));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_2fr]">
        <Panel label="Profile" meta={`${assessed.length} / ${DIMENSIONS.length} ASSESSED`}>
          {assessed.length === 0 ? (
            <Empty
              label="NOT YET ASSESSED"
              hint="One assessment row per (session × exercised dimension) is written at DEBRIEF."
            />
          ) : (
            <>
              <AbilityRadar axes={radarAxes} size={276} />
              <p className="mt-2 text-center text-[11px] text-ink-subtle">
                1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong
              </p>
            </>
          )}
        </Panel>

        <Panel
          label="Dimensions"
          meta="LATEST LEVEL · TREND"
          bodyClassName="p-0"
          table={
            <TableView
              columns={['dimension', 'level', 'trend', 'assessments', 'latest evidence']}
              rows={trends.map((t) => [
                title(t.dimension),
                t.latest ? `L${t.latest.level}` : '—',
                ARROW[t.direction],
                t.history.length,
                t.latest?.evidence ?? '—',
              ])}
            />
          }
        >
          <ul>
            {trends.map((t) => {
              const active = selected === t.dimension;
              return (
                <li key={t.dimension}>
                  <button
                    type="button"
                    onClick={() => setSelected(active ? null : t.dimension)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-4 border-b border-line-muted px-3 py-2.5 text-left last:border-0 hover:bg-subtle ${
                      active ? 'bg-subtle' : ''
                    }`}
                  >
                    <span className="w-[132px] shrink-0">
                      <span className="hud-label block text-ink">{DIM_SHORT[t.dimension] ?? t.dimension}</span>
                      <span className="mt-1 block text-[10px] text-ink-subtle">
                        {t.latest ? LEVEL_NAMES[t.latest.level] : 'not assessed'}
                      </span>
                    </span>

                    <span className="w-24 shrink-0">
                      <Meter value={t.latest?.level ?? 0} max={5} color={t.latest ? ACCENT : 'transparent'} />
                      <span className="hud-num mt-1 block text-[11px] text-ink">
                        {t.latest ? `L${t.latest.level}` : '—'}
                        <span className="ml-1.5" style={{ color: arrowColor(t.direction) }}>
                          {ARROW[t.direction]}
                          {t.delta !== 0 ? Math.abs(t.delta) : ''}
                        </span>
                      </span>
                    </span>

                    <span className="hidden shrink-0 md:block">
                      <StepLine
                        points={t.history.map((h) => ({ x: fmtDate(h.ts), y: h.level, label: h.session }))}
                        width={168}
                        height={48}
                      />
                    </span>

                    <span className="min-w-0 flex-1 text-[11px] text-ink-muted">
                      {t.latest?.evidence ?? (
                        <span className="text-ink-subtle">no evidence recorded</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
        <Panel
          label="Evidence log"
          meta={selected ? `FILTER ${DIM_SHORT[selected] ?? selected}` : 'ALL DIMENSIONS'}
          bodyClassName="p-0"
          actions={
            selected ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="hud-label border border-line-muted px-1.5 py-1 hover:border-line hover:text-ink"
              >
                Clear
              </button>
            ) : null
          }
        >
          {evidence.length === 0 ? (
            <div className="p-4">
              <Empty label="NO ASSESSMENTS" />
            </div>
          ) : (
            <ul className="max-h-[420px] overflow-auto">
              {evidence.map((a, i) => (
                <li
                  key={`${a.session}-${a.dimension}-${i}`}
                  className="border-b border-line-muted px-3 py-2 last:border-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="hud-label text-ink">{DIM_SHORT[a.dimension] ?? a.dimension}</span>
                    <span className="hud-num text-[11px] text-ink-subtle">{fmtDate(a.ts)}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className="hud-num shrink-0 text-[12px]"
                      style={{ color: SEQUENTIAL[Math.min(4, Math.max(0, a.level - 1))] }}
                    >
                      L{a.level}
                    </span>
                    <span className="text-[12px] text-ink-muted">{a.evidence}</span>
                  </div>
                  <div className="hud-num mt-1 text-[10px] text-ink-subtle">{a.session}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel label="Coach notes" meta="NOTES.MD">
          {snapshot.notesMd ? (
            <div className="max-h-[420px] overflow-auto pr-1">
              <Markdown source={snapshot.notesMd} />
            </div>
          ) : (
            <Empty
              label="NOTES.MD EMPTY"
              hint="A bounded snapshot regenerated at each debrief — one row per dimension plus at most three focus items."
            />
          )}
        </Panel>
      </div>

      <Legend
        className="px-1"
        items={[
          { label: 'level 1–5 · rubric', color: ACCENT },
          { label: 'trend up', color: 'var(--color-ok)', glyph: '↑' },
          { label: 'trend down', color: 'var(--color-danger)', glyph: '↓' },
        ]}
      />
    </div>
  );
}
