# 3348 — Smallest Divisible Digit Product II · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-07 — session 1

- **Outcome:** unsolved → revealed (user-sourced editorial, not a coach L4)
- **Final complexity:** n/a — no code written. Editorial is O(n + log²t) time / O(n) space.
- **Hints used:** L1, L1, L0, L2, L2, L3 (the L3 explicitly requested)
- **Tags:** `#technique:pivot-enumeration` `#technique:residual-by-gcd` `#technique:greedy`
  `#weakness:derive-not-enumerate` `#weakness:unvalidated-counterexample` `#weakness:conjecture-as-proof`
- **Session:** 2h18m wall, 1h45m active. Time in APPROACH: 75 min. Zero time in IMPLEMENTATION.
- **Context:** day after solving 3345 (the Easy version of the same problem) first-submit.

**Approach path.** Restatement was clean and unprompted on the hard part: they separated
"`num` may contain a `0`" from "the answer may not", read both constraint ranges correctly
(only slip: `10e14` for `1e14`), and correctly killed the 3345 bounded-scan on two grounds —
the 0-absorption fallback is banned, and the space is 10²⁰⁰⁰⁰⁰ wide.

From there they built, essentially unaided, nine of the roughly twelve components of the
accepted solution:

1. `t` must be 7-smooth or the answer is `-1` (stated as "prime ≥ 11", the right idea narrower
   than the true rule)
2. digits as a recipe alphabet over `{2,3,5,7}` with substitutions (their table was correct;
   they caught the `4·4 ≠ 8` slip mid-sentence)
3. minimal multiset, pad `1`s, big digits toward the low-order end for minimality
4. **the pivot** — the answer keeps a prefix of `num` rather than being built free-standing
5. the prefix supplies factors, so the outstanding requirement shrinks
6. the shrinkage cannot be bookkept by digit *name* — found via their own `t=96, num=24210`
   case where `24` behaves like an `8`, and `t=36, num=3231` where a `3` and a `2` cover a `6`
7. bump invariants: one bump only; the result then exceeds `num` unconditionally; intervening
   positions collapse to `1`; a `9` cannot be bumped
8. forced length growth degenerates to the easy pad-with-`1`s case
9. the correct diagnosis that construction is easy and **minimality** is where the difficulty is

They also produced the fixed-line procedure in their own words: *"if we know the line, tally
numbers on the left, take what can be taken away, large number first, from the right."*

**Where they got stuck — one thing, for 75 minutes.** They would not stop trying to *derive*
the pivot position. Their model was a fixed-point chase: draw a line, discover the prefix
supplies a factor, redraw the line rightward, discover the reclaimed position changes the
tally, redraw again. They named the symptom themselves — *"this step will have some effect
propagates back to the last step - this is not clean"* — and read it as evidence the problem
was intractable rather than as evidence the derivation was the wrong move.

The unblocking idea is that the pivot is not derived at all; it is enumerated. Four attempts
at L0/L1 to surface this from their own material all stalled:

- L1 "how many candidate lines are there, and what does one cost — multiply" (three times, in
  escalating concreteness)
- L0 reading their own bump invariant back against their `2ⁿ` objection
- L0 reading their own verified `32688 → 32697` back against their "bump at the first non-`9`" rule

Both L0 reconciliations were left unanswered. After a defeat signal ("this problem may be way
too hard for me right now, i dont think i am even on the right track") the coach spent an L2 on
pure calibration — confirming the track was correct and inventorying the nine pieces — and
offered the ladder. They requested L3, received the class name ("smallest number ≥ X satisfying
P", solved by pivot enumeration), and tapped out ~4 minutes later, returning with the
leetcode.cn editorial by 灵茶山艾府 (EndlessCheng).

**What the editorial had that they didn't.** Three things, out of ~twelve:

- **`residual // gcd(residual, digit)`.** The entire prime-exponent bookkeeping apparatus they
  spent the middle third of the session dreading — *"which 2's contribution is locked in and
  cannot be replaced?"* — is one line, and never names a prime. Carry "what is still required"
  as a single integer; each consumed digit divides it by `gcd`. This is the highest-value
  transferable idea in the session and they had no analogue of it.
- **Rightmost-feasible-pivot-wins.** They intended to generate all candidates and take the min.
  Correct but unnecessary: scanning pivots right-to-left means the first feasible one is already
  the answer, which is why the loop is a `return` and not a `min`.
- **The consequence of `num` containing a `0`.** They flagged the fact at intake and never
  converted it into a constraint. In the editorial it is `i0` — the prefix scan breaks at the
  first `0`, capping how far right a pivot may sit. Two lines.

**Exposed weaknesses.**

- **`#weakness:derive-not-enumerate` (new, and the finding of the session).** Given a small
  choice set and no closed form for the right choice, they treated "I cannot compute which one"
  as a dead end rather than as licence to try all of them. Verbatim: *"if I know where to put
  the bump I'd solved it by now. The entire problem about minimization is that i have no damn
  clue on where the true bump actually fucking happens."* The choice set had ~`n` elements and
  a cheap feasibility test. **Drill: when stuck deriving a value, ask how many values it could
  take and what one costs to test. If the product fits the budget, the derivation is optional.**
- **`#weakness:unvalidated-counterexample` (new).** Six hand-built instances across three turns;
  three carried wrong answers. Two of those three were *minimality* errors — and the user's
  pushback on this is correct and was conceded: determining the smallest qualifying number by
  hand **is** the algorithm, so those are not a hygiene failure. The other three were *validity*
  errors costing one multiplication each: `11119` (product `9`, not divisible by `18`) and two
  cases (`8289`, `23299`) where `num` itself was already the answer and was never multiplied out.
  The mitigation offered — write an 8-line brute-force oracle into `tests/`, which is safe
  precisely because it is uselessly slow for the real constraints — was not taken up.
- **`#weakness:conjecture-as-proof` (recurrence).** *"is there any example of redrawing the line
  causes the right to be oversaturated? i cant think of an example here"* — then built on its
  absence. Same shape as the `33 → 9` moment on 3345, except on 3345 they went and found the
  counterexample when nudged; here the flag was raised and not acted on.

**What went right, specifically.**

- **`1111136`.** Handed the L1 "hand-trace your pipeline on the provided examples", they went
  further than asked: took a case their model handled (`1111134`), deliberately perturbed it into
  one they suspected it wouldn't (`1111136`), found `1111153` by hand, and killed their own rule.
  That is exactly the adversarial-selection drill prescribed at the 3345 debrief, applied at
  design time rather than test time, unprompted. It is also the single move that produced the
  pivot insight.
- **The `24 ≡ 8` observation.** Discovering that a prefix's contribution is not readable off
  digit names is the conceptual half of the gcd trick. They got there from a self-built example.
- **Correct, load-bearing invariants.** Every one of the bump invariants in item 7 above is right
  and appears in the accepted solution.
- **Honest, correct pushback on coach framing.** When told to validate their examples, they
  argued that hand-computing a minimal answer is the algorithm itself. That is right, the
  criticism was partly wrong, and it was conceded on the spot.

**Not exercised.** Implementation correctness and optimization — no code was written. No rows.

**On redo.** First attempt. This is a strong redo candidate: the user derived nine of twelve
components, and the missing three are nameable. A redo should blank `solution.py` and check
specifically whether they reach for enumeration when the pivot resists derivation.
