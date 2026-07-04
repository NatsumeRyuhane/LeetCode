# 2492 — Minimum Score of a Path Between Two Cities · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-07-04 — session 1

- **Outcome:** solved-optimal (two accepted variants: BFS, then a hand-derived union-find)
- **Final complexity:** BFS O(V+E) time / O(V) space · DSU (no path compression) O(E log V) time / O(V) space
- **Hints used:** L0, L1, L1, L1 — all inside the union-find derivation drill; the base solve needed only test failures
- **Tags:** #structure:union-find #structure:graph #technique:bfs #weakness:missed-edge-case #weakness:misread-statement

**Approach path.** Reduced the problem to "minimum edge weight in the component containing 1 and n" at first read, then proved it both directions (detour-and-return achievability; contradiction for the lower bound) on a single prompt. BFS + min-edge tracking accepted (219ms). Post-accept, self-generated the idea of a connectivity-lookup structure and self-named disjoint-set, knowing it only as a black box. Derived the internals across ~73 min: naive labels → costed the mass-rename via a merge-sort analogy → indirection/tree ("DNS delegation" model) → root-to-root attach → depth-ranked union with O(1) `max(dA, dB+1)` update. DSU variant accepted (231ms, −25% memory).

**Where they got stuck.** (1) Union orientation: first concluded deep-goes-under-shallow, believing deep members "ignore internal layers"; one L0 hop-count trace flipped it. (2) The dropped merge cost: `merge` didn't receive the edge's cost, so pure-tree inputs returned inf; found by tracing road [1,2,9] on an L1 prompt. (3) Contract mismatch: `getRootID` tolerated unseen nodes but `merge` didn't → KeyError; fixed with lazy singleton init.

**Exposed weaknesses.** *misread-statement:* shipped directed-only adjacency for a stated-bidirectional graph AND started BFS at node 0 for stated 1-indexed cities — the latter minutes after the indexing was explicitly flagged. *missed-edge-case (recurring, 4th session):* skipped the pre-submit degenerate test again, reasoning "the problem guarantees 1–n connectivity" — misjudging what the guarantee excludes; coach added the disconnected-cheaper-component test. Notably strong counter-signal: post-hoc safety argument for why BFS never sees detached components was correct, and the Ω(E) floor argument was self-derived.

**Deferred for next union-find use.** Path compression ("repair during the walk") — seen in a fast sample solution afterward but deliberately not studied. On next use: re-derive it, check it against the rank bookkeeping (does rank stay exact?), and count walks per edge (this session's code did 4 finds per merging edge; 2 suffice).
