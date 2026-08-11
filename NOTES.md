# Coach notes

Bounded dashboard maintained by the leetcode coach. Full history lives in
`db/assessments.jsonl`; detailed narratives live in each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.

| Dimension | Level | Latest evidence (one line) | Trend |
| --- | --- | --- | --- |
| Decomposition | 4 | 2996: isolated the statement's one real ambiguity (must a sequential prefix start at 0) and attached a self-built discriminating instance; right conclusion, imprecise reason, corrected in one exchange | ↑ |
| Pattern recognition | 4 | 2996: produced the counting bound unprompted — "n elements occupy at most n slots, so the first free slot appears within n probes" — though an Easy problem is a weak test of it | → |
| Complexity analysis | 4 | 2996: volunteered O(n)/O(n) with a correct pigeonhole justification, then refuted the coach's *wrong* challenge in 2.5 min by tracing `[1,1000000]`; named declared-bound vs operative-bound | ↑ |
| Implementation correctness | 3 | 2996: first snapshot went 5/5 green carrying a defect in the exact claim flagged 12 min earlier, and the first repair relocated the claim instead of removing it; the second repair was excellent | ↓ |
| Edge-case handling | 3 | 2996: three tests authored unprompted (first time in four sessions) and one caught a real shipped bug — but all three enter paths already believed correct | → |
| Optimization | 3 | 0239: hit the optimal class on the first implementation and removed the one-index overlap once derived, but closed without porting the root-caused 2× constant *(not exercised on 2996)* | → |

## Focus next

- **`#weakness:conjecture-as-proof` — finish the sentence before you write the branch.**
  On 2996 the claim "prefix of length 1 ⟹ answer is `nums[0]+1`" was asked for as a
  one-line precondition at APPROACH, skipped, shipped, and then *relocated* rather than
  removed on first repair — landing on a version that was strictly less true than the
  original. Both times a disagreeing input produced the right answer within minutes, so
  the reasoning is there; it just runs after the code instead of before it. Rule: any
  `if <special case>: return <value>` needs the sentence "`<value>` is the answer whenever
  ____" written out first. If the blank won't fill, the branch is a guess.
- **`#weakness:confirmatory-testing` — map tests to code paths, not to interesting inputs.**
  Fourth session in the pattern (3345, 1140, 0239, 2996) but the first with real movement:
  three tests written unprompted, one of which caught a genuine bug. What still didn't
  happen is coverage of the branch that had been named out loud as unjustified minutes
  earlier — so a defective snapshot went 5/5 green. Diagnostic before declaring ready:
  list the file's branches, mark which test enters each, and write one for whichever
  branch has none.
- **`#weakness:off-by-one` — derive the declared bound from the operative one.**
  2996 shipped `range(prefix_sum, global_max+2)` plus a `prefix_sum > global_max`
  short-circuit to cover the empty-range case that bound creates. The pigeonhole argument
  they already had licenses `prefix_sum + n + 1`, under which the range is never empty and
  the short-circuit doesn't exist. Same shape as 0239's tuned answer-loop boundary: a
  correct derivation was available and a patch was reached for first.

**Worth keeping:** two things from 2996. First, `#technique:invariant-repair` — the second
fix deleted the special case and made the set's meaning true instead
(`largerNumbers.add(nums[0])`), which is a strictly better move than the return-value patch
the coach was fishing for, and it was reached *within the session* after the first attempt
patched the symptom. Second, complexity claims are now being defended rather than asserted:
0239 refuted the judge percentile as a complexity instrument by parameter sweep, and 2996
refuted an incorrect challenge from the coach by tracing two lines. That is the most
durable habit visible in the record right now.
