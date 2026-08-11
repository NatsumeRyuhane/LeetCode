/**
 * SESSIONS — the log, and one sitting in full.
 *
 * The list is a table because outcomes, tags and complexities are all classes
 * that carry meaning; past a handful of them a chart would blur what a table
 * states exactly. The detail view is where the timing data earns its keep.
 */
import { useMemo, useState } from 'react';

import {
  BREAK_S,
  fmtClock,
  fmtDate,
  fmtDuration,
  fmtTime,
  type Derived,
  type SessionStats,
} from '../lib/analytics.ts';
import { Markdown, splitLogSections } from '../lib/markdown.tsx';
import {
  ACCENT,
  INK_MUTED,
  INK_SUBTLE,
  OUTCOME_GLYPH,
  hintColor,
  namespaceColor,
  outcomeColor,
} from '../lib/palette.ts';
import { OUTCOMES, PROTOCOL_STATES, type Snapshot } from '../lib/types.ts';
import { BarList, LatencyStrip, SessionTimeline, type TimelineMark } from '../components/charts.tsx';
import {
  Chip,
  Empty,
  Field,
  Legend,
  Panel,
  StatTile,
  TableView,
} from '../components/hud.tsx';

const EVENT_GLYPH: Record<string, string> = {
  'user-turn': '·',
  'state-change': '▸',
  hint: '▲',
  'test-run': '■',
  reveal: '△',
  note: '–',
};

const eventColor = (type: string, level?: string): string => {
  if (type === 'hint') return hintColor(level);
  if (type === 'state-change') return ACCENT;
  if (type === 'reveal') return 'var(--color-severe)';
  if (type === 'test-run') return INK_MUTED;
  return INK_SUBTLE;
};

// ─────────────────────────────────────────────────────────── list

