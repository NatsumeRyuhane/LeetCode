# Coach notes

Bounded dashboard maintained by the leetcode-coach — a **materialized view over
`db/assessments.jsonl`**, regenerated in place each debrief. Constant size by design:
one row per dimension, one line of evidence, at most three focus items. History and
detail live in the db (`tools/coachdb.py trend / query`) and each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.
Trend: ↑ / → / ↓ over the last few assessments (`coachdb.py trend --dimension ...`).

| Dimension | Level | Latest evidence (one line) | Trend |
| --- | --- | --- | --- |
| Decomposition | 4 | 3517: derived pair-counts and the unique odd centre from the palindromicity guarantee unaided, before any hint | → |
| Pattern recognition | 4 | 3517: proposed the correct count-then-emit-and-mirror method at approach stage with zero hints | → |
| Complexity analysis | 4 | 3517: Ω(n) floor argued from *both* obligations (read the multiset, write n chars) — but never re-derived after editing, and shipped a self-introduced O(n²) | → |
| Implementation correctness | 2 | 3517: three defects — `str(reversed(x))` repr leak, a stale `-= 2` left behind after moving the scan bound, then a "fix" that renamed variables instead of changing the operation | ↓ |
| Edge-case handling | 2 | 3517: fifth straight session with no self-written test past the provided examples; coach supplied all three edge cases before submit | → |
| Optimization | 2 | 3517: both bottleneck hypotheses overturned by the profiler, attempted fix ran 4× slower, tapped out to L4 | ↓ |

## Focus next

- **`#weakness:unverified-assumption` (new tag) — measure, don't assert.** Three overturned guesses in one session: a hand-trace claiming counts the code never produced; "the culprit is my string construction" (not a hotspot at all); "unwrapping the helpers won't matter" (they were 65 % of cumulative time). Every one was settled in seconds by a `print` or a profile that wasn't run. **The rule: when a claim is about what the machine does — a value, a hotspot, a cost — the trace is the suspect and the measurement is the authority.** `sessions/3517-*/bench.py` is reusable scaffolding for the perf half of this (`--profile` for call counts, `--scale` for the growth curve).
- **`#weakness:missed-edge-case` — five sessions, habit still not firing.** No longer a lapse, it's a hole in the workflow: the coach has written the pre-submit edge cases every time. Next session, before *any* judge submit, write one degenerate-input test yourself (empty / singleton / all-identical / the value the guarantee seems to rule out) — and on 3517 the one that mattered was `"bbabb"`, where the smallest letter is pinned to the centre and cannot be pulled forward.
- **`#weakness:language-mechanics` (new tag) — Python semantics, not algorithmics.** `str(reversed(x))` returning a repr, believing a `str` could be reused as a mutable buffer, and treating `+=` as intrinsically fast rather than as a CPython refcount-1 tail-resize special case. Consolidate the one transferable rule from the 3517 reveal: **a Python-level loop over n items is ~10× an equivalent C-level builtin, at identical big-O** — reach for `Counter` / `str.count` / `sorted` / `join` / `c * k` / slicing before writing the loop.
