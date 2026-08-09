# 1140 — Stone Game II · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-09 — session 1

- **Outcome:** solved-suboptimal
- **Final implemented complexity:** time `O(nM^2)` = `O(n^3)` / space `O(nM)` = `O(n^2)`
- **Best known examined:** time `O(n^2)` / space `O(n^2)` via monotone windows; understood but not implemented
- **Hints used:** L0 × 7, L1 × 7, L2 × 3
- **Tags:** `#technique:dp` `#technique:minimax` `#technique:prefix-sum`
  `#technique:zero-sum-symmetry` `#weakness:language-mechanics`
  `#weakness:unaudited-instrument` `#weakness:wrong-proposition`

**Approach path.** Recognized the 0877/1406 zero-sum-game structure immediately and
proposed memoized recursion over the remaining-head position, the player, and `M`.
Defined the first value as fixed `Alice - Bob`, derived `Alice = (total + diff) / 2`,
and proved with two controlled paths that the player coordinate really is required
under that definition. The first Accepted version used that three-coordinate state
and repeated slice sums (`411 ms`, `35.62 MB`). The user independently identified
the repeated sums and introduced prefix sums (`367 ms`). They then revisited 1406's
zero-sum symmetry, redefined `f(head, M)` as the current player's maximum obtainable
stones, derived the conservation transition `remaining - opponent`, and removed the
player coordinate. The final submission passed 92/92 at `155 ms`, `26.98 MB`.

**Where they got stuck.** The first terminal condition compared constant `len(piles)`
against `2M`; two L0 refocuses led to the correct remaining-count expression. The
first state-key proof changed both player and `M`; one L1 request for a controlled
comparison produced a valid same-`(head,M)`, opposite-player witness. The ready
implementation initially failed collection on a missing `Tuple` import and contained
several transcription errors; after the failing output, the user spent about 19 minutes
and fixed them without a method hint. During optimization, one L1 complexity prompt
surfaced the cost of repeated slice sums, and one L1 conservation prompt unblocked the
current-player recurrence after the child-value perspective became confusing.

**Exposed weaknesses.** `implementation-correctness`: the first ready snapshot did not
reach the examples because of a missing import, and the pre-fix diff also contained an
off-by-one next pointer and an invalid cache-call argument; all were subsequently fixed
from tests. `wrong-proposition`: the first proof for keeping `player_control` compared
states whose `M` values differed, so it did not isolate the claimed variable; the user
repaired the proof immediately once asked for a controlled witness.
`unaudited-instrument`: read `42,063` total cache lookups as states even though the
instrument printed `4,784` unique states on the preceding line; after separating hits,
misses, and stored states, the original state bound was confirmed. `edge-case-handling`:
the take-all path received explicit tests, but the added random `n=100` probe had no
expected-value assertion and therefore measured execution rather than correctness.

**On redo (if applicable).** First attempt; not applicable.

### Post-debrief complexity audit

The user brought the referenced LeetCode article back for an `O(n^2)` claim check.
The coach initially relied on a stale indexed copy exposing only the article's older
`O(n^3)` transition and incorrectly rejected the claim. The user supplied the current
code and complexity screenshot, which contains a genuine `O(n^2)` optimisation: split
the child minimum into a fixed-`m` column interval (`x <= m`) and a diagonal interval
(`x > m`), then maintain both interval minima with monotone queues. Each DP cell enters
and leaves each relevant window at most once, making transition work amortized `O(1)`
per `O(n^2)` state. This correction supersedes the earlier audit conclusion; the final
implemented solution remains `O(n^3)`, accepted and substantially optimized, but is not
the best known asymptotic bound.

To unpack the dense transition, the user expanded `m=2` into child coordinates and
identified the fixed-`M` horizontal segment followed by the `(head,M)` diagonal. They
then derived the diagonal-window update from `D_m=[m+1,2m]` to
`D_(m+1)=[m+2,2m+2]`: remove one, reuse the middle, add two. Three L2 explanations
were needed to translate `D_3` and separate two ideas that the compact code conflates:
DP values need not be monotone; the deque establishes monotonicity dynamically by
discarding an older value only when an actually compared newer value is no larger and
expires later. The user stopped after understanding that invariant rather than porting
the `O(n^2)` implementation.
