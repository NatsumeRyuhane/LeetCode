/**
 * coach-data — serves a leetcode-coach practice repo to the dashboard.
 *
 * The dashboard is strictly read-only: it never writes to the repo, never runs
 * git, and never touches `db/`. It reads what the coach already wrote and
 * assembles it into one `Snapshot` per request.
 *
 * Mounted on both the dev server and `vite preview`, so a built bundle keeps
 * working. Files under `db/` and `sessions/` are watched; a change pushes a
 * `coach:update` message over Vite's websocket and the client refetches.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { Connect, Plugin, ViteDevServer } from 'vite';

import type {
  CoachAssessment,
  CoachEvent,
  CoachSession,
  GitCommit,
  ProblemFiles,
  Snapshot,
  TagDef,
} from '../src/lib/types.ts';

const execFileAsync = promisify(execFile);

/** Marks a directory as a coach practice repo. `db/` is created lazily, so it is not required. */
const ROOT_MARKERS = ['TAGS.md', 'tools/coachdb.py'];

const isRepoRoot = (dir: string): boolean =>
  ROOT_MARKERS.every((m) => fs.existsSync(path.join(dir, m)));

/**
 * Locate the practice repo.
 *
 * `COACH_REPO_ROOT` wins; otherwise walk up from the dashboard's own location,
 * which lands on the repo when it is vendored at
 * `.claude/skills/leetcode-coach/assets/dashboard`. Falls back to cwd so the
 * plugin still boots (with a warning) when nothing matches.
 */
export function resolveRepoRoot(start: string): { root: string; found: boolean } {
  const fromEnv = process.env.COACH_REPO_ROOT;
  if (fromEnv) {
    const abs = path.resolve(fromEnv);
    return { root: abs, found: isRepoRoot(abs) };
  }
  for (const base of [start, process.cwd()]) {
    let dir = path.resolve(base);
    for (let i = 0; i < 12; i += 1) {
      if (isRepoRoot(dir)) return { root: dir, found: true };
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return { root: process.cwd(), found: false };
}

// ─────────────────────────────────────────────────────────── readers

const readTextIfExists = (p: string): string | undefined => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return undefined;
  }
};

/**
 * Parse one JSONL table. A malformed line is skipped with a warning rather than
 * failing the whole request — a half-written row must not blank the dashboard.
 */
function readJsonl<T>(file: string, warnings: string[]): T[] {
  const raw = readTextIfExists(file);
  if (raw === undefined) return [];
  const rows: T[] = [];
  raw.split('\n').forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      rows.push(JSON.parse(trimmed) as T);
    } catch {
      warnings.push(`${path.basename(file)}:${i + 1} — unparseable JSON line, skipped`);
    }
  });
  return rows;
}

/** Session keys are `<problem>@<date>`; older rows may lack the derived `problem`. */
const problemOf = (row: { problem?: string; session?: string }): string =>
  row.problem || (row.session ?? '').split('@')[0] || '';

/**
 * Parse `TAGS.md`. The registry is a set of `## \`#namespace:*\`` headings, each
 * followed by `- \`#tag\` — gloss` list items.
 */
export function parseTags(md: string | undefined, warnings: string[]): TagDef[] {
  if (!md) return [];
  const tags: TagDef[] = [];
  for (const line of md.split('\n')) {
    const m = /^\s*-\s+`(#[^`]+)`\s*(?:[—–-]\s*(.*))?$/.exec(line);
    if (!m) continue;
    const tag = m[1].trim();
    const colon = tag.indexOf(':');
    tags.push({
      tag,
      namespace: colon === -1 ? tag.slice(1) : tag.slice(1, colon),
      gloss: (m[2] ?? '').trim(),
    });
  }
  if (tags.length === 0) warnings.push('TAGS.md — no registry entries matched, tag glosses unavailable');
  return tags;
}

/** Pull `- **Key:** value` bullets and the `# NNNN — Title` heading out of `problem.md`. */
function parseProblemMd(md: string | undefined): {
  title?: string;
  difficulty?: string;
  source?: string;
} {
  if (!md) return {};
  const out: { title?: string; difficulty?: string; source?: string } = {};
  const heading = /^#\s+(.+)$/m.exec(md);
  if (heading) out.title = heading[1].replace(/^\d+\s*[—–-]\s*/, '').trim();
  const field = (name: string): string | undefined => {
    const m = new RegExp(`^\\s*-\\s+\\*\\*${name}:\\*\\*\\s*(.+)$`, 'im').exec(md);
    return m ? m[1].trim() : undefined;
  };
  const diff = field('Difficulty');
  // Templates ship `{Easy | Medium | Hard}` placeholders — treat unfilled as absent.
  if (diff && !diff.startsWith('{')) out.difficulty = diff;
  const src = field('Source');
  if (src && !src.startsWith('{')) out.source = src.replace(/^<|>$/g, '');
  return out;
}

const countLines = (s: string): number => s.split('\n').filter((l) => l.trim()).length;

