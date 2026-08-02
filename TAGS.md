# Tag registry

Canonical source of truth for tags. **Register a tag here before using it** in a commit
trailer or a `log.md` entry, so tags never fork into synonyms. Three namespaces.

## `#structure:*` — data structures the problem hinges on
- `#structure:hashmap` — dict/set for O(1) membership or grouping
- `#structure:heap` — priority queue / k-th element / streaming top-k
- `#structure:stack` — LIFO, monotonic stack, parsing
- `#structure:queue` — FIFO, BFS frontier, deque/sliding window
- `#structure:linked-list` — singly/doubly linked list manipulation
- `#structure:tree` — binary tree / BST / n-ary traversal
- `#structure:trie` — prefix tree
- `#structure:graph` — adjacency list/matrix, nodes+edges (grids count)
- `#structure:union-find` — disjoint set / connectivity

## `#technique:*` — the method that cracks it
- `#technique:two-pointer` — opposing or same-direction pointers
- `#technique:sliding-window` — variable/fixed window over a sequence
- `#technique:binary-search` — search a sorted space
- `#technique:binary-search-on-answer` — binary search the answer value, not the array
- `#technique:dp` — dynamic programming / memoization
- `#technique:interval-dp` — state is a contiguous segment `(i, j)` of the input rather than a prefix; applicable when the only legal mutations are at the segment's ends, which is what keeps the surviving set contiguous and collapses `2^n` subsets to `O(n^2)` intervals
- `#technique:minimax` — adversarial two-player search: alternating levels maximise and minimise the same quantity. Made history-independent by scoring the *differential* (my points minus theirs) instead of absolute scores, so a node's value depends only on the position, not the path that reached it
- `#technique:greedy` — locally optimal choice
- `#technique:backtracking` — build/prune candidate solutions
- `#technique:bfs` — breadth-first search
- `#technique:multi-source-bfs` — BFS seeded from many sources at once (distance-to-nearest field)
- `#technique:0-1-bfs` — shortest path with only 0/1 edge weights; deque-based (push 0-cost to front, 1-cost to back) or round/bucket ordering, in place of a full Dijkstra heap
- `#technique:dfs` — depth-first search / recursion
- `#technique:dijkstra` — non-negative-weight shortest path via a min-heap frontier (settle-on-pop)
- `#technique:topological-sort` — linearize a DAG (Kahn's peel-degree-0 / DFS postorder) so every edge points forward; enables one-pass DP over the order
- `#technique:frequency-count` — tally symbols into a fixed-size bucket array / Counter, then read the buckets in order (counting-sort family)
- `#technique:prefix-sum` — cumulative aggregates
- `#technique:sorting` — sort as a preprocessing step
- `#technique:closed-form` — collapse the iteration into direct arithmetic derived from the constraints (counting / pigeonhole), turning an O(n) scan into O(1)
- `#technique:parity-argument` — 2-colour the positions by index parity and show the structure of the moves forces each side into one colour class; converts an adversarial search into a comparison of two fixed sums. The family: prove a *strategy* exists rather than searching for one
- `#technique:exchange-argument` — prove a greedy optimal by showing any assignment containing an inversion can be improved by swapping the inverted pair, so no optimal solution has one
- `#technique:lower-bound-argument` — establish a floor before optimising (must-read / must-write / adversary: if the algorithm skips input i, choose input i to change the answer)
- `#design` — object/system design (LRU cache, iterators, etc.)

## `#weakness:*` — recurring stumbles to target (grows as they surface)
- `#weakness:complexity-analysis` — miscounts or skips deriving big-O
- `#weakness:off-by-one` — boundary/index errors (incl. wrong search direction on a boundary)
- `#weakness:missed-edge-case` — empties, duplicates, single element, overflow
- `#weakness:pointer-bookkeeping` — loses track of links/indices during mutation
- `#weakness:premature-implementation` — codes before the approach is sound
- `#weakness:pattern-recognition` — doesn't map the problem to a known technique
- `#weakness:refactor-regressions` — drops a guard/seed/invariant when restructuring working code
- `#weakness:bfs-mechanics` — BFS/DFS confusion, per-cell vs shared distance, visited timing
- `#weakness:misread-statement` — codes against a different spec than stated (indexing base, directedness, parameter semantics)
- `#weakness:language-mechanics` — misuses Python semantics rather than algorithmics: builtin return types, immutability, in-place vs copy, what `+=` actually does
- `#weakness:unverified-assumption` — asserts runtime behaviour (a trace result, a hotspot, a cost) from reasoning alone when a print/profile/measurement would settle it in seconds
- `#weakness:unevaluated-expression` — derives the correct *form* of a quantity and then reports a number that isn't its value: states the formula and substitutes a guess, an asymptotic class, or a mis-scaled figure instead of evaluating it
- `#weakness:index-vs-value` — uses an index where the element it addresses was meant (`a[i]` written as `i`), typically in a base case or accumulator that the surrounding code otherwise dereferences correctly
- `#weakness:trace-intent-not-code` — hand-simulates the algorithm as designed rather than the lines as written, so self-review reproduces the intent and structurally cannot find transcription bugs; the fix is to instrument and diff, not to re-simulate
- `#weakness:unaudited-instrument` — reports a measurement or test result without checking what the harness actually produced or whether it ran to completion; the inverse of `#weakness:unverified-assumption` — the measurement was taken, the *instrument* wasn't inspected
- `#weakness:conjecture-as-proof` — treats failure-to-refute over a small or unrepresentative sample as an established fact and ships on it, without an argument for *why* it holds
