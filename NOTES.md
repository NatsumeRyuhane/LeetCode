# Coach notes

Bounded dashboard maintained by the leetcode coach. Full history lives in
`db/assessments.jsonl`; detailed narratives live in each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.

| Dimension | Level | Latest evidence (one line) | Trend |
| --- | --- | --- | --- |
| Decomposition | 3 | 0239: restatement clean on semantics, constraints and range, but output length was asserted as `n-k-1` and only corrected after being told to evaluate it against Example 1 | ↓ |
| Pattern recognition | 4 | 0239: rebuilt the value-and-lifetime dominance rule in their own words off two L0s, then characterized the whole structure in one pass — though the problem was self-selected *because* the technique had been explained in 1140 | ↑ |
| Complexity analysis | 3 | 0239: built a valid worst-single-call witness unaided but needed four L1s to price it; separately refuted the judge percentile as a complexity signal by parameter sweep, unaided | → |
| Implementation correctness | 4 | 0239: first ready snapshot had zero defects across 4,300 oracle cases and the `10^5` ceiling, with the empty-deque hazard anticipated in code | ↑ |
| Edge-case handling | 3 | 0239: no test authored beyond the two provided examples; the boundary they trusted least was tuned against cases that were already green | → |
| Optimization | 3 | 0239: hit the optimal class on the first implementation and removed the one-index overlap once derived, but closed without porting the root-caused 2× constant | → |

## Focus next

- **`#weakness:wrong-proposition` — vary one coordinate in the witness.** Recurred exactly.
  On 1140 the state-key witness changed both player and `M`; on 0239 the space-bound
  witness was `[9999…1]` with `k = 9999`, which pins `k ≈ n` and so cannot show which
  parameter caps the deque. `O(k)` came instantly on being asked to re-run with `k = 2`.
  Before offering an instance as proof, name the variable it is meant to isolate and check
  that nothing else moved with it.
- **`#weakness:off-by-one` — derive boundaries, don't tune them.** Two in one session:
  `nums.length - k - 1` for the output count, and the answer loop's start index reached by
  trial and error against the two green examples. When asked afterwards, the correct
  window-saturation derivation came immediately — the capability is there, it just isn't
  the first thing reached for. Rule: write the boundary's justification in one line before
  running anything; if you can't, that's the test to write.
- **`#weakness:confirmatory-testing` — test the line you trust least.** Third session in
  this pattern (3345, 1140, 0239), and the sharpest instance: zero self-authored tests, so
  the trial-and-error boundary was validated only by cases that were already passing.
  A brute-force oracle is cheap here and can't leak the method — it is the standing answer
  to "how do I know?" and it is what caught nothing this time only because the code
  happened to be right.

**Worth keeping:** the percentile did not get read as a complexity signal. Handed
`299 ms` / "beats 14.59%" and a measured 2× gap against the reference, they ruled out an
asymptotic difference by noting the ratio held steady as `k` swept — a parameter-sweep
argument that separates a constant from a growth term. That is the 1140
`#weakness:unaudited-instrument` failure inverted into a working proof technique. The
cross-problem link to the memoization state bound ("like when we use dict to restrict the
nodes explored in the stone games series") was likewise unprompted and correct.
