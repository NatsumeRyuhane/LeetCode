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
| Decomposition | 4 | 2492: clean restatement + both-direction proof (achievability & contradiction) of the reduction on one prompt | → |
| Pattern recognition | 5 | 2492: reduced to component-min unaided at first read; self-generated and self-named disjoint-set | ↑ |
| Complexity analysis | 4 | 2492: self-derived Ω(E) floor, costed relabeling via merge-sort analogy, read 12ms judge delta as constants — but stated O(V+E) only when pressed | ↑ |
| Implementation correctness | 3 | 2492: five bugs across two impls (directed-only adjacency, start at 0, missing init, dropped merge cost); each diagnosed fast from one failing trace | → |
| Edge-case handling | 2 | 2492: skipped the pre-submit degenerate test again, misjudging what the 1–n guarantee excludes | ↓ |
| Optimization | 4 | 2492: floor argument *before* optimizing; honest constants-vs-asymptotics verdict; chose toolkit drill over percentile | → |

## Focus next

- **`#weakness:missed-edge-case` — the pre-submit habit still isn't firing.** Fourth session in a row: this time the degenerate test was waved off as unnecessary because "1–n connectivity is guaranteed" — the guarantee excludes exactly one shape, not all of them. The rule stands: one degenerate-input test (empty / singleton / disconnected / extreme value) written *before* every judge submit, no exceptions, especially when it feels unnecessary.
- **`#weakness:misread-statement` (new tag).** Two spec slips in one session — directed-only adjacency for a bidirectional graph, BFS from node 0 in a 1-indexed problem (minutes after indexing was flagged) — following 3620's k-semantics misread. Before coding: restate indexing base, directedness, and value ranges as a three-line comment at the top of `solution.py`.
- **Union-find: finish the toolkit entry.** The structure was hand-derived this session (rank rule included) — consolidate it. Next union-find problem: re-derive path compression ("repair during the walk"), check whether rank stays exact under it, and cut the 4-finds-per-edge pattern to 2 by fusing the connected-check into the union.
