# 3310 — Remove Methods From Project · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-05 — session 1

- **Outcome:** solved-optimal (accepted 775/775; tapped out of the constant-factor loop)
- **Final complexity:** time O(n + m) / space O(n + m) — their own phrasing, O(max(m, n))
- **Hints used:** L0, L0, L1, L2, L2
- **Tags:** `#structure:graph` `#structure:queue` `#structure:hashmap` `#technique:bfs`
  `#weakness:misread-statement` `#weakness:unevaluated-expression` `#weakness:bfs-mechanics`
  `#weakness:unaudited-instrument` `#weakness:wrong-instance-check`
- **Timing:** 2h37m wall / 1h56m active. APPROACH 46m (largest block), IMPLEMENTATION 13m,
  REVIEW 15m, OPTIMIZATION-LOOP 10m.

**Approach path.** Restatement covered every constraint *and* every guarantee line unprompted —
the exact gap flagged on 3731 — plus cycles inferred from example 3 and the all-or-nothing return
rule. But the edge semantics were read backwards: the statement says `[a, b]` means *a invokes b*,
and they talked themselves out of that first instinct into `b() { ... a() ... }`. Approach opened
with union-find carried over from 2492 ("a structure that tells if one element belongs to the same
tree of another"), described as a tree despite having just noted the graph has cycles. An L0 on
that contradiction plus their own example-walking collapsed it to "maybe we don't [need] that
complex tree algorithm — a set is sufficient," which is where they stayed. Final design: forward
and reverse adjacency built in one pass, BFS from `k` for the dirty set, then a scan for an edge
with a clean caller and a dirty callee. Implementation took 13 minutes and stood at 6/6 by the
ready signal, including three self-authored edge cases. Per the user, that was *not* a clean first
run: there were implementation defects during those 13 minutes, caught and fixed against their own
tests before declaring ready, with no coach involvement (specifics not captured — the fixes predate
the first commit, so git holds no trace of them). The only defect that survived to review was
performance, found by a coach-supplied scale test, diagnosed unaided, and fixed. Accepted first
submit at 775/775 (and the
pre-fix version was *also* accepted — the judge's data never contains the adversarial shape).

**Where they got stuck.**

1. *Direction, three times.* Inverted `[a, b]` at intake against explicit statement text; gave a
   justification for example 1 blocking ("the removed methods *depends on* clean methods") that
   does not block anything even on its own terms; then stated the blocking pattern as `[clean,
   dirty]` and, ten minutes later, as `[dirty, clean]`. Unblocked by an L0 that quoted their two
   contradictory formulas side by side without saying which was right — resolved in 66s.
2. *Complexity, the long wall.* Claimed `O(n²)` by bounding one adjacency list at `n` and
   multiplying by `n`. Told explicitly *"don't bound it — count it,"* they swapped the bound for
   `m` and multiplied again → `O(mn)`. Only an L2 concrete instance (build `dict_source` for
   example 2 by hand, count the entries, compare against the predicted `n·m = 20`) broke it, after
   which they produced the charging argument unaided in 125s: *"there is only m edges - you can at
   most do the graph query as many times as there is an unconsidered edge."*
3. *Scale.* `dirty.add(node)` at pop time rather than at discovery let a node be enqueued once per
   in-edge and rescanned on every pop. Coach added `test_large_fan_in_then_fan_out` (`n=14003`,
   `m=21000`, both ~1/7 of the legal maximum): correct output, 4.3s. They instrumented, found
   `counter2 = 49,014,001` against `n + m = 35,003`, and named the root cause precisely in 274s —
   *"a node is known to be dirty after it is added to the exploration queue"* — then added a
   pop-time guard. 49,014,001 → 21,001; 4.82s → 0.02s.

**Exposed weaknesses.**

- `#weakness:misread-statement` — read `[a, b]` as "b invokes a" against text that says the
  opposite, having first read it correctly. The index-level rules survived only because the
  contamination direction and the blocking direction were *both* flipped and the errors cancelled;
  the narrative attached to them ("dirty depends on clean, therefore blocked") was not recoverable.
- `#weakness:unevaluated-expression` — five instances. `m ≤ 2n` asserted as structural from two
  independent constraint caps (false: `m ≤ n(n-1)`; at `n = 5`, `m` can be 20). `O(n²)`, then
  `O(mn)`, both from bound-and-multiply. Then after the recovery, two fresh ones in a single
  message: *"it did not make too much difference here"* (list vs set) and *"d_dst builiding is
  cheap because we are building d_src anyway"* — both quantities, neither evaluated, in a turn that
  was otherwise reasoning well.
- `#weakness:bfs-mechanics` — mark-at-pop instead of mark-at-discovery. This is the **exact**
  recurrence from 3286 (2026-07-02), whose assessment row reads *"mark-at-discovery shipped a round
  late."* Visited timing, five weeks apart, same slip.
- `#weakness:unaudited-instrument` — read LeetCode's 816ms-vs-943ms across two submissions as
  evidence that removing redundant work made the code *slower*, when both runs sat in the same
  bottom decile (9.60% / 5.60%) and the guard costs one set lookup per pop. They had already run
  the controlled experiment themselves (`counter2`) and did not treat it as the measurement.
- `#weakness:wrong-instance-check` — asked to hand-verify example 1 (`[[1,2],[0,1],[3,2]]`), they
  walked example 2's edge list (`[[1,2],[0,2],[0,1],[3,4]]`) and reported "so the idea holds." The
  conclusion happened to be right; the edge they dismissed as irrelevant (`[3,4]`) is `[3,2]` in
  the real instance, which fires. Redone correctly on request.

**What went well, specifically.**

- Every guarantee line read unprompted at intake — the 3731 focus item, applied.
- Abandoned the imported union-find under an L0 that only pointed at their own words, and replaced
  it with a plain set.
- Three self-authored edge tests before the ready signal, all expectations correct by hand — and
  `remainingMethods(2, 0, [[1,0]]) == [0,1]` is precisely the discriminator for the direction error
  they had made twice that morning. They built the test that would have caught their own bug.
- Diagnosed the scale defect from their own instrumentation with no hint beyond the failing test.
- Delivered the complexity line at last — `O(max(m, n))` for both, correct.
- Found the `d_dst` elimination and the set-not-used-as-a-set mismatch when asked whether each
  structure earned its keep.

**Tap-out.** Left the optimization loop consciously, citing fatigue, at ~900ms against a histogram
mode of ~250–430ms (memory was fine — beat 80%). Two unverified beliefs remain standing, which is
the 3016 precedent for capping optimization at 3 rather than 4: *informed decline = 4; decline that
leaves the model wrong = 3.* The bound itself is optimal — `O(n + m)` is the input-reading floor —
so the outcome is not affected.

**Left on disk for a redo.** `solution.py` still carries the counters and `print`s; they were
stripped only in the LeetCode editor. The open questions are unchanged: does `d_dst` earn its build
cost, what is the per-edge operation count of the build loop with and without it, and what is a
`dict` buying you over dense integer indices.
