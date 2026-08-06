# 3345 — Smallest Divisible Digit Product I · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-06 — session 1

- **Outcome:** solved-optimal (accepted 1000/1000, first submit)
- **Final complexity:** time O(1) / space O(1)
- **Hints used:** L0 (approach), L2 (two failing tests at review)
- **Tags:** `#technique:bounded-brute-force` `#technique:closed-form` `#weakness:confirmatory-testing` `#weakness:missed-edge-case` `#weakness:off-by-one`
- **Session wall time:** 32 min, all of it active.

**Approach path.** Restatement was correct with zero corrections, including the
`n' >= n` inclusivity and both constraint ranges. Opened with a brute-force baseline
over `[n, 100]`, then attempted to replace it with a closed form: tabulated digit
products for 1–29, observed that a two-digit number containing a digit `d` has a
product divisible by `d`, and proposed computing the multiples of `t` in `[t, 9]`
and snapping the ones digit up to the first one that fits.

That shortcut is wrong, and they found it themselves. One L0 — no new content, just
their own two claims read back with the question *"which of these directions did you
prove, and which is your algorithm relying on?"* — and 260s later they returned with
`33 → 9` for `t = 9`: a product divisible by `t` with no single digit a multiple of `t`.
They had proven sufficiency and were relying on necessity.

They then dropped the shortcut for the right reason rather than just abandoning it,
and derived the replacement argument unaided: the next multiple of 10 is at most 9
steps away and its digit product is 0, so the scan terminates within 10 candidates.
The same 0-absorption fact answered the earlier "why can the search stop at 100?"
question. Coded it in 11 minutes; declared ready with 5/5 local tests green.

**Where they got stuck.** Not on the method — on coverage. Two defects survived to
the ready signal, both in the region their own tests never entered:

1. `tens = i // 10` evaluates to 0 for single-digit `i`, fabricating a zero factor,
   so every `n < 10` returned `n` immediately regardless of `t`. `smallestNumber(5, 7)`
   → 5, correct answer 7.
2. `range(n, 100)` excludes 100 — the exact value they had proven at intake is the
   universal fallback. `smallestNumber(99, 2)` → `None`, correct answer 100.

Two coach tests (`test_single_digit_input`, `test_top_of_range`, input→output only)
made both red. Both were root-caused and fixed correctly on the first try in 144s
with no further hints, and the fixes are of two distinct kinds — a boundary extension
and a branch for the sub-10 domain — so they weren't conflated. A coach sweep over
all 1000 `(n, t)` pairs then found zero mismatches.

**Exposed weaknesses.**

- **`#weakness:confirmatory-testing` (new tag, primary finding).** The three
  self-authored tests were `test_with_100`, `test_with_1`, `test_with_10_mult`.
  Map each to a code path: all three enter the `if n%10 == 0 or t == 1` early return
  and exit. **Zero tests reached the loop body** — the only code in the function they
  had any reason to doubt. The habit of writing tests before declaring ready held
  (four sessions running); the adversarial selection of what to test did not.
  This reverses a two-session climb (3731 L4, 3310 L4).
- **`#weakness:off-by-one` + `#weakness:missed-edge-case`.** The `range(n, 100)`
  miss is not a generic boundary slip — 100 is the one value in the space whose
  qualification they had *personally proven* two hours earlier ("100 multiplies
  digits to 0 and 0 is an absorbing element"). The proven fact did not reach the
  code. The stale comment they left in place (`# no need to count for 100 here,
  already shortcut`) records the false inference exactly: the shortcut fires on `n`
  being a multiple of 10, but the *answer* being 100 is a different event, which is
  precisely what their own correction comment says.
- **The 0-absorption double edge.** The same fact — a zero digit makes the product 0,
  divisible by everything — was simultaneously the key that solved the problem and the
  mechanism of bug 1, where `i // 10` manufactured a zero that isn't a digit of `i`.
  Correctly wielded on real zeros, silently bitten by a synthetic one.

**What went right, specifically.**

- `#weakness:unaudited-instrument` — **closed this session.** They wrote a fourth test
  (`test_with_10t`: the answer is always the next multiple of 10) and killed it
  themselves before running the suite, hand-checking the expectation against the
  statement rather than against their code's output. That is the exact audit missing
  twice on 3310, performed unprompted.
- Complexity was stated from the structural argument, not from the judge's 0ms /
  "beats 100%" panel — the 3310 failure mode (reading two noisy bottom-decile
  timings as evidence) did not recur, and the panel was in front of them.
- The counterexample hunt: given an L0 containing no information they didn't already
  have, they went looking for the direction they hadn't proven and found it.

**Not exercised.** Optimization — the first correct version was already O(1), and
there was no suboptimal bound to improve. No row written.

**On redo.** n/a — first attempt.
