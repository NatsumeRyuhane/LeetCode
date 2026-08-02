# 0877 — Stone Game · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-02 — session 1

- **Outcome:** solved-optimal (accepted 46/46, 0 ms / beats 100%, 18.93 MB / beats 97.07%)
- **Final complexity:** time O(1) / space O(1) — submitted `return True`
- **Hints used:** L0, L1, L0, L2, L2 — none naming a technique; every algorithmic hint
  was a refocus onto something the user had already written
- **Tags:** `#technique:parity-argument` `#technique:closed-form` `#technique:interval-dp`
  `#technique:minimax` `#weakness:unaudited-instrument` `#weakness:conjecture-as-proof`
  `#weakness:unevaluated-expression`
- **Timing:** 59 min wall, no breaks. INTAKE 9m · APPROACH 7m · IMPLEMENTATION 20m ·
  REVIEW 4m · OPTIMIZATION 18m.

**Approach path.** Recognised 877 as the same game as 0486 (solved the previous day) on
first read, and ported the memoized interval minimax on the score differential straight
across — a legitimate reuse, and the port reasoning was correct (`vis >= 0` and `vis > 0`
coincide here because the odd total makes the differential odd, hence never zero). Then
the session turned: writing their own test `test_lose([2,2,999,2]) == False`, they could
not construct a board where Alice loses, and instead of patching the expected value they
interrogated the case and conjectured **"Alice always wins."** Verified it by randomised
oracle comparison against a `stoneGame2` that returns `True`, then submitted the constant
— accepted, with no idea why. The remaining 18 minutes recovered the *why*: two invariants
named (no ties, even pile count), then the observation that the DP uses the first and makes
zero use of the second, then their own "protect the core" sketch — *take 3 so that 1 is
buried between 0 and 2; take 0 to protect 2* — read back as index pairs, from which they
derived the full argument: **Alice's first move selects an index-parity class, the geometry
of the row forces Bob into the complement for the whole game, and the odd total makes the
two class sums unequal, so Alice takes the larger.** Closed by locating exactly where an
odd pile count breaks the forcing, with `[·, big, ·]` as the concrete counterexample.

**Where they got stuck.**

1. *Not stuck algorithmically at all.* The port worked first run; the only local failure
   was `RecursionError` at the constraint ceiling, diagnosed unaided and exactly — three
   frames per level (`recurse → take_number_at_start → get_state_value → recurse`), not one.
2. *Stuck on "why".* Sat on `"Alice just can't lose somehow"` for two turns. Three hints
   moved it, all pointing at the user's own text: reread your restatement (L0) → your DP
   never uses invariant 2 (L1) → read your two `(took, protected)` index pairs (L0).
   The last one landed in under four minutes.

**Exposed weaknesses.**

- `#weakness:unaudited-instrument` **(new, and severe).** Reported "the randomized test
  comes back all pass" for a generator that (a) built `[v] * n` — every pile identical,
  one value repeated, the most degenerate corner of the input space; (b) indexed
  `random.randint(0, piles)`, out of range by one; and (c) ran nine samples. The very next
  run raised `IndexError` before completing. The measurement was taken; the instrument was
  never looked at. Distinct from `#weakness:unverified-assumption` — this is the inverse.
- `#weakness:conjecture-as-proof` **(new).** Submitted `return True` on that evidence,
  explicitly as a gamble ("risk it and see if I get hit in the face"). Accepted — which is
  the dangerous outcome, because the judge rewarded a guess and confirmed nothing. Worth
  recording that the gamble was *taken knowingly*, and that the proof was then chased down
  rather than abandoned once green.
- `#weakness:unevaluated-expression` **(third session running).** `2^500 ≈ 10^130` by feel;
  challenged, re-derived correctly as `10^(500/3)` and reported `10^133` from a division
  never performed; corrected to 167 only on a second push. Then declined the follow-up
  (largest `n` the DP survives at a recursion limit of 1000 — 333) as not worth computing.
  Their counter-argument is on the record and is partly fair: the number never mattered to
  the conclusion. The unresolved part: nothing distinguished "off by a bit" from "off by
  10^37" until the division was actually done.
- **Test coverage — instinct up, rigor flat.** First session in three where randomised
  testing was reached for unaided (it has been the standing focus item), and the self-written
  test is what cracked the problem open. But the coach still supplied the constraint-ceiling
  case (`n = 500`), one turn after explicitly saying to sample at the ceilings.

**What went notably right.**

- **Did not edit a failing test to make it green.** Treated the disagreement as information.
  Direct contrast with 0486, where the single self-written test passed for the wrong reason
  and was never questioned. This is the behaviour the last three debriefs asked for.
- **Derived the whole parity argument from L0s.** No technique was named at any point.
  The proof is theirs.
- **Pushed back correctly on the coach.** When told "the structure is unchanged from 0486"
  was false, they defended it — rightly. The mechanics *are* unchanged; what differs is the
  guarantee set. Coach conceded and re-aimed.

**Loose end.** The odd-`n` breakdown was argued with the right conclusion and the right
concrete counterexample, but the index trace written out (`0 1 2 … 2n-1`, shrinking to
`1 … 2n-1` / `0 … 2n-2`) describes an **even**-length row, so the symbols contradict the
prose. Same species as the arithmetic slips: correct structure, unchecked detail. The clean
statement: with an odd count both ends share a parity, so the first move selects nothing —
and hands the mixed-parity ends, and therefore the choice, to the opponent.
