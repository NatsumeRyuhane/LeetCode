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
| Decomposition | 4 | 3348: named *minimality*, not construction, as where the difficulty lives — the correct diagnosis of a Hard, reached unaided; separated "`num` may contain a `0`" from "the answer may not" at intake, and killed the 3345 bounded scan on both correct grounds | → |
| Pattern recognition | 2 | 3348: reached prefix-freeze independently but could not turn "I have no clue where the bump is" into "then try every bump" — four L0/L1 attempts stalled over 75 min, and the class name had to be handed over at L3 on request | ↓ |
| Complexity analysis | 2 | 3348: asserted a `2ⁿ` arrangement cost for a subproblem their own bump invariant had already eliminated, and left "how many pivots × cost per pivot" unanswered across three asks — the question that would have ended the session | ↓ |
| Implementation correctness | 3 | *(not exercised on 3348 — no code written)* 3345: two judge-fatal defects at the ready signal, `i // 10` fabricating a zero factor and `range(n, 100)` excluding the proven fallback; both root-caused and fixed first try in 144s | ↓ |
| Edge-case handling | 2 | 3348: flagged at intake that `num` may contain a `0`, then never converted it into a constraint on the answer; separately skipped "is the input already valid?" on three self-built examples, two of which were answered by the input itself | ↓ |
| Optimization | 3 | *(not exercised on 3348 — nothing was built to optimize)* 3310: root-caused the mark-at-pop blowup unaided and found both structural redundancies when asked whether each earns its keep; tapped out leaving two unevaluated beliefs standing | → |

## Focus next

- **`#weakness:derive-not-enumerate` — new, and the whole story of 3348.** You built nine of
  the twelve components of a Hard in one sitting and then spent 75 minutes stuck on one belief:
  *"if I know where to put the bump I'd solved it by now."* The bump position had a candidate
  set of size `n` and a cheap feasibility test per candidate. You never had to know it. Your own
  iterative line-pushing kept invalidating its own precondition, and you read that as the
  *problem* being intractable rather than the *derivation* being the wrong move.
  **Drill: the moment you catch yourself trying to compute which choice is right, stop and ask
  two questions — how many values can it take, and what does one cost to test? Multiply. If it
  fits the budget, the derivation is optional.** This is also why complexity-analysis fell this
  session: that multiplication *was* the unlock, and it was asked three times.
- **`#weakness:unvalidated-counterexample` — build the oracle, stop arguing with yourself.**
  Six hand-built instances, three wrong. Your pushback was right about two of them: hand-deriving
  a *minimal* answer is the algorithm, so those don't count against you. The other three were
  one multiplication each — `11119` has digit product `9`, and twice the input itself was already
  the answer. **An eight-line brute force in `tests/` answers any small instance instantly and is
  safe to write precisely because it is far too slow to be the solution.** You invent examples
  constantly and they're your best tool; give them an instrument.
- **The trivial branch keeps going unchecked — second session running.** On 3345 all three of
  your tests entered the early return and none reached the loop. On 3348 you skipped "is `num`
  itself already the answer?" three times — which is *example 2 of the statement*. Different
  scope (tests then, design examples now), same shape: the cheapest branch is the one you walk
  past. **Check the degenerate case first, always, and out loud.**

**Closed / holding:** `#weakness:unaudited-instrument` stayed closed — when told to audit
`23299`, you did it immediately and correctly ("9 hides a 3 inside it"). `#weakness:conjecture-as-proof`
recurred but only mildly: you flagged *"i cant think of an example here"* yourself, which is the
flag working; you just built on the absence anyway.

**Worth keeping:** given "hand-trace your pipeline on the provided examples," you went further
than asked — took a case your model handled, deliberately perturbed it into one you suspected it
wouldn't, and killed your own rule with it. That is the 3345 drill applied at design time instead
of test time, unprompted, and it is what produced the pivot insight in the first place.

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
