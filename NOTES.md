# Coach notes

Bounded dashboard maintained by the leetcode-coach — a **materialized view over
`db/assessments.jsonl`**, regenerated in place each debrief. Constant size by design:
one row per dimension, one line of evidence, at most three focus items. History and
detail live in the db (`tools/coachdb.py trend / query`) and each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.
Trend: ↑ / → / ↓ over the last few assessments (`coachdb.py trend --dimension ...`).

| Dimension | Level | Latest evidence (one line) | Trend |
|---|---|---|---|
| Decomposition | 4 | 3286: framed the round-based-BFS plan cleanly at approach, unaided | → |
| Pattern recognition | 4 | 3286: derived the monotonic-cost / 0-1-BFS argument unaided (coach never named it) | → |
| Complexity analysis | 4 | 3286: judged `.copy()` linear-across-run, a non-bottleneck, and declined needless micro-opt | ↑ |
| Implementation correctness | 2 | 3286: each fix lagged its own already-correct stated design by one bug | → |
| Edge-case handling | 2 | 2812: judge WA on endpoint-is-thief; no self-authored boundary tests (not exercised in 3286) | → |
| Optimization | 4 | 3286: reached O(1) discovery-marking + deque-swap from Socratic probes, zero reveals | ↑ |

## Focus next

- **`#weakness:refactor-regressions` — highest priority.** The shape shifted 2812→3286 from "loses an invariant while restructuring" to "code lags the design already stated correctly in words." Drill: write the invariant as a one-line comment/assertion *before* coding, then check the shipped code against it before declaring ready.
- **`#weakness:bfs-mechanics` (visited timing).** Recurred 2812→3286 — could state "mark at discovery, not dequeue" in words but took a full TLE→band-aid→probe→redesign cycle to land it. Watch whether it ships right on the *first* pass next BFS/graph problem.
- **`#weakness:missed-edge-case`.** Still no self-driven adversarial testing; both sessions' boundary breaks (2812 endpoint-is-thief WA, 3286 large-input TLE) came from the judge, not the user. Before submitting, write 1–2 own boundary cases.
