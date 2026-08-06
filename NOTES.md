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
| Decomposition | 4 | 3345: restatement with zero corrections including the `n' >= n` inclusivity and both ranges, and the "why can the search stop at 100?" probe answered crisply and unaided — "100 multiplies digits to 0, and 0 is an absorbing element" | ↑ |
| Pattern recognition | 4 | 3345: built a digit-product table, proposed a closed-form ones-digit snap from it, then killed it themselves off an L0 carrying no new content (`33 → 9` for `t = 9`) and replaced it with a bounded scan they could justify | → |
| Complexity analysis | 4 | 3345: derived the ≤10-step bound unaided *at approach stage* and used it as the reason to drop the shortcut, then stated O(1)/O(1) from that argument rather than from the judge's 0ms panel sitting on screen — though the bound is near-trivial here and does not test the bound-and-multiply trap | ↑ |
| Implementation correctness | 3 | 3345: two judge-fatal defects at the ready signal — `i // 10` fabricating a zero factor so every `n < 10` returned `n`, and `range(n, 100)` excluding the one value they had personally proven is the universal fallback; both root-caused and fixed correctly first try in 144s | ↓ |
| Edge-case handling | 2 | 3345: all three self-authored tests enter the `n%10 == 0 or t == 1` early return and exit — **zero tests reached the loop body**, the only code worth doubting — and both coach tests landed in that gap and failed; partial credit for killing their own bad test by hand-check before running | ↓ |
| Optimization | 3 | *(not exercised on 3345 — the first correct version was already O(1))* 3310: root-caused the mark-at-pop blowup unaided from one failing test and found both structural redundancies when asked whether each earns its keep; tapped out leaving two unevaluated beliefs standing | → |

## Focus next

- **`#weakness:confirmatory-testing` — new, and the sharpest finding in six sessions.**
  Your three tests on 3345 were `test_with_100`, `test_with_1`, `test_with_10_mult`.
  Map each to the path it enters: **all three hit the same early return and exit.** Not one
  test reached the loop — the only code in the function you had any reason to doubt. The
  habit is solid (four sessions running, written pre-ready, expectations hand-checked); what
  failed is *selection*. You tested the parts you had already proven. **Drill: before declaring
  ready, list your code's branches and put a test on each one. A branch with no test is the
  branch that ships broken.** Both defects were there, and both would have been a WA.
- **`#weakness:off-by-one` — the proven fact that didn't reach the code.** You established at
  intake that 100 always qualifies, used it to bound the search, used it again to bound the step
  count — then wrote `range(n, 100)`, excluding it. Your own correction comment names the false
  inference precisely: the shortcut fires on *`n`* being a multiple of 10, but *the answer* being
  100 is a different event. **Rule: when a specific value is load-bearing in your argument,
  check by hand that it is reachable in your code.** Same shape as the 0-absorption bug next to
  it, where `i // 10` manufactured a zero that is not a digit of `i` at all.
- **`#weakness:unevaluated-expression` — still open, untested today.** Six sessions running
  before 3345, and 3345 gave it nothing to bite on: a ≤10-step bound needs no counting argument.
  The escape route from the last debrief is still the one to reach for on the next problem with
  a sum-over-structure quantity — stop asking *"how big can one of these get?"* and ask
  ***"who put each entry there?"*** Consider a medium graph/array problem next to actually test it.

**Closed this session:** `#weakness:unaudited-instrument`. You wrote a fourth test asserting the
answer is always the next multiple of 10, hand-checked the expectation against the *statement*
rather than against your code's output, found it false, and deleted it before running the suite.
That is exactly the audit that was missing twice on 3310, performed unprompted. The judge's
"0 ms · beats 100%" panel was also right in front of you at debrief and you quoted your bound
argument instead.

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
