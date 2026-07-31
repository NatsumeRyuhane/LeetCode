# 3016 — Minimum Number of Pushes to Type Word II · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-31 — session 1

- **Outcome:** solved-optimal (accepted first submit — 147 ms / beats 29.41 %, 19.74 MB / beats 91.18 %)
- **Final complexity:** time O(n) / space O(1) — at the proven Ω(n) floor
- **Hints used:** L0, L0, L1 (no hint touched the algorithm; all three were process probes)
- **Tags:** `#technique:greedy` `#technique:frequency-count` `#technique:sorting`
  `#technique:exchange-argument` `#technique:lower-bound-argument`
  `#weakness:language-mechanics` `#weakness:unverified-assumption`
- **Session time:** 46 min wall, no breaks

**Approach path.** Restated every keypad mechanic correctly and proposed frequency-count +
descending sort + tiered slot assignment at first contact, with zero hints. Claimed the
whole thing was O(1) ("bounded by 26"); one L0 refocus on that sentence produced the
correction — "oh that one is dependent on size of n" — in a single step, unaided. Coded
`int[26]` + `ord(c) - ord_a` + `sorted(reverse=True)` + an 8-slot tier walk. First try, no
defects, all local tests green, accepted first submit. Post-acceptance, the judge's 29th
percentile opened a constant-factor investigation (below).

**Where they got stuck.** Not on the algorithm — there was no wall. Two process moments:

1. The `O(1)` claim, corrected on one L0.
2. The optimisation loop, where they stalled on *how* to implement the variants and folded
   that into "I don't think chasing the microscopic optimization is my point." Deliberate
   tap-out, logged as a choice — but see below, the tap-out cost them the punchline.

**Exposed weaknesses.**

- `unverified-assumption`, much improved but unfinished. The process was right for the
  first time: category named before touching code ("constant factor, not big-O"),
  hypothesis stated *before* measuring, profiler actually run, and — the best moment of the
  session — the output read honestly: *"There is no direct evidence of needing a Counter()
  from profiler alone."* That is the exact inverse of 3517, where three assumptions survived
  contradicting evidence. What did not happen was the A/B that would have settled it.
- `language-mechanics`. Two instances: `s += "a"` in a 10⁵-iteration test loop (only fast
  because of CPython's refcount-1 in-place optimisation, an interpreter detail, not a
  language guarantee), and — the substantive one — no working model of *what* costs time in
  CPython, which is what left both hypotheses unbuilt.
- Constraint sweep, half-complete. Three constraint lines, two swept. Notably the one they
  *caught* was the hard one: repeats-allowed inferred from the **absence** of 3014's
  distinctness line. The one skipped was `1 <= word.length <= 10^5`, whose jump from 3014's
  `<= 26` states the very same fact positively — the load-bearing signal was read the
  difficult way and missed the easy way. Cost nothing here; the habit is still incomplete.

**The measurement (coach-run after the tap-out, at the user's request).** Four variants,
identical algorithm, differing only in the counting step. 100k random chars, full alphabet,
best of 9; `check()` verified all four agree on every case:

| variant | counting step | time | vs v1 |
| --- | --- | --- | --- |
| v1 | Python loop + `ord(c) - ord_a` (submitted) | 2.89 ms | — |
| v2 | Python loop over `word.encode()`, no `ord` | 2.15 ms | 1.34× |
| v3 | `Counter(word)` — C-level count | 2.10 ms | 1.38× |
| v4 | 26 × `word.count(ch)` — 26 C-level passes | **0.37 ms** | **7.9×** |

Both of the user's hypotheses were largely wrong, and the decomposition says why:

- **H1 (the `ord()` calls):** real but modest — 0.74 ms, ~26 % of runtime.
- **H2 (`Counter`, "just use more builtins"):** worth **~2 %** on its own (2.15 → 2.10). Nearly
  all of `Counter`'s apparent benefit *is* H1 — it doesn't call `ord` — not its C-ness.
  `Counter` still performs a hash + dict lookup + increment per character; the work per
  character is what costs, not the language that work is written in.
- **The actual win came from a variant neither of us proposed:** reading the string 26 times
  instead of once. 2.6 M character comparisons beat 100 k loop iterations by 7.9×, because
  `str.count` on a one-char needle is a tight memory scan with zero per-character object
  creation, dict hashing, or bytecode dispatch.

The transferable rule: **in CPython the unit of cost is not "number of operations", it is
"number of per-element operations that touch a Python object."** An algorithm doing 26× the
comparisons can be an order of magnitude faster. This is also a caveat, not a universal
trick — v4 is O(26n), so its advantage is proportional to alphabet size and would invert
for a large or Unicode alphabet.

**Improvements worth recording.**

- **The edge-case habit is now closed, not just fired.** 3014 saw the first self-written
  tests in six sessions but skipped the singleton *after naming it*. This session, unaided
  and before the ready signal: `"a"` (singleton), `"a" × 43` (degenerate-but-large),
  `"abcdefghi"` (one letter past a tier edge, expected written as `8+2` so the arithmetic
  stays legible), plus two randomised tests at the 10⁵ scale. All hand-verified correct —
  including a subtlety they may not have noticed: when `random.randint` rolls `l = 1`, the
  second randomised test degenerates to a nine-way frequency tie, and the formula `l + 7 + 2`
  still holds. Boundary *and* degenerate *and* scale.
- **Constant-factor vs big-O, applied without prompting.** Handed a 29th-percentile runtime,
  they immediately classified it as constant-factor rather than hunting a better bound —
  the precise distinction that cost 3517 a wasted optimisation loop, now reflexive.
- **Two unprompted proof obligations.** An exchange argument for the greedy (`cost = freq ×
  push`, freq is fixed by the input, so only `push` is optimisable — therefore large freq
  meets small push), and an Ω(n) lower bound before being asked whether one existed. Both
  correct in conclusion; both loose in form — the greedy argued one slot then gestured at
  induction ("working back on that") rather than the two-line inversion swap, and the lower
  bound was circular ("you can't calculate pushes without knowing frequencies" presumes the
  algorithm counts frequencies). Sharpened both in-session: swap any inversion and the cost
  changes by `(f_x − f_y)(p_y − p_x) < 0`; and `"abcdefgh" + ?` answers 10 for `?="i"` and 9
  for `?="a"`, so no correct algorithm can skip a character.
- **Second consecutive zero-defect implementation.** The tier walk resets `slots` *before*
  accumulating, which is exactly the off-by-one surface, and it was right first try.

**Test-craft note.** The two randomised tests are unseeded — a failure at `l = 73412` cannot
be replayed. They also vary only *length*, and correctness here does not depend on length;
the dimension worth randomising is the frequency *shape*, checked against an independent
brute-force oracle.

**Coach note on scoring.** Pattern recognition is contaminated this session: NOTES.md's
"focus next" named sort-by-frequency-then-assign-tiers as this problem's answer at the end
of the 3014 debrief. The mapping may have been recalled rather than derived. Scored 4 with
the confound recorded rather than inflated — and NOTES.md should stop naming techniques for
upcoming problems.
