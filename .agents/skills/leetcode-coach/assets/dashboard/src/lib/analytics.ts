/**
 * Derived metrics over a Snapshot.
 *
 * The per-session timing block is a deliberate port of `cmd_stats` in
 * `tools/coachdb.py` — same BREAK_S cutoff, same "gap accrues to the state we
 * were in" rule, same pause pairing. If the CLI's rules change, change them
 * here too; a dashboard that quietly disagrees with the debrief numbers is
 * worse than no dashboard.
 */
import {
  DIMENSIONS,
  HINT_LEVELS,
  OUTCOMES,
  PROTOCOL_STATES,
  type CoachAssessment,
  type CoachEvent,
  type CoachSession,
  type Dimension,
  type HintLevel,
  type Outcome,
  type ProblemFiles,
  type Snapshot,
} from './types.ts';

/** Gaps longer than this are breaks, not struggle. Matches coachdb.BREAK_S. */
export const BREAK_S = 1800;

const parseTs = (s: string): number => new Date(s).getTime();

/** Local calendar day (`YYYY-MM-DD`) for an ISO timestamp. */
export function dayKey(ts: string): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface EventSummary {
  type?: string;
  state?: string;
  level?: string;
  note?: string;
}

const summarize = (e: CoachEvent): EventSummary => ({
  type: e.type,
  state: e.state,
  level: e.level,
  note: e.note,
});

export interface Pause {
  gapS: number;
  after: EventSummary;
  resumedWith: EventSummary;
}

export interface HintLatency {
  level?: string;
  note?: string;
  /** Seconds until the user's next move; null when the hint is the last event. */
  responseS: number | null;
  ts: string;
}

export interface SessionStats {
  key: string;
  problem: string;
  /** The `@YYYY-MM-DD` half of the session key, or the first event's day. */
  date: string;
  eventCount: number;
  wallSeconds: number;
  /** Excludes gaps over BREAK_S, so breaks don't read as struggle. */
  activeSeconds: number;
  secondsInState: Record<string, number>;
  hintLatency: HintLatency[];
  pauses: Pause[];
  hintCounts: Record<string, number>;
  turns: number;
  testRuns: number;
  reveals: number;
  statesVisited: string[];
  firstTs?: string;
  lastTs?: string;
  events: CoachEvent[];
  /** The debrief summary row, when the session reached DEBRIEF. */
  summary?: CoachSession;
  assessments: CoachAssessment[];
}

/** Port of `coachdb.py cmd_stats`, plus a few counters the HUD needs. */
export function statsForSession(key: string, events: CoachEvent[]): SessionStats {
  const ev = events
    .filter((e) => e.session === key)
    .slice()
    .sort((a, b) => parseTs(a.ts) - parseTs(b.ts));

  const base: SessionStats = {
    key,
    problem: key.split('@')[0],
    date: key.includes('@') ? key.split('@')[1] : ev[0] ? dayKey(ev[0].ts) : '',
    eventCount: ev.length,
    wallSeconds: 0,
    activeSeconds: 0,
    secondsInState: {},
    hintLatency: [],
    pauses: [],
    hintCounts: {},
    turns: 0,
    testRuns: 0,
    reveals: 0,
    statesVisited: [],
    events: ev,
    assessments: [],
  };
  if (ev.length === 0) return base;

  base.firstTs = ev[0].ts;
  base.lastTs = ev[ev.length - 1].ts;
  base.wallSeconds = Math.round((parseTs(base.lastTs) - parseTs(base.firstTs)) / 1000);

  // A gap accrues to the state we were in *before* this event's state change.
  let state: string | null = null;
  const seen: string[] = [];
  for (const e of ev) {
    const gap = e.gap_s ?? 0;
    if (gap > 0 && gap <= BREAK_S) {
      base.activeSeconds += gap;
      if (state !== null) base.secondsInState[state] = (base.secondsInState[state] ?? 0) + gap;
    }
    if (e.state) {
      state = e.state;
      if (!seen.includes(e.state)) seen.push(e.state);
    }
    if (e.type === 'user-turn') base.turns += 1;
    if (e.type === 'test-run') base.testRuns += 1;
    if (e.type === 'hint' && e.level) {
      base.hintCounts[e.level] = (base.hintCounts[e.level] ?? 0) + 1;
    }
    // A reveal *is* the ladder's top rung, but it is logged as its own event
    // type — count it as L4 so the ladder doesn't silently under-report.
    if (e.type === 'reveal') {
      base.reveals += 1;
      const level = e.level ?? 'L4';
      base.hintCounts[level] = (base.hintCounts[level] ?? 0) + 1;
    }
  }
  base.statesVisited = seen;

  // A pause's gap_s sits on the event that ENDS it — pair it with what preceded it.
  base.pauses = ev
    .map((e, i) => ({ e, i }))
    .filter(({ e, i }) => i > 0 && !!e.gap_s)
    .map(({ e, i }) => ({
      gapS: e.gap_s as number,
      after: summarize(ev[i - 1]),
      resumedWith: summarize(e),
    }))
    .sort((a, b) => b.gapS - a.gapS);

  base.hintLatency = ev
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.type === 'hint')
    .map(({ e, i }) => ({
      level: e.level,
      note: e.note,
      responseS: i + 1 < ev.length ? (ev[i + 1].gap_s ?? null) : null,
      ts: e.ts,
    }));

  return base;
}

