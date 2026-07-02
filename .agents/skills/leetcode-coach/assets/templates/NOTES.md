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
| Decomposition | – | *(no sessions yet)* | – |
| Pattern recognition | – | | – |
| Complexity analysis | – | | – |
| Implementation correctness | – | | – |
| Edge-case handling | – | | – |
| Optimization | – | | – |

## Focus next

*(At most three tag-linked recommendations, e.g. "drill #technique:binary-search-on-answer —
two misses in the last three sessions". Populated after the first session.)*
