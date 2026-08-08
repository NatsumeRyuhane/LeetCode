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
| Decomposition | 4 | 3302: restatement caught every trap in the statement unaided — lexicographic order applies to the array not the string, "at most one" includes zero, `len(seq)==len(word2)` — and self-corrected their own phantom `word2'` before any prompt | → |
| Pattern recognition | 2 | 3302: the enumerate-candidates-and-verify skeleton was in message one and still there in the last; every proposed fix was an inner-loop speedup, and the argument ruling out linear was silently conditioned on keeping the outer loop | → |
| Complexity analysis | 3 | 3302: held a judge budget of 1e10 ops/s (wrong by 3–4 orders), but on being told to measure rather than argue, ran it, got 2e7, and derived 5e3 s in one turn; later rejected their own precompute sketch on the bound unprompted | ↑ |
| Implementation correctness | 3 | *(not exercised on 3302 — no code written)* 3345: two judge-fatal defects at the ready signal, `i // 10` fabricating a zero factor and `range(n, 100)` excluding the proven fallback; both root-caused and fixed first try in 144s | → |
| Edge-case handling | 4 | 3302: three self-built probe instances, all three correct — `aabcc`/`atc` killed binary search over slots, `abcdce`/`abcc` killed the user's own 99%-confidence rule | ↑ |
| Optimization | 2 | 3302: from a correct O(n·m) reached the collapse to m thresholds and the telescoping precompute unaided, then stalled — the target needed the bound named, then the witness decomposition, then a full reveal | ↓ |

## Focus next

- **`#weakness:optimize-the-skeleton` — new, and it is the same animal as 3348's
  `#weakness:derive-not-enumerate`.** On 3348 you would not *adopt* enumeration; on 3302 you
  would not *drop* it. Both times the control structure was the one thing never treated as a
  variable — every move was made *inside* it. On 3302 that cost 76 minutes: the skeleton from
  your first message was correct but O(n·m), and each improvement you found (binary search over
  slots, O(1) feasibility, telescoped precompute) made that skeleton cheaper rather than asking
  whether it should exist. The intended solution has no candidate loop at all.
  **Drill: after two or three genuine improvements fail to reach the target, stop improving.
  Say the skeleton out loud as an assumption — "I am enumerating candidates and verifying
  each" — and ask what a solution that never runs that loop would have to look like.** The
  usual escape is the one you missed here: replace a global choice made by enumeration with a
  local choice made during one pass, licensed by precomputed lookahead.
- **Finish the complexity chain every time — the last link was a wrong constant.** You believed
  the judge does 1e10 ops/sec; it is ~2e7 for a bare Python loop and single-digit millions for
  real work. That prior was load-bearing and had been silently passing bad plans for a while.
  You corrected it in one turn once told to measure, and immediately applied it to reject your
  own sketch. **Keep the number, and keep the habit: expression → multiply out → divide by rate
  → compare to budget. An unfinished chain is not an analysis.**

**Closed:** `#weakness:unvalidated-counterexample` — decisively. Three instances built on 3302,
three correct, two of them fatal to load-bearing ideas. `#weakness:conjecture-as-proof` — you
went hunting for a counterexample to something you held at 99% and found it. Both were the open
items from 3348 and both closed in one session. The trivial-branch blind spot (3345, 3348) did
not recur.

**Worth keeping:** you rejected your own precompute sketch on complexity grounds, unprompted,
one turn after building it — "if you somehow encountered an all F table you perform check on
each cell, that is O(mn)." That is the analysis habit turned on your own work, which is the
hardest place to point it. Also: you pushed back on two coach claims this session and were
right both times. Keep doing that.

<!-- Coach reminder: do NOT name a technique for an upcoming problem here. Doing so at the
     end of the 3014 debrief contaminated 3016's pattern-recognition score. Point at a
     problem, or at a weakness, never at its method. -->
