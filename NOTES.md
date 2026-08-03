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
| Decomposition | 5 | 1406: third consecutive zero-correction restatement, and refuted the coach's misstatement of the terminal rule with a correct counterexample pulled from example 2 | → |
| Pattern recognition | 4 | 1406: mapped to 0486's minimax, sized the state space and branching unaided at first contact — but carried 0486's memo shape onto a single-index state, and the 1-D form needed an experiment plus three redirects | ↓ |
| Complexity analysis | 2 | 1406: reasoned from 0877's constants after stating 1406's correctly at intake; "3-branching tree, so O(n³)" with 3^d never written; then 10⁵ states × O(1) reported as "O(1) work" | ↓ |
| Implementation correctness | 4 | 1406: hand-rolled explicit-stack memoization with four re-entry paths, correct on the first run — 0/3000 vs oracle, accepted 185/185 first submit; dead condition and 4× redundant recomputation left in | → |
| Edge-case handling | 3 | 1406: four small-n cases written pre-ready with every expectation correct by hand, and the 50k generator's value range right unaided — the exact bug shipped on 0877 | ↑ |
| Optimization | 3 | 1406: found the state redundancy from their own print table and derived the whole rewrite, but on L0+4×L1 after defending the redundancy with a "they differ, therefore they're independent" argument | ↓ |

## Focus next

- **`#weakness:cross-problem-constants` — you reasoned from yesterday's problem's numbers.**
  "At most 1000 states, stack depth capped at 500." Those are 0877's figures. 1406's `n` is
  5×10⁴, and **you had said so correctly at intake**, before writing a line — then recalled the
  wrong ones an hour later and built a complexity claim on them. The risk lives precisely where
  you're strongest right now: same family, consecutive days, high fluency. **When you state a
  bound, re-read the constraint line first — don't recall it.** Recall is what substituted 500
  for 50,000.
- **`#weakness:wrong-proposition` — new, and it fired twice in one session.** You argued a lower
  bound *for all algorithms* by describing what *your* algorithm does. Then you showed two stored
  values **differ** and concluded they were **independent** — they were exact negations of each
  other. Both times the sentence you proved sat next to the sentence you needed. This is 0877's
  `conjecture-as-proof` with a different failure mode: there the argument was missing, here it
  was present and aimed one target to the left. **Before accepting your own argument, write down
  the claim you need and check that the argument concludes *that* sentence.**
- **`#weakness:unevaluated-expression` — fourth consecutive session, and now it costs conclusions,
  not just precision.** "3-branching tree, so O(n³)" — the phrase was never turned into an
  expression, and 3^d is not n³. Then "10⁵ states × O(1) each, so the algorithm is already doing
  O(1) work" — the multiplication was right in your head and wrong on the page, and O(1) vs O(n)
  is the difference between reading your input and not. The 0877 note said *evaluate it in the
  same breath*; the 1406 version is stricter: **write the expression down before you name its
  class.**

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
