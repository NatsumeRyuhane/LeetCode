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
- `#technique:greedy` — locally optimal choice
- `#technique:backtracking` — build/prune candidate solutions
- `#technique:bfs` — breadth-first search
- `#technique:multi-source-bfs` — BFS seeded from many sources at once (distance-to-nearest field)
- `#technique:0-1-bfs` — shortest path with only 0/1 edge weights; deque-based (push 0-cost to front, 1-cost to back) or round/bucket ordering, in place of a full Dijkstra heap
- `#technique:dfs` — depth-first search / recursion
- `#technique:dijkstra` — non-negative-weight shortest path via a min-heap frontier (settle-on-pop)
- `#technique:topological-sort` — linearize a DAG (Kahn's peel-degree-0 / DFS postorder) so every edge points forward; enables one-pass DP over the order
- `#technique:prefix-sum` — cumulative aggregates
- `#technique:sorting` — sort as a preprocessing step
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
