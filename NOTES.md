# Coach notes

Bounded dashboard maintained by the leetcode coach. Full history lives in
`db/assessments.jsonl`; detailed narratives live in each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.

| Dimension | Level | Latest evidence (one line) | Trend |
| --- | --- | --- | --- |
| Decomposition | 4 | 0673: restated both halves correctly on first pass — including the index-distinctness reading example 2 forces — and named the difficulty in one sentence: "the dp compressed the exact path information" | → |
| Pattern recognition | 4 | 0673: rejected tuple enumeration on growth grounds, invented a layered backward walk, then reached the (length, count) pair via a grid-paths analogy off an L0 aimed at their wording, not the idea | → |
| Complexity analysis | 4 | 0673: bounded the walk by *pairs, not paths* before writing code — the exact distinction separating the correct algorithm from the factorial one — then refused to credit their own hash-bucket idea as more than a constant factor | → |
| Implementation correctness | 4 | 0673: the (len, count) pivot was correct on the first snapshot in one 13-min pass — Accepted first submission, 0 mismatches over 3000 differential cases; got the reset-vs-accumulate trichotomy and the seed right unaided | ↑ |
| Edge-case handling | 3 | 0673: four tests unprompted with written rationales and *measured* full line+branch coverage — yet two one-token mutants survive all six, so the suite cannot distinguish the load-bearing line from a wrong one | → |
| Optimization | 3 | 0673: correctly self-assessed their own bucket-by-length idea as constant-factor rather than claiming an improvement, but never put the inner scan itself in question and closed with the skeleton intact | → |

## Focus next

- **`#weakness:coverage-without-discrimination` — ask what one-token change your suite would
  miss.** This replaces `#weakness:confirmatory-testing`, which did *not* recur on 0673:
  every branch got a test, chosen for structural reasons and written down. The successor
  failure survives that fix. On 0673 the suite had 100% line and branch coverage, and
  `path_count += pathcnt → += 1` still passed all six tests, because no test ever ran that
  line with a count above 1. Coverage says a line *executed*; it cannot say the execution
  could have caught a wrong version. Diagnostic, ~60 seconds: name the one line the whole
  method rests on, change one token to something plausible-but-wrong, re-run. A surviving
  mutant is a missing test. **Open rep:** the `test_example_7` for 0673 that kills both
  mutants was assigned and declined — a count `> 1` that a later cell consumes.
- **`#weakness:optimize-the-skeleton` — third appearance (3302, 3310, 0673).** The pattern is
  stable and now well-characterized: every proposed improvement makes the *inner* step
  cheaper, and the outer loop is never named as an assumption. Credit where due — on 0673
  the constant-factor idea was self-diagnosed as constant-factor within one message, which
  is the discipline 3016/3310 lacked. The missing move is upstream of that: after the first
  inner-loop idea fails to change the bound, state the skeleton out loud ("I visit every
  earlier index") and ask what a solution that never runs that loop would look like.
- **`#technique:dp-with-multiplicity` — worth one cold redo.** 0673 is now solved and its
  optimization thread is deliberately open (see its `log.md`). The transferable half is the
  pairing rule: overwrite the counter on a strictly better child, add on a tie, never
  increment by 1, seed at 1, and sum over *every* cell attaining the optimum. Counting-paths
  variants of a solved optimum recur (grid paths, LIS count, shortest-path counts).

**Worth keeping:** two things from 0673. First, the session's decisive move happened *before
any code* — bounding the backward walk by pairs rather than paths, in their own words, which
is what turned a factorial idea into an `O(n²)` one; that is the second session running
(after 2996) where the load-bearing reasoning preceded the implementation instead of
following it. Second, when challenged on test coverage they made a specific claim, the claim
was **measured, and it was correct** — the coach's framing was the imprecise one. Insisting
on measurement over impression, in both directions, is the most durable habit in this record
(0239 parameter sweep, 2996 two-line trace, 0673 coverage claim).
