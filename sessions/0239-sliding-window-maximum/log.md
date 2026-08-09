# 0239 — Sliding Window Maximum · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-09 — session 1

- **Outcome:** solved-optimal
- **Final complexity:** time `O(n)` / space `O(k)` auxiliary, plus the `Θ(n-k+1)` output
- **Judge:** Accepted 53/53, `299 ms` (beats 14.59%), `34.57 MB` (beats 54.24%)
- **Hints used:** L0 × 4, L1 × 5
- **Wall / active:** 5,028 s ≈ 84 min, no break long enough to be excluded
- **Tags:** `#structure:queue` `#technique:sliding-window` `#technique:monotonic-queue`
  `#technique:amortized-analysis` `#technique:index-as-key`
  `#weakness:off-by-one` `#weakness:confirmatory-testing` `#weakness:wrong-proposition`

**Session framing.** The user chose 239 immediately after 1140, whose post-debrief audit
had unpacked the monotone-deque dominance invariant without implementing it. Pattern
recognition was therefore partly pre-spent by their own choice, stated openly at intake.
The genuine targets were implementation and the amortized cost argument.

**Approach path.** Restated the problem accurately and opened with `max()` per window as
the baseline. Moved unprompted from "each window is a fresh problem" to "a slide is one
departure plus one arrival", enumerated the cases, and landed on the crux — what happens
when the departing element *is* the max — without help. One L0 pointed at their own claim
that "if b is bigger than a then max becomes b"; repairing it produced the correct
`b > max` rule but they then concluded `a` and `b` were unrelated. A second L0 pushed back
on that, and the reframe ("which elements are permanently out?") produced the dominance
rule in their own words: anything below `b` is guaranteed to expire before `b`, so it can
never be the answer. The justification was the right one — value *and* remaining lifetime
together, not value alone. From one L1 they characterized the whole structure in a single
pass: survivors are monotonically decreasing, the max sits at index 0, the front leaves by
exactly two causes, and a newcomer that kills the front kills everything. A worry about
where to insert a mid-strength newcomer dissolved under an L0 pointing back at the
monotonicity they had just proved. Implementation used `deque[(value, expiry)]` with an
`elem >= front` wholesale-clear fast path. First ready snapshot was correct.

**Where they got stuck.** Two places, both brief. The insertion-position worry (resolved
by applying their own monotone invariant). And the amortized bound: after correctly
constructing a worst-single-call witness (`[9999, 9998, ..., 1, 9998]`, `k = 9999`, one
call popping ~`k`), they extended it to a family producing repeated expensive calls —
a valid construction, verified — but did not price it. Four L1 prompts were needed,
including a tap-out for fatigue and a voluntary return, before they charged each pop to
the push that created it and closed `total pops ≤ total pushes = n`.

**What went well, specifically.**

- *First ready snapshot had zero defects.* 2/2 provided examples, 4,300 randomized cases
  against a coach-side brute-force oracle, and the `10^5` ceiling including strictly
  monotone adversarial inputs. Directly counter to 1140 that same day, where the first
  snapshot failed collection. The empty-deque case was anticipated in code rather than
  discovered by crashing.
- *Refused to read the judge percentile as a complexity signal.* Given `299 ms` / beats
  14.59% and a measured 2× gap against the reference, they ruled out an asymptotic
  difference with a parameter-sweep argument: "if they are asymptotically different, the
  relative time scale won't stay same." That is the `#weakness:unaudited-instrument`
  failure from 1140 not merely avoided but inverted into a correct proof technique.
- *Connected the aggregate bound to prior work unaided* — "like when we use dict to
  restrict the nodes explored in the stone games series" — recognizing that both bound
  total work by a resource consumed exactly once.

**Exposed weaknesses.**

- `#weakness:off-by-one` — two instances. Output length asserted as `nums.length - k - 1`
  (off by two) when Example 1 sitting in the statement refutes it in one subtraction;
  corrected to `n - (k-1)` after an L0 to evaluate it against that example. Separately,
  the answer loop's start index was tuned by trial and error, disclosed voluntarily at the
  ready signal. Asked to derive it afterwards, they produced the correct window-saturation
  argument *and* found the resulting one-index overlap and correctly sized its cost as
  `O(1)` total — so the capability is present; it was simply not reached for first.
- `#weakness:confirmatory-testing` — no test was authored beyond the two provided
  examples. The trial-and-error boundary means the line they trusted least in the whole
  file was never given a test of its own; it was tuned against the same two examples that
  were already passing. The correctness of `k=1`, `k=n`, all-negative and all-duplicate
  inputs was established by the coach's oracle, not by them, and was unverified at the
  moment they declared ready.
- `#weakness:wrong-proposition` — recurrence of the exact 1140 shape. Asked for space
  complexity they answered `O(n)`, justified by `[9999, 9998, ..., 1]` with `k = 9999`.
  True but not tight: the witness pins `k ≈ n`, so it cannot distinguish which parameter
  bounds the deque. One L0 ("re-run that with `k = 2`") produced `O(k)` immediately. On
  1140 the state-key witness varied both player and `M` for the same reason.

**Left on the table.** The 2× constant factor. Reading the reference solution surfaced
that both fields of their `(value, expiry)` tuple are functions of the index alone — with
`k` fixed, `evict = j + k` and the value is `nums[j]` — so a bare `int` carries the same
information, and `q[0] < i-k+1` is their `i >= evict` rearranged. They understood this but
closed the session without porting it. Asymptotically irrelevant; the point stands as a
habit (`#technique:index-as-key`).

**On redo (if applicable).** First attempt; not applicable.
