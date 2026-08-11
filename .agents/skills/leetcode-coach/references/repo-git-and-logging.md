# Repo, git & logging

Everything the coach writes to disk, plus the git conventions that make sessions greppable across time. Read before your first write of a session.

## Contents
- [Repo layout](#repo-layout)
- [Bootstrap](#bootstrap-state-0)
- [The coachdb layer](#the-coachdb-layer)
- [The pytest import trick](#the-pytest-import-trick)
- [Git conventions](#git-conventions)
- [File formats](#file-formats)
- [Ability assessment rubric](#ability-assessment-rubric)

## Repo layout

```
<leetcode repo>/
├── .gitignore              # .venv/, __pycache__/, .pytest_cache/
├── pyproject.toml          # single repo-level uv project + pytest config
├── uv.lock
├── NOTES.md                # BOUNDED snapshot: current ability levels + focus (materialized view)
├── TAGS.md                 # canonical tag registry (source of truth for tags)
├── tools/
│   ├── coachdb.py          # stdlib JSONL store + query CLI (copied in at bootstrap)
│   └── dashboard.sh        # launches the skill's dashboard against THIS repo (copied in at bootstrap)
├── db/                     # append-only JSONL, created lazily by coachdb
│   ├── events.jsonl        # timeline: turns, state changes, hints, test runs (with gap_s)
│   ├── sessions.jsonl      # one summary row per completed session
│   └── assessments.jsonl   # one row per (session × dimension) — full assessment history
└── sessions/
    └── 0146-lru-cache/
        ├── problem.md      # statement + link + the user's restated understanding
        ├── solution.py     # the USER writes here; imported by tests from outside
        ├── log.md          # accumulating per-session detail for THIS problem
        └── tests/
            ├── conftest.py       # adds ../ to sys.path so `import solution` works
            └── test_solution.py  # provided examples + edge cases (I/O only)
```

One uv env at the repo root serves every problem — leetcode rarely needs third-party packages (occasionally `sortedcontainers`). Add such deps with `uv add <pkg>` at repo root when a problem genuinely needs one.

## Bootstrap (state 0)

Run only if the piece is missing; each step is idempotent.

1. `git rev-parse --git-dir` — if it fails, `git init`.
2. If no `pyproject.toml`, copy `assets/templates/pyproject.toml`, then `uv sync` (the template already declares pytest in `[dependency-groups]`; sync creates `.venv/` and `uv.lock` — no `uv add` needed).
3. Copy `assets/templates/gitignore` → `.gitignore`, `NOTES.md`, `TAGS.md` if absent. Create `sessions/`.
4. Copy `assets/tools/coachdb.py` → `tools/coachdb.py` if absent (`db/` is created lazily on first write). The copy — rather than invoking from the skill directory — keeps the repo self-contained. Copy `assets/tools/dashboard.sh` → `tools/dashboard.sh` too, and `chmod +x` it; it must live in the repo because it derives which repo to serve from its own path. Both copies are worth re-checking on an already-bootstrapped repo — a repo set up before a tool existed is missing it, and this step is the only thing that installs it.
5. If the repo has no commits yet: `git add -A && git commit -m "chore: bootstrap leetcode practice repo"`. If the commit fails on missing git identity, ask the user for name/email rather than inventing one.

## The coachdb layer

Append-only JSONL under `db/`, driven by `tools/coachdb.py` (stdlib only — no deps, no env needed; run with `python3`). It exists so the coach can **pull specific records on demand instead of stuffing history into context**, and so timing becomes measurable. Rows are never edited — corrections are new rows — which keeps git diffs clean: a debrief commit's diff shows exactly the rows that session produced.

**Session keys: `<NNNN>-<slug>@<YYYY-MM-DD>` — one key per sitting.** Redos get a new key (new date), so gap computation and `stats` never conflate attempts. The part before `@` is the problem key; the CLI auto-stores it as `problem` on every row, and `query --problem <NNNN>-<slug>` matches every sitting of a problem (with a fallback that derives it for rows logged before this convention). Two sittings on the same day: suffix `.2` manually.

**Three tables:**

```jsonc
// events.jsonl — the timeline. `log` auto-stamps ts and computes gap_s since the
// previous event in the same session (this is the response-latency measurement).
{"ts":"2026-07-02T10:14:22-07:00","session":"3286-safe-walk@2026-07-01","problem":"3286-safe-walk","type":"hint",
 "state":"APPROACH","level":"L1","note":"probed read-order","gap_s":142}

// sessions.jsonl — one summary row per completed session, written at debrief.
{"ts":"...","session":"3286-safe-walk@2026-07-01","problem":"3286-safe-walk","outcome":"solved-optimal","hints":["L1","L2"],
 "tags":["#technique:bfs","#weakness:bfs-mechanics"],"time_complexity":"O(V+E)","space_complexity":"O(V)"}

// assessments.jsonl — one row per (session × exercised dimension). Full history;
// NOTES.md shows only the latest snapshot.
{"ts":"...","session":"3286-safe-walk@2026-07-01","problem":"3286-safe-walk","dimension":"implementation-correctness",
 "level":2,"evidence":"shipped mark-at-discovery a round late"}
```

**Event types:** `user-turn`, `state-change`, `hint` (with `--level`), `test-run`, `reveal` (L4), `note`.

**CLI quick reference** (full `--help` on the script):

```bash
python3 tools/coachdb.py log --session <key> --type user-turn --state IMPLEMENTATION
python3 tools/coachdb.py log --session <key> --type hint --level L2 --note "failing test: empty grid"
python3 tools/coachdb.py session --session <key> --outcome solved-optimal --hints L1,L2 \
    --tags "#technique:bfs,#weakness:bfs-mechanics" --time "O(V+E)" --space "O(V)"
python3 tools/coachdb.py assess --session <key> --dimension complexity-analysis --level 4 \
    --evidence "derived amortized copy() cost unaided"
python3 tools/coachdb.py query sessions --tag "#weakness:off-by-one" --limit 5   # JSONL out
python3 tools/coachdb.py query events --problem 0146-lru-cache                    # every sitting
python3 tools/coachdb.py query events --session <key> --type hint                 # one sitting
python3 tools/coachdb.py trend --dimension implementation-correctness             # level history
python3 tools/coachdb.py stats --session <key>  # wall/active time, time-in-state,
                                                # per-hint response latency, longest pauses
                                                # (pauses pair "after" event with "resumed_with")
```

**Division of labor with git:** the db answers structured questions (tags, trends, timing); git answers narrative ones (what did the code look like, what was the attempt sequence). Commit trailers stay as a redundant grep path, but the db is the primary lookup.

**The dashboard reads these same files.** `assets/dashboard/` renders `db/*.jsonl` + `sessions/` + `NOTES.md` + `TAGS.md` as a live HUD, and it re-derives the `stats` numbers in TypeScript rather than shelling out to this CLI. So a change to `cmd_stats`' rules — `BREAK_S`, how a gap accrues to a state, how a pause pairs with its neighbours — must be mirrored in `assets/dashboard/src/lib/analytics.ts`, or the dashboard and the debrief will quietly disagree.

**Timing discipline:** the gap data only exists if `log` runs every turn — make it the first action on each user message. Interpret gaps per the rules in SKILL.md (weak signal, corroborate with content, >30 min ≈ break).

## The pytest import trick

Tests live in `sessions/<id>/tests/` and must import `sessions/<id>/solution.py` (its sibling's parent). The repo-level env doesn't put that on the path, so each problem's `tests/conftest.py` injects it:

```python
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
```

`parents[1]` of `sessions/<id>/tests/conftest.py` is `sessions/<id>/`, so `import solution` resolves to `solution.py` there. Run tests scoped to one problem from the repo root:

```bash
uv run pytest sessions/0146-lru-cache/tests/
```

No `conftest.py` edits needed per problem — the template is identical everywhere; INTAKE just copies it.

## Git conventions

The git history **is** the training log (requirement 6). Consistency is what makes `git log --grep` useful, so follow the schema exactly.

**Branch per session**, off `main`:
```
drill/<YYYY-MM-DD>-<NNNN>-<slug>      e.g. drill/2026-07-01-0146-lru-cache
```

**Commit types** map to flow states. `type(scope): subject`, scope = zero-padded problem id:
- `wip(0146):` — checkpoint during implementation (may be broken/TLE).
- `attempt(0146):` — the user declared ready; snapshots what they submitted.
- `solve(0146):` — passes local tests / accepted by judge.
- `opt(0146):` — an optimization step.
- `note(0146):` — debrief; updates to `log.md` / `NOTES.md` / `TAGS.md`.

Write subjects that say *what was happening*, so the log reads like a story:
```
wip(0146):     brute-force get/put, both O(n) — TLE expected on large inputs
attempt(0146): hashmap + DLL, get/put O(1) — 2 local tests fail
solve(0146):   fixed eviction pointer bookkeeping — all local tests pass
note(0146):    debrief + assessment update
```

**Trailers** carry the machine-parseable metadata (requirement 7). Put them on the `attempt`/`solve`/`note` commits and the merge:
```
Tags: #design #structure:hashmap #structure:doubly-linked-list #weakness:pointer-bookkeeping
Outcome: solved-optimal
Hints: L1,L2,L2
```
(All tags used must already exist in `TAGS.md` — register first, then use.)

**Close with a `--no-ff` merge** so each session is a visible bubble in `git log --graph`:
```bash
git checkout main
git merge --no-ff drill/2026-07-01-0146-lru-cache \
  -m "session(0146): solved-optimal, hints L1/L2, pointer-bookkeeping weakness" \
  -m "Tags: #design #structure:hashmap #weakness:pointer-bookkeeping"
```

**Safety guards** — you are running git in the user's repo:
- Before branching, check `git status --porcelain`. If there are unrelated uncommitted changes, stop and ask; don't sweep them into a session.
- Never `push --force`, `reset --hard`, or `rebase` shared history. Redo = new branch, never rewrite.
- If any git step is ambiguous, ask rather than guess.

**Querying history** for cross-session feedback:
```bash
git log --all --grep="#weakness:complexity-analysis"   # every session where this bit them
git log --graph --oneline --all                          # the shape of their journey
git log --all --grep="0146"                              # everything for one problem
```

## File formats

### `problem.md` (per problem, written at INTAKE)
Statement (pasted or fetched), source URL, difficulty, and — added during UNDERSTANDING-CHECK — the user's own restatement. This is context for future sessions; keep the user's wording.

### `log.md` (per problem, appended each session at DEBRIEF)
One `## <date> — session N` section per attempt; never overwrite prior sections. Each contains: approach path, where they got stuck, hint levels used, final complexity (time/space), exposed weaknesses with the concrete moment each surfaced, and — on a redo — whether a previously flagged weakness resolved. Template in `assets/templates/log.md`.

### `NOTES.md` (repo-level, a bounded materialized view)
NOTES.md must stay **constant-size** — it is regenerated from the db each debrief, never an accumulating log. It is *your* bounded context: cheap to read mid-session without loading history. (The human-facing view is `assets/dashboard/`, which renders the same db far better than any markdown table can — see SKILL.md § The dashboard. Neither replaces the other, and neither replaces an actual debrief.) Two parts: (1) the **ability table** — per dimension exactly one row: latest level, *one line* of evidence from the most recent session that exercised it, and a trend arrow derived from `coachdb.py trend` (↑/→/↓ over the last few assessments); (2) **focus next** — at most three tag-linked recommendations. If you feel the urge to keep old evidence "for context", that's what `db/assessments.jsonl` is for — query it, don't hoard it. Template in `assets/templates/NOTES.md`.

### `TAGS.md` (repo-level registry)
Three namespaces — `#structure:*`, `#technique:*`, `#weakness:*` — each a flat list with a one-line gloss. Add a tag here *before* using it in a commit trailer or log, so tags never fork into synonyms. Seed in `assets/templates/TAGS.md`.

## Ability assessment rubric

Assess **demonstrated behavior on the session's problem**, grounded in specific moments. This is a skills readout to guide practice, not a character judgment — cite evidence, avoid sweeping claims about the person, and don't invent a level for a dimension the problem didn't exercise (mark it `n/a` this session).

Six dimensions:
1. **Decomposition** — turning the prose into a precise, constraint-aware problem.
2. **Pattern recognition** — mapping the problem to a known structure/technique.
3. **Complexity analysis** — deriving and justifying time/space, unprompted.
4. **Implementation correctness** — translating a correct idea into bug-free code.
5. **Edge-case handling** — anticipating empties, duplicates, overflow, boundaries.
6. **Optimization** — recognizing a suboptimal bound and reaching a better one.

Five-point scale, applied per dimension with evidence:
- **1 nascent** — didn't engage the dimension or went materially wrong.
- **2 developing** — right instinct, needed strong hints (L2–L3) to land it.
- **3 competent** — got there with light nudging (L0–L1).
- **4 proficient** — handled it unaided, cleanly.
- **5 strong** — unaided, and articulated the *why* / tradeoffs.

Record each exercised dimension as a db row — `coachdb.py assess --dimension ... --level N --evidence "..."` — capturing the level *and the moment it showed* ("claimed the nested loop was O(n), corrected only after a counting prompt"). NOTES.md then shows only the latest snapshot per dimension; trends come from `coachdb.py trend`, not memory. Levels move slowly; one session nudges the picture, it doesn't rewrite it.
