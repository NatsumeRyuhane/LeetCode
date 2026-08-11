/**
 * TIMING — where the hours actually go.
 *
 * Latency is a weak, corroborating signal, never a diagnosis, so this view
 * states that plainly and shows the raw pairs (what preceded a pause, what
 * ended it) instead of scoring anyone on the clock.
 */
import { useMemo } from 'react';

import {
  BREAK_S,
  fmtDate,
  fmtDuration,
  type Derived,
} from '../lib/analytics.ts';
import { ACCENT, INK_SUBTLE, hintColor, seqStep } from '../lib/palette.ts';
import { PROTOCOL_STATES } from '../lib/types.ts';
import { BarList, LatencyStrip } from '../components/charts.tsx';
import { Empty, Legend, Panel, StatTile, TableView } from '../components/hud.tsx';

/** Buckets chosen to match how SKILL.md reads a pause, not by even spacing. */
const LATENCY_BUCKETS: { label: string; max: number; read: string }[] = [
  { label: '< 1 min', max: 60, read: 'fluent' },
  { label: '1–2 min', max: 120, read: 'thinking' },
  { label: '2–10 min', max: 600, read: 'working it' },
  { label: '10–30 min', max: 1800, read: 'deep or distracted' },
  { label: '> 30 min', max: Infinity, read: 'probably a break' },
];