export interface DimensionTrend {
  dimension: string;
  /** Chronological history — the trend line. */
  history: CoachAssessment[];
  latest?: CoachAssessment;
  /** Latest minus the previous assessment; 0 when there is only one. */
  delta: number;
  direction: 'up' | 'flat' | 'down' | 'none';
}

export interface TagStat {
  tag: string;
  namespace: string;
  gloss: string;
  count: number;
  /** Session keys carrying the tag, newest last. */
  sessions: string[];
  lastSeen?: string;
}

export interface DayActivity {
  day: string;
  events: number;
  activeSeconds: number;
  sessions: string[];
}

export interface ProblemRollup {
  key: string;
  files?: ProblemFiles;
  attempts: SessionStats[];
  /** Latest attempt's outcome, when it reached debrief. */
  latestOutcome?: string;
  totalActiveSeconds: number;
  hintTotal: number;
  lastTouched?: string;
}

export interface Derived {
  sessions: SessionStats[];
  /** Newest first. */
  sessionsDesc: SessionStats[];
  problems: ProblemRollup[];
  byDay: DayActivity[];
  byDayMap: Map<string, DayActivity>;
  outcomeCounts: Record<string, number>;
  hintTotals: Record<string, number>;
  tagStats: TagStat[];
  dimensionTrends: DimensionTrend[];
  /** Summed across every session, so the ladder reads as a whole-history shape. */
  stateTotals: { state: string; seconds: number }[];
  totals: {
    sessions: number;
    problems: number;
    activeSeconds: number;
    wallSeconds: number;
    hints: number;
    reveals: number;
    testRuns: number;
    solved: number;
    solveRate: number;
    hintsPerSession: number;
    currentStreak: number;
    longestStreak: number;
    activeDays: number;
  };
  isEmpty: boolean;
}

const orderIndex = <T extends readonly string[]>(list: T, v: string): number => {
  const i = list.indexOf(v as T[number]);
  return i === -1 ? list.length : i;
};

/** Consecutive-day streaks over days that saw any logged event. */
function streaks(days: string[]): { current: number; longest: number } {
  if (days.length === 0) return { current: 0, longest: 0 };
  const set = new Set(days);
  const sorted = days.slice().sort();
  const dayMs = 86_400_000;
  const asDate = (d: string) => new Date(`${d}T00:00:00`).getTime();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = asDate(sorted[i - 1]);
    const cur = asDate(sorted[i]);
    run = Math.round((cur - prev) / dayMs) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // The streak is "current" only if it reaches today or yesterday.
  let current = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const todayKey = dayKey(cursor.toISOString());
  if (!set.has(todayKey)) cursor.setTime(cursor.getTime() - dayMs);
  for (;;) {
    const k = dayKey(cursor.toISOString());
    if (!set.has(k)) break;
    current += 1;
    cursor.setTime(cursor.getTime() - dayMs);
  }
  return { current, longest };
}

