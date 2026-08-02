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
| Decomposition | 5 | 0877: second zero-correction restatement running; classified the problem as a strict specialization of 0486 and successfully defended that against the coach's overstatement | → |
| Pattern recognition | 5 | 0877: conjectured the constant-answer collapse unprompted off their own failing test, then built the entire forcing proof from L0/L1 refocus — no technique was ever named | → |
| Complexity analysis | 3 | 0877: asymptotics right and unprompted; `2^500` reported as `10^130`, then `10^133` from a division never performed, corrected only on a second push | → |
| Implementation correctness | 4 | 0877: ported DP correct first run, zero defects; diagnosed the `RecursionError` mechanism exactly and unaided — three stack frames per level of descent, not one | ↑ |
| Edge-case handling | 2 | 0877: randomised oracle reached for unaided at last, but the generator built all-identical boards, indexed out of range, ran 9 samples — and was reported as "all pass" on a run that crashed | → |
| Optimization | 4 | 0877: collapsed a 250k-state DP to O(1) and reached the bound unaided — but shipped it to the judge on nine broken samples, with the justifying proof arriving afterward | → |

## Focus next

- **`#weakness:unaudited-instrument` — you now measure, but you don't inspect the meter.**
  Three sessions of "run the randomised check" finally landed, and the *instinct* is real.
  What didn't land: `[v] * n` builds one repeated value, `randint(0, piles)` is out of range,
  and nine samples is a rounding error — and "comes back all pass" was reported for a run
  that raised `IndexError` before finishing. **The rule: before you trust a generator, print
  ten of the things it generates and read them.** A green harness that tests one degenerate
  corner is worse than no harness, because it buys confidence you haven't earned.
- **`#weakness:conjecture-as-proof` — the judge said yes and it proved nothing.**
  You submitted `return True` as a knowing gamble, it was accepted, and you still could not
  say why it was correct. That was the right call to *chase down* afterward and you did — the
  proof you built is genuinely yours. But note the shape of the trap: an accepted submission
  is evidence about a test set, never about a claim. **When a conjecture survives testing,
  the next question is "what forces this?", not "can I submit it?"**
- **`#weakness:unevaluated-expression` — third session, and the counter-argument is noted.**
  `2^500` → "10^130" → "10^133" (from `500/3`, never divided) → 167 only on a second push.
  You argued the precision was irrelevant to the conclusion, and for that decision you were
  right. The part that still stands: you could not tell whether you were off by a factor of 2
  or 10^37 until you did the division. **When an expression decides something, evaluate it in
  the same breath** — and when it decides nothing, say so out loud instead of publishing a
  number you haven't computed.

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