/** Walk `sessions/` and collect each problem directory's files and metadata. */
function readProblems(root: string): ProblemFiles[] {
  const dir = path.join(root, 'sessions');
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const problems: ProblemFiles[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const base = path.join(dir, entry.name);
    const problemMd = readTextIfExists(path.join(base, 'problem.md'));
    const logMd = readTextIfExists(path.join(base, 'log.md'));
    const solution = readTextIfExists(path.join(base, 'solution.py'));
    const meta = parseProblemMd(problemMd);

    let testFiles: string[] = [];
    try {
      testFiles = fs
        .readdirSync(path.join(base, 'tests'))
        .filter((f) => f.startsWith('test_') && f.endsWith('.py'));
    } catch {
      /* a problem may not have a tests/ dir yet */
    }

    let updatedAt: number | undefined;
    try {
      updatedAt = Math.max(
        ...fs
          .readdirSync(base, { withFileTypes: true })
          .filter((f) => f.isFile())
          .map((f) => fs.statSync(path.join(base, f.name)).mtimeMs),
      );
    } catch {
      /* mtime is decoration; a failure here must not drop the problem */
    }

    const dash = entry.name.indexOf('-');
    problems.push({
      key: entry.name,
      id: dash === -1 ? entry.name : entry.name.slice(0, dash),
      slug: dash === -1 ? '' : entry.name.slice(dash + 1),
      title: meta.title || entry.name,
      difficulty: meta.difficulty,
      source: meta.source,
      problemMd,
      logMd,
      hasSolution: solution !== undefined && solution.trim().length > 0,
      solutionLines: solution ? countLines(solution) : 0,
      solutionBytes: solution ? Buffer.byteLength(solution, 'utf8') : 0,
      testFiles,
      updatedAt,
    });
  }
  // An absent or empty `sessions/` is the normal state of a fresh repo, not an
  // anomaly — the views say so themselves. Warnings are for real breakage.
  return problems.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Read the commit log for narrative context. Uses a record separator that cannot
 * occur in a subject line, and tolerates a repo with no commits (or no git).
 */
async function readCommits(root: string): Promise<GitCommit[]> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', '--all', '--date=iso-strict', '--pretty=format:%H%x1f%ad%x1f%s%x1f%(trailers:key=Tags,valueonly)%x1e', '-n', '400'],
      { cwd: root, maxBuffer: 8 * 1024 * 1024 },
    );
    return stdout
      .split('\x1e')
      .map((rec) => rec.trim())
      .filter(Boolean)
      .map((rec) => {
        const [hash, ts, subject, trailers = ''] = rec.split('\x1f');
        return {
          hash: hash.slice(0, 8),
          ts,
          subject,
          tags: trailers.split(/\s+/).filter((t) => t.startsWith('#')),
        };
      });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────── snapshot

async function buildSnapshot(root: string, rootFound: boolean): Promise<Snapshot> {
  const warnings: string[] = [];
  if (!rootFound) {
    warnings.push(
      `No practice repo found (looked for ${ROOT_MARKERS.join(' + ')}). Set COACH_REPO_ROOT to the repo root.`,
    );
  }
  const db = (t: string) => path.join(root, 'db', `${t}.jsonl`);
  const events = readJsonl<CoachEvent>(db('events'), warnings).map((r) => ({
    ...r,
    problem: problemOf(r),
  }));
  const sessions = readJsonl<CoachSession>(db('sessions'), warnings).map((r) => ({
    ...r,
    problem: problemOf(r),
    hints: r.hints ?? [],
    tags: r.tags ?? [],
  }));
  const assessments = readJsonl<CoachAssessment>(db('assessments'), warnings).map((r) => ({
    ...r,
    problem: problemOf(r),
  }));

  const tagsMd = readTextIfExists(path.join(root, 'TAGS.md'));
  const notesMd = readTextIfExists(path.join(root, 'NOTES.md'));

  return {
    generatedAt: new Date().toISOString(),
    repoRoot: root,
    demo: false,
    warnings,
    events,
    sessions,
    assessments,
    tags: parseTags(tagsMd, warnings),
    notesMd: notesMd && notesMd.trim() ? notesMd : undefined,
    problems: readProblems(root),
    commits: await readCommits(root),
  };
}

/** Load the bundled fixture so the HUD is inspectable before the first real session. */
function loadDemoSnapshot(pluginDir: string): Snapshot {
  const file = path.resolve(pluginDir, '../fixtures/demo-snapshot.json');
  const snap = JSON.parse(fs.readFileSync(file, 'utf8')) as Snapshot;
  return { ...snap, demo: true, generatedAt: new Date().toISOString(), repoRoot: '(bundled demo fixture)' };
}

// ─────────────────────────────────────────────────────────── plugin

export function coachData(): Plugin {
  const pluginDir = path.dirname(new URL(import.meta.url).pathname);
  const { root, found } = resolveRepoRoot(pluginDir);
  const demo = process.env.COACH_DEMO === '1';

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/snapshot')) return next();
    const send = (body: unknown, status = 200) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(body));
    };
    const work = demo
      ? Promise.resolve(loadDemoSnapshot(pluginDir))
      : buildSnapshot(root, found);
    work.then(send).catch((err: unknown) => {
      send({ error: err instanceof Error ? err.message : String(err) }, 500);
    });
  };

  const watch = (server: ViteDevServer) => {
    if (demo) return;
    const targets = [path.join(root, 'db'), path.join(root, 'sessions'), path.join(root, 'NOTES.md'), path.join(root, 'TAGS.md')];
    server.watcher.add(targets);
    const ping = (file: string) => {
      if (!targets.some((t) => file === t || file.startsWith(`${t}${path.sep}`))) return;
      server.ws.send({ type: 'custom', event: 'coach:update', data: { file } });
    };
    server.watcher.on('change', ping);
    server.watcher.on('add', ping);
    server.watcher.on('unlink', ping);
  };

  return {
    name: 'coach-data',
    configureServer(server) {
      server.middlewares.use(middleware);
      watch(server);
      server.httpServer?.once('listening', () => {
        const label = demo ? 'DEMO FIXTURE (no repo data)' : root;
        server.config.logger.info(`\n  coach-data  →  ${label}\n`);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
