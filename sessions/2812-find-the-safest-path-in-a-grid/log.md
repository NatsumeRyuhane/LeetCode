# 2812 — Find the Safest Path in a Grid · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-02 — session 1

- **Outcome:** solved-optimal (Accepted 1036/1036) — final micro-optimization was **coach-provided (L4 reveal)**; the algorithm/design was the user's.
- **Final complexity:** time `O(n² log D)` (multi-source BFS map `O(n²)` + binary search over `D` distinct safeness values, each a reachability BFS `O(n²)`) / space `O(n²)`.
- **Hints used:** L0–L2 throughout (mostly L1 probing questions + L2 failing-test/edge nudges); one **L4 reveal** at the very end (coach implemented the filter-before-enqueue rewrite of both BFS loops at the user's explicit request after a long grind).
- **Tags:** `#structure:graph` `#structure:queue` `#technique:multi-source-bfs` `#technique:binary-search-on-answer` `#technique:bfs` `#weakness:refactor-regressions` `#weakness:bfs-mechanics` `#weakness:off-by-one` `#weakness:missed-edge-case`

**Approach path.** Restated the objective cleanly as max-over-paths of the min-cell-safeness (bottleneck). Reached for a count-paths-style grid DP, then **correctly killed it themselves** on the right grounds — a single-pass DP needs a topological order ("left/up already finalized"), which 4-directional movement destroys. From a nudge, derived the decision reframe (fix `k` → "is start→end reachable using only cells with safeness ≥ k?"). Built it as: (1) per-cell safeness map, (2) sweep `k` from high, reachability-checking each. Got correct on the 3 examples, then the judge exposed the rest.

**Where they got stuck (and what unblocked each).**
- Infinite recursion in the first path search — built a `cell_in_path` set but never *read* it (L1: "what tells it it's already been here?").
- Inverted walkability (`>` vs `<`) and off-by-one arrival `(n,n)` vs `(n-1,n-1)` — L1 "two gates" probe.
- Safeness map wildly inflated: it was a **DFS with a single shared distance counter**, not a BFS. Needed L1 nudges to separate `max`→nearest and DFS→fan-out, then to express BFS as a FIFO frontier carrying per-cell distance.
- First TLE (per-cell BFS, O(n⁴)) → derived multi-source BFS ("flow the wave from the thieves") mostly unaided.
- Map cascade blowup: strict `<` prune let equal-distance revisits re-fire subtrees; then over-corrected (my `<=` steer killed the sources → all-`99999` map — coach error, owned) → landed on a dedicated visited set.
- Judge **WA** on `[[0,1,1],[0,1,1],[0,0,1]]`: destination cell is a thief; the "arrived" check ran *before* the threshold check, so it accepted an unsafe goal. Caught via a regression test.
- Second/third TLE → binary search over `k` (monotonicity explained), then `deque.popleft()`, then filter-before-enqueue.

**Exposed weaknesses (with the moment each surfaced).**
- `#weakness:refactor-regressions` — **the dominant pattern.** Dropped the visited *check* writing the recursive search (infinite loop); dropped it *again* converting to iterative; dropped the queue **seed** in that same rewrite (IndexError); inverted both the bounds test and the binary-search branch directions during the `range()`/filter refactors. Working code repeatedly lost an invariant when restructured.
- `#weakness:bfs-mechanics` — implemented a DFS believing it was a BFS; used one shared `distance` counter across a frontier holding multiple rings; marked visited on pop instead of enqueue.
- `#weakness:off-by-one` — arrival coordinate; strict `<` vs `<=` map prune; **binary-search direction inverted** on a descending list (returned the smallest value).
- `#weakness:missed-edge-case` — never tested the endpoint itself being a thief; the judge's WA was exactly that.

**Strengths worth reinforcing.** Genuinely strong *teardown* reasoning — abandoned the DP for the precise correct reason (topological order), not by trial. Derived the decision reframe, multi-source BFS, and grasped monotonicity → binary search with only light nudging. Engaged honestly with profiling to locate bottlenecks. Diagnosed nearly every bug himself off a single probe.

**On redo (if applicable).** First encounter — nothing to compare yet. Next redo, watch specifically whether the visited-guard / seed survives a from-scratch rewrite (the recurring `#weakness:refactor-regressions`), and whether he tests the endpoints as edge cases before submitting.
