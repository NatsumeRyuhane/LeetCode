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
| Decomposition | 5 | 0055: restated start-at-0, reach-last, and up-to jump semantics accurately | ↑ |
| Pattern recognition | 5 | 0055: proposed the max-coverage invariant unaided and justified contiguous reachability | ↑ |
| Complexity analysis | 4 | 0055: chose a single left-to-right scan; final solution is O(n)/O(1), though not stated explicitly | → |
| Implementation correctness | 3 | 0055: missed the loop increment at first, then self-diagnosed after one trace prompt | ↑ |
| Edge-case handling | 2 | 2812: judge WA on endpoint-is-thief; no self-authored boundary tests (not exercised in 3286) | → |
| Optimization | 4 | 0055: started directly from the optimal coverage scan instead of enumerating jumps | → |

## Focus next

- **`#weakness:pointer-bookkeeping` — current priority.** 0055 had the correct invariant immediately, but the loop-control variable was not advanced in the first ready version. Drill: trace the changing variables on one provided example before declaring ready.
- **`#weakness:refactor-regressions`.** The broader pattern is still "design is right in words, code lags by one guard/update." Keep writing the invariant before coding, then check the shipped loop/branch updates against it.
- **`#weakness:missed-edge-case`.** Still little self-driven adversarial testing; before submitting, write 1-2 boundary cases even when the main idea feels obvious.
