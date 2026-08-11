/**
 * TAGS — what the practice has actually covered, and what keeps biting.
 *
 * Faceted by namespace rather than stacked into one chart: within a facet every
 * bar is one series, so the categorical hue carries namespace identity only.
 * The weakness recurrence strip is the view's real payload — a weakness that
 * reappears three sessions later is the thing worth drilling.
 */
import { useMemo, useState } from 'react';

import { fmtDate, type Derived, type TagStat } from '../lib/analytics.ts';
import { INK_SUBTLE, OUTCOME_GLYPH, namespaceColor, outcomeColor } from '../lib/palette.ts';
import type { Snapshot } from '../lib/types.ts';
import { BarList } from '../components/charts.tsx';
import { Chip, Empty, Legend, Panel, TableView } from '../components/hud.tsx';

const NAMESPACE_ORDER = ['structure', 'technique', 'weakness'];

export function Tags({
  snapshot,
  derived,
  onOpen,
}: {
  snapshot: Snapshot;
  derived: Derived;
  onOpen: (key: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const { tagStats } = derived;

  const byNamespace = useMemo(() => {
    const map = new Map<string, TagStat[]>();
    for (const t of tagStats) {
      const list = map.get(t.namespace) ?? [];
      list.push(t);
      map.set(t.namespace, list);
    }
    return map;
  }, [tagStats]);

  /** Registered-but-unused tags: coverage gaps worth seeing. */
  const unused = useMemo(() => {
    const used = new Set(tagStats.map((t) => t.tag));
    return snapshot.tags.filter((t) => !used.has(t.tag));
  }, [snapshot.tags, tagStats]);

  const weaknessTimeline = useMemo(() => {
    const weaknesses = tagStats.filter((t) => t.namespace === 'weakness');
    return weaknesses.map((w) => ({
      tag: w.tag,
      gloss: w.gloss,
      hits: snapshot.sessions
        .filter((s) => s.tags.includes(w.tag))
        .sort((a, b) => a.ts.localeCompare(b.ts)),
    }));
  }, [tagStats, snapshot.sessions]);

  const selectedStat = selected ? tagStats.find((t) => t.tag === selected) : undefined;
  const selectedSessions = selectedStat
    ? snapshot.sessions.filter((s) => s.tags.includes(selectedStat.tag)).reverse()
    : [];

  if (tagStats.length === 0) {
    return (
      <Panel label="Tags" meta={`${snapshot.tags.length} REGISTERED`}>
        <Empty
          label="NO TAGS USED YET"
          hint={`TAGS.md registers ${snapshot.tags.length} tags. They start appearing here once sessions are debriefed with tag trailers.`}
        />
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {NAMESPACE_ORDER.map((ns) => {
          const list = (byNamespace.get(ns) ?? []).slice(0, 12);
          const registered = snapshot.tags.filter((t) => t.namespace === ns).length;
          return (
            <Panel
              key={ns}
              label={`#${ns}`}
              meta={`${byNamespace.get(ns)?.length ?? 0} / ${registered} USED`}
              table={
                <TableView
                  columns={['tag', 'sessions', 'last seen']}
                  rows={(byNamespace.get(ns) ?? []).map((t) => [
                    t.tag,
                    t.count,
                    fmtDate(t.lastSeen),
                  ])}
                />
              }
            >
              {list.length === 0 ? (
                <Empty label="NONE USED" />
              ) : (
                <BarList
                  data={list.map((t) => ({
                    label: t.tag.replace(`#${ns}:`, ''),
                    value: t.count,
                    color: namespaceColor(ns),
                    meta: [
                      ['tag', t.tag],
                      ['last seen', fmtDate(t.lastSeen)],
                      ...(t.gloss ? ([['gloss', t.gloss]] as [string, string][]) : []),
                    ],
                    onClick: () => setSelected(t.tag === selected ? null : t.tag),
                  }))}
                  labelWidth={150}
                />
              )}
            </Panel>
          );
        })}
      </div>

      {/* ── weakness recurrence ─────────────────────────────────── */}
      <Panel label="Weakness recurrence" meta="EACH MARK IS ONE SESSION" bodyClassName="p-0">
        {weaknessTimeline.length === 0 ? (
          <div className="p-4">
            <Empty label="NO WEAKNESSES TAGGED" hint="Nothing has recurred often enough to flag." />
          </div>
        ) : (
          <ul>
            {weaknessTimeline.map((w) => (
              <li key={w.tag} className="border-b border-line-muted px-3 py-2.5 last:border-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(w.tag === selected ? null : w.tag)}
                    className="hud-num text-left text-[12px] hover:underline"
                    style={{ color: namespaceColor('weakness') }}
                  >
                    {w.tag}
                  </button>
                  <span className="hud-label">
                    {w.hits.length} SESSION{w.hits.length === 1 ? '' : 'S'}
                  </span>
                </div>
                {w.gloss ? <p className="mt-0.5 text-[11px] text-ink-subtle">{w.gloss}</p> : null}
                <ol className="mt-2 flex flex-wrap items-center gap-1.5">
                  {w.hits.map((s) => (
                    <li key={s.session}>
                      <button
                        type="button"
                        onClick={() => onOpen(s.session)}
                        title={`${s.session} — ${s.outcome}`}
                        className="hud-num flex items-center gap-1 border border-line-muted px-1.5 py-0.5 text-[10px] hover:border-line"
                        style={{ color: outcomeColor(s.outcome) }}
                      >
                        <span>{OUTCOME_GLYPH[s.outcome] ?? '·'}</span>
                        <span className="text-ink-subtle">{fmtDate(s.ts)}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          label="Tag detail"
          meta={selectedStat ? selectedStat.tag.toUpperCase() : 'SELECT A TAG'}
          actions={
            selectedStat ? (
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
          {!selectedStat ? (
            <Empty label="NOTHING SELECTED" hint="Click a bar or a weakness tag to inspect its sessions." />
          ) : (
            <>
              {selectedStat.gloss ? (
                <p className="mb-3 text-[12px] text-ink-muted">{selectedStat.gloss}</p>
              ) : null}
              <ul>
                {selectedSessions.map((s) => (
                  <li key={s.session}>
                    <button
                      type="button"
                      onClick={() => onOpen(s.session)}
                      className="flex w-full items-center gap-3 border-b border-line-muted py-1.5 text-left last:border-0 hover:bg-subtle"
                    >
                      <span className="hud-num w-4 text-center" style={{ color: outcomeColor(s.outcome) }}>
                        {OUTCOME_GLYPH[s.outcome] ?? '·'}
                      </span>
                      <span className="hud-num w-20 shrink-0 text-[11px] text-ink-subtle">
                        {fmtDate(s.ts)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{s.problem}</span>
                      <span className="hud-num shrink-0 text-[11px] text-ink-subtle">
                        {s.hints.length ? s.hints.join('/') : 'no hints'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel label="Registry coverage" meta={`${unused.length} UNUSED`}>
          {unused.length === 0 ? (
            <Empty label="FULL COVERAGE" hint="Every registered tag has been used at least once." />
          ) : (
            <>
              <p className="mb-3 text-[11px] text-ink-subtle">
                Registered in TAGS.md but never used — untouched ground, not a problem in itself.
              </p>
              <div className="flex max-h-[260px] flex-wrap gap-1.5 overflow-auto">
                {unused.map((t) => (
                  <Chip key={t.tag} color={INK_SUBTLE} title={t.gloss}>
                    {t.tag}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <Legend
        className="px-1"
        items={NAMESPACE_ORDER.map((ns) => ({ label: `#${ns}`, color: namespaceColor(ns) }))}
      />
    </div>
  );
}
