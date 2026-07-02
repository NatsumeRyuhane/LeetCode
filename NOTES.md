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
| Decomposition | 5 | 0045: restated forward-only movement, minimum jumps, and guaranteed reachability accurately | ↑ |
| Pattern recognition | 4 | 0045: moved from DP/heap to BFS/FIFO ordering after light prompting | → |
| Complexity analysis | 3 | 0045: found repeated range scans after prompt; needed L2 for the contiguous processed boundary | ↓ |
| Implementation correctness | 3 | 0045: fixed dist timing, neighbor update, strict improvement, and processed-boundary off-by-one | ↑ |
| Edge-case handling | 3 | 0045: missed n=1, then diagnosed and fixed it from a failing local test | ↑ |
| Optimization | 4 | 0045: improved accepted runtime from 1986 ms to 43 ms, then replaced heap with FIFO locally | ↑ |

## Focus next

- **`#weakness:pointer-bookkeeping` — current priority.** 0045 had several one-index/update-target slips after the invariant was verbalized; trace the exact variable being updated before submitting.
- **`#weakness:complexity-analysis`.** When a solution passes but is slow, identify the repeated unit of work; here it was overlapping range scans, not just heap overhead.
- **`#weakness:missed-edge-case`.** Keep adding one boundary test before judge submit; n=1 was caught locally only after review added it.