export function derive(snap: Snapshot): Derived {
  const keys = new Set<string>();
  snap.events.forEach((e) => keys.add(e.session));
  snap.sessions.forEach((s) => keys.add(s.session));
  snap.assessments.forEach((a) => keys.add(a.session));

  const summaryByKey = new Map(snap.sessions.map((s) => [s.session, s]));
  const assessBySession = new Map<string, CoachAssessment[]>();
  for (const a of snap.assessments) {
    const list = assessBySession.get(a.session) ?? [];
    list.push(a);
    assessBySession.set(a.session, list);
  }

  const sessions = [...keys]
    .map((key) => {
      const st = statsForSession(key, snap.events);
      st.summary = summaryByKey.get(key);
      st.assessments = assessBySession.get(key) ?? [];
      // A session with only a debrief row (no events) still has a real date.
      if (!st.firstTs && st.summary) st.date = st.date || dayKey(st.summary.ts);
      return st;
    })
    .sort((a, b) => (a.firstTs ?? a.date).localeCompare(b.firstTs ?? b.date));
  const sessionsDesc = sessions.slice().reverse();

  // ── daily activity
  const byDayMap = new Map<string, DayActivity>();
  const bump = (day: string, key: string, events: number, active: number) => {
    const cur = byDayMap.get(day) ?? { day, events: 0, activeSeconds: 0, sessions: [] };
    cur.events += events;
    cur.activeSeconds += active;
    if (!cur.sessions.includes(key)) cur.sessions.push(key);
    byDayMap.set(day, cur);
  };
  for (const s of sessions) {
    if (s.events.length === 0) {
      if (s.date) bump(s.date, s.key, 0, 0);
      continue;
    }
    for (const e of s.events) {
      const gap = e.gap_s ?? 0;
      bump(dayKey(e.ts), s.key, 1, gap > 0 && gap <= BREAK_S ? gap : 0);
    }
  }
  const byDay = [...byDayMap.values()].sort((a, b) => a.day.localeCompare(b.day));

  // ── outcomes & hints
  const outcomeCounts: Record<string, number> = {};
  for (const s of snap.sessions) outcomeCounts[s.outcome] = (outcomeCounts[s.outcome] ?? 0) + 1;

  const hintTotals: Record<string, number> = {};
  for (const s of sessions) {
    for (const [lvl, n] of Object.entries(s.hintCounts)) {
      hintTotals[lvl] = (hintTotals[lvl] ?? 0) + n;
    }
  }
  // Sessions logged before per-hint events, or debriefed from a summary row only,
  // still carry their ladder in `hints[]` — fall back to it when no hint events exist.
  for (const s of sessions) {
    if (Object.keys(s.hintCounts).length > 0 || !s.summary) continue;
    for (const lvl of s.summary.hints) {
      hintTotals[lvl] = (hintTotals[lvl] ?? 0) + 1;
      s.hintCounts[lvl] = (s.hintCounts[lvl] ?? 0) + 1;
    }
  }

  // ── tags
  const tagMeta = new Map(snap.tags.map((t) => [t.tag, t]));
  const tagAcc = new Map<string, TagStat>();
  for (const s of snap.sessions) {
    for (const tag of s.tags) {
      const meta = tagMeta.get(tag);
      const colon = tag.indexOf(':');
      const cur =
        tagAcc.get(tag) ??
        ({
          tag,
          namespace: meta?.namespace ?? (colon === -1 ? tag.replace('#', '') : tag.slice(1, colon)),
          gloss: meta?.gloss ?? '',
          count: 0,
          sessions: [],
        } as TagStat);
      cur.count += 1;
      cur.sessions.push(s.session);
      cur.lastSeen = s.ts;
      tagAcc.set(tag, cur);
    }
  }
  const tagStats = [...tagAcc.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  // ── ability dimensions
  const dimNames = new Set<string>([...DIMENSIONS, ...snap.assessments.map((a) => a.dimension)]);
  const dimensionTrends: DimensionTrend[] = [...dimNames]
    .map((dimension) => {
      const history = snap.assessments
        .filter((a) => a.dimension === dimension)
        .sort((a, b) => a.ts.localeCompare(b.ts));
      const latest = history[history.length - 1];
      const prev = history[history.length - 2];
      const delta = latest && prev ? latest.level - prev.level : 0;
      return {
        dimension,
        history,
        latest,
        delta,
        direction: !latest ? 'none' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      } as DimensionTrend;
    })
    .sort(
      (a, b) =>
        orderIndex(DIMENSIONS, a.dimension) - orderIndex(DIMENSIONS, b.dimension) ||
        a.dimension.localeCompare(b.dimension),
    );

  // ── problems
  const fileByKey = new Map(snap.problems.map((p) => [p.key, p]));
  const problemKeys = new Set<string>([...snap.problems.map((p) => p.key), ...sessions.map((s) => s.problem)]);
  const problems: ProblemRollup[] = [...problemKeys]
    .filter(Boolean)
    .map((key) => {
      const attempts = sessions.filter((s) => s.problem === key);
      const last = attempts[attempts.length - 1];
      return {
        key,
        files: fileByKey.get(key),
        attempts,
        latestOutcome: last?.summary?.outcome,
        totalActiveSeconds: attempts.reduce((n, a) => n + a.activeSeconds, 0),
        hintTotal: attempts.reduce(
          (n, a) => n + Object.values(a.hintCounts).reduce((m, v) => m + v, 0),
          0,
        ),
        lastTouched: last?.lastTs ?? last?.summary?.ts,
      };
    })
    .sort((a, b) => (b.lastTouched ?? '').localeCompare(a.lastTouched ?? '') || a.key.localeCompare(b.key));

  // ── time in state, in protocol order
  const stateAcc: Record<string, number> = {};
  for (const s of sessions) {
    for (const [st, secs] of Object.entries(s.secondsInState)) {
      stateAcc[st] = (stateAcc[st] ?? 0) + secs;
    }
  }
  const stateTotals = Object.entries(stateAcc)
    .map(([state, seconds]) => ({ state, seconds }))
    .sort(
      (a, b) =>
        orderIndex(PROTOCOL_STATES, a.state) - orderIndex(PROTOCOL_STATES, b.state) ||
        a.state.localeCompare(b.state),
    );

  const solved = snap.sessions.filter((s) => s.outcome.startsWith('solved')).length;
  const hints = Object.values(hintTotals).reduce((n, v) => n + v, 0);
  const activeSeconds = sessions.reduce((n, s) => n + s.activeSeconds, 0);
  const { current, longest } = streaks(byDay.filter((d) => d.events > 0).map((d) => d.day));

  return {
    sessions,
    sessionsDesc,
    problems,
    byDay,
    byDayMap,
    outcomeCounts,
    hintTotals,
    tagStats,
    dimensionTrends,
    stateTotals,
    totals: {
      sessions: sessions.length,
      problems: problems.length,
      activeSeconds,
      wallSeconds: sessions.reduce((n, s) => n + s.wallSeconds, 0),
      hints,
      reveals: sessions.reduce((n, s) => n + s.reveals, 0),
      testRuns: sessions.reduce((n, s) => n + s.testRuns, 0),
      solved,
      solveRate: snap.sessions.length ? solved / snap.sessions.length : 0,
      hintsPerSession: sessions.length ? hints / sessions.length : 0,
      currentStreak: current,
      longestStreak: longest,
      activeDays: byDay.filter((d) => d.events > 0).length,
    },
    isEmpty: sessions.length === 0 && snap.problems.length === 0,
  };
}

// ─────────────────────────────────────────────────────────── formatting

/** Compact duration for HUD readouts: `4h 12m`, `18m 30s`, `42s`. */
export function fmtDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

/** Fixed-width duration for table columns. */
export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function fmtDate(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function fmtTime(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const fmtPct = (v: number): string => `${Math.round(v * 100)}%`;

export const isHintLevel = (v: string): v is HintLevel => (HINT_LEVELS as readonly string[]).includes(v);
export const isOutcome = (v: string): v is Outcome => (OUTCOMES as readonly string[]).includes(v);
export const isDimension = (v: string): v is Dimension => (DIMENSIONS as readonly string[]).includes(v);
