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
| Decomposition | 5 | 0486: first session with *zero* comprehension corrections — tie rule caught unprompted, greedy disproved with a self-built counterexample, constraints triaged (value range irrelevant, length load-bearing) | ↑ |
| Pattern recognition | 5 | 0486: score-differential representation derived unaided from a pure L0; interval state from a second L0 that was literally "read your own leaf row again" — and articulated *why* contiguity collapses `2ⁿ` to `n²` | ↑ |
| Complexity analysis | 3 | 0486: every asymptotic right and unprompted, but the arithmetic took four asks and came back wrong — `1+2+…+19` (=190) reported as "about 400" | ↓ |
| Implementation correctness | 3 | 0486: two defects after two clean sessions — base case returned the index not the value; memo never written (that one found unaided) | ↓ |
| Edge-case handling | 2 | 0486: one self-written test (`[1]`), and it passed for the wrong reason; both discriminating cases came from the coach at L2 | ↓ |
| Optimization | 4 | 0486: self-found the dead memo write, derived the parity redundancy from one L1, refused the 13.12% percentile bait, then declined the rewrite on *stated, measured* grounds | ↑ |

## Focus next

- **`#weakness:unevaluated-expression` — the new one, and it fired five times in one session.**
  Distinct from `#weakness:unverified-assumption`: that one is asserting runtime behaviour without
  measuring; **this one is having the number already in hand and not computing it.** Every instance
  had correct structure and a skipped evaluation — `O(2ⁿ)` called "unacceptable" uncomputed;
  `7 = 2³-1` offered in place of `2²⁰`; `10E6` written for `1.05e6`; "affordable" with no budget
  named; `1+2+…+19` reported as "about 400". **The rule: when you write an expression that decides
  something, evaluate it in the same breath.** Knowing an expression's *form* is not knowing its
  *value*, and the gap is where the 2× and 10× errors live.
- **`#weakness:trace-intent-not-code` — your self-review has a structural blind spot.** Asked to
  hand-trace a program that was provably returning the wrong answer, you traced the algorithm you
  designed and concluded it was correct. You cannot re-simulate your way out of this: the
  substitution you make on paper is the same one you made writing the line. **The move that worked,
  and that generalises: stop simulating, print `state -> value`, and find the *first divergent row* —
  not the wrong final answer.** Eight minutes from redirect to exact diagnosis.
- **Test coverage regressed — and the tool you needed was already in your own notes.** Five unaided
  tests on 3016 became one here, and it passed by coincidence. The randomised oracle check that
  finds this class of bug in seconds was run by the coach, not you — third session running it has
  been on this list. You had no excuse this time: you designed the exponential brute force *first*,
  so the oracle was already written in your head. **Next session, before you say "ready": seed an
  RNG, generate random inputs, diff your solution against your own brute force.**

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
