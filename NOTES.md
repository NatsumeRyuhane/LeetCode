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
| Decomposition | 3 | 3310: every guarantee line read unprompted — the 3731 gap closed — but `[a, b]` was read as "b invokes a" against text saying the opposite, after first reading it correctly, and `m ≤ 2n` was asserted as structural from two independent caps | ↓ |
| Pattern recognition | 4 | 3310: imported 2492's union-find and called the structure a tree minutes after noting it has cycles, then dropped it under an L0 that only quoted their own contradiction back — "a set is sufficient"; the frontier expansion and the single edge scan were never named by the coach | ↑ |
| Complexity analysis | 2 | 3310: `O(n²)` by bounding one adjacency list at `n` and multiplying by `n`; told explicitly "don't bound it, count it," swapped the bound to `m` and multiplied again → `O(mn)`; an L2 hand-count on a 4-edge instance unlocked the charging argument, produced unaided in 125s | ↓ |
| Implementation correctness | 4 | 3310: 6/6 at the ready signal with three self-authored edge cases; defects during the 13-minute build were all caught and fixed against their own tests with zero coach involvement, and the surviving performance defect was root-caused from their own counters | → |
| Edge-case handling | 4 | 3310: three tests before the ready signal, every expectation correct by hand, and `remainingMethods(2, 0, [[1,0]]) == [0,1]` is exactly the discriminator for the direction error they had made twice that morning — they built the test that would have caught their own bug | ↑ |
| Optimization | 3 | 3310: root-caused the mark-at-pop blowup unaided from one failing test (49,014,001 → 21,001 iterations) and found both the `d_dst` elimination and the set-not-used-as-a-set mismatch when asked whether each structure earns its keep; tapped out leaving two unevaluated beliefs standing | → |

## Focus next

- **`#weakness:unevaluated-expression` — sixth consecutive session, and today it has a name:
  bound-and-multiply.** Three times you took one part, bounded it (`n`, then `m`), and multiplied
  by the number of parts. Between the second and third you were told in plain words *"don't bound
  it — count it"*, and you swapped which bound you used and multiplied again. What finally worked
  is **yours, and it generalises**: stop asking *"how big can one of these get?"* and ask
  ***"who put each entry there?"*** Every adjacency entry traces to exactly one edge, so the total
  is `m` regardless of how lopsided the distribution is. That is a charging argument, and it is the
  standard escape from this exact trap. Reach for it by default on any "sum over nodes" quantity.
- **`#weakness:bfs-mechanics` — the identical slip as 3286, five weeks apart.** That session's row
  reads *"mark-at-discovery shipped a round late."* Today: `dirty.add(node)` at pop time, so a node
  was enqueued once per in-edge and rescanned on every pop — 49M iterations against `n + m` =
  35,003, and a legal input would have TLE'd at ~2.5·10⁹. The judge accepted it anyway, which is a
  fact about their test data, not your code. **Rule: decide membership when you enqueue, not when
  you dequeue.** Write the mark on the same line as the push.
- **`#weakness:wrong-instance-check` + `#weakness:unaudited-instrument` — twice today you ran a
  real check against the wrong thing.** Asked to hand-verify example 1, you walked example 2's edge
  list and reported "the idea holds" (the edge you dismissed as irrelevant is the one that fires in
  the real instance). Then you read LeetCode's 816ms-vs-943ms as evidence that removing redundant
  work made the code *slower* — two bottom-decile runs differing by noise — while ignoring the
  controlled experiment you had already run yourself, `counter2`. Both times the check was
  performed; neither time was it performed on the thing in question. **Name the instrument and the
  instance out loud before you read the result off it.**

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
