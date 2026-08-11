/**
 * Generate `fixtures/demo-snapshot.json` — synthetic but structurally exact.
 *
 * Why a generator rather than a checked-in blob edited by hand: the fixture has
 * to obey the same invariants the real store does (gap_s is the delta between
 * consecutive events in a session, session keys are `<problem>@<date>`, tags
 * exist in TAGS.md, assessments are one row per session × dimension). Deriving
 * it from a script keeps those true; hand-editing JSON would not.
 *
 * Run: node scripts/make-demo-fixture.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../fixtures/demo-snapshot.json');

// Deterministic RNG so regenerating the fixture doesn't churn the diff.
let seed = 20260711;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const between = (lo, hi) => Math.floor(lo + rnd() * (hi - lo));

const DIMENSIONS = [
  'decomposition',
  'pattern-recognition',
  'complexity-analysis',
  'implementation-correctness',
  'edge-case-handling',
  'optimization',
];

const PROBLEMS = [
  { key: '0146-lru-cache', title: 'LRU Cache', difficulty: 'Medium', tags: ['#design', '#structure:hashmap', '#structure:linked-list'] },
  { key: '0011-container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium', tags: ['#technique:two-pointer'] },
  { key: '0207-course-schedule', title: 'Course Schedule', difficulty: 'Medium', tags: ['#structure:graph', '#technique:topological-sort'] },
  { key: '0239-sliding-window-maximum', title: 'Sliding Window Maximum', difficulty: 'Hard', tags: ['#structure:queue', '#technique:sliding-window'] },
  { key: '0875-koko-eating-bananas', title: 'Koko Eating Bananas', difficulty: 'Medium', tags: ['#technique:binary-search-on-answer'] },
  { key: '3286-safe-walk', title: 'Find a Safe Walk Through a Grid', difficulty: 'Medium', tags: ['#structure:graph', '#technique:0-1-bfs'] },
  { key: '0042-trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', tags: ['#structure:stack', '#technique:two-pointer'] },
  { key: '0994-rotting-oranges', title: 'Rotting Oranges', difficulty: 'Medium', tags: ['#structure:graph', '#technique:multi-source-bfs'] },
];

const WEAKNESSES = [
  '#weakness:off-by-one',
  '#weakness:complexity-analysis',
  '#weakness:missed-edge-case',
  '#weakness:pointer-bookkeeping',
  '#weakness:bfs-mechanics',
  '#weakness:premature-implementation',
];

const HINT_NOTES = [
  'probed read-order',
  'asked what the window invariant is',
  'failing test: single element',
  'nudged toward restating the recurrence',
  'asked what is recomputed each step',
  'failing test: all duplicates',
  'asked for the cost of the inner scan',
];

const EVIDENCE = {
  decomposition: [
    'restated constraints unprompted, caught the "return any" wording',
    'missed the k ≤ n bound until asked to reread',
    'separated the invariant from the loop body cleanly',
  ],
  'pattern-recognition': [
    'reached for the right structure after one L1 nudge',
    'named the technique unaided from the constraint shape',
    'stalled on mapping to a known form, needed L2',
  ],
  'complexity-analysis': [
    'called the nested scan O(n), corrected only after a counting prompt',
    'derived the amortised bound unaided and justified it',
    'gave time but skipped space until asked',
  ],
  'implementation-correctness': [
    'shipped mark-at-discovery a round late',
    'first draft passed every local test',
    'dropped the seed guard when restructuring working code',
  ],
  'edge-case-handling': [
    'anticipated the empty input before writing the loop',
    'missed the single-element case, found it from the failing test',
    'enumerated duplicates and overflow unprompted',
  ],
  optimization: [
    'spotted the repeated work and cut a pass without a hint',
    'accepted the O(n log n) and tapped out consciously',
    'moved to the linear bound after being asked what was recomputed',
  ],
};

const STATE_FLOW = [
  'INTAKE',
  'UNDERSTANDING-CHECK',
  'APPROACH',
  'HINT-LOOP',
  'IMPLEMENTATION',
  'REVIEW',
  'POST-SUBMIT',
  'OPTIMIZATION-LOOP',
  'DEBRIEF',
];

const iso = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  const tzh = pad(Math.floor(Math.abs(tz) / 60));
  const tzm = pad(Math.abs(tz) % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}${sign}${tzh}:${tzm}`;
};
const dayOf = (d) => iso(d).slice(0, 10);

const events = [];
const sessions = [];
const assessments = [];
const commits = [];

// Walk backwards from today, ~11 weeks of practice with realistic gaps.
const today = new Date();
today.setHours(0, 0, 0, 0);

const sittings = [];
for (let back = 76; back >= 0; back -= 1) {
  // Roughly every third day, with a couple of dead weeks.
  const inSlump = back > 34 && back < 48;
  if (rnd() > (inSlump ? 0.08 : 0.34)) continue;
  const date = new Date(today.getTime() - back * 86_400_000);
  sittings.push(date);
}

const problemAttempts = new Map();

sittings.forEach((date, idx) => {
  const problem = PROBLEMS[idx % PROBLEMS.length];
  const attempt = (problemAttempts.get(problem.key) ?? 0) + 1;
  problemAttempts.set(problem.key, attempt);

  const sessionKey = `${problem.key}@${dayOf(date)}`;
  const cursor = new Date(date);
  cursor.setHours(between(9, 21), between(0, 59), 0, 0);

  // Progress over time: earlier sittings lean on higher hints.
  const maturity = idx / Math.max(1, sittings.length - 1);
  const hintCount = Math.max(0, Math.round(3 - maturity * 2.4 + (rnd() - 0.5)));
  const hintsUsed = [];

  let prev = null;
  const push = (rec) => {
    const ts = iso(cursor);
    const row = { ts, session: sessionKey, problem: problem.key, ...rec };
    if (prev !== null) row.gap_s = Math.round((cursor.getTime() - prev) / 1000);
    prev = cursor.getTime();
    events.push(row);
  };
  const advance = (lo, hi) => cursor.setTime(cursor.getTime() + between(lo, hi) * 1000);

  for (const state of STATE_FLOW) {
    if (state === 'HINT-LOOP' && hintCount === 0) continue;
    if (state === 'OPTIMIZATION-LOOP' && rnd() > 0.4) continue;

    push({ type: 'state-change', state });
    advance(20, 90);
    push({ type: 'user-turn', state });
    advance(30, 240);

    if (state === 'HINT-LOOP') {
      for (let h = 0; h < hintCount; h += 1) {
        const level = `L${Math.min(4, h + (rnd() > 0.6 ? 1 : 0))}`;
        hintsUsed.push(level);
        push({ type: 'hint', state, level, note: pick(HINT_NOTES) });
        advance(90, 700); // thinking time after a hint
        push({ type: 'user-turn', state });
        advance(30, 180);
      }
    }

    if (state === 'IMPLEMENTATION') {
      // Implementation is the long pole, and often contains the break.
      for (let t = 0; t < between(2, 5); t += 1) {
        advance(120, 900);
        push({ type: 'user-turn', state });
      }
      if (rnd() > 0.75) {
        advance(2200, 5200); // a genuine break — excluded from active time
        push({ type: 'user-turn', state });
      }
    }

    if (state === 'REVIEW') {
      for (let t = 0; t < between(1, 3); t += 1) {
        advance(60, 300);
        push({ type: 'test-run', state, note: rnd() > 0.5 ? 'all local tests pass' : '2 failed' });
      }
    }

    if (state === 'POST-SUBMIT' && rnd() > 0.88) {
      advance(120, 400);
      push({ type: 'reveal', state, level: 'L4', note: 'user asked for the full solution' });
      hintsUsed.push('L4');
    }
  }

  const revealed = hintsUsed.includes('L4');
  const outcome = revealed
    ? 'revealed'
    : rnd() > 0.86
      ? 'unsolved'
      : rnd() > 0.3 + maturity * 0.25
        ? 'solved-suboptimal'
        : 'solved-optimal';

  const weakness = rnd() > 0.35 ? [pick(WEAKNESSES)] : [];
  const tags = [...problem.tags, ...weakness];

  sessions.push({
    ts: iso(cursor),
    session: sessionKey,
    problem: problem.key,
    outcome,
    hints: hintsUsed,
    tags,
    time_complexity: pick(['O(n)', 'O(n log n)', 'O(V+E)', 'O(n·k)', 'O(1) amortised']),
    space_complexity: pick(['O(1)', 'O(n)', 'O(V)', 'O(k)']),
  });

  // 3–5 dimensions exercised per sitting; levels drift up slowly with maturity.
  const exercised = DIMENSIONS.filter(() => rnd() > 0.35).slice(0, 5);
  for (const dimension of exercised.length ? exercised : ['implementation-correctness']) {
    const base = 2 + maturity * 2;
    const level = Math.max(1, Math.min(5, Math.round(base + (rnd() - 0.5) * 1.4)));
    assessments.push({
      ts: iso(cursor),
      session: sessionKey,
      problem: problem.key,
      dimension,
      level,
      evidence: pick(EVIDENCE[dimension]),
    });
  }

  commits.push({
    hash: Math.floor(rnd() * 0xfffffff).toString(16).padStart(8, '0').slice(0, 8),
    ts: iso(cursor),
    subject: `note(${problem.key.slice(0, 4)}): debrief + assessment update`,
    tags,
  });
});

// ── files under sessions/
const problems = [...problemAttempts.keys()].map((key) => {
  const meta = PROBLEMS.find((p) => p.key === key);
  const attempts = sessions.filter((s) => s.problem === key);
  const logBody = attempts
    .map(
      (s, i) => `## ${s.ts.slice(0, 10)} — session ${i + 1}

- **Outcome:** ${s.outcome}
- **Final complexity:** time ${s.time_complexity} / space ${s.space_complexity}
- **Hints used:** ${s.hints.length ? s.hints.join(', ') : 'none'}
- **Tags:** ${s.tags.join(' ')}

**Approach path.** Opened with a brute-force read of the constraints, then narrowed once the
input bound made the naive pass untenable.

**Where they got stuck.** ${pick([
        'The invariant held on paper but not across the mutation.',
        'Read the bound as inclusive and built the loop around it.',
        'Recomputed the aggregate every step without noticing.',
      ])}

**Exposed weaknesses.** ${
        s.tags.find((t) => t.startsWith('#weakness:'))
          ? `${s.tags.find((t) => t.startsWith('#weakness:'))} — surfaced at the first failing case.`
          : 'None specific to this sitting.'
      }
`,
    )
    .join('\n---\n\n');

  return {
    key,
    id: key.slice(0, 4),
    slug: key.slice(5),
    title: meta.title,
    difficulty: meta.difficulty,
    source: `https://leetcode.com/problems/${key.slice(5)}/`,
    problemMd: `# ${key.slice(0, 4)} — ${meta.title}\n\n- **Source:** https://leetcode.com/problems/${key.slice(5)}/\n- **Difficulty:** ${meta.difficulty}\n\n## Statement\n\n*(Demo fixture — the real repo carries the pasted statement and its constraints here.)*\n\n## User's restatement\n\n*(Filled in during UNDERSTANDING-CHECK, in the user's own words.)*\n`,
    logMd: `# ${key.slice(0, 4)} — ${meta.title} · session log\n\nNewest sessions appended below; never overwrite prior sections.\n\n---\n\n${logBody}`,
    hasSolution: true,
    solutionLines: between(14, 48),
    solutionBytes: between(400, 1600),
    testFiles: ['test_solution.py'],
    updatedAt: Date.now(),
  };
});

// ── TAGS.md registry (mirrors the shipped template's namespaces)
const tagDefs = [
  ['#structure:hashmap', 'structure', 'dict/set for O(1) membership or grouping'],
  ['#structure:heap', 'structure', 'priority queue / k-th element / streaming top-k'],
  ['#structure:stack', 'structure', 'LIFO, monotonic stack, parsing'],
  ['#structure:queue', 'structure', 'FIFO, BFS frontier, deque/sliding window'],
  ['#structure:linked-list', 'structure', 'singly/doubly linked list manipulation'],
  ['#structure:tree', 'structure', 'binary tree / BST / n-ary traversal'],
  ['#structure:trie', 'structure', 'prefix tree'],
  ['#structure:graph', 'structure', 'adjacency list/matrix, nodes+edges (grids count)'],
  ['#structure:union-find', 'structure', 'disjoint set / connectivity'],
  ['#technique:two-pointer', 'technique', 'opposing or same-direction pointers'],
  ['#technique:sliding-window', 'technique', 'variable/fixed window over a sequence'],
  ['#technique:binary-search', 'technique', 'search a sorted space'],
  ['#technique:binary-search-on-answer', 'technique', 'binary search the answer value, not the array'],
  ['#technique:dp', 'technique', 'dynamic programming / memoization'],
  ['#technique:greedy', 'technique', 'locally optimal choice'],
  ['#technique:backtracking', 'technique', 'build/prune candidate solutions'],
  ['#technique:bfs', 'technique', 'breadth-first search'],
  ['#technique:multi-source-bfs', 'technique', 'BFS seeded from many sources at once'],
  ['#technique:0-1-bfs', 'technique', 'shortest path with only 0/1 edge weights'],
  ['#technique:dfs', 'technique', 'depth-first search / recursion'],
  ['#technique:dijkstra', 'technique', 'non-negative-weight shortest path via a min-heap frontier'],
  ['#technique:topological-sort', 'technique', 'linearize a DAG so every edge points forward'],
  ['#technique:prefix-sum', 'technique', 'cumulative aggregates'],
  ['#technique:sorting', 'technique', 'sort as a preprocessing step'],
  ['#design', 'design', 'object/system design (LRU cache, iterators, etc.)'],
  ['#weakness:complexity-analysis', 'weakness', 'miscounts or skips deriving big-O'],
  ['#weakness:off-by-one', 'weakness', 'boundary/index errors'],
  ['#weakness:missed-edge-case', 'weakness', 'empties, duplicates, single element, overflow'],
  ['#weakness:pointer-bookkeeping', 'weakness', 'loses track of links/indices during mutation'],
  ['#weakness:premature-implementation', 'weakness', 'codes before the approach is sound'],
  ['#weakness:pattern-recognition', 'weakness', "doesn't map the problem to a known technique"],
  ['#weakness:refactor-regressions', 'weakness', 'drops a guard/seed/invariant when restructuring'],
  ['#weakness:bfs-mechanics', 'weakness', 'BFS/DFS confusion, visited timing'],
].map(([tag, namespace, gloss]) => ({ tag, namespace, gloss }));

// ── NOTES.md, as the coach would have rewritten it at the last debrief
const latestByDim = {};
for (const a of assessments) latestByDim[a.dimension] = a;
const arrow = (dim) => {
  const hist = assessments.filter((a) => a.dimension === dim);
  if (hist.length < 2) return '–';
  const d = hist[hist.length - 1].level - hist[hist.length - 2].level;
  return d > 0 ? '↑' : d < 0 ? '↓' : '→';
};
const label = (d) => d.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const notesMd = `# Coach notes

Bounded dashboard maintained by the leetcode-coach — a **materialized view over
\`db/assessments.jsonl\`**, regenerated in place each debrief.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.

| Dimension | Level | Latest evidence (one line) | Trend |
|---|---|---|---|
${DIMENSIONS.map(
  (d) =>
    `| ${label(d)} | ${latestByDim[d]?.level ?? '–'} | ${latestByDim[d]?.evidence ?? ''} | ${arrow(d)} |`,
).join('\n')}

## Focus next

- Drill \`#technique:binary-search-on-answer\` — two misses in the last three sessions.
- \`#weakness:off-by-one\` keeps surfacing on boundary reads; re-do 0011 cold.
- Derive complexity *before* coding, not after the review prompt.
`;

const snapshot = {
  generatedAt: new Date().toISOString(),
  repoRoot: '(bundled demo fixture)',
  demo: true,
  warnings: [],
  events,
  sessions,
  assessments,
  tags: tagDefs,
  notesMd,
  problems,
  commits: commits.reverse(),
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(snapshot, null, 1)}\n`);
console.log(
  `wrote ${path.relative(process.cwd(), out)} — ${sessions.length} sessions, ${events.length} events, ${assessments.length} assessments`,
);
