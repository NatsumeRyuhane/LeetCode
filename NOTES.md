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
| Decomposition | 4 | 3016: inferred repeats-allowed from the *absence* of 3014's distinctness line — first session the sweep caught rather than missed — but skipped the `1e5` bound that says it outright | → |
| Pattern recognition | 4 | 3016: freq-count + tiered assignment at first contact, zero hints — but confounded, the 3014 debrief had named this technique in advance | → |
| Complexity analysis | 4 | 3016: claimed O(1), self-corrected on a pure L0 in one step; then volunteered an Ω(n) lower bound unasked — right conclusion, circular form | → |
| Implementation correctness | 4 | 3016: second consecutive zero-defect session; tier walk resets `slots` *before* accumulating — the exact off-by-one surface — right first try | ↑ |
| Edge-case handling | 4 | 3016: singleton, degenerate-large, tier-crossing and two 1e5-scale tests, all unaided before the ready signal, all correct by hand | ↑ |
| Optimization | 3 | 3016: named constant-factor-vs-big-O unprompted and refused to over-read the profiler, then stalled on *how* to build the variants and tapped out | ↑ |

## Focus next

- **`#weakness:unverified-assumption` — the process is right now; finish the loop.** This
  session ran it correctly for the first time: category named before touching code,
  hypothesis stated *before* measuring, profiler actually run, output read honestly
  (*"no direct evidence of needing a Counter() from profiler alone"* — the direct inverse of
  3517). It stopped one step early. The A/B that didn't get run showed both hypotheses were
  largely wrong: `Counter` bought ~2 %, while a variant neither of us proposed bought 7.9×.
  **The half-step: when the blocker is "I don't know how", say that as its own fact instead
  of folding it into "not worth doing."** Only one of those two is a decision.
- **`#weakness:language-mechanics` — build a cost model for CPython.** Today's numbers are
  the lesson: 26 full C-level passes over a 10⁵ string beat one Python-level pass by **7.9×**,
  despite doing 26× the character comparisons. The unit of cost is not "number of
  operations", it is **"number of per-element operations that touch a Python object"** —
  bytecode dispatch, `ord()` calls, dict hashing. `Counter` is C but still hashes per
  character, which is why it barely helped. Same thread as `s += "a"` in a 10⁵ loop
  (only fast via CPython's refcount-1 in-place hack, not a language guarantee).
- **Test craft — the coverage instinct landed, now make failures reproducible.** Six
  sessions of missing tests ended on 3014 and closed on 3016: boundary, degenerate *and*
  scale, unaided, pre-submit. The remaining gap is craft, not instinct — the randomised
  tests are unseeded (a failure at `l = 73412` can't be replayed) and vary only *length*,
  which correctness here doesn't depend on. **Seed the RNG, print the seed, and randomise
  the dimension that actually matters — then check it against a brute-force oracle.**

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
