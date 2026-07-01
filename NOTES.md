# Coach notes

Rolling snapshot maintained by the leetcode-coach. Rewritten in place each debrief.
This is a picture of *current* ability, not a log — the log lives in git history and
each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.
Each line: level — evidence from most recent relevant session — trend.

| Dimension | Level | Evidence | Trend |
|---|---|---|---|
| Decomposition | 4 | 2812: restated max-of-min bottleneck precisely; framed the two-phase plan unaided. | – (1st) |
| Pattern recognition | 4 | 2812: killed the count-paths DP for the *right* reason (needs topo order; 4-dir movement breaks it), then derived the decision reframe + multi-source BFS + monotonic→binary-search with only light nudges. | – (1st) |
| Complexity analysis | 3–4 | 2812: derived the O(n⁴) per-cell-BFS cost himself; engaged honestly with profiling to locate each bottleneck. | – (1st) |
| Implementation correctness | 2 | 2812: right ideas, but a long tail of slips — infinite recursion (unread visited set), inverted walkability, DFS-as-BFS, shared distance counter, `<` vs `<=`, inverted binary-search direction. Needed L1–L2 to land each. | – (1st) |
| Edge-case handling | 2 | 2812: judge WA on endpoint-is-a-thief; his 3 self-tests never probed the start/end cells being unsafe. | – (1st) |
| Optimization | 3 | 2812: reached multi-source BFS + binary search from nudges; the final filter-before-enqueue rewrite was coach-provided (L4). | – (1st) |

## Focus next

- **`#weakness:refactor-regressions` — highest priority.** He loses an invariant almost every time he restructures working code (dropped the visited *check* twice, dropped the queue seed, inverted bounds/branch directions mid-refactor). Drill: after any rewrite, re-list the invariants the old version guaranteed (seeded start? visited checked *before* expanding? bounds before enqueue?) and confirm each survives. Consider redoing 2812 from a blank `solution.py` to see if this resolves.
- **`#weakness:missed-edge-case` — test the boundaries of the input, not just the middle.** Before submitting, always hand-check the degenerate endpoints (here: start or goal cell being a thief). Pair with writing 1–2 adversarial cases himself, not just the provided examples.
- **`#weakness:bfs-mechanics` — solidify BFS vs DFS.** Reinforce: FIFO frontier (`deque`), per-node state carried with the node (not a shared counter), mark visited at *enqueue*. A couple of plain grid-BFS reps (e.g. `#technique:multi-source-bfs` like 0994 Rotting Oranges) would cement it cheaply.