export function Sessions({
  derived,
  onOpen,
}: {
  derived: Derived;
  onOpen: (key: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState<string>('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return derived.sessionsDesc.filter((s) => {
      if (outcome !== 'all') {
        if (outcome === 'in-progress' ? !!s.summary : s.summary?.outcome !== outcome) return false;
      }
      if (!q) return true;
      const haystack = [s.key, s.problem, ...(s.summary?.tags ?? []), s.summary?.outcome ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [derived.sessionsDesc, query, outcome]);

  if (derived.sessions.length === 0) {
    return (
      <Panel label="Sessions">
        <Empty label="NO SESSIONS" hint="Events land in db/events.jsonl as soon as a drill starts." />
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* One filter row above everything it scopes — never per-panel filters. */}
      <div className="hud-ticks flex flex-wrap items-center gap-3 border border-line bg-panel px-3 py-2">
        <label className="flex items-center gap-2">
          <span className="hud-label">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="problem, tag, outcome…"
            className="hud-num w-56 border border-line-muted bg-canvas px-2 py-1 text-[11px] text-ink placeholder:text-ink-subtle focus:border-line focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="hud-label">Outcome</span>
          <div className="flex">
            {['all', ...OUTCOMES, 'in-progress'].map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOutcome(o)}
                aria-pressed={outcome === o}
                className={`hud-label border border-line-muted px-2 py-1 -ml-px first:ml-0 ${
                  outcome === o ? 'bg-subtle text-ink' : 'hover:bg-subtle hover:text-ink'
                }`}
                style={outcome === o ? { borderColor: outcomeColor(o) } : undefined}
              >
                {o === 'all' ? 'All' : o.replace('solved-', '')}
              </button>
            ))}
          </div>
        </div>
        <span className="hud-label ml-auto">
          {rows.length} / {derived.sessions.length} SHOWN
        </span>
      </div>

      <Panel label="Session log" meta="NEWEST FIRST" bodyClassName="p-0">
        {rows.length === 0 ? (
          <div className="p-4">
            <Empty label="NO MATCHES" hint="Adjust the search or outcome filter above." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead className="bg-subtle">
                <tr>
                  {['', 'Date', 'Problem', 'Outcome', 'Hints', 'Active', 'Time / Space', 'Tags'].map(
                    (h) => (
                      <th
                        key={h}
                        className="hud-label border-b border-line-muted px-2 py-2 text-left font-normal whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const o = s.summary?.outcome;
                  const hints = Object.entries(s.hintCounts).sort(([a], [b]) => a.localeCompare(b));
                  return (
                    <tr
                      key={s.key}
                      onClick={() => onOpen(s.key)}
                      className="cursor-pointer border-b border-line-muted last:border-0 hover:bg-subtle"
                    >
                      <td className="px-2 py-2 text-center" style={{ color: outcomeColor(o) }}>
                        <span className="hud-num" title={o ?? 'in progress'}>
                          {o ? OUTCOME_GLYPH[o] ?? '·' : '·'}
                        </span>
                      </td>
                      <td className="hud-num px-2 py-2 whitespace-nowrap text-ink-subtle">
                        {fmtDate(s.firstTs ?? s.summary?.ts)}
                      </td>
                      <td className="px-2 py-2 text-ink">{s.problem}</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: outcomeColor(o) }}>
                        {o ?? <span className="text-ink-subtle">in progress</span>}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {hints.length === 0 ? (
                          <span className="text-ink-subtle">—</span>
                        ) : (
                          <span className="flex gap-1">
                            {hints.map(([lvl, n]) => (
                              <Chip key={lvl} color={hintColor(lvl)}>
                                {lvl}
                                {n > 1 ? `×${n}` : ''}
                              </Chip>
                            ))}
                          </span>
                        )}
                      </td>
                      <td className="hud-num px-2 py-2 whitespace-nowrap text-ink-muted">
                        {fmtDuration(s.activeSeconds)}
                      </td>
                      <td className="hud-num px-2 py-2 whitespace-nowrap text-ink-muted">
                        {s.summary?.time_complexity ?? '—'}
                        <span className="text-ink-subtle"> / </span>
                        {s.summary?.space_complexity ?? '—'}
                      </td>
                      <td className="px-2 py-2">
                        <span className="flex flex-wrap gap-1">
                          {(s.summary?.tags ?? []).map((t) => (
                            <Chip key={t} color={namespaceColor(t.slice(1).split(':')[0])}>
                              {t}
                            </Chip>
                          ))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Legend
        className="px-1"
        items={OUTCOMES.map((o) => ({ label: o, color: outcomeColor(o), glyph: OUTCOME_GLYPH[o] }))}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────── detail

/** Place each event on an elapsed-*active*-time axis, so breaks don't stretch it. */
function timelineMarks(s: SessionStats): { marks: TimelineMark[]; span: number } {
  let at = 0;
  const marks: TimelineMark[] = s.events.map((e) => {
    const gap = e.gap_s ?? 0;
    if (gap > 0 && gap <= BREAK_S) at += gap;
    return {
      at,
      type: e.type,
      state: e.state,
      level: e.level,
      note: e.note,
      ts: e.ts,
      gapS: e.gap_s,
      color: eventColor(e.type, e.level),
      glyph: EVENT_GLYPH[e.type] ?? '·',
    };
  });
  return { marks, span: at };
}

export function SessionDetail({
  snapshot,
  derived,
  sessionKey,
  onBack,
}: {
  snapshot: Snapshot;
  derived: Derived;
  sessionKey: string;
  onBack: () => void;
}) {
  const session = derived.sessions.find((s) => s.key === sessionKey);

  if (!session) {
    return (
      <Panel
        label="Session"
        actions={
          <button
            type="button"
            onClick={onBack}
            className="hud-label border border-line-muted px-1.5 py-1 hover:border-line hover:text-ink"
          >
            ← Back
          </button>
        }
      >
        <Empty label="NOT FOUND" hint={`No session keyed ${sessionKey} in the record.`} />
      </Panel>
    );
  }

  const problem = snapshot.problems.find((p) => p.key === session.problem);
  const { marks, span } = timelineMarks(session);
  const outcome = session.summary?.outcome;

  const stateBars = Object.entries(session.secondsInState)
    .map(([state, seconds]) => ({ state, seconds }))
    .sort(
      (a, b) => PROTOCOL_STATES.indexOf(a.state as never) - PROTOCOL_STATES.indexOf(b.state as never),
    )
    .map((s) => ({ label: s.state, value: s.seconds, color: ACCENT }));

  const logSections = problem?.logMd ? splitLogSections(problem.logMd) : [];
  const thisLog =
    logSections.find((sec) => sec.title.startsWith(session.date)) ?? logSections[0];

  return (
    <div className="flex flex-col gap-3">
      {/* ── identity strip ─────────────────────────────────────── */}
      <div className="hud-ticks flex flex-wrap items-center gap-x-4 gap-y-2 border border-line bg-panel px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="hud-label border border-line-muted px-2 py-1 hover:border-line hover:text-ink"
        >
          ← Sessions
        </button>
        <span className="hud-num text-[13px] text-ink">{session.key}</span>
        {outcome ? (
          <span className="hud-num text-[11px]" style={{ color: outcomeColor(outcome) }}>
            {OUTCOME_GLYPH[outcome]} {outcome}
          </span>
        ) : (
          <span className="hud-label">IN PROGRESS</span>
        )}
        {problem?.difficulty ? <Chip>{problem.difficulty}</Chip> : null}
        <span className="flex flex-wrap gap-1">
          {(session.summary?.tags ?? []).map((t) => (
            <Chip key={t} color={namespaceColor(t.slice(1).split(':')[0])}>
              {t}
            </Chip>
          ))}
        </span>
        {problem?.source ? (
          <a
            href={problem.source}
            target="_blank"
            rel="noreferrer"
            className="hud-label ml-auto hover:text-ink"
            style={{ color: ACCENT }}
          >
            Source ↗
          </a>
        ) : null}
      </div>

      {/* ── numbers ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Active" value={fmtDuration(session.activeSeconds)} sub="gaps ≤ 30 min" />
        <StatTile label="Wall" value={fmtDuration(session.wallSeconds)} sub="first → last event" />
        <StatTile label="Turns" value={session.turns} sub={`${session.eventCount} events`} />
        <StatTile
          label="Hints"
          value={Object.values(session.hintCounts).reduce((n, v) => n + v, 0)}
          sub={
            Object.keys(session.hintCounts).length
              ? Object.entries(session.hintCounts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([l, n]) => `${l}×${n}`)
                  .join(' ')
              : 'unassisted'
          }
        />
        <StatTile label="Test runs" value={session.testRuns} sub="pytest invocations" />
        <StatTile
          label="Reveals"
          value={session.reveals}
          sub="L4 full solutions"
          accent={session.reveals > 0 ? 'var(--color-severe)' : undefined}
        />
      </div>

      {/* ── timeline ───────────────────────────────────────────── */}
      <Panel
        label="Timeline"
        meta={`ELAPSED ACTIVE ${fmtClock(span)}`}
        table={
          <TableView
            columns={['at', 'clock', 'type', 'state', 'level', 'pause before', 'note']}
            rows={marks.map((m) => [
              fmtClock(m.at),
              fmtTime(m.ts),
              `${m.glyph} ${m.type}`,
              m.state ?? '—',
              m.level ?? '—',
              m.gapS ? fmtDuration(m.gapS) : '—',
              m.note ?? '—',
            ])}
          />
        }
      >
        {marks.length === 0 ? (
          <Empty label="NO EVENTS" hint="This session has a debrief row but no logged timeline." />
        ) : (
          <>
            <SessionTimeline marks={marks} totalSeconds={span} />
            <Legend
              className="mt-2"
              items={[
                { label: 'state change', color: ACCENT, glyph: EVENT_GLYPH['state-change'] },
                { label: 'hint', color: hintColor('L2'), glyph: EVENT_GLYPH.hint },
                { label: 'test run', color: INK_MUTED, glyph: EVENT_GLYPH['test-run'] },
                { label: 'reveal', color: 'var(--color-severe)', glyph: EVENT_GLYPH.reveal },
                { label: 'turn', color: INK_SUBTLE, glyph: EVENT_GLYPH['user-turn'] },
              ]}
            />
          </>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel
          label="Time in state"
          meta="ACTIVE SECONDS"
          table={
            <TableView
              columns={['state', 'active']}
              rows={stateBars.map((b) => [b.label, fmtDuration(b.value)])}
            />
          }
        >
          {stateBars.length === 0 ? (
            <Empty label="NO STATE DATA" />
          ) : (
            <BarList data={stateBars} format={fmtDuration} labelWidth={140} />
          )}
        </Panel>

        <Panel
          label="Hint response latency"
          meta="SECONDS TO NEXT MOVE"
          table={
            <TableView
              columns={['level', 'response', 'note']}
              rows={session.hintLatency.map((h) => [
                h.level ?? '—',
                h.responseS === null ? '—' : fmtDuration(h.responseS),
                h.note ?? '—',
              ])}
            />
          }
        >
          {session.hintLatency.length === 0 ? (
            <Empty label="NO HINTS" hint="Nothing was needed, or hints predate event logging." />
          ) : (
            <>
              <LatencyStrip
                values={session.hintLatency
                  .filter((h) => h.responseS !== null)
                  .map((h) => ({
                    label: `${h.level ?? 'hint'} — ${h.note ?? ''}`.trim(),
                    seconds: h.responseS as number,
                    color: hintColor(h.level),
                  }))}
              />
              <ul className="mt-2">
                {session.hintLatency.map((h, i) => (
                  <li
                    key={`${h.ts}-${i}`}
                    className="flex items-baseline gap-2 border-b border-line-muted py-1 last:border-0"
                  >
                    <Chip color={hintColor(h.level)}>{h.level ?? '?'}</Chip>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-ink-muted" title={h.note}>
                      {h.note ?? '—'}
                    </span>
                    <span className="hud-num shrink-0 text-[11px] text-ink">
                      {h.responseS === null ? '—' : fmtDuration(h.responseS)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-ink-subtle">
                A weak signal on its own: 2–10 min after a hint reads as working it, over 30 min is
                probably a break.
              </p>
            </>
          )}
        </Panel>

        <Panel label="Longest pauses" meta="TOP 5">
          {session.pauses.length === 0 ? (
            <Empty label="NO PAUSES RECORDED" />
          ) : (
            <ul>
              {session.pauses.slice(0, 5).map((p, i) => (
                <li key={i} className="border-b border-line-muted py-1.5 last:border-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="hud-num text-[12px] text-ink">{fmtDuration(p.gapS)}</span>
                    {p.gapS > BREAK_S ? <Chip color={INK_SUBTLE}>break</Chip> : null}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-subtle">
                    after{' '}
                    <span style={{ color: eventColor(p.after.type ?? '', p.after.level) }}>
                      {p.after.type}
                      {p.after.level ? ` ${p.after.level}` : ''}
                    </span>
                    {' → resumed with '}
                    <span style={{ color: eventColor(p.resumedWith.type ?? '', p.resumedWith.level) }}>
                      {p.resumedWith.type}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ── record ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel label="Assessments" meta="THIS SITTING">
          {session.assessments.length === 0 ? (
            <Empty label="NOT ASSESSED" />
          ) : (
            <ul>
              {session.assessments.map((a, i) => (
                <li key={i} className="border-b border-line-muted py-2 last:border-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="hud-label text-ink">{a.dimension.replace(/-/g, ' ')}</span>
                    <span className="hud-num text-[12px]" style={{ color: ACCENT }}>
                      L{a.level}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">{a.evidence}</p>
                </li>
              ))}
            </ul>
          )}
          {session.summary ? (
            <div className="mt-3 border-t border-line-muted pt-2">
              <Field label="Outcome">{session.summary.outcome}</Field>
              <Field label="Time">{session.summary.time_complexity ?? '—'}</Field>
              <Field label="Space">{session.summary.space_complexity ?? '—'}</Field>
              <Field label="Solution">
                {problem?.hasSolution ? `${problem.solutionLines} lines` : 'not on disk'}
              </Field>
              <Field label="Tests">{problem?.testFiles.length ?? 0} file(s)</Field>
            </div>
          ) : null}
        </Panel>

        <Panel label="Session log" meta={thisLog ? thisLog.title.toUpperCase() : 'LOG.MD'}>
          {thisLog ? (
            <div className="max-h-[380px] overflow-auto pr-1">
              <Markdown source={thisLog.body} />
            </div>
          ) : (
            <Empty
              label="NO LOG ENTRY"
              hint="A dated section is appended to the problem's log.md at DEBRIEF."
            />
          )}
        </Panel>
      </div>

      {problem?.problemMd ? (
        <Panel label="Problem" meta={problem.key.toUpperCase()}>
          <div className="max-h-[420px] overflow-auto pr-1">
            <Markdown source={problem.problemMd} />
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
