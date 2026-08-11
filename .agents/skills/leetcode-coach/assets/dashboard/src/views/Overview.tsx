/**
 * OVERVIEW — the "where do I stand" read.
 *
 * Leads with the headline numbers as stat tiles (not a chart), then the
 * activity field, the ability shape, and what the coach flagged to work on next.
 */
import {
  fmtDate,
  fmtDuration,
  fmtPct,
  type Derived,
} from '../lib/analytics.ts';
import { Markdown, extractSection } from '../lib/markdown.tsx';
import {
  ACCENT,
  HINT_RAMP,
  OUTCOME_GLYPH,
  hintColor,
  namespaceColor,
  outcomeColor,
} from '../lib/palette.ts';
import { DIMENSIONS, OUTCOMES, type Snapshot } from '../lib/types.ts';
import { BarList, HeatCalendar, AbilityRadar, StackBar } from '../components/charts.tsx';
import {
  Chip,
  Empty,
  Legend,
  Panel,
  StatTile,
  TableView,
} from '../components/hud.tsx';

const DIM_SHORT: Record<string, string> = {
  decomposition: 'DECOMP',
  'pattern-recognition': 'PATTERN',
  'complexity-analysis': 'CPLXTY',
  'implementation-correctness': 'IMPL',
  'edge-case-handling': 'EDGE',
  optimization: 'OPTIM',
};

