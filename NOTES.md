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
| Decomposition | 4 | 3731: length and value constraints restated with zero corrections, but both load-bearing guarantees — uniqueness, min/max still present — went unstated and had to be supplied | ↓ |
| Pattern recognition | 3 | 3731: sort-then-adjacent-scan proposed instantly and unaided at first contact; the value-domain alternative took L1/L1/L2 and only after the sort had been defended as unavoidable | ↓ |
| Complexity analysis | 3 | 3731: retracted their own O(lg n) claim unprompted, produced the exact output size `(max-min+1)-n` unaided, and repaired `m ≈ n/2` → `≈ n` by checking an instance — then answered a request for two expressions with "gut feelings" | ↑ |
| Implementation correctness | 4 | 3731: both versions correct on the first run, accepted first submit, and the `!=` termination defended with a real loop invariant rather than a rationalization | → |
| Edge-case handling | 4 | 3731: three self-authored tests before the ready signal, every expectation correct by hand, and could name which stated guarantee each shortcut depends on | ↑ |
| Optimization | 3 | 3731: built the entire O(n+R) alternative from one `range()` counterexample, attacked their own draft over list-vs-set lookup cost, and **implemented** it this time — then asserted a trade-off that does not exist | → |

## Focus next

- **`#weakness:wrong-proposition` — three times in one session, and it is now the pattern, not a
  slip.** Asked whether *any* algorithm could hit O(lg n), you analysed *yours*. Asked for the
  output size, you gave the gap count — twice, including on `[1,100]`, where those numbers are 1 and
  98. Asked whether the sort was avoidable, you argued "the answer must be sorted, therefore sorting
  is unavoidable" — a property of the output used as a constraint on the input handling. Each
  argument was individually **correct**; none concluded the sentence on the table. That's what makes
  it hard to catch from the inside: nothing feels wrong, because nothing *is* wrong except the aim.
  **Write the target sentence down before you start arguing, and check the argument lands on it.**
- **`#weakness:unevaluated-expression` — fifth consecutive session, and this time it ended the
  session rather than delaying it.** You were asked for two totals as expressions and for the
  relationship between `n` and `R`; you returned "switching point is about R ≈ n//2. Gut feelings"
  — your own label, and accurate. Had you written it: `n ≤ R` is forced (n distinct values inside a
  width-`R` interval), so `R ≈ n/2` is an impossible region, and `O(n+R)` beats `O(n lg n + R)`
  *everywhere* — there is no crossover to locate. Four sessions of notes have said evaluate it;
  the sharper version now is **when you catch yourself saying "roughly" or "gut feeling" about a
  quantity you were asked to derive, that is the moment to stop and write the line.**
- **Decomposition — the guarantees you skip at intake are the ones your code ends up standing on.**
  You omitted "unique" and "min and max are still present." By the end of the session your loop
  terminated on `comp != diff` (correct *only* under uniqueness) and your entire range derivation
  rested on the endpoints being present. Both were load-bearing within the hour. **Read the
  guarantee lines out loud with the constraint lines** — they are not background colour, they are
  the preconditions your code will silently assume.

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
