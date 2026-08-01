# 0486 — Predict the Winner · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-01 — session 1

- **Outcome:** solved-suboptimal (accepted; declined a final constant-factor reformulation on stated grounds)
- **Final complexity:** time `O(n²)` / space `O(n²)` — 210 memo entries at `n = 20`
- **Hints used:** L0, L0, L0, L2, L1, L1 (no L3, no L4)
- **Tags:** `#technique:dp` `#technique:interval-dp` `#technique:minimax` `#technique:dfs`
  `#weakness:unevaluated-expression` `#weakness:index-vs-value` `#weakness:trace-intent-not-code`
- **Timing:** 1 h 51 m wall, no breaks. **69 minutes of it in APPROACH** — design dominated the
  session; implementation was 47 s of state time and the code was written in one pass.

**Approach path.** Restated the problem with zero comprehension corrections — the first session
with none — including the tie rule and a self-built counterexample (`[1,2,999,3]`) proving greedy
fails. Opened by naming alpha-beta pruning, which was pointed at the right *frame* (adversarial
game tree) but is a pruning layer, not an algorithm; a probe asking what the search itself returns
moved them off it. Derived the `O(2ⁿ)` tree, built the minimax leaf/parent argument bottom-up, and
discovered independently that a boolean node value carries too little information to decide
anything. That produced the session's pivotal sentence — *"We need some way to decouple the score
from the node selection perhaps?"* — which they then abandoned in the very next line to conclude
"top-down, therefore BFS."

A pure L0 (*"you asked exactly the right question and walked past it"*) brought them back, and they
produced the load-bearing insight unaided: **score the differential** — P1's points positive, P2's
negative — so a node's value describes the position rather than the path that reached it. First
draft of the recurrence was algebraically broken (the taken number factored *outside* the
`min`/`max`, so both branches shared one number; P1 and P2 given structurally inconsistent
formulas). They fixed it themselves after being told only that their own hedge was the honest
clause, then hand-verified the whole recurrence on `[1,5,2]` and got every node right.

The state-space collapse came from the cheapest hint on the ladder. Their own three-element trace
had produced the leaf row `[1] [5] [5] [2]`; the entire hint was *"read it again."* From that they
derived, in one message: duplicates exist → cache them → the naive encoding is a subset, which is
expensive → **but removals only ever happen at the ends, so the surviving elements are always
contiguous, and two indices name the state.** They reached for the wrong conclusion first
("there is no way to efficiently encode"), interrogated it instead of accepting it, and found the
constraint that made it false. That self-correction was the best thinking of the session.

Implementation was one clean pass. Post-accept, one L1 (*"can the same segment be reached with both
players to move?"*) produced the parity argument — one element removed per turn, so turn parity and
remaining-count parity advance in lockstep — hence `player_control` is a function of the segment,
not a third degree of freedom.

**Where they got stuck.**

1. *Not stuck, but self-blocked, at the decoupling question* (~8 min). They wrote the right question
   and walked past it. Unblocked by an L0 that added no content at all.
2. *The base-case bug* (~19 min across two hints). Two coach-written failing tests (`[1,3,1]` →
   `False`, `[1,4,3]` → `True`) established that a bug existed; they then hand-traced and reported
   *"my hand trace says the program should have produced the correct outcome, weird."* That report
   was the real diagnostic: their trace and the program disagreed, which meant the trace was of the
   design, not the code. An L1 redirect — stop simulating, print `state -> value`, find the **first
   divergent row** — closed it in 8 minutes with a precise diagnosis.

**Exposed weaknesses.**

- **`#weakness:unevaluated-expression` — the defining pattern of this session, five instances.**
  (i) *"if we bf the tree it gives a O(2ⁿ) algorithm, which is unacceptable"* — never computed.
  (ii) Asked for `2²⁰`, returned `7 = 2³ - 1` — a correct derivation of the tree's *shape*, offered
  in place of its *value*. (iii) Asked a third time, produced `1048576` but wrote it as `10E6`, a
  10× slip. (iv) Concluded *"affordable"* without ever naming the budget. (v) Wrote
  *"1+2+3+4...+19 states, which is about 400"* — an expression evaluating to 190, reported as `n²`.
  Every single time the **structural reasoning was correct** and the evaluation was skipped or
  substituted. Distinct from `#weakness:unverified-assumption` (asserting runtime behaviour without
  measuring): here nothing needs measuring, the number is already in hand and simply isn't computed.
  Self-corrected cleanly once (`(1+20)*20/2 = 210`, catching both the missing `/2` *and* the wrong
  upper limit, with no number supplied).
- **`#weakness:index-vs-value`** — base case shipped as `player_control * seg_start`, returning the
  index where the element it addresses was meant. Survived all three local tests by coincidence:
  `[1]` returned `1*0 = 0`, and `0 >= 0` is `True`; `[1,5,2]` happened to evaluate to `-2` under both
  the buggy and correct base cases. The surrounding code dereferences `nums[...]` correctly
  everywhere else — the base case is the one line that doesn't.
- **`#weakness:trace-intent-not-code`** — the reason self-review could not find the above. Asked to
  hand-trace, they reproduced the algorithm they had designed rather than the lines they had
  written, and concluded the program was correct while it was demonstrably returning `True` on
  `[1,3,1]`. The substitution made on paper was the same one made when writing the line, so
  re-simulating could never surface it. **Fix that worked and is transferable: instrument, then diff
  against the trace, and look for the first divergent row rather than the wrong final answer.**
- **Test coverage regressed sharply from 3016.** One self-written test this session (`[1]`), versus
  five unaided on 3016 including scale and boundary cases. Worse, that one test passed *for the
  wrong reason* — index `0` and value `1` both clear the `>= 0` check. Neither discriminating case
  came from them. The **habit** held (test written unprompted, before the ready signal); the
  **coverage** did not. The oracle-based randomised check that would have caught the bug in seconds
  was run by the coach, not the user — and it is item three on their own NOTES focus list, with the
  exponential oracle already sitting in their notes from the design phase.

**What went right, specifically.**

- The score-differential representation, unaided, from an L0 that added no information.
- Interrogating *"there is no way to efficiently encode"* instead of accepting it, and finding the
  contiguity constraint that made it false.
- Finding the missing `state_values[s] = v` **entirely unaided**, by re-reading the code while
  debugging something else. This was a second defect being deliberately withheld for post-submit:
  before that line the memo was written to never, and the `O(n²)` design was still paying `O(2ⁿ)`.
- Diagnosing the base-case bug precisely and immediately once instrumented — *"the state [1,2,2] was
  evaluated to be a 2 … it used `player_control * seg_start` instead of the indexed query."*
- Deriving the parity redundancy from a single L1.

**On the declined optimization.** Offered the reformulation that measures value from the mover's
viewpoint (collapsing the `max`/`min` branch into one line), they declined: hashing a 3-tuple versus
a 2-tuple is nil at `n ≤ 20`, and they judged their explicit version more readable. **This is an
informed decline, and it is the distinction 3016's clarification row turned on.** The coach had
measured and handed over the real figures first (0.19 ms and 23.2 KiB for a full `n = 20` solve,
against a judge-reported 3 ms / 19.73 MB that is almost entirely interpreter baseline), so the
decision was made against facts, not vibes, and leaves no false belief standing — unlike 3016, where
stopping mid-diagnosis left two wrong hypotheses in place. They also correctly refused to chase the
`13.12%` memory percentile, which is exactly the noise-reading trap they passed on 3016. One
residual caveat: the readability comparison was made against an alternative they never wrote.

**On redo (if applicable).** n/a — first attempt at this problem.