export function Overview({
  snapshot,
  derived,
  onOpen,
  onNav,
}: {
  snapshot: Snapshot;
  derived: Derived;
  onOpen: (key: string) => void;
  onNav: (href: string) => void;
}) {
  const { totals, byDayMap, dimensionTrends, outcomeCounts, hintTotals, tagStats, sessionsDesc } =
    derived;

  if (derived.isEmpty) {
    return (
      <Panel label="Standing">
        <Empty
          label="RECORD EMPTY"
          hint="No sessions logged yet. Start a drill with the leetcode-coach skill — the first debrief writes db/sessions.jsonl and db/assessments.jsonl, and this HUD fills in."
        />
      </Panel>
    );
  }

  const radarAxes = DIMENSIONS.map((d) => {
    const t = dimensionTrends.find((x) => x.dimension === d);
    return { label: DIM_SHORT[d] ?? d, value: t?.latest ? t.latest.level : null };
  });

  const outcomeSegments = OUTCOMES.filter((o) => (outcomeCounts[o] ?? 0) > 0).map((o) => ({
    label: o,
    value: outcomeCounts[o] ?? 0,
    color: outcomeColor(o),
    glyph: OUTCOME_GLYPH[o],
  }));

  const focus = snapshot.notesMd ? extractSection(snapshot.notesMd, /focus/i) : undefined;

  // Recent-window readouts under the heatmap — the field shows shape, these
  // give it a number.
  const since = (days: number) => {
    const cutoff = Date.now() - days * 86_400_000;
    return derived.byDay
      .filter((d) => new Date(`${d.day}T00:00:00`).getTime() >= cutoff)
      .reduce((n, d) => n + d.activeSeconds, 0);
  };
  const bestDay = derived.byDay.reduce(
    (best, d) => (d.activeSeconds > (best?.activeSeconds ?? 0) ? d : best),
    derived.byDay[0],
  );
  const window7 = [
    { label: 'Last 7 days', value: fmtDuration(since(7)) },
    { label: 'Last 30 days', value: fmtDuration(since(30)) },
    { label: 'Best day', value: bestDay ? fmtDuration(bestDay.activeSeconds) : '—' },
  ];

  // Always show every rung, including the zeros — an empty L3/L4 is the good news.
  const hintBars = (['L0', 'L1', 'L2', 'L3', 'L4'] as const).map((lvl) => ({
    label: lvl,
    value: hintTotals[lvl] ?? 0,
    color: hintColor(lvl),
  }));

  const topTags = tagStats.slice(0, 8).map((t) => ({
    label: t.tag,
    value: t.count,
    color: namespaceColor(t.namespace),
    meta: [['namespace', t.namespace] as [string, string]],
    onClick: () => onNav('/tags'),
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* ── KPI row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Sessions" value={totals.sessions} sub={`${totals.problems} problems`} />
        <StatTile
          label="Solve rate"
          value={fmtPct(totals.solveRate)}
          sub={`${totals.solved} of ${snapshot.sessions.length} debriefed`}
          accent={totals.solveRate >= 0.5 ? 'var(--color-ok)' : undefined}
        />
        <StatTile label="Active time" value={fmtDuration(totals.activeSeconds)} sub="breaks excluded" />
        <StatTile
          label="Hints / session"
          value={totals.sessions ? totals.hintsPerSession.toFixed(1) : '0'}
          sub={`${totals.hints} total · ${totals.reveals} L4 reveal${totals.reveals === 1 ? '' : 's'}`}
        />
        <StatTile
          label="Streak"
          value={totals.currentStreak}
          unit={totals.currentStreak === 1 ? 'day' : 'days'}
          sub={`longest ${totals.longestStreak} · ${totals.activeDays} active days`}
        />
        <StatTile label="Test runs" value={totals.testRuns} sub="local pytest invocations" />
      </div>

      {/* ── activity + ability ──────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[2fr_1fr]">
        <Panel label="Activity field" meta="ACTIVE TIME / DAY · 52 WEEKS">
          <HeatCalendar days={byDayMap} weeks={52} />
          <div className="mt-3 grid grid-cols-3 border-t border-line-muted pt-3">
            {window7.map((w) => (
              <div key={w.label}>
                <div className="hud-label">{w.label}</div>
                <div className="hud-value mt-1 text-[15px] text-ink">{w.value}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          label="Ability profile"
          meta="L1–L5"
          actions={
            <button
              type="button"
              onClick={() => onNav('/ability')}
              className="hud-label border border-line-muted px-1.5 py-1 hover:border-line hover:text-ink"
            >
              Detail
            </button>
          }
        >
          {radarAxes.every((a) => a.value === null) ? (
            <Empty label="NOT YET ASSESSED" hint="Assessments are written at DEBRIEF, one row per exercised dimension." />
          ) : (
            <>
              <AbilityRadar axes={radarAxes} size={268} />
              <p className="mt-1 text-center text-[11px] text-ink-subtle">
                1 nascent · 3 competent · 5 strong
              </p>
            </>
          )}
        </Panel>
      </div>

      {/* ── outcomes, hints, tags ───────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
        <Panel
          label="Outcomes"
          meta={`${snapshot.sessions.length} DEBRIEFED`}
          table={
            <TableView
              columns={['outcome', 'sessions']}
              rows={outcomeSegments.map((s) => [`${s.glyph} ${s.label}`, s.value])}
            />
          }
        >
          {outcomeSegments.length === 0 ? (
            <Empty label="NO DEBRIEFS" />
          ) : (
            <>
              <StackBar segments={outcomeSegments} />
              <Legend
                className="mt-3"
                items={outcomeSegments.map((s) => ({
                  label: `${s.label} (${s.value})`,
                  color: s.color,
                  glyph: s.glyph,
                }))}
              />
            </>
          )}
        </Panel>

        <Panel
          label="Hint ladder"
          meta="TIMES EMITTED"
          table={
            <TableView columns={['level', 'count']} rows={hintBars.map((b) => [b.label, b.value])} />
          }
        >
          {totals.hints === 0 ? (
            <Empty label="NO HINTS EMITTED" hint="Unassisted so far — the ladder fills in as hints get logged." />
          ) : (
            <>
              <BarList data={hintBars} labelWidth={28} />
              <p className="mt-3 text-[11px] text-ink-subtle">
                Weakest-first is the intent: a ladder weighted to{' '}
                <span style={{ color: HINT_RAMP[0] }}>L0</span>/
                <span style={{ color: HINT_RAMP[1] }}>L1</span> means small nudges were enough.
              </p>
            </>
          )}
        </Panel>

        <Panel
          label="Top tags"
          meta="BY SESSION COUNT"
          table={
            <TableView
              columns={['tag', 'namespace', 'count']}
              rows={tagStats.map((t) => [t.tag, t.namespace, t.count])}
            />
          }
        >
          {topTags.length === 0 ? (
            <Empty label="NO TAGS YET" />
          ) : (
            <>
              <BarList data={topTags} labelWidth={168} />
              <Legend
                className="mt-3"
                items={[
                  { label: 'structure', color: namespaceColor('structure') },
                  { label: 'technique', color: namespaceColor('technique') },
                  { label: 'weakness', color: namespaceColor('weakness') },
                ]}
              />
            </>
          )}
        </Panel>
      </div>

      {/* ── recent + focus ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[3fr_2fr]">
        <Panel label="Recent sessions" meta="NEWEST FIRST" bodyClassName="p-0">
          {sessionsDesc.length === 0 ? (
            <div className="p-4">
              <Empty label="NO SESSIONS" />
            </div>
          ) : (
            <ul>
              {sessionsDesc.slice(0, 8).map((s) => {
                const outcome = s.summary?.outcome;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => onOpen(s.key)}
                      className="flex w-full items-center gap-3 border-b border-line-muted px-3 py-2 text-left last:border-0 hover:bg-subtle"
                    >
                      <span
                        className="hud-num w-4 shrink-0 text-center text-[12px]"
                        style={{ color: outcomeColor(outcome) }}
                        title={outcome ?? 'in progress'}
                      >
                        {outcome ? OUTCOME_GLYPH[outcome] ?? '·' : '·'}
                      </span>
                      <span className="hud-num w-20 shrink-0 text-[11px] text-ink-subtle">
                        {fmtDate(s.firstTs ?? s.summary?.ts)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{s.problem}</span>
                      <span className="hud-num hidden shrink-0 text-[11px] text-ink-subtle sm:inline">
                        {fmtDuration(s.activeSeconds)}
                      </span>
                      <span className="hidden shrink-0 gap-1 md:flex">
                        {(s.summary?.tags ?? []).slice(0, 2).map((t) => (
                          <Chip key={t} color={namespaceColor(t.slice(1).split(':')[0])}>
                            {t.split(':')[1] ?? t}
                          </Chip>
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel label="Focus next" meta="FROM NOTES.MD">
          {focus ? (
            <Markdown source={focus} />
          ) : (
            <Empty
              label="NO FOCUS SET"
              hint="The coach rewrites NOTES.md at each debrief with at most three tag-linked recommendations."
            />
          )}
          {snapshot.notesMd ? (
            <button
              type="button"
              onClick={() => onNav('/ability')}
              className="hud-label mt-3 border border-line-muted px-2 py-1 hover:border-line hover:text-ink"
              style={{ color: ACCENT }}
            >
              Full notes →
            </button>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
