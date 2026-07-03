# 3620 — Network Recovery Pathways · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-03 — session 1

- **Outcome:** solved-optimal (judge accepted; reached the better asymptotic bound)
- **Final complexity:** time O((V+E) log m) / space O(V+E)
- **Hints used:** L1, L1, L0, L1, L2, L3
- **Tags:** #structure:graph #technique:binary-search-on-answer #technique:dijkstra #technique:topological-sort #weakness:complexity-analysis #weakness:missed-edge-case

**Approach path.** Came in doubting they could do a HARD. Restated cleanly (DAG, offline
pruning, two-part: existence + max score) but initially misread `k` as a per-edge cap;
corrected to "sum of path edges ≤ k" after one probe on Example 1. Started from an
exhaustive best-first idea tracking (path score, remaining budget) plus a precomputed
min-cost oracle. A single L1 coupling probe — "the oracle runs over cheap edges that
violate the score you're claiming" — unlocked the key reframe: **binary-search-on-answer**,
`feasible(c) = can we reach n-1 within budget k using only edges ≥ c?`, which deletes the
backward search entirely. Chose Dijkstra for the feasibility check; nearly abandoned it
over a mis-costed complexity (see below). Implemented, got accepted (945 ms). Then, in
the optimization loop, cashed in the DAG property (flagged turn 1, unused) by learning
topological sort — re-derived Kahn's algorithm from first principles — and rewrote the
feasibility check as a heap-free linear DP over a once-computed topo order:
O((V+E) log m). Accepted again at 1059 ms (a wash / slightly slower — see weaknesses).

**Where they got stuck.**
- *k semantics* — one probe against Example 1 fixed the per-edge-vs-sum confusion.
- *Dijkstra as a black box* — forgot the internals entirely; given a mechanics refresher
  (settle-on-pop invariant, one push per relaxation → O((V+E) log V)). Also needed a
  heapq API cheat sheet.
- *Inverted heap* — misapplied the max-heap negation trick from the cheat sheet, so the
  feasibility search popped the most-expensive path first and fail-fast returned -1.
  Found only after an L2 hand-trace of Example 1.
- *Unconnected node* — `self.edges[node]` KeyError'd on nodes with no out-edges; surfaced
  as a judge WA on `edges=[]`. Fixed by pre-seeding adjacency for all n nodes.
- *Topological sort* — had never met the concept; re-derived Kahn's (peel degree-0 nodes,
  maintain degree counts, worklist queue) almost entirely unaided once pointed at the DAG.

**Exposed weaknesses.**
- **complexity-analysis (recurring):** claimed Dijkstra costs "more than edge×node" ≈ 5·10⁹
  and judged the whole plan too slow; only after an L0 nudge to count pops/pushes did they
  recompute (V+E) log V. Same shape as 0045 (mis-cost of a nested scan). *But* the closing
  reasoning — why the asymptotically-better topo-DP didn't beat Dijkstra on wall-clock
  (goal-directed early-exit + C-heap vs Python-loop constants + LeetCode noise) — was sharp.
- **missed-edge-case (recurring):** shipped to the judge without any degenerate-input test;
  disconnected/empty graph → WA. Third session in a row lost to an unanticipated boundary
  (cf. n=1 on 0045, endpoint-thief on 2812). Diagnosis was instant once shown.
- **implementation-correctness:** the inverted-heap bug came from applying a remembered
  trick (negate-for-max-heap) without checking it fit the need. Offsetting positive: the
  Kahn topo sort + linear DP were correct on the first try.
- **Knowledge gaps (not a weakness tag):** Dijkstra internals, heapq API, and topological
  sort were all rediscovered live rather than recalled — strong first-principles ability,
  but costly in time (~2h wall). Worth drilling to fluency.

**On redo (if applicable).** N/A — first attempt at this problem.
