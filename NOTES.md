# Coach notes

Rolling snapshot maintained by the leetcode-coach. Rewritten in place each debrief.
This is a picture of *current* ability, not a log — the log lives in git history and
each problem's `log.md`.

## Ability assessment

Levels: 1 nascent · 2 developing · 3 competent · 4 proficient · 5 strong.
Each line: level — evidence from most recent relevant session — trend.

| Dimension | Level | Evidence | Trend |
|---|---|---|---|
| Decomposition | 4 | 3286: accurate restatement; framed the round-based-BFS plan cleanly at approach stage, unaided. | → (steady) |
| Pattern recognition | 4 | 3286: derived the monotonic-cost → increasing-order-exploration argument unaided (this *is* 0-1 BFS, self-discovered rather than named by the coach). | → (steady) |
| Complexity analysis | 4 | 3286: correctly reasoned that `.copy()`'s total cost was linear *across the whole run*, not per-round — recognized it was never the real bottleneck and made a deliberate, justified call not to chase further micro-opts. Up from 2812's solid-but-narrower profiling. | ↑ (improving) |
| Implementation correctness | 2 | 3286: still the dominant weak spot, but the shape shifted — each fix stage lagged its own already-correct stated design by one bug (goal-check fixed but not the paired bounds swap; read-order fixed but not the matching write; "mark at discovery" designed correctly in words, shipped a round late in code). | → (steady, different flavor) |
| Edge-case handling | 2 | 3286: not strongly exercised — the TLE-triggering large case came from the judge, not self-authored adversarial tests; still no evidence of proactively probing boundaries before submitting. | → (unexercised) |
| Optimization | 4 | 3286: reached O(1) discovery-marking and the deque-reference-swap purely from Socratic probes — zero L3/L4 reveals needed this session (2812 needed one). | ↑ (improving) |

## Focus next

- **`#weakness:refactor-regressions` / design-code gap — still highest priority, but note the shape shifted.** On 2812 it was "loses an invariant while restructuring." On 3286 it was closer to "the code doesn't yet reflect the design already correctly stated in words" (goal-check fix without the paired bounds fix; read-order fix without the matching write; correct mark-at-discovery design shipped a cycle late). Drill: after stating a design principle out loud, write it down as a one-line comment or assertion *before* touching the implementation, then check the shipped code against that line before declaring ready.
- **`#weakness:bfs-mechanics` (visited timing) — re-flagged from 2812, confirmed recurring.** Could already state "mark at discovery, not at processing" correctly in words at the approach stage, but it took a full TLE → band-aid → probe → redesign cycle to actually land in code. The principle is understood; the translation into code isn't automatic yet. Watch specifically whether this ships correctly on the *first* pass next time a BFS/graph problem comes up.
- **`#weakness:missed-edge-case` — unresolved, unexercised this session.** Still no self-driven adversarial testing before declaring ready; the large-input TLE case this session was coach-supplied, not self-authored. Keep pushing: before submitting, write 1–2 of your own boundary cases (not just the provided examples).
