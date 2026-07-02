# 3286 — Find a Safe Walk Through a Grid · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-02 — session 1

- **Outcome:** solved-optimal (Accepted 691/691). No L3/L4 reveals this session — every unblock stayed at L0–L2.
- **Final complexity:** time `O(m·n)` amortized (single-pass round-based BFS, each cell marked and processed exactly once) / space `O(m·n)` for the cost-tracking grid.
- **Hints used:** L0–L2 throughout (mostly L1 probing questions; a couple of L2 "isolate it with a minimal repro" nudges). Zero reveals.
- **Tags:** `#structure:graph` `#structure:queue` `#technique:bfs` `#technique:0-1-bfs` `#weakness:refactor-regressions` `#weakness:off-by-one` `#weakness:bfs-mechanics`

**Approach path.** Correctly reasoned from first principles that since cost never decreases, processing cells in strictly increasing-cost order guarantees the first settle is the true minimum — derived this **unaided**, before any hint. Designed a two-queue round-based BFS (current-cost queue / next-cost queue) and, when pushed on duplicate-enqueue risk, arrived unaided at "mark a cell the instant it's discovered, using a cost grid as the visited structure." Implementation lagged the design by several rounds of REVIEW — the *stated* plan was consistently ahead of what the code actually did.

**Where they got stuck (and what unblocked each).**
- Termination check `x == self.width and y == self.height` — off by one *and* silently transposed (compared row-count against `width`, col-count against `height`). Self-diagnosed the off-by-one immediately from a "write out both coordinate pairs" probe (L1), but only fixed the missing `-1`, leaving the dimension swap intact.
- Same swap then surfaced as an `IndexError` once example 3 (a square grid, where the swap is invisible) passed but 1/2 (non-square) crashed — a good moment where comparing a passing square-grid case against failing non-square cases let them isolate the *second* bug from the first.
- Classic Python list-aliasing footgun: `[[-1] * w] * h` shares one row object across all "rows." Diagnosed instantly once handed a 3-line isolated repro to run themselves (L2) — good instinct once the experiment was in front of them, but hadn't thought to construct that isolation unprompted.
- TLE on a large judge case: root cause was marking visited-at-**dequeue** (line 30) instead of at-**discovery**, i.e. the code didn't match the design they'd already articulated. First patch was a band-aid (`n not in queue` — turns an O(1) problem into an O(n) scan, functionally correct but slow). Recognized the band-aid's cost class themselves once asked to justify it.
- Redesigned to mark-at-discovery ("a cell never writes a value for itself; a written neighbor is guaranteed already-queued") — sound design, but the *implementation* left a copy-pasted line referencing `x, y` before they were ever assigned in that scope (`UnboundLocalError`). Self-diagnosed and fixed in one pass once shown the traceback.
- Optimization pass: proposed replacing the two-deque round transition with a `dict`/`List[List]` bucket structure: over-engineered relative to what was needed. One probe ("does `.copy()` need to happen at all, or could you just reassign") led directly to the actual fix — swap deque references instead of copying.

**Exposed weaknesses (with the moment each surfaced).**
- `#weakness:refactor-regressions` — **recurred from 2812, in a new shape.** Every implementation pass this session lagged its own stated design by at least one bug: fixed the goal-check off-by-one but not the paired `is_oob` bounds swap; fixed `get_value`'s read order but initially missed the matching raw write at line 30; designed "mark at discovery" correctly in words, then shipped code that still marked at dequeue for another full round of REVIEW, then shipped the *correct* redesign with a leftover copy-pasted undefined-variable line. The pattern isn't "loses an invariant while refactoring" anymore so much as "the code doesn't yet reflect the design in their head" — a related but slightly different flavor of the same weakness. Worth testing on the next problem whether writing the invariant down explicitly *before* touching code reduces this gap.
- `#weakness:off-by-one` — recurred (width/height boundary, again involving a dimension mix-up, similar shape to 2812's inverted binary-search direction).
- `#weakness:bfs-mechanics` — recurred specifically on **visited timing** (mark-at-enqueue vs mark-at-dequeue), which was the *exact* focus-next item flagged after 2812. Needed a full REVIEW cycle (TLE → band-aid → probe → redesign) to actually land it in code, even though they could already state the correct principle in words.

**Strengths worth reinforcing.** Real growth since 2812: derived the core monotonic-cost argument unaided at the approach stage (no hints needed to get the algorithm shape right). Complexity reasoning was noticeably stronger this time — when told a change had "no obvious improvement," correctly reasoned that `.copy()`'s cost was already linear in total across the whole run (not per-round-quadratic), so it was never the real bottleneck, and made a deliberate, well-justified call to *not* chase further micro-optimization (inlining helpers) for the sake of readability. Confirmed that judgment afterward by comparing against the fastest leaderboard submission and correctly identifying the remaining gap as Python constant-factor overhead, not a missed algorithmic idea. No L3/L4 reveals needed anywhere this session — a first.

**On redo (if applicable).** First encounter for this problem — nothing to compare yet. On a future redo (or the next fresh problem), watch specifically whether "mark visited at enqueue, not dequeue" now ships correctly on the first implementation pass, since it took a full TLE cycle to land here despite being correctly stated up front.
