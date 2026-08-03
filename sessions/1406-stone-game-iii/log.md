# 1406 — Stone Game III · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-03 — session 1

- **Outcome:** solved-suboptimal (accepted 185/185, 5253 ms / beats 6.38%, 41.58 MB / beats 21.28%)
- **Final complexity:** time O(n) / space O(n) — asymptotically at the floor, constant factor bottom-decile
- **Hints used:** L1, L0, L1, L1, L1 (all in REVIEW and OPTIMIZATION-LOOP; zero hints through INTAKE → submission)
- **Tags:** `#technique:dp` `#technique:minimax` `#technique:explicit-stack` `#technique:linear-dp`
  `#technique:zero-sum-symmetry` `#technique:lower-bound-argument`
  `#weakness:unevaluated-expression` `#weakness:cross-problem-constants` `#weakness:wrong-proposition`

**Approach path.** Third stone game in three days. Restated the problem with zero corrections and
immediately classified it as 0486's minimax with a front pointer and branching factor 3, sizing the
state space at 10⁵ unaided. Asked to enumerate everything sized by `n`, they predicted the
recursion-depth blowup *before writing a line* — 5×10⁴ levels × 3 frames per level against a limit of
1000 — the exact failure that cost them a `RecursionError` on 0877 the day before. They pre-empted it
by hand-rolling an explicit deque stack with a memo dict keyed on `(player_control, ptr_stone)`,
re-pulling each state up to four times as its children resolved. Correct on the first run: 5/5 local,
0/3000 mismatches against a coach-written brute-force oracle, accepted first submit.

The optimization loop then ran the full distance without landing. Given the measured contradiction
(a claimed O(n³) traversal finishing 50k stones in 0.22 s), they identified memoization as the
collapse and settled the algorithm at Θ(n) against an Ω(n) floor — so 6.38% meant constant factor,
not algorithm class. From there: an L2 print experiment surfaced that the two per-player entries for
a position are exact negations, and they produced the zero-sum argument for *why* unaided; then,
redirected from branch-order to state-order, they derived the reverse-direction 1-D DP themselves —
base case at the last pile, resolve backwards, every dependency ready on arrival, stack and memo dict
and all three `continue` restarts deleted. They tapped out before implementing it, roughly 93 minutes
of wall time in.

**Where they got stuck.**

1. *The complexity derivation, badly.* Asked for their bound, they answered with 0877's numbers
   (`≤1000` states, stack depth capped at `500`) despite having stated the correct 10⁵ at intake, then
   claimed O(n³) from "a 3-branching tree", then asserted that was also the Ω. Unblocked by an L0 that
   named nothing and only pointed back at three of their own claims plus the measurement that
   contradicted them.
2. *Defending the redundant state dimension.* Asked whether `player_control` earned its place, they
   argued that `(1,2)` and `(-1,2)` hold different values so both must be stored. Unblocked by an L2:
   re-add the print they had just deleted, dump the table for two inputs, pair the entries by `ptr`.
   They read the negation off the table in one turn.
3. *Answering the wrong question on ordering.* Asked which **state** to resolve first, they answered
   which **branch** to try first, and the branch claim ran backwards (take-3-first, when `i+1`'s
   dependency closure contains the others'). Unblocked by an L1 that asked for the single state
   resolvable with no other value known, then the next, then the rule.

**Exposed weaknesses.**

- `#weakness:cross-problem-constants` — **new, and the sharpest one.** "There is at most 1000 states,
  the stack depth is capped at 500." Both figures belong to 0877, which they had solved 18 hours
  earlier; 1406's `n` is 5×10⁴, and they had said so correctly at intake before writing any code.
  The wrong constants then propagated into a wrong complexity claim. Same-family problems on
  consecutive days are exactly when the constraint line needs re-reading, not recalling.
- `#weakness:wrong-proposition` — **new, and it fired twice in one session.** (a) Argued Ω by
  describing what their own algorithm does ("you have to walk through the tree to know") — a statement
  about one implementation offered as a bound over all of them. (b) Established that the two stored
  values *differ* and concluded they were *independent*. Both times the claim proved was adjacent to
  the claim needed. This is the structural cousin of 0877's `#weakness:conjecture-as-proof`: not a
  missing argument this time, but an argument for the wrong sentence.
- `#weakness:unevaluated-expression` — **fourth consecutive session.** Two instances. "3-branching
  tree, so O(n³)" — the node count for branching 3 at depth `d` is 3^d, and the phrase was never
  turned into an expression before being reported as an answer. Then, after correctly deriving 10⁵
  states at O(1) each, they wrote the conclusion as "the algorithm should be already doing O(1) work".
  The multiplication was right in their head and wrong on the page, and the difference between O(1)
  and O(n) decides whether the algorithm reads its input.
- *Not a weakness, recorded for contrast:* the branch-ordering claim was challenged and never
  returned to. It went moot in the new design, but it is a belief left standing.

**What went right, specifically.**

- **The recursion-depth prediction.** Yesterday's `RecursionError` became today's pre-emptive design
  constraint, from an L0 that only said "enumerate what is sized by `n`". That is 0877's flagged
  weakness closing.
- **Correct on the first run**, on a hand-rolled iterative memoization with four re-entry paths —
  the error-prone way to write this. Oracle-clean at 3000 random cases; judge-clean at 185.
- **Test expectations computed by hand and all correct**, including `[1,-999,3]`, which is genuinely
  non-obvious and was recomputed independently rather than taken on trust. Value range `randint(-1000,
  1000)` was right unaided — the exact generator bug shipped on 0877.
- **They found the leftover debug print themselves**, from a hint that only handed them a timing
  measurement and said ~30% of it is not algorithm.
- **The zero-sum argument was theirs**, produced from a table they generated, not pattern-matched.

**Left on the table.** The rewrite is fully derived and unimplemented: 1-D table of `n` entries
(not 2n), each computed exactly once (not up to four times), iterating backwards from the last pile,
with `state_values`, `stack`, `peekleft` and the three `continue` branches all deleted. A redo should
start by writing that from the derivation already in this log — and then ask whether an `n`-entry
table is itself more than the recurrence needs.
