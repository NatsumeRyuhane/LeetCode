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
| Decomposition | 4 | 3620: clean two-part split + offline pruning, but misread k as a per-edge cap; fixed in one probe | ↓ |
| Pattern recognition | 4 | 3620: reframed to binary-search-on-answer off one L1 probe; re-derived Kahn's topo sort from scratch | → |
| Complexity analysis | 3 | 3620: mis-costed Dijkstra as V·E, feared TLE; recomputed after an L0 nudge; strong asymptotic-vs-wallclock reasoning | → |
| Implementation correctness | 3 | 3620: shipped an inverted (negated) heap, caught via L2 trace; but Kahn topo sort + linear DP correct first try | ↑ |
| Edge-case handling | 3 | 3620: missed unconnected/empty-graph node → judge WA (KeyError); diagnosed instantly once shown | → |
| Optimization | 4 | 3620: reached O((V+E) log m) topo-DP (topo sort named at L3), re-derived Kahn unaided | → |

## Focus next

- **`#weakness:complexity-analysis` — still the top recurring gap.** 3620 repeated the pattern: mis-costed a *standard* algorithm (Dijkstra as V·E) and nearly abandoned a correct plan over it. Derive the textbook bound of any named algorithm *before* declaring it too slow.
- **`#weakness:missed-edge-case`.** Third session lost to an unanticipated degenerate input (here: disconnected / empty graph → judge WA; cf. n=1 on 0045, endpoint-thief on 2812). Add one degenerate-input test (empty / singleton / disconnected) to the local set *before* every judge submit.
- **Consolidate the graph toolkit (`#technique:dijkstra`, `#technique:topological-sort`).** Both were rediscovered live this session, not recalled — Dijkstra internals and Kahn's were re-derived from zero. Drill them until they're recall, so the thinking time goes to the problem, not the tool.
