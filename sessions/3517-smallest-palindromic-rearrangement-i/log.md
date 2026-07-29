# 3517 — Smallest Palindromic Rearrangement I · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-29 — session 1

- **Outcome:** solved-suboptimal (judge-accepted 930/930, 555 ms / 8.07 %, 20.41 MB / 91.94 %); L4 reveal on the constant-factor rewrite only
- **Final complexity:** time O(n) / space O(n) output + O(1) counters (fixed 26-slot array)
- **Hints used:** L1, L0, L1, L1, L4
- **Tags:** `#technique:greedy` `#technique:frequency-count` `#weakness:refactor-regressions` `#weakness:language-mechanics` `#weakness:unverified-assumption` `#weakness:missed-edge-case`
- **Timing:** 80 min wall, no >30 min break. Time-in-state: OPTIMIZATION-LOOP 36 min, REVIEW 20 min, IMPLEMENTATION 9 min, INTAKE→APPROACH 15 min.

**Approach path.** Restated accurately on the first pass and derived the two load-bearing
structural facts unaided: palindromicity forces pair counts, and at most one letter (the
centre) can have odd count. Proposed the correct method at approach stage with no hints —
count the first half into a fixed 26-slot array, emit greedily smallest-first, mirror,
pin the odd letter to the middle. Initially set the scan bound at `ceil(n/2)`; when asked
to hand-trace `"babab"` against it, self-corrected to `floor(n/2)` before writing any code.
Implementation was ~9 minutes. Post-accept, entered a 36-minute optimization loop chasing
the 8th-percentile runtime, which produced a regression rather than a win and ended in a
requested reveal.

**Where they got stuck.**

1. *Mirror step.* Shipped `str(reversed(ans))`, which stringifies the iterator object —
   all three provided examples failed with `"z<reversed object at 0x…>"`. Fixed in one
   turn once shown the output shape.
2. *Stale compensation line.* Having moved the scan bound from `ceil` to `floor`, the
   `char_count[…] -= 2` line written to offset the middle character was left in place,
   silently deleting a real pair. `"babab"` → `"aba"`. Notably `"z"` and `"daccad"` still
   passed, so 2/3 green masked it. An L1 (output-length invariant: 5 in, 3 out) got them
   looking; they then produced a *hand-trace claiming 4b/2a* — which is what `ceil` would
   have given, not what the code did. An L0 asking them to enumerate the actual `i` values
   settled it and they diagnosed it correctly and unaided from there.
3. *Self-inflicted quadratic.* Chasing constant factors, inlined the two helpers and
   hoisted `ord('a')` (both correct), but also replaced the one-shot `ans[::-1]` with an
   incremental `rans = chr(...) + rans` built inside the per-character loop. Tests stayed
   green; runtime went 6.78 ms → 25.85 ms on 100k. A `--scale` growth curve (2.48x, 2.80x,
   3.26x, 6.57x per doubling) showed the order of growth had changed. They correctly stated
   the underlying rule — *"the new content must appear at the end for this to work"* — but
   then applied it by renaming variables (`thatchar += rans; rans = thatchar`), which is the
   identical operation, and the curve did not move. Tapped out and requested L4.

**Exposed weaknesses.**

- **`#weakness:refactor-regressions` (recurrence).** The `-= 2` line was correct for the
  `ceil` bound and became a bug the moment the bound moved; the edit changed one half of a
  two-line invariant. Same shape as 2812's dropped visited-seed across rewrites.
- **`#weakness:language-mechanics` (new tag, three instances in one session).**
  `str(reversed(x))` returning a repr; believing `s` could be reused as a mutable buffer
  (Python strings are immutable); and treating `+=` as intrinsically fast rather than
  understanding it as a CPython refcount-1 in-place-resize special case that only applies
  when growth is at the tail. All three are Python semantics, not algorithmics — and all
  three cost real time this session.
- **`#weakness:unverified-assumption` (new tag, three instances).** Asserted runtime
  behaviour from reasoning and was overturned by evidence every time: (a) the hand-trace
  claiming 4b/2a that contradicted the code; (b) "the culprit is how I construct my answer"
  — the profile showed `ans +=` was not a hotspot at all; (c) "unwrapping the functions is
  going too far to matter" — the two helpers were 0.026 s of 0.040 s cumulative, the
  majority of runtime. Each was settled in seconds by a print or a profile that was not run.
- **`#weakness:missed-edge-case` (fifth consecutive session).** Wrote no test beyond the
  three provided examples and was ready to submit on that basis; the coach added `"aa"`,
  `"bbabb"` (centre is the smallest letter but immovable) and `"ccccc"`. The pre-submit
  degenerate-input habit still has not fired unprompted in five sittings.

**What went well.**

- **Complexity floor, derived cleanly.** Argued Ω(n) from *both* obligations — must read
  every character to know the multiset, must write `n` characters of output — and drew the
  right conclusion from it: that an 8th-percentile result at the floor means the problem is
  constant factors, not algorithm. That is the strongest complexity reasoning in the record
  so far and it reframed the whole optimization loop correctly.
- **Self-corrected the scan boundary before writing code**, off a single hand-trace prompt.
- **Changed a decision on measurement rather than argument** — after the profile showed
  `ans +=` was not the bottleneck, dropped the string-building rewrite. First time this
  session that evidence beat intuition, and the right instinct to reinforce.
- **Called the tap-out honestly.** Percentile-chasing on a judge is genuinely low-value
  work and saying so is a correct engineering judgement, not a lapse.

**L4 reveal (scope).** The algorithm was never revealed — it was theirs from the approach
stage and accepted unaided. The reveal covered only the constant-factor rewrite:
`Counter(s[:n//2])` + `c * cnt[c]` runs + one `"".join` + one `[::-1]` slice, i.e. pushing
the per-character loop into C. Measured 1.28 ms vs their 10.56 ms on 100k. Also surfaced
that no single variant wins everywhere — `str.count`×26 is fastest on large inputs and
slowest across 930 small ones, while the theoretically-worse `"".join(sorted(...))` wins
the small-case column — so at this scale input distribution and constants decide, not the
exponent.

**Artifacts.** `bench.py` (timing / `--profile` call counts / `--scale` growth curve) was
added this session and is reusable for any Python constant-factor question.
