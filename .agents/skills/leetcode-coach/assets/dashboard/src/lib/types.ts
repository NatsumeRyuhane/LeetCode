/**
 * Wire format between the `coach-data` Vite plugin and the app.
 *
 * These mirror the append-only JSONL rows written by `tools/coachdb.py`. Rows on
 * disk are never edited, and older rows may predate a field — so everything the
 * CLI treats as optional is optional here too, and the app must degrade rather
 * than assume. `problem` in particular is derived at read time for legacy rows.
 */

/** `log --type ...` — the fine-grained session timeline. */
export type EventType =
  | 'user-turn'
  | 'state-change'
  | 'hint'
  | 'test-run'
  | 'reveal'
  | 'note';

/** Protocol states from SKILL.md's session state machine, in flow order. */
export const PROTOCOL_STATES = [
  'BOOTSTRAP',
  'INTAKE',
  'UNDERSTANDING-CHECK',
  'APPROACH',
  'HINT-LOOP',
  'IMPLEMENTATION',
  'REVIEW',
  'POST-SUBMIT',
  'OPTIMIZATION-LOOP',
  'DEBRIEF',
] as const;
export type ProtocolState = (typeof PROTOCOL_STATES)[number];

/** Hint ladder rungs. L4 is the gated full reveal. */
export const HINT_LEVELS = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
export type HintLevel = (typeof HINT_LEVELS)[number];

/** Session outcomes, ordered best → worst (drives the status ramp). */
export const OUTCOMES = [
  'solved-optimal',
  'solved-suboptimal',
  'revealed',
  'unsolved',
] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** The six ability dimensions from the assessment rubric. */
export const DIMENSIONS = [
  'decomposition',
  'pattern-recognition',
  'complexity-analysis',
  'implementation-correctness',
  'edge-case-handling',
  'optimization',
] as const;
export type Dimension = (typeof DIMENSIONS)[number];

/** Rubric levels 1..5. */
export const LEVEL_NAMES: Record<number, string> = {
  1: 'nascent',
  2: 'developing',
  3: 'competent',
  4: 'proficient',
  5: 'strong',
};

export interface CoachEvent {
  ts: string;
  session: string;
  problem: string;
  type: EventType | string;
  state?: string;
  level?: string;
  note?: string;
  /** Seconds since the previous event in the same session; absent on the first. */
  gap_s?: number;
}

export interface CoachSession {
  ts: string;
  session: string;
  problem: string;
  outcome: Outcome | string;
  hints: string[];
  tags: string[];
  time_complexity?: string;
  space_complexity?: string;
  note?: string;
}

export interface CoachAssessment {
  ts: string;
  session: string;
  problem: string;
  dimension: string;
  level: number;
  evidence: string;
}

/** One tag from the `TAGS.md` registry. */
export interface TagDef {
  /** Full tag including the leading `#`, e.g. `#technique:bfs`. */
  tag: string;
  /** `structure` | `technique` | `weakness` | `design` | … */
  namespace: string;
  gloss: string;
}

/** A problem directory under `sessions/`. */
export interface ProblemFiles {
  key: string;
  /** Zero-padded id parsed off the key, e.g. `0146`. */
  id: string;
  slug: string;
  title: string;
  difficulty?: string;
  source?: string;
  problemMd?: string;
  logMd?: string;
  hasSolution: boolean;
  solutionLines: number;
  solutionBytes: number;
  testFiles: string[];
  /** mtime (ms) of the newest file in the problem directory. */
  updatedAt?: number;
}

/** One commit touching the practice record. */
export interface GitCommit {
  hash: string;
  ts: string;
  subject: string;
  /** Parsed from the `Tags:` trailer. */
  tags: string[];
}

/** Everything the dashboard renders, assembled server-side per request. */
export interface Snapshot {
  generatedAt: string;
  repoRoot: string;
  /** True when serving the bundled fixture instead of a real repo. */
  demo: boolean;
  /** Non-fatal problems (missing dirs, unparseable lines) surfaced in the UI. */
  warnings: string[];
  events: CoachEvent[];
  sessions: CoachSession[];
  assessments: CoachAssessment[];
  tags: TagDef[];
  notesMd?: string;
  problems: ProblemFiles[];
  commits: GitCommit[];
}
