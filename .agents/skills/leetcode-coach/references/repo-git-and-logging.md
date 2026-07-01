# Repo, git & logging

Everything the coach writes to disk, plus the git conventions that make sessions greppable across time. Read before your first write of a session.

## Contents
- [Repo layout](#repo-layout)
- [Bootstrap](#bootstrap-state-0)
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
├── NOTES.md                # coach scratchpad: rolling ability assessment + focus areas
├── TAGS.md                 # canonical tag registry (source of truth for tags)
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
2. If no `pyproject.toml`, copy `assets/templates/pyproject.toml`, then `uv add --dev pytest` (creates `.venv/` and `uv.lock`).
3. Copy `assets/templates/gitignore` → `.gitignore`, `NOTES.md`, `TAGS.md` if absent. Create `sessions/`.
4. If the repo has no commits yet: `git add -A && git commit -m "chore: bootstrap leetcode practice repo"`.

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

### `NOTES.md` (repo-level, the coach's rolling brain)
Two parts: (1) the **ability assessment** across the six dimensions below, each with a level, a one-line justification from the most recent evidence, and a rough trend; (2) **focus next** — 2–3 concrete recommendations tied to tags (e.g. "drill `#technique:binary-search-on-answer` — two misses in the last three sessions"). Rewrite in place each debrief; this is a snapshot, not a log. Template in `assets/templates/NOTES.md`.

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

Record the level *and the moment it showed* ("complexity: 2 — claimed the nested loop was O(n), corrected only after a counting prompt"). Levels move slowly; one session nudges the picture, it doesn't rewrite it.
