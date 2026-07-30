# 3014 — Minimum Number of Pushes to Type Word I · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-30 — session 1

- **Outcome:** solved-optimal (accepted first submit — 0 ms / beats 100 %, 18.96 MB / beats 92.68 %)
- **Final complexity:** time O(1) / space O(1)
- **Hints used:** none — zero rungs of the ladder were needed
- **Tags:** `#technique:greedy` `#technique:closed-form` `#weakness:misread-statement`

**Approach path.** Restated the keypad mechanics correctly and immediately reached for a
frequency model — "kinda like how compression algorithms like huffman code works",
most-frequent letter into the 1-push slot, then `ans += count * slots`, claimed O(n)/O(1).
That is the correct algorithm for the *general* version of this problem (3016, Word II),
but it was built without registering constraint 3, `All letters in word are distinct`.
Pointed at that constraint verbatim (statement territory, not a hint) and asked what the
frequency table looks like for any legal input. The model collapsed in one step: recognised
it as pigeonhole, first 8 letters cost 1, next 8 cost 2, and wrote the closed form
`clamp(0,8,n)*1 + clamp(0,8,n-8)*2 + clamp(0,8,n-16)*3 + clamp(0,8,n-24)*4`, correctly
calling it O(1). Implemented as four `if/elif` tiers with precomputed bases 0/8/24/48
rather than a clamp expression. First try, all local tests green, accepted first submit.

**Where they got stuck.** Nowhere, in the usual sense — there was no wall and no hint. The
one course correction was the distinctness constraint, and it was a *re-read* miss rather
than a reasoning failure: the information was on the page from the start and had simply not
been marked as load-bearing.

**Exposed weaknesses.**

- `misread-statement`: built a complete solution model for a strictly harder problem because
  the constraint that makes this one Easy went unregistered on the first pass. Same shape as
  3620 (read `k` as a per-edge cap) — a constraint skimmed, then corrected instantly on one
  probe. The correction speed is not the issue; the first-pass constraint sweep is.
- Residual `missed-edge-case`, much reduced: the singleton input (`"a"`, the only case below
  the smallest tier) was named explicitly before submit and still did not get a test.

**Improvements worth recording (this is the story of the session).**

- **The edge-case habit finally fired.** Six sessions after it was first flagged, and five
  consecutive sessions of the coach supplying every pre-submit test, the user wrote
  `test_all_letters` (26 → 56) and `test_9_letters` (9 → 10) unaided, before declaring ready,
  with expected values computed by hand and correct. Both are well-chosen: the top boundary
  and the first input that crosses a tier.
- **Implementation correctness, first-try clean.** Four branches, three distinct precomputed
  bases (8, 24, 48), each an accumulated tier cost that had to be right — exactly the
  arithmetic-boundary surface flagged before coding — and zero defects. Against a trend of
  three-to-five bugs per session (3517: three; 2492: five), this shipped correct.
- **Yesterday's constant-factor lesson carried.** Volunteered that `Counter()` "is not an
  algorithmically faster change", keeping constant factors and big-O separate unprompted —
  the exact distinction that cost 3517 a wasted optimisation loop.
- **A model was allowed to die on contact with evidence.** The direct inverse of 3517, where
  three assumptions survived contradicting evidence. Here one constraint killed the frequency
  model outright, with no attempt to salvage it.

**Note for a future sitting.** The discarded frequency model is not wrong, it is early:
**3016 · Minimum Number of Pushes to Type Word II** drops the distinctness guarantee, and
sort-by-frequency-then-assign-tiers is precisely its answer. Natural next problem.
