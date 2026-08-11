/**
 * Parity check: `src/lib/analytics.ts` vs `tools/coachdb.py stats`.
 *
 * The dashboard re-derives session timing in TypeScript instead of shelling out
 * to the Python CLI, which means two implementations of the same rules. This
 * script runs both over a real practice repo and fails on any disagreement, so
 * the duplication can't silently drift.
 *
 * Usage: node scripts/check-parity.mjs [repo-root]
 *        (defaults to $COACH_REPO_ROOT, else walks up for the repo markers)
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));

function findRepo(start) {
  const marker = (d) => fs.existsSync(path.join(d, 'TAGS.md')) && fs.existsSync(path.join(d, 'tools/coachdb.py'));
  let dir = path.resolve(start);
  for (let i = 0; i < 12; i += 1) {
    if (marker(dir)) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

const repo = path.resolve(process.argv[2] ?? process.env.COACH_REPO_ROOT ?? findRepo(here) ?? '.');
if (!fs.existsSync(path.join(repo, 'tools/coachdb.py'))) {
  console.error(`not a practice repo: ${repo}`);
  process.exit(2);
}

// Load the TS analytics by bundling it to a temp ESM module.
const bundle = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coach-parity-')), 'analytics.mjs');
await esbuild.build({
  entryPoints: [path.resolve(here, '../src/lib/analytics.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: bundle,
  logLevel: 'silent',
});
const { statsForSession } = await import(bundle);

const readJsonl = (p) =>
  fs.existsSync(p)
    ? fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
    : [];

const events = readJsonl(path.join(repo, 'db/events.jsonl'));
const keys = [...new Set(events.map((e) => e.session))];

if (keys.length === 0) {
  console.log(`no sessions in ${repo}/db/events.jsonl — nothing to compare`);
  process.exit(0);
}

let failures = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

for (const key of keys) {
  const { stdout } = await execFileAsync('python3', ['tools/coachdb.py', 'stats', '--session', key], { cwd: repo });
  const py = JSON.parse(stdout);
  const ts = statsForSession(key, events);

  const checks = [
    ['events', py.events, ts.eventCount],
    ['wall_seconds', py.wall_seconds, ts.wallSeconds],
    ['active_seconds', py.active_seconds, ts.activeSeconds],
    ['seconds_in_state', py.seconds_in_state, ts.secondsInState],
    [
      'hint_latency',
      py.hint_latency,
      ts.hintLatency.map((h) => ({ level: h.level, note: h.note, response_s: h.responseS })),
    ],
    [
      'longest_pauses',
      py.longest_pauses,
      // Python emits the top 5, already sorted by gap descending.
      ts.pauses.slice(0, 5).map((p) => ({ gap_s: p.gapS, after: strip(p.after), resumed_with: strip(p.resumedWith) })),
    ],
  ];

  for (const [name, expected, actual] of checks) {
    if (!eq(expected, actual)) {
      failures += 1;
      console.error(`✗ ${key} · ${name}`);
      console.error(`    coachdb.py: ${JSON.stringify(expected)}`);
      console.error(`    analytics : ${JSON.stringify(actual)}`);
    }
  }
}

/** Python's `_summ` emits only the keys that are present, in a fixed order. */
function strip(s) {
  const out = {};
  for (const k of ['type', 'state', 'level', 'note']) if (s[k] !== undefined) out[k] = s[k];
  return out;
}

if (failures > 0) {
  console.error(`\n${failures} mismatch(es) across ${keys.length} session(s) — analytics.ts has drifted from coachdb.py`);
  process.exit(1);
}
console.log(`✓ parity holds across ${keys.length} session(s) in ${repo}`);
