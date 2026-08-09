# Coach notes

Bounded dashboard maintained by the leetcode coach. Full history lives in
`db/assessments.jsonl`; detailed narratives live in each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.

| Dimension | Level | Latest evidence (one line) | Trend |
| --- | --- | --- | --- |
| Decomposition | 4 | 1140: isolated one-sided taking, dynamic `M`, positive values, and the output-vs-relative-score distinction; derived `Alice=(total+diff)/2` | → |
| Pattern recognition | 4 | 1140: immediately transferred the zero-sum memoized-game model from 0877/1406, then reused 1406 symmetry to remove the player coordinate | ↑ |
| Complexity analysis | 3 | 1140: after one L1 to count slice cost, independently found prefix sums and finished at `O(nM²)` time / `O(nM)` space; briefly read total lookups as unique states | ↑ |
| Implementation correctness | 3 | 1140: first ready snapshot failed collection and contained several transcription defects; fixed all from test evidence without method hints and shipped Accepted | → |
| Edge-case handling | 3 | 1140: added correct take-all boundary assertions; the random `n=100` probe had no expected assertion and measured execution rather than correctness | → |
| Optimization | 3 | 1140: cut 411 ms to 155 ms via prefix sums and state collapse; later unpacked the `O(n²)` monotone-window method with L1/L2 but stopped before implementing it | ↑ |

## Focus next

- **`#weakness:unaudited-instrument` — label every metric before interpreting it.**
  On 1140, `4,784` was the number of unique states, while `42,063` was total cache
  lookups; reading the latter as states temporarily overturned a correct bound. Before
  drawing a conclusion, write the numerator, denominator, unit, and whether the value is
  per input or cumulative.
- **`#weakness:language-mechanics` — add a ready-signal smoke gate.** The first 1140
  attempt could not import (`Tuple` missing), and the pre-fix code also contained an
  invalid cache argument and a next-pointer transcription error. Before saying ready,
  run the scoped pytest command once; collection failure is cheaper than a review cycle.
- **`#weakness:wrong-proposition` — vary one coordinate when proving independence.**
  The first state-key witness changed both player and `M`; the controlled same-`(head,M)`
  construction repaired it immediately. Keep that controlled-comparison habit.

**Worth keeping:** the optimization loop was evidence-driven and completed rather than
abandoned: repeated sums were measured and removed, the state definition itself was then
treated as a variable, and the final complexity was derived from states × transitions ×
per-transition work instead of from the judge percentile.