export function Timing({
  derived,
  onOpen,
}: {
  derived: Derived;
  onOpen: (key: string) => void;
}) {
  const { sessions, stateTotals, totals } = derived;

  const hintLatencies = useMemo(
    () =>
      sessions.flatMap((s) =>
        s.hintLatency
          .filter((h) => h.responseS !== null)
          .map((h) => ({
            session: s.key,
            level: h.level,
            note: h.note,
            seconds: h.responseS as number,
          })),
      ),
    [sessions],
  );

  const buckets = useMemo(() => {
    const counts = LATENCY_BUCKETS.map((b) => ({ ...b, count: 0 }));
    for (const h of hintLatencies) {
      const idx = counts.findIndex((b) => h.seconds < b.max);
      counts[idx === -1 ? counts.length - 1 : idx].count += 1;
    }
    return counts;
  }, [hintLatencies]);

  const allPauses = useMemo(
    () =>
      sessions
        .flatMap((s) => s.pauses.map((p) => ({ ...p, session: s.key })))
        .sort((a, b) => b.gapS - a.gapS)
        .slice(0, 12),
    [sessions],
  );

  const perSession = useMemo(
    () =>
      sessions
        .slice()
        .reverse()
        .slice(0, 14)
        .map((s) => ({
          label: `${s.date} ${s.problem}`,
          value: s.activeSeconds,
          color: ACCENT,
          meta: [
            ['wall', fmtDuration(s.wallSeconds)] as [string, string],
            ['events', String(s.eventCount)] as [string, string],
          ],
          onClick: () => onOpen(s.key),
        })),
    [sessions, onOpen],
  );

  const medianLatency = useMemo(() => {
    if (hintLatencies.length === 0) return 0;
    const sorted = hintLatencies.map((h) => h.seconds).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }, [hintLatencies]);

  if (sessions.length === 0) {
    return (
      <Panel label="Timing">
        <Empty label="NO TIMELINE DATA" hint="Timing appears once events are logged with gap_s." />
      </Panel>
    );
  }

  const stateBars = stateTotals
    .map((s) => ({ label: s.state, value: s.seconds, color: ACCENT }))
    .filter((s) => s.value > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Active total" value={fmtDuration(totals.activeSeconds)} sub="breaks excluded" />
        <StatTile
          label="Wall total"
          value={fmtDuration(totals.wallSeconds)}
          sub={`${Math.round((1 - totals.activeSeconds / Math.max(1, totals.wallSeconds)) * 100)}% idle`}
        />
        <StatTile
          label="Median hint response"
          value={medianLatency ? fmtDuration(medianLatency) : '—'}
          sub={`${hintLatencies.length} measured`}
        />
        <StatTile
          label="Active / session"
          value={fmtDuration(totals.sessions ? totals.activeSeconds / totals.sessions : 0)}
          sub={`${totals.sessions} sittings`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          label="Time in state"
          meta="ALL SESSIONS · PROTOCOL ORDER"
          table={
            <TableView
              columns={['state', 'active', 'share']}
              rows={stateBars.map((b) => [
                b.label,
                fmtDuration(b.value),
                `${Math.round((b.value / Math.max(1, totals.activeSeconds)) * 100)}%`,
              ])}
            />
          }
        >
          {stateBars.length === 0 ? (
            <Empty label="NO STATE DATA" />
          ) : (
            <>
              <BarList data={stateBars} format={fmtDuration} labelWidth={150} />
              <p className="mt-3 text-[11px] text-ink-subtle">
                Rows follow the state machine in flow order ({PROTOCOL_STATES[1]} →{' '}
                {PROTOCOL_STATES[PROTOCOL_STATES.length - 1]}), not by size — the shape of the ladder
                is the point.
              </p>
            </>
          )}
        </Panel>

        <Panel
          label="Hint response distribution"
          meta="SECONDS TO NEXT MOVE"
          table={
            <TableView
              columns={['bucket', 'hints', 'reads as']}
              rows={buckets.map((b) => [b.label, b.count, b.read])}
            />
          }
        >
          {hintLatencies.length === 0 ? (
            <Empty label="NO MEASURED RESPONSES" />
          ) : (
            <>
              <BarList
                data={buckets.map((b, i) => ({
                  label: b.label,
                  value: b.count,
                  color: seqStep(i / (buckets.length - 1)),
                  meta: [['reads as', b.read]],
                }))}
                labelWidth={84}
              />
              <div className="mt-3 border-t border-line-muted pt-3">
                <span className="hud-label">EVERY MEASURED RESPONSE</span>
                <LatencyStrip
                  values={hintLatencies.map((h) => ({
                    label: `${h.level ?? 'hint'} · ${h.session}`,
                    seconds: h.seconds,
                    color: hintColor(h.level),
                  }))}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-subtle">
                A weak signal, and only meaningful next to what the user actually did after the hint.
                A long pause alone might be lunch.
              </p>
            </>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          label="Active time per session"
          meta="LAST 14"
          table={
            <TableView
              columns={['session', 'active', 'wall']}
              rows={sessions
                .slice()
                .reverse()
                .map((s) => [s.key, fmtDuration(s.activeSeconds), fmtDuration(s.wallSeconds)])}
            />
          }
        >
          {perSession.length === 0 ? (
            <Empty label="NO SESSIONS" />
          ) : (
            <BarList data={perSession} format={fmtDuration} labelWidth={190} />
          )}
        </Panel>

        <Panel label="Longest pauses" meta="ACROSS ALL SESSIONS" bodyClassName="p-0">
          {allPauses.length === 0 ? (
            <div className="p-4">
              <Empty label="NO PAUSES RECORDED" />
            </div>
          ) : (
            <ul className="max-h-[340px] overflow-auto">
              {allPauses.map((p, i) => (
                <li key={`${p.session}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onOpen(p.session)}
                    className="flex w-full items-baseline gap-3 border-b border-line-muted px-3 py-2 text-left last:border-0 hover:bg-subtle"
                  >
                    <span
                      className="hud-num w-16 shrink-0 text-[12px]"
                      style={{ color: p.gapS > BREAK_S ? INK_SUBTLE : ACCENT }}
                    >
                      {fmtDuration(p.gapS)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] text-ink-muted">
                        {p.after.type}
                        {p.after.level ? ` ${p.after.level}` : ''} → {p.resumedWith.type}
                        {p.resumedWith.state ? ` · ${p.resumedWith.state}` : ''}
                      </span>
                      <span className="hud-num block text-[10px] text-ink-subtle">{p.session}</span>
                    </span>
                    {p.gapS > BREAK_S ? <span className="hud-label shrink-0">BREAK</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Legend
        className="px-1"
        items={[
          { label: 'counted as active', color: ACCENT },
          { label: `break (> ${Math.round(BREAK_S / 60)} min, excluded)`, color: INK_SUBTLE },
          { label: `sessions since ${fmtDate(sessions[0]?.firstTs)}`, color: 'transparent' },
        ].filter((l) => l.color !== 'transparent')}
      />
    </div>
  );
}
