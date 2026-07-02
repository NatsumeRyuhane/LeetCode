# 0045. Jump Game II

## 2026-07-02 — session 1

Approach path:
- Restated the task accurately: Jump Game, but return the minimum jump count instead of reachability.
- Started with a DP/heap distance formulation: `least_jumps[i]` as source of truth, heap entries as candidate `(jumps, index)` states.
- Repaired the heap solution through local and judge feedback: single-index boundary, updating discovered neighbors, strict improvement only, and skipping already-scanned jump targets.
- Optimized the accepted heap version from 1986 ms to 43 ms by tracking the rightmost scanned target, then locally replaced the heap with FIFO queue once the uniform-cost BFS ordering was clear.
- Compared the compact sample solution: `end` is the current jump-layer boundary, `maxi` is the farthest reach of the next layer, and `steps` increments when the scan crosses a layer boundary.

Where stuck:
- Initially treated the heap as if existing priorities needed in-place updates; resolved by using `least_jumps` as truth and pushing only improved candidates.
- Distance bookkeeping lagged the stated invariant: `least_jumps` was not updated, then was updated on pop, then updated on the wrong index, then allowed equal-distance duplicates.
- Runtime issue was not stale heap entries after strict improvement; it was repeated scanning of overlapping contiguous ranges.
- Needed an L2 hint to use contiguity to track `processed`/rightmost scanned target and avoid holes.

Hints used:
- L1: heap only needs discovered candidates; stale entries can be skipped.
- L0: `least_jumps` was not being maintained as source of truth.
- L1: update the discovered neighbor when accepting a candidate.
- L1: strict improvement, not `<=`, prevents equal-distance duplicate pushes.
- L1: uniform edge cost means first discovery is minimum jump count.
- L2: contiguous jump ranges permit a rightmost-scanned boundary.

Final complexity:
- Current local queue version: O(n) time, O(n) space.
- Compact sample solution discussed at wrap-up: O(n) time, O(1) space.

Exposed weaknesses:
- `#weakness:pointer-bookkeeping`: the solution repeatedly lagged its own invariant by one update target or boundary (`least_jumps[index]` vs `least_jumps[i]`, `processed` vs `processed + 1`).
- `#weakness:complexity-analysis`: the MLE/TLE-style behavior came from repeated range scans, not just heap size; this surfaced only after accepted-but-slow judge feedback.
- `#weakness:missed-edge-case`: `nums.length == 1` needed a zero-jump guard; diagnosed after a failing local test.
