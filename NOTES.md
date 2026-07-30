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
| Decomposition | 4 | 3014: keypad mechanics restated correctly, but modelled the *general* problem — the "all letters distinct" constraint went unregistered until quoted back | → |
| Pattern recognition | 4 | 3014: named Huffman/frequency-greedy for the general shape, then re-mapped to pigeonhole + tiered closed form the moment the constraint landed | → |
| Complexity analysis | 4 | 3014: O(n)/O(1) then O(1) both stated unprompted and both correct; kept `Counter()` filed as a constant-factor, not a big-O, change | → |
| Implementation correctness | 4 | 3014: four tiered branches with three accumulated bases (8/24/48) — the flagged boundary surface — zero defects, accepted first submit | ↑ |
| Edge-case handling | 3 | 3014: first self-written pre-submit tests in six sessions (26→56, 9→10), correct by hand; singleton `"a"` still missing after being named | ↑ |
| Optimization | 2 | 3517: both bottleneck hypotheses overturned by the profiler, attempted fix ran 4× slower, tapped out to L4 *(not exercised since)* | ↓ |

## Focus next

- **`#weakness:misread-statement` — sweep the constraints *before* choosing a model.** Twice
  now a complete, correct-for-something-else plan was built on a skimmed constraint: 3620 read
  `k` as a per-edge cap, 3014 missed `All letters are distinct` and solved the harder variant.
  Both were corrected in one step once pointed at, so the fix isn't comprehension — it's
  sequencing. **The rule: after restating the problem, walk the constraints list line by line
  and say out loud what each one *buys* you.** A constraint that buys nothing is usually one
  that was misread.
- **`#weakness:missed-edge-case` — the habit fired; now finish it.** Six sessions flagged, five
  of them with the coach writing every pre-submit test, and on 3014 the tests appeared unaided
  before the ready signal, well-chosen and hand-verified. Keep that. The remaining half-step is
  *coverage*, not existence: 3014 covered the top boundary and a tier crossing but not the
  singleton — the smallest legal input is its own category, and it was named out loud and still
  skipped. Boundary **and** degenerate, every time.
- **Next problem: 3016 · Minimum Number of Pushes to Type Word II.** The frequency model
  discarded on 3014 is not wrong, it's early — 3016 drops the distinctness guarantee and
  sort-by-frequency-then-assign-tiers *is* its answer, so the reasoning already done gets
  cashed in. It also re-opens the two threads 3014 couldn't test: at `n ≤ 10⁵` the
  Python-loop-vs-C-builtin gap (`#weakness:language-mechanics`) becomes measurable, and any
  claim about where the time goes should be settled with `sessions/3517-*/bench.py` rather than
  asserted (`#weakness:unverified-assumption`).
